# Spark Knowledge Spine V0.8.0

## 目标

V0.8.0 只冻结 Spark 的学习结构。

不写正文，不新增 UI，不创建 12 篇空 Markdown。

Spark 的难点不是概念少，而是概念特别容易被拆成：

```text
Driver
Executor
Job
Stage
Task
Shuffle
Partition
Catalyst
AQE
Skew
Cache
Streaming
...
```

如果按术语逐个学，最后会知道很多名词，却说不清一个 Spark Application 为什么会变慢、为什么会 Shuffle、为什么会 OOM、为什么 Streaming State 会持续增长。

因此 V1 只接受一条因果主线。

---

## 为什么是 12 节，不硬套 11 节

Iceberg 和 Trino 各自用 11 节闭环，但章节数量不是产品规范。

Spark 同时覆盖：

```text
Batch / Spark SQL
+
Structured Streaming
```

如果强行压缩，最容易牺牲的是 Streaming：

```text
Micro-batch
State
Watermark
Checkpoint
Exactly-once
```

会被挤成一个巨大的杂项章节。

所以 Spark V1 固定 12 节，以知识完整性优先。

---

## 主因果链

```text
Spark 是什么
→ 谁在运行 Application
→ Transformation 为什么先不执行
→ Action 如何形成 Job / Stage / Task
→ Shuffle 为什么切 Stage
→ Partition 怎样决定并行度
→ SQL / DataFrame 怎样变成 Physical Plan
→ Join / AQE 怎样决定数据移动
→ Skew 为什么形成 Shuffle 长尾
→ Memory / Cache / Spill 为什么形成资源压力
→ Streaming 怎样增量运行
→ State / Watermark / Checkpoint 怎样保证状态与恢复
→ 最后怎样排障、回填和做容量规划
```

---

## 01｜Spark 总览与核心心智模型

先回答：

- Spark 是什么；
- 为什么它是 Compute Engine，不是 Storage；
- Batch、Spark SQL、Structured Streaming 为什么可以共用执行基础；
- Spark 与 Iceberg / Trino / Flink 分别在哪一层。

不提前讲 Driver / Executor 细节。

---

## 02｜Driver、Executor、Cluster Manager 与 Application Lifecycle

回答：

```text
spark-submit
→ Cluster Manager
→ Driver
→ Executors
→ Application Running
```

建立进程和资源模型。

这里不进入 Job / Stage / Task。

---

## 03｜DataFrame、Dataset、Lazy Evaluation 与 DAG

回答：

> 为什么写了一串 Transformation，Spark 却没有马上执行？

核心：

```text
Transformation
→ Logical Dependency
→ Lazy Evaluation
→ Action
→ Execution
```

RDD 只作为底层执行抽象背景，不把本章变成 RDD API 教程。

---

## 04｜Job、Stage、Task、Narrow/Wide Dependency 与 Shuffle

这是 Spark 执行模型的核心层级。

```text
Action
→ Job
→ Stage
→ Task
```

并在这里讲清：

```text
Narrow Dependency
vs
Wide Dependency
→ Shuffle
→ Stage Boundary
```

---

## 05｜Partition、Parallelism、Repartition 与 Coalesce

上一节知道 Task 执行 Partition。

这一节回答：

> 到底有多少 Task 可以并行？为什么一个 Partition 太大或太小都会出问题？

主线：

```text
Partition
→ Task Count
→ Parallelism
→ Task Size
→ Repartition / Coalesce
→ Output Files
```

这里可以和后续 Iceberg Write 建立接口，但不重新讲 Iceberg Distribution / Manifest。

---

## 06｜Spark SQL、Catalyst 与 Physical Plan

现在才进入 Spark SQL Optimizer。

```text
SQL / DataFrame
→ Unresolved Logical Plan
→ Analyzed Logical Plan
→ Optimized Logical Plan
→ Physical Plan
```

并建立：

```text
EXPLAIN
Statistics
Pushdown / Pruning
```

作为观察入口。

---

## 07｜Join Strategy、Statistics 与 AQE

因果链：

```text
Statistics
→ Join Strategy
→ Broadcast / Sort Merge / Shuffled Hash
→ Shuffle / Memory Cost
→ Runtime Statistics
→ AQE
→ Plan Adjustment
```

AQE 不是单独的“优化开关”，而是利用 Runtime Statistics 修正执行计划。

---

## 08｜Data Skew、Shuffle Pressure 与 Straggler

上一节的 Join 真正运行以后，进入数据分布问题：

```text
Hot Key
→ Uneven Shuffle Partition
→ Large Task
→ Straggler
→ Stage waits
```

这一节再比较：

- AQE Skew Handling；
- Salting；
- Repartition；
- Speculation 的边界。

明确：

**Salting 不是默认答案。**

---

## 09｜Memory、Cache/Persist、Serialization、Spill 与 OOM

现在才进入 Memory，因为前面已经知道：

```text
一个 Task 到底处理多少数据
```

主线：

```text
Task Working Set
→ Execution Memory
→ Storage Memory
→ Cache / Persist
→ Serialization
→ Spill
→ GC / OOM
```

不能把 Cache 讲成“用了就快”，也不能把 Spill 讲成免费扩容。

---

## 10｜Structured Streaming 执行模型

Batch / SQL 主线完整以后进入 Streaming。

第一步只回答：

```text
Unbounded Input
→ Stream as Table
→ Incremental Query
→ Trigger
→ Progress / Offset
```

当前版本必须区分：

- 默认 Micro-batch；
- Spark 4.x Real-Time Mode；
- Continuous Processing。

不能简单说：

```text
Spark 4.x = 已经完全变成纯流引擎
```

也不能继续说：

```text
Spark Streaming 永远只有 Micro-batch
```

---

## 11｜State、Event Time、Watermark、Checkpoint 与 Exactly-once

第二个 Streaming 节点解决真正困难的状态问题：

```text
Event Time
→ Late Data
→ Watermark
→ State
→ State Cleanup
```

以及恢复链：

```text
Source Offset
+
Checkpoint
+
Replay
+
Sink Semantics
→ End-to-end Delivery Guarantee
```

必须明确：

**Checkpoint 本身 ≠ Exactly-once。**

Exactly-once 要看 Source、Engine、Sink 整条链。

---

## 12｜Failure、Observability、Backfill 与 Capacity

最后不再重新发明 Spark 核心机制。

把前面压成生产排障链：

```text
Application slow / failed
→ Driver?
→ Job / Stage?
→ Shuffle?
→ Skew?
→ Task Working Set?
→ Executor / GC / OOM?
→ Streaming Backlog / State?
→ Resource Competition?
```

再进入：

- Spark UI；
- Retry；
- Executor Loss；
- Backfill；
- Resource Isolation；
- Capacity；
- Cost。

---

## 和 Iceberg 的边界

Spark 负责：

```text
Partition
→ Shuffle
→ Task
→ Writer-side compute behavior
```

Iceberg 负责：

```text
Data File
→ Manifest
→ Snapshot
→ Commit
```

因此后面讲：

> Spark 为什么产生很多小文件

可以讲。

但不能在 Spark 章节重新讲：

> Manifest List / Manifest / Snapshot 到底怎样提交。

---

## 和 Trino 的边界

两者都有 SQL Optimizer，但问题不同。

Spark 主线：

```text
Application
→ Batch / SQL / Streaming Compute
→ Catalyst
→ Stage / Task / Shuffle
```

Trino 主线：

```text
Interactive / Federated Query
→ Coordinator
→ Connector
→ Distributed Query Runtime
```

所以不会复制 Trino 的 Resource Group / FTE 章节。

---

## 和 Flink 的边界

Spark 可以解释自己的：

- Micro-batch；
- Real-Time Mode；
- State；
- Watermark；
- Checkpoint；

但不会提前讲：

- JobManager / TaskManager；
- Operator Chain；
- Checkpoint Barrier Alignment；
- Flink State Backend。

等 Flink Vertical Slice 时再完整建立它自己的模型。

---

## Interview Seed

现有真实 Evidence 可以自然进入 Spark：

```text
Job / Stage / Task
Repartition / Coalesce
Broadcast Join
Data Skew / Salting
Cache / Persist
Join Slowdown
Large-scale with Limited Resources
Large Dataset Tech Selection
```

但 Relation 只表示：

```text
内容相关
```

不改变每道题原来的 Evidence / Frequency。

---

## Freeze Definition

V0.8.0 冻结：

- 12 节顺序；
- 每节职责；
- 前置依赖；
- must-explain；
- must-not-cover；
- Spark / Iceberg / Trino / Flink 边界；
- Interview Evidence Seed。

尚未开始：

- 12 篇正文；
- Spark Scale Scenario；
- Spark Interview Answer；
- Spark UI 修改。
