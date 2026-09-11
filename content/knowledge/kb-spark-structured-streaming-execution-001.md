---
id: kb-spark-structured-streaming-execution-001
type: knowledge
title: Structured Streaming Execution Model
title_cn: Structured Streaming 执行模型
stage_id: '02'
domain: compute
topic: spark
order: 10
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: spark_l5_v1
summary: Structured Streaming 建立在 Spark SQL 引擎之上，把持续输入抽象成不断增长的 Table，并用 Incremental Query 持续更新结果。默认仍是 Micro-batch，同时 4.x 还存在 Real-Time Mode 与 Continuous Processing。
prerequisites:
  - kb-spark-memory-cache-spill-001
related:
  - kb-spark-streaming-state-reliability-001
---
# Structured Streaming 执行模型

## 30 秒理解

Structured Streaming 不是：

> 另一个完全独立于 Spark SQL 的 Streaming Engine。

它的核心模型是：

**Unbounded Input（无界输入）**

→ **Unbounded Table（持续增长的表）**

→ **DataFrame / SQL Query**

→ **Incremental Execution（增量执行）**

→ **Result Table / Sink**

所以用户仍然可以写：

```python
events = (
    spark.readStream
    .format("kafka")
    .option("subscribe", "events")
    .load()
)

result = (
    events
    .selectExpr("CAST(value AS STRING)")
)
```

真正变化的是：

> 输入不会结束，Query 会持续获得新数据并不断推进 Progress。

## Stream as a Table 是什么意思

Structured Streaming 最核心的心智模型是：

> 把持续到来的数据看成一张不断追加的新表。

例如：

```text
10:00
Table contains rows 1-100

10:01
Table logically contains rows 1-150

10:02
Table logically contains rows 1-230
```

但 Spark 不会每次都：

> 从第一行重新计算整张无限表。

它会：

**只处理新的输入**

+

**复用需要保留的 State**

+

**更新结果。**

这就是 Incremental Query（增量查询）。

## 为什么 Batch SQL 和 Streaming SQL 能长得很像

例如静态：

```python
df.groupBy("region").count()
```

流式：

```python
streaming_df.groupBy("region").count()
```

表达逻辑非常接近。

因为两者都建立在：

**Spark SQL / DataFrame Engine**

上。

差异主要来自：

- 输入是否持续；
- 是否需要 State；
- Trigger；
- Output Mode；
- Checkpoint；
- Failure Recovery。

所以不要理解成：

> Structured Streaming 放弃了 Spark SQL Runtime。

恰恰相反：

> Structured Streaming 建立在同一个结构化执行体系上。

## 默认执行模型：Micro-batch

当前 Spark 4.2.0 默认仍然使用：

**Micro-batch（微批）**

高层过程：

```text
New data available
→ determine input range
→ run one small batch
→ commit progress
→ next batch
```

例如 Kafka：

```text
Batch 100
offset 1000 → 1500

Batch 101
offset 1500 → 1900
```

每个 Micro-batch 可以继续使用 Spark SQL 的：

- Logical Plan；
- Physical Plan；
- Stage；
- Task；
- Shuffle；

等执行机制。

所以 Micro-batch 的核心不是：

> 传统离线任务定时每 5 分钟跑一次。

而是：

> 一个持续运行的 Streaming Query 内部，用连续的小批次推进数据和状态。

## Trigger 是什么

Trigger 决定：

> Query 什么时候尝试推进下一轮处理。

常见概念包括：

### Processing Time Trigger

例如：

```python
query = (
    result.writeStream
    .trigger(processingTime="5 seconds")
    .start()
)
```

表达：

> 按处理时间周期触发新的 Micro-batch。

### Default / As-fast-as-possible

不显式指定时，

Micro-batch 可以在上一批完成后尽快继续推进。

### AvailableNow

处理当前所有可用数据，

可能分成多个 Batch，

处理完成后停止。

它非常适合：

- Incremental Backfill；
- 定时增量消费；
- 替代旧的“一次一批”思路。

## Offset / Progress 为什么重要

Streaming Query 必须知道：

> 我到底处理到哪里了？

对 Kafka 类 Source，

Progress 可以理解成：

```text
Partition 0 offset = ...
Partition 1 offset = ...
```

对其他 Source 则可能是不同 Position。

核心不变：

**Source Progress**

→ **记录本批输入范围**

→ **Batch Commit**

→ **下次从正确位置继续**

所以 Streaming Recovery 的根本不是：

> Job 重启以后重新猜哪里处理过。

而是：

> 有明确的可恢复 Progress / Offset。

## Query Progress 不等于 Kafka Consumer Group Offset

这是一个容易混的边界。

Structured Streaming 对 Source Progress 有自己的 Query Checkpoint 语义。

即使 Source 是 Kafka，

也不要简单把：

> Spark Structured Streaming 恢复

等同于：

> 只依赖 Kafka Consumer Group 自动提交 Offset。

真正恢复状态以 Streaming Query 的：

**Checkpoint / Offset Log / Commit Progress**

为核心。

## Real-Time Mode 是什么

Spark 4.1 起正式加入 Structured Streaming 的 **Real-Time Mode（实时模式）**，4.2 继续存在。

它的目标是：

> 对受支持的 Streaming Query 进一步降低延迟。

当前 API 可以使用 Real-Time Trigger。

但必须明确三个边界。

### 第一：它不是 Structured Streaming 的默认模式

默认模型仍然是：

**Micro-batch。**

### 第二：它不是“所有算子都已经支持”

当前 Real-Time Mode 对：

- Source；
- Operator；
- Sink；

存在明确支持范围和 Allowlist。

所以：

> Spark 有 Real-Time Mode

不等于：

> 任意现有 Streaming Query 改一个参数就能无条件实时运行。

### 第三：它不等于 Flink Runtime

Spark Real-Time Mode 仍属于 Spark Structured Streaming 的演进。

不能因为延迟更低就说：

> Spark 4.x 已经和 Flink 的原生流执行架构完全一样。

两者 Runtime、State、Checkpoint、调度体系仍然不同。

## Continuous Processing 又是什么

Structured Streaming 还保留：

**Continuous Processing（连续处理）**

这是更早引入的实验型低延迟模式。

它和默认 Micro-batch 的一个重要区别是：

> 容错语义和可支持的 Query 范围不同。

官方文档长期明确：

**Micro-batch**

→ 可以提供更强的 Exactly-once 处理语义。

**Continuous Processing**

→ 追求更低延迟，但容错语义是 At-least-once。

所以：

```text
Micro-batch
Real-Time Mode
Continuous Processing
```

不能混成一个东西。

## 为什么不要用“Spark 是批引擎，所以 Streaming 只是伪流”这种说法

这个说法太粗糙。

更准确的是：

**Structured Streaming 是真正持续运行的 Streaming Query Engine。**

但它默认的 Execution Granularity 是：

**Micro-batch。**

同时现代 Spark 又在发展：

**Real-Time Mode。**

所以正确表达应该是：

> Spark Structured Streaming 的默认执行模型是微批，但它是持续流处理系统；Spark 4.x 还提供新的更低延迟模式，不能简单用“只有批”概括。

## Input Rate 和 Processing Rate 为什么要分开

Streaming Production 里有一个非常重要的稳定性判断：

**Input Rate**

vs

**Processing Rate**

如果：

```text
Input = 200k records/s
Processing = 250k records/s
```

通常系统可以追上。

如果持续：

```text
Input = 200k
Processing = 120k
```

那么：

```text
Backlog
→ grows continuously
→ latency grows
```

这就是 Streaming 和 Batch 最重要的生产差异之一：

> Batch 慢通常只是“完成时间变长”，Streaming 跟不上则会形成不断增长的积压。

## Micro-batch Duration 为什么不是越短越好

把 Trigger 从：

```text
10 seconds
```

改成：

```text
100 ms
```

不一定更快。

因为每个 Batch 都有：

- Scheduling；
- Planning；
- Commit；
- State；
- Source / Sink；

固定开销。

如果：

```text
Batch interval too short
→ overhead ratio rises
→ previous batch not finished
→ backlog grows
```

所以正确目标不是：

> Batch 越小越实时。

而是：

> Processing Time 能稳定小于 Arrival Interval，并满足目标 Latency。

## 一个 Streaming Query 的高层生命周期

```text
1. Driver starts Streaming Query
2. Source reports available progress
3. Spark chooses input range
4. Build / reuse execution plan
5. Executors process new data
6. Stateful operators update state if needed
7. Sink writes output
8. Progress is committed
9. Repeat
```

State 和 Checkpoint 下一节完整讲。

## 这一节先不展开什么

暂时不深入：

- State Store；
- Event Time；
- Watermark；
- Late Data；
- Exactly-once；
- TransformWithState。

因为必须先知道：

> Streaming Query 本身是怎样不断推进的。

## 关联知识

下一节进入：

**State、Event Time、Watermark、Checkpoint 与 Exactly-once 边界**。

这一节会回答：

> 当 Query 需要跨多个 Micro-batch 记住历史信息时，Spark 到底把什么留下来，又怎样在失败后恢复？
