---
id: kb-trino-production-troubleshooting-001
type: knowledge
title: Observability, Troubleshooting & Capacity
title_cn: Observability、Troubleshooting 与 Capacity
stage_id: '04'
domain: lakehouse
topic: trino
order: 22
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: trino_l5_v1
summary: 最后一节不再引入新机制，而是把 Query Lifecycle、Scan、Join、Memory、Resource Group 与 FTE 串成一套生产排障和容量模型：先定位 Query 卡在哪一层，再沿因果链找瓶颈。
prerequisites:
  - kb-trino-fault-tolerant-execution-001
related:
  - kb-trino-query-lifecycle-001
  - kb-trino-scan-pushdown-001
  - kb-trino-cbo-join-dynamic-filtering-001
  - kb-trino-memory-exchange-pressure-001
  - kb-trino-concurrency-resource-groups-001
---
# Observability、Troubleshooting 与 Capacity

## 30 秒理解

前 10 节已经把 Trino 的核心机制学完。

最后一节只做一件事：

**把这些机制重新组织成生产排障模型。**

以后遇到：

> “Trino 慢了”

不要先猜：

- Worker 少；
- Memory 小；
- Spill 没开；
- Join 有问题。

先问：

**Query 卡在哪个阶段？**

第一层定位：

**Queued**

→ Admission / Resource Group / Cluster Capacity

**Planning**

→ Metadata / Connector / Statistics / Plan Complexity

**Running / Blocked**

→ Scan / Join / Exchange / Memory / Skew / 下游阻塞

**Failed**

→ SQL / Connector / Resource / Worker / Retry Boundary

再沿着：

**Query Lifecycle**

→ **Plan**

→ **Data Volume**

→ **Distribution**

→ **Resource**

→ **Concurrency**

→ **Failure / Recovery**

一层层往下排。

这就是最后要形成的 Production Mental Model（生产心智模型）。

## 第一原则：先分阶段，再谈优化

一个用户说：

> “这条 SQL 跑了 30 秒。”

30 秒本身的信息非常少。

因为它可能是：

```text
Queue       20s
Planning     1s
Execution    9s
```

也可能是：

```text
Queue        0s
Planning    20s
Execution   10s
```

或者：

```text
Queue        0s
Planning     1s
Execution   29s
```

三种情况用户看到的都是：

**30 秒**

但优化方向完全不同。

所以第一步不是：

> 调什么参数？

而是：

> 时间到底花在哪一段？

## Web UI 是第一层运行视角

Trino Web UI 可以直接看到 Query State。

当前主要状态包括：

- `QUEUED`
- `PLANNING`
- `STARTING`
- `RUNNING`
- `BLOCKED`
- `FINISHING`
- `FINISHED`
- `FAILED`

这几个状态本身就是一个非常好的排障入口。

### QUEUED 很久

说明 Query 已经被接受，

但还没有真正进入执行。

优先看：

- Resource Group；
- hardConcurrencyLimit；
- 当前 Running Query 数；
- 是否某类重型 Workload 占满并发；
- Cluster 是否已经达到设计容量。

这时如果你只去看：

**Scan Bytes**

通常方向就错了，

因为 Query 可能根本还没开始 Scan。

### PLANNING 很久

优先看：

- Catalog / Connector Metadata；
- 表、Partition、File 数量；
- Statistics 获取；
- Query Plan 复杂度；
- Optimizer；
- Coordinator 压力。

这时单纯增加 Worker，

通常不能直接解决 Coordinator 端的 Planning 瓶颈。

### RUNNING 很久

才真正进入：

- Scan；
- Join；
- Exchange；
- Memory；
- CPU；
- Network；
- Skew。

### BLOCKED

`BLOCKED` 本身不一定异常。

Pipeline Execution 中，

Task 等待：

- Input；
- Output Buffer；
- Memory；
- Split；

都是正常现象。

但如果长时间持续 Blocked，

就要继续看：

- Memory 不足；
- Split 不足；
- Disk / Network I/O；
- 数据倾斜；
- 下游 Stage 太慢；
- Client 消费结果太慢。

所以：

**Blocked ≠ 一看到就认为故障。**

真正重要的是：

> 为什么被 Block，以及持续多久？

## 第二层：Plan 对不对

Query 已经进入执行以后，

先不要立即看 CPU。

先问：

> Trino 打算怎么执行它？

用：

```sql
EXPLAIN
SELECT ...
```

主要看：

- TableScan；
- Filter；
- Join；
- Join Distribution；
- Build / Probe；
- Exchange；
- Dynamic Filter；
- Estimated Rows / Size。

这里对应前面：

**Query Planning**

和：

**Statistics / CBO**

两节。

### 一个典型坏计划

例如：

真实 Build Side：

```text
20GB
```

但 Statistics 估成：

```text
100MB
```

可能形成：

**Estimate 错**

→ **选择 Broadcast**

→ **每个 Worker 复制大 Hash Table**

→ **Memory / Network 放大**

→ **Query OOM 或严重变慢**

所以遇到 Memory 问题，

不能只从：

> Memory 配置

开始。

要先往前追：

> 为什么 Plan 需要这么多 Memory？

## 第三层：Estimate 和 Actual 是否一致

`EXPLAIN` 看的是计划。

`EXPLAIN ANALYZE` 会真正执行 Query，

再显示实际运行统计。

当前 Trino 的输出可以看到：

- Queued；
- Analysis；
- Planning；
- Execution；
- Stage CPU；
- Scheduled；
- Blocked；
- Input / Output；
- Task 级输入分布。

因此非常适合判断：

> Optimizer 认为会发生什么，和实际发生了什么，差多少？

### 如果 Estimate 和 Actual 差很多

优先怀疑：

- Statistics 过旧；
- Connector Statistics 不完整；
- Filter Selectivity 估算偏差；
- 数据分布发生变化。

这时应该回到：

**Statistics → CBO**

而不是只对最后的慢 Stage 做局部调参。

## 第四层：Scan 到底读了多少

一个 Query 最终：

```text
返回 100 行
```

完全不代表它：

```text
只读取 100 行。
```

排查 Scan 要看：

**Logical Result**

和：

**Physical Input**

之间差多少。

先问：

**需要哪些 Column？**

→ Projection Pushdown 是否生效？

**有哪些 Predicate？**

→ Partition / File / Reader Pruning 是否生效？

**Connector 能下推到哪里？**

→ 还是大量数据进入 Worker 后才 Filter？

**Split 怎么样？**

→ 数量过少导致并行不足？

→ 数量极多导致 Scheduling / File Open 开销？

### 一个常见坏链路

```text
Predicate 无法有效下推
→ Candidate Files 很多
→ Split 很多
→ Scan Bytes 很大
→ Worker CPU / Object Storage 请求增加
→ 下游 Join 也收到更多数据
```

这时后面的 Join、Memory 变重，

可能只是 Scan 放大的后果。

所以要沿因果链向前找第一个异常点。

## 第五层：Join 和 Exchange 有没有放大数据

如果 Scan 本身正常，

继续看：

- Join Order；
- Build Side；
- Broadcast / Partitioned；
- Dynamic Filtering；
- Exchange Bytes；
- Intermediate Rows。

### Broadcast 异常

如果 Build Side 实际很大：

```text
Large Build
→ replicate to every Worker
→ Memory × Worker Count
→ Network amplification
```

### Partitioned Join 异常

如果两边都很大：

```text
Large Left
+
Large Right
→ Hash Repartition
→ Huge Exchange
→ Network bottleneck
```

所以：

**Join 慢**

不一定是 Join Operator 自己 CPU 慢。

可能真正贵的是：

**为了 Join 而产生的数据移动。**

## 第六层：有没有 Data Skew

平均值很危险。

例如 Task Input：

```text
99GB
101GB
96GB
104GB
```

比较健康。

但如果是：

```text
40GB
42GB
39GB
380GB
```

整个 Stage 会被最后一个 Task 拖住。

这就是：

**Skew（数据倾斜）**

典型信号：

- 某些 Task Input 远高于平均；
- 某些 Task Duration 远高于其他 Task；
- 一个 Worker Memory 特别高；
- Stage 长时间只剩少量 Task；
- EXPLAIN ANALYZE 中 Input 分布方差明显。

因此：

> Stage 慢

要继续问：

**所有 Task 都慢，还是只有少数 Task 特别慢？**

这是：

**Capacity**

和：

**Skew**

最重要的分界之一。

## 第七层：Memory 是原因还是结果

看到 OOM 时，

常见错误是立刻：

> 提高 query.max-memory。

但 OOM 可能只是最后结果。

完整链可能是：

```text
Statistics 错
→ Broadcast 选错
→ Build Side 大
→ Hash Table 大
→ Memory 超限
```

或者：

```text
高基数 GROUP BY
→ Group State 大
→ Aggregation Memory 高
```

或者：

```text
Concurrent Queries 太多
→ 每条 Query 单独正常
→ Cluster 总 Memory 被吃满
```

所以 Memory 排障必须区分：

**Plan 问题**

**Data Distribution 问题**

**单 Query Resource Demand**

**Cluster Concurrency**

四个层次。

## 第八层：Queued 和 Running 要分开看

假设 Dashboard P95 从：

```text
5s
```

上升到：

```text
25s
```

但 Query Execution 仍然：

```text
5s
```

真正变化的是：

```text
Queue Time = 20s
```

这说明：

**Query 本身没变慢。**

是：

**Cluster Admission 饱和了。**

因此用户端 SLO 最好拆成：

```text
End-to-End Latency
=
Queue
+
Planning
+
Execution
+
Result Consumption
```

至少在平台分析时，

Queue 和 Execution 必须分开。

否则很容易错误地：

> 调 SQL、加索引、看 Join

但真实问题是：

> Resource Group 已经达到并发上限。

## 第九层：FAILED 要先分类 Failure Domain

Query Failed 以后，

先问：

### User Error

例如：

- SQL 错误；
- 类型错误；
- 权限；
- 无效函数；
- 数据问题。

这种错误：

**Retry 没有价值。**

### External Failure

例如：

- Metastore；
- Object Storage；
- Remote Database；
- Connector Dependency。

这时问题可能根本不在 Worker CPU / Memory。

### Internal / Worker Failure

例如：

- Worker Crash；
- 节点离线；
- Runtime Bug；
- OOM。

这才进入：

**FTE / Retry**

的主要场景。

所以不能看到：

> Query Failed

就统一回答：

> 开 TASK Retry。

## 第十层：Retry 有没有真的帮助

启用 FTE 后，

排障还要问：

- Query Retry 了几次；
- Task Retry 了几次；
- 是否同一个 Task 反复失败；
- Exchange Storage 是否成为瓶颈；
- Retry 后是否仍在同一个 Failure Point 失败。

如果：

```text
Task 1
→ fail
→ retry
→ same deterministic error
→ fail
→ retry
```

那么 Retry 只是在重复浪费资源。

FTE 适合：

**Transient Failure**

而不是：

**Deterministic Failure。**

## Trino 的观测面应该分三层

到这里可以把工具也分层。

### 第一层：单 Query

使用：

- Web UI；
- Query Detail；
- Stage / Task；
- Timeline；
- Query JSON；
- EXPLAIN；
- EXPLAIN ANALYZE；
- SHOW STATS。

回答：

> 这一条 Query 为什么慢？

### 第二层：Cluster

使用：

- OpenMetrics `/metrics`；
- JMX；
- Dashboard / Alert。

重点关注：

- Running / Queued Query；
- Waiting for Resources；
- Query Latency；
- Failure Rate；
- Cluster Free Memory；
- OOM Kill；
- Worker / Task Input；
- Connector Metrics。

回答：

> 整个 Cluster 正在发生什么？

### 第三层：长期历史和跨系统链路

使用：

- Event Listener；
- OpenTelemetry；
- 外部 Metrics / Log / Trace 平台。

Event Listener 可以持续保存：

- Query Started；
- Query Completed；

等事件，

避免只依赖 Trino 内存里的短期 Query History。

OpenTelemetry 则可以把 Trace 从：

**Client**

→ **Coordinator**

→ **Workers**

→ **Connector / Data Source**

继续串起来。

回答：

> 过去为什么发生过？问题到底在 Trino 还是下游依赖？

## 生产 SLO 应该先定义什么

不要先定义：

> Worker CPU 必须小于 70%。

CPU 是内部指标，

不是用户目标。

更好的第一层 SLO 是：

### Latency

例如：

- Interactive Query P95；
- Dashboard Query P95；
- Queue P95。

### Reliability

例如：

- Query Success Rate；
- Internal Failure Rate；
- Retry Rate。

### Availability

例如：

- 能否接受 Query；
- Coordinator / Worker Healthy。

然后再用：

- CPU；
- Memory；
- Network；
- Scan；
- Queue；
- Retry；

解释为什么 SLO 变差。

也就是：

**SLO 是结果**

**Resource Metric 是原因证据。**

## Capacity Planning 不是“算多少 Worker”

容量规划不能只问：

> 需要几台机器？

因为 Trino 的瓶颈维度可能不同。

至少要看：

- Query Arrival / Concurrency；
- Query Mix；
- Scan Bytes；
- CPU；
- Peak Memory；
- Exchange / Network；
- Object Storage Throughput；
- Connector / Metastore Capacity；
- Coordinator Planning Load；
- FTE Exchange Storage。

所以：

**同样 20 台 Worker**

对于两个不同 Workload，

容量可能完全不同。

## 一套更可靠的容量校准方法

### 第一步：先分 Workload

至少分：

**Interactive / BI**

和：

**Batch / Heavy Query**

不要把平均 Query 当成真实业务。

### 第二步：建立单 Query Profile

对代表性 Query 记录：

- Queue；
- Planning；
- Execution；
- Scan Bytes；
- CPU Time；
- Peak Memory；
- Exchange；
- Task Distribution。

### 第三步：逐步增加并发

例如：

```text
5
→ 10
→ 20
→ 40
→ 80
```

每一步观察：

- Throughput；
- P50 / P95；
- Queue Time；
- Memory；
- Network；
- Failure；
- Retry。

### 第四步：找 Saturation Point

某个并发以后可能出现：

```text
Concurrency ↑
但 Throughput 不再 ↑
P95 快速 ↑
Queue 快速 ↑
Failure ↑
```

这里就是当前架构的饱和区。

### 第五步：保留 Headroom

生产容量不能正好跑在：

**理论极限。**

因为还要容纳：

- 数据增长；
- Query Mix 波动；
- Worker Loss；
- Storage Latency 抖动；
- Batch 峰值；
- Retry。

所以需要明确：

**正常容量**

和：

**降级容量 / Failure Capacity**

之间的余量。

## 一个完整的慢查询排障顺序

以后可以按这一条链走：

```text
1. Query State？
   Queued / Planning / Running / Blocked / Failed

2. Time 花在哪？
   Queue / Planning / Execution

3. Plan 对不对？
   EXPLAIN + Statistics + CBO

4. Scan 是否过量？
   Columns / Predicate / Pruning / Pushdown / Split

5. Join 是否放大？
   Build / Probe / Broadcast / Partitioned / Dynamic Filter

6. Exchange 是否过重？
   Intermediate Data / Network

7. Task 是否倾斜？
   Avg vs Max / Straggler

8. Memory 为什么高？
   Hash / Aggregate / Sort / Window / Concurrency

9. Cluster 是否饱和？
   Queue / Resource Group / Running Queries

10. Failure 属于哪一层？
    User / External / Internal / Worker

11. Retry 是否有效？
    QUERY / TASK / Exchange Storage
```

这不是“排障 Checklist”。

它本质上是一条：

**从症状反推因果层级**

的路径。

## 11 节最终形成的完整 Trino 模型

现在把整个 Trino Vertical Slice 压缩成一条主线：

**01｜Trino 是什么**

→ 分布式 SQL Query Engine

**02｜谁负责什么**

→ Coordinator / Worker / Query Lifecycle

**03｜怎么连接外部数据**

→ Catalog / Connector / SPI

**04｜SQL 怎么变成 Plan**

→ Parser / Analyzer / Optimizer / Distributed Plan

**05｜Plan 怎么真正执行**

→ Stage / Task / Split / Driver / Operator

**06｜怎么尽量少读数据**

→ Pruning / Pushdown / Worker Scan

**07｜怎么决定 Join**

→ Statistics / CBO / Build / Probe / Distribution / Dynamic Filtering

**08｜为什么大 Query 会吃资源**

→ Memory / Exchange / Skew

**09｜为什么高并发会拖垮 Cluster**

→ Queue / Resource Group / Workload Isolation

**10｜失败以后怎么恢复**

→ NONE / QUERY / TASK / Exchange Manager

**11｜线上怎么定位问题**

→ Observability / Troubleshooting / Capacity

这 11 节不是 11 个独立知识点。

它们共同回答一个问题：

> **一个 SQL 怎样进入 Trino、被计划、被分布式执行、消耗资源、参与资源竞争、发生故障，并最终被生产系统观测和治理？**

## 这一阶段到这里结束

Trino Learn V1 到这里内容闭环完成。

下一阶段不再增加 Learn 机制。

而是把已有知识接到：

**Scale**

和：

**Interview**

上。

Scale 会训练：

> 当并发、数据量、长 Query、SLO 和故障约束真正扩大时，架构怎么变？

Interview 只连接已经存在真实 Evidence 的问题，

不因为 Trino Learn 完整了，就制造“Trino 高频题”。
