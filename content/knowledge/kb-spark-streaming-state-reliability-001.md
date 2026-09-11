---
id: kb-spark-streaming-state-reliability-001
type: knowledge
title: State, Event Time, Watermark, Checkpoint & Exactly-once Boundary
title_cn: State、Event Time、Watermark、Checkpoint 与 Exactly-once 边界
stage_id: '02'
domain: compute
topic: spark
order: 11
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: spark_l5_v1
summary: Stateful Streaming 需要跨 Trigger 保存 State。Watermark 用 Event Time 控制迟到数据与状态清理，Checkpoint 保存 Query Progress 与状态恢复信息；Exactly-once 取决于 Source、Engine、Checkpoint 和 Sink 的端到端组合。
prerequisites:
  - kb-spark-structured-streaming-execution-001
related:
  - kb-spark-production-troubleshooting-001
---
# State、Event Time、Watermark、Checkpoint 与 Exactly-once 边界

## 30 秒理解

Structured Streaming 真正困难的部分不是：

> 一条记录进来算一下。

而是：

> 需要记住过去发生过什么。

例如：

- Window Aggregate；
- Deduplication；
- Stream-Stream Join；
- Running Count；
- Session；
- Arbitrary Stateful Logic。

这些都需要 State。

核心链：

**Event**

→ **Event Time**

→ **Stateful Operator**

→ **State Store**

→ **Watermark**

→ **State Cleanup / Late Data Boundary**

再加恢复链：

**Source Progress**

+

**Checkpoint**

+

**Recoverable State**

+

**Sink Semantics**

→ **End-to-end Delivery Guarantee**

## State 是什么

State 可以理解成：

> 为了处理未来数据，必须保留的历史中间信息。

例如持续统计：

```text
customer_id → total_amount
```

当前已经处理：

```text
customer 123 → 1000
```

下一批又来：

```text
customer 123 → +200
```

Spark 必须先记住：

```text
1000
```

才能得到：

```text
1200
```

这个：

```text
customer 123 → 1000
```

就是 State。

## 哪些操作需要 State

典型包括：

### Streaming Aggregation

```text
groupBy key
→ count / sum
```

需要记住之前的 Group State。

### Window Aggregation

需要记住尚未完成的时间窗口。

### Deduplication

为了判断：

> 这条 ID 以前见过没有？

需要保留去重 State。

### Stream-Stream Join

两边数据不一定同一时刻到达，

因此需要保留一定时间范围的 Join State。

### Arbitrary Stateful Processing

现代 Spark 4.x 提供 `TransformWithState` 作为新一代通用 Stateful API。

但 API 不是重点。

重点是：

> State 的生命周期必须被管理，否则它可能一直增长。

## Processing Time 和 Event Time

这是 Streaming 必须分清的两个时间。

### Processing Time

数据被 Spark 处理的时间。

例如：

```text
Event actually happened: 10:00
arrived at Spark: 10:08
```

Processing Time 可能是：

```text
10:08
```

### Event Time

事件本身携带的业务时间：

```text
10:00
```

如果业务要算：

> 每 5 分钟真实交易额

通常应该按：

**Event Time**

而不是：

**Spark 什么时候收到数据**

来做 Window。

## Late Data 为什么天然存在

分布式系统里事件可能因为：

- Mobile Offline；
- Kafka Backlog；
- Network Delay；
- Retry；
- 上游故障；

晚到。

例如：

```text
10:00 event
10:12 arrives
```

如果 10:00 的 Window 已经完全删除，

这个事件就没地方更新。

如果永远不删 State，

State 又会无限增长。

所以必须做一个权衡：

**允许多晚的数据更新旧结果？**

这就是 Watermark 的核心问题。

## Watermark 是什么

高层可以理解：

> Watermark 表达系统认为 Event Time 已经推进到了什么位置，以及多老的数据可以开始进入清理边界。

例如：

```python
df.withWatermark("event_time", "10 minutes")
```

不要简单理解成：

> 超过 10 分钟的数据一定立刻丢。

更准确地说：

Spark 会根据：

**观察到的最大 Event Time**

减去：

**Delay Threshold**

推进 Watermark。

由于分布式协调与 Trigger 推进，

实际清理 / Late Data 处理还受 Operator 和执行时点影响。

官方也明确：

> 某些超过 Delay Threshold 的更晚数据仍可能被处理。

所以 Watermark 是：

**状态与迟到数据的时间边界机制**

不是：

**精确的定时删除器。**

## Watermark 为什么和 State Size 直接相关

没有 Watermark 的 Stateful Aggregation 可能需要：

```text
old key
old key
old key
...
keep forever
```

如果 Key 持续增长：

```text
State Rows ↑
State Bytes ↑
Checkpoint ↑
Recovery Time ↑
```

最终 Streaming Query 会越来越重。

有 Watermark 后，

Spark 可以在满足对应 Stateful Operator 语义时清理已经过期的 State。

所以：

```text
Watermark
→ State Retention Boundary
→ State Size Control
```

是生产 Streaming 最重要的链之一。

## Watermark 不是“数据正确性开关”

Watermark Delay 选太短：

```text
State clears earlier
→ less state
→ lower resource cost
→ more late data may be dropped
```

选太长：

```text
more late events accepted
→ more state retained
→ higher memory / storage / checkpoint cost
```

所以这是一个明确 Trade-off：

**Correctness / Completeness**

vs

**State Cost / Latency / Recovery Cost**

没有统一的：

```text
watermark = 10 minutes
```

最佳答案。

必须根据真实业务迟到分布设计。

## Checkpoint 到底保存什么

Structured Streaming Checkpoint 的核心作用不是：

> 把所有业务数据备份一遍。

它用于保存 Query 恢复需要的信息，例如：

- Query Progress；
- Source Offset / Position；
- Commit 信息；
- Stateful Operator 的 State / Metadata。

高层上：

```text
Checkpoint
→ know where query had progressed
→ restore state
→ resume processing
```

因此 Production Checkpoint 必须放在：

**可靠、持久的存储**

而不是：

> 某个会随 Executor 消失的本地临时目录。

## Checkpoint 和 Cache 完全不同

### Cache

目标：

**性能复用**

丢了通常可以：

**重新计算。**

### Checkpoint

目标：

**切断 / 保存恢复边界与进度**

用于 Failure Recovery。

Streaming Query 重启时，

Checkpoint 可能决定：

- 从哪里继续读；
- 哪些 Batch 已提交；
- State 恢复到哪里。

所以：

```text
Cache
≠
Checkpoint
```

## Checkpoint 和 Exactly-once 也不是等号

这是这一节最重要的边界。

错误说法：

```text
checkpoint=true
→ exactly once
```

正确模型：

```text
Replayable Source
+
Recorded Progress
+
Deterministic / Recoverable Processing
+
Sink can safely handle retry
→ possible end-to-end exactly-once
```

Checkpoint 只是其中一部分。

## Replayable Source 为什么重要

假设 Spark 记录：

```text
我处理到 offset 1000
```

失败以后需要重做：

```text
900 → 1000
```

Source 必须还能提供这些数据。

例如 Kafka 保留了对应 Offset，

Spark 才能重新读。

如果 Source 本身不可 Replay，

Checkpoint 记得再清楚也无法：

> 把已经消失的数据重新变出来。

所以 Source 必须具备：

**可定位 + 可重放**

能力。

## Sink 为什么决定最后的 Exactly-once

假设 Batch 100：

```text
1. Sink 写成功
2. Driver 在 Commit Progress 前崩溃
3. Query 恢复
4. Batch 100 被重放
```

如果 Sink 只是：

```text
INSERT every retry
```

就可能重复写。

如果 Sink 支持：

- Idempotent Write；
- Transaction；
- Batch ID Dedup；
- Exactly-once Commit Protocol；

才有机会保证：

> 重放不产生业务重复。

所以：

**Engine Exactly-once**

和：

**End-to-end Exactly-once**

不能混为一谈。

## foreachBatch 为什么尤其要小心

`foreachBatch` 很灵活，

但也意味着：

> Sink 语义更多由用户代码自己负责。

例如：

```python
def write_batch(df, batch_id):
    ...
```

如果 Failure 后相同 `batch_id` 被重新执行，

你的写入逻辑必须决定：

- 是否幂等；
- 是否事务；
- 是否去重。

所以 `foreachBatch` 不是：

> 自动给任何数据库 Exactly-once。

生产上经常需要使用：

**batch_id**

或业务唯一键构造幂等写入。

## State Store 是什么

Stateful Operator 的状态并不是：

> 永远存在普通 Python Dict 里。

Spark 使用 State Store 管理跨 Trigger State。

高层职责：

```text
Stateful operator
→ read previous state
→ apply new events
→ write updated state
→ commit with query progress
```

Spark 4.x 还增加了更现代的 Stateful 能力，例如：

**TransformWithState**

支持：

- Value / List / Map State；
- TTL；
- Timer；
- Event Time / Processing Time。

但这里重点仍然是模型：

> State 是持续 Query 的长期资源，不只是功能变量。

## 为什么 State Growth 是生产风险

如果：

```text
new keys keep appearing
+
no cleanup
```

State 会不断增长。

后果：

```text
State Bytes ↑
→ Checkpoint I/O ↑
→ Batch Duration ↑
→ Recovery Time ↑
→ Backlog ↑
```

于是形成非常危险的正反馈：

```text
state grows
→ processing slower
→ backlog grows
→ each batch carries more pressure
→ state / latency worse
```

所以 Streaming Capacity 不只看：

**records / second**

还必须看：

**State Rows / Bytes / Growth Rate。**

## Watermark 也不是所有 State 的唯一清理机制

不同 Stateful API 可能使用：

- Watermark；
- TTL；
- Timer；
- Business Expiration Logic；

管理 State。

例如 TransformWithState 可以有更明确的 TTL / Timer 模型。

因此：

> Stateful Streaming = 一律靠 Watermark 删除 State

也是错误说法。

Watermark 主要处理：

**Event-Time Progress**

和：

**Late Data / Event-Time State Cleanup**

这一类问题。

## Failure Recovery 的完整链

假设：

```text
Batch 200
→ process input
→ update state
→ write sink
→ failure
```

恢复时系统需要协调：

- Source Progress；
- Committed Batch；
- State Version；
- Sink Write。

真正目标是：

> 恢复到一个一致的处理边界，避免既丢数据又重复产生业务结果。

所以 Streaming Reliability 本质上是一种：

**Progress + State + Output**

的一致性问题。

## 到这里 Spark Streaming 主线完整了

现在可以串起来：

```text
Unbounded Source
→ Offset / Progress
→ Trigger
→ Incremental Query
→ Stateful Operator
→ State Store
→ Event Time
→ Watermark / TTL
→ Checkpoint
→ Recovery
→ Sink Semantics
→ End-to-end Guarantee
```

这比只记：

> Checkpoint、Watermark、Exactly-once

三个词重要得多。

## 下一步

Spark Learn 现在已经完成 11 / 12。

最后一节不会再增加新的 Spark 核心机制。

它只会把前 11 节收束成：

**Failure、Observability、Backfill 与 Capacity**

也就是：

> 当 Spark Job / Streaming Query 真正在生产上慢、失败、积压、OOM 时，怎么沿着前面的因果链定位？
