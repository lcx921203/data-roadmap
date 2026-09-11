---
id: kb-trino-fault-tolerant-execution-001
type: knowledge
title: Fault-Tolerant Execution & Recovery
title_cn: Fault-Tolerant Execution 与失败恢复
stage_id: '04'
domain: lakehouse
topic: trino
order: 21
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: trino_l5_v1
summary: FTE 通过 QUERY 或 TASK Retry 缓解 Worker Failure 对长 Query 的影响；TASK Retry 依赖 Exchange Manager 持久化中间 Exchange 数据，使失败 Task 可以在其他 Worker 上局部重做，但会增加存储、I/O、协调与延迟成本。
prerequisites:
  - kb-trino-concurrency-resource-groups-001
related:
  - kb-trino-production-troubleshooting-001
---
# Fault-Tolerant Execution 与失败恢复

## 30 秒理解

默认情况下，

运行中的 Query 如果因为 Worker Failure 或资源问题无法继续，

Query 可能失败并需要重新执行。

FTE（Fault-Tolerant Execution，容错执行）改变的是：

**失败以后重做多少工作。**

当前 Trino 有三种核心 Retry Policy（重试策略）概念：

```text
NONE
QUERY
TASK
```

可以先理解：

**NONE**

→ 不做 FTE 自动恢复。

**QUERY**

→ Worker Failure 后自动重跑整条 Query。

**TASK**

→ 只重试失败的 Task。

而 TASK Retry 能成立的关键是：

**Exchange Manager**

把已经完成 Stage 的中间结果 Spool 到可复用的存储中。

## 为什么 Query 越长越需要考虑 Fault Tolerance

一个 3 秒 Query：

Worker 在这 3 秒内挂掉的概率比较低。

即使失败，

重跑成本也很小。

但一个：

**40 分钟**

甚至：

**2 小时**

的 Batch Query，

暴露在：

- Worker Restart；
- Node Replacement；
- Network Transient Error；
- Resource Pressure；

下的时间更长。

如果第 39 分钟失败以后：

**从第 0 分钟重新执行**

浪费会非常大。

所以 Fault Tolerance 的价值随着：

**Query Duration**

和：

**Query Cost**

上升。

## NONE：最简单，也最适合低开销路径

`retry-policy=NONE`

表示没有启用 FTE Query / Task Retry。

好处是：

- 执行模型更直接；
- 不需要为恢复额外持久化大量中间 Exchange；
- 适合强调低延迟的短 Query。

代价是：

> Worker Failure 可能直接导致 Query 失败。

因此：

**Interactive Query**

和：

**Long Batch Query**

不一定应该使用完全相同的 Execution Mode。

## QUERY Retry：整条 Query 自动重跑

`retry-policy=QUERY`

发生 Worker Error 时，

Trino 可以自动重新执行整个 Query。

逻辑上：

```text
Query Attempt 1
→ Worker Failure
→ fail attempt

Query Attempt 2
→ execute whole query again
```

优势：

- Recovery 模型相对简单；
- 不需要理解哪个 Task 需要局部恢复；
- 对大量较短 Query 更合适。

但缺点也明显：

> 已经完成的大量工作可能全部丢掉。

如果一个重型 Query 已经跑了很久，

整条重做仍然成本很高。

## TASK Retry：只重做失败的 Task

`retry-policy=TASK`

目标变成：

```text
Stage A / Task 1 ✓
Stage A / Task 2 ✓
Stage A / Task 3 ✓

Stage B / Task 7 ✗

→ only retry failed work
```

相比 Query Retry，

它可以保留更多已经完成的中间工作。

因此更适合：

**大型 Batch Query**

和：

**长时间 Query。**

但它不是免费的。

要让 Task 可以单独重跑，

系统必须保留足够的中间数据。

这就是 Exchange Manager 的作用。

## 为什么普通 Pipeline Exchange 不够恢复

在传统 Pipelined Execution 中，

上游 Task 产生的数据可以直接流向下游。

例如：

```text
Task A
→ network stream
→ Task B
```

如果 Task A 已经结束，

而 Task B 后来失败，

要重新执行 Task B，

它可能再次需要 Task A 的 Output。

但原来的网络流已经不存在了。

如果没有持久化中间结果：

```text
Task B retry
→ needs old input
→ input unavailable
→ upstream work must run again
```

所以 Task-level Recovery 需要改变 Exchange 的持久化方式。

## Exchange Manager 是 FTE 的关键

FTE 会把 Intermediate Exchange Data（中间交换数据）Spool 到可恢复的 Storage。

高层可以理解成：

```text
Stage A
→ Exchange Manager
→ durable / reusable exchange data

Stage B
→ read exchange data
```

如果执行 Stage B 的 Worker 失败：

```text
Stage B Task fails
→ schedule replacement task
→ read same spooled exchange
→ continue
```

这样：

**Stage A 不需要全部重跑。**

这就是 Task Retry 能成立的基础。

## Exchange Manager 存在哪里

当前 Trino 的 Exchange Manager 可以把 Spooling Data 存到例如：

- S3 / S3-compatible Object Storage；
- Azure Blob Storage；
- Google Cloud Storage；
- HDFS；
- 支持的文件系统。

配置入口类似：

```properties
exchange-manager.name=filesystem
exchange.base-directories=s3://trino-exchange
```

具体 Storage、Authentication 和并行参数需要按部署环境配置。

生产设计真正要关注的是：

**Exchange Storage 本身也变成 Query Runtime Dependency。**

## FTE 为什么会增加成本

没有 FTE 时，

很多 Intermediate Data 可能主要通过：

**Memory + Network Pipeline**

向下游流动。

TASK FTE 下，

为了能恢复，

更多中间结果需要：

**写入 Exchange Storage**

然后：

**下游再读取。**

因此增加：

- Object Storage / Filesystem I/O；
- Network；
- Serialization；
- Storage Cost；
- Coordination；
- Query Latency。

所以不能认为：

> 开 FTE = 免费获得可靠性。

更准确是：

**用额外 I/O 和执行开销换 Recovery Capability。**

## FTE 和 Spill 再对比一次

两者非常容易被混。

### Spill

触发原因：

**Operator Memory Pressure**

目标：

**降低 Peak Memory**

主要动作：

**Operator 中间状态 → Disk**

### FTE Exchange Spooling

触发目的：

**让 Query / Task 失败后可以恢复**

目标：

**Preserve Recoverable Intermediate Result**

主要动作：

**Stage Exchange Output → Recoverable Storage**

所以：

```text
Spill
= Memory Management

FTE Spooling
= Failure Recovery
```

这两个概念不能互换。

## 为什么官方现在更推荐 TASK FTE，而不是继续依赖 Spill

当前 Trino 已明确把传统 Spill 标为 Legacy Functionality，

并建议大型 Query 考虑：

```text
retry-policy=TASK
+
Exchange Manager
```

但这里不能误解成：

> TASK FTE 是所有 Trino Query 的默认最佳模式。

当前官方同样明确：

**TASK Retry 更适合大型 Batch Query，**

而大量短 Query 使用 TASK 模式可能增加 Latency。

所以更合理的架构可能是：

```text
Interactive Cluster
→ NONE / QUERY-oriented workload

Batch Cluster
→ TASK FTE
```

具体是否分 Cluster，

取决于：

- Query Duration；
- SLO；
- Workload Volume；
- Cost；
- Failure Rate。

## QUERY 和 TASK 怎么选

可以先用这个判断框架。

### 很多短 Query

例如：

- BI Dashboard；
- Interactive Exploration；
- API Query。

更关心：

- Latency；
- Low Overhead；
- Fast Failure / Retry。

更可能考虑：

**NONE / QUERY**

### 少量重型长 Query

例如：

- ETL；
- CTAS；
- 大规模 Batch Transformation；
- 长时间 Aggregation / Join。

更关心：

- 不要因为单节点失败整条从头重跑；
- 能承受额外 I/O。

更适合考虑：

**TASK**

这不是绝对规则，

而是 Workload Fit（负载匹配）。

## Connector 也必须支持 FTE

FTE 不是只改 Trino Core 配置就一定可用。

当前 Trino 对 FTE 的支持存在 Connector Boundary。

例如 Iceberg Connector 当前支持 FTE，

但不能假设：

> 所有 Connector、所有 SQL Statement 都拥有完全相同的 Retry 能力。

所以生产上线前必须核对：

**目标 Connector + 目标 Statement**

是否支持对应 Retry Mode。

## Retry 也必须有上限

如果一个 Task 因为确定性 Bug：

```text
每次执行都失败
```

无限 Retry 没有意义。

所以 FTE 还需要：

- Retry Attempt Limit；
- Retry Delay；
- Backoff。

这和分布式系统的一般原则一致：

> Retry 用来处理 Transient Failure（瞬时失败），不是掩盖确定性错误。

例如：

- SQL Parse Error；
- 权限错误；
- 永远不可达的数据；

不能靠 FTE 自动治好。

## Task Size 为什么影响恢复成本

TASK Retry 还有一个很重要的粒度问题。

### Task 太大

失败时：

**需要重做很多数据**

并且：

**单个 Task 可能需要超出 Worker 能承受的资源。**

### Task 太小

会产生：

- Task Scheduling Overhead；
- Coordinator / Runtime Metadata 开销；
- 大量小 Exchange Object；
- 管理成本。

所以 Task Retry 本质上还引入：

**Recovery Granularity（恢复粒度）**

这个设计问题。

当前 Trino 提供 Fault-Tolerant Execution 的 Task Sizing 配置帮助控制这种粒度。

## Worker 挂掉以后发生什么

以 TASK Retry 为例：

```text
1. Worker X 执行 Task B7
2. 上游 Exchange Output 已经 Spool
3. Worker X Failure
4. Coordinator 识别 Task B7 失败
5. 新 Worker Y 获得 Retry Task
6. Worker Y 从 Exchange Storage 重新读取输入
7. Task B7 重新执行
8. Query 继续
```

重点不是背事件名。

而是理解：

**恢复成立是因为输入还在。**

如果中间输入已经不可恢复，

就无法只重做局部 Task。

## FTE 解决不了什么

FTE 不解决：

### Bad SQL

语法错误、类型错误不会因为 Retry 变正确。

### Bad Plan

Join Strategy 本身很差，

重试只会：

**重新执行一个很差的 Plan。**

### Unlimited Resource Demand

单 Task 永远需要超过任意 Worker 可用 Memory，

Retry 多少次都不会成功。

### Business Logic Error

计算逻辑错误不会被 Fault Tolerance 修复。

所以：

> Reliability 不是用 Retry 掩盖所有问题。

FTE 只解决它适合的 Failure Domain。

## 前 10 节到这里形成什么模型

现在 Trino 主链已经非常完整：

**Query Engine**

→ **Coordinator / Worker**

→ **Connector**

→ **Planning**

→ **Stage / Task / Split**

→ **Scan / Pushdown**

→ **Statistics / CBO / Join**

→ **Memory / Exchange**

→ **Concurrency / Resource Group**

→ **Fault-Tolerant Execution**

最后只剩一件事：

> 当线上出现“慢、排队、OOM、Skew、Retry、Worker Failure”时，怎样不靠猜，而是沿这条因果链快速定位？

## 关联知识

下一节进入最后一节：

**Observability、Troubleshooting 与 Capacity**

它不会再引入新的核心机制。

而是把前 10 节重新组织成一个生产排障模型：

**Planning → Scan → Join / Exchange → Memory → Queue → Failure / Retry → Capacity**
