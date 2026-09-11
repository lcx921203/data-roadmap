---
id: kb-spark-partition-parallelism-001
type: knowledge
title: Partition, Parallelism, Repartition & Coalesce
title_cn: Partition、Parallelism、Repartition 与 Coalesce
stage_id: '02'
domain: compute
topic: spark
order: 5
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: spark_l5_v1
summary: Partition 是 Spark 分布式计算的工作切片；一个 Stage 的 Partition 数决定 Task 数的主要上界，但真正并发还受 Executor Core 和 Cluster 资源限制。Repartition 与 Coalesce 用不同代价改变数据分布。
prerequisites:
  - kb-spark-job-stage-task-shuffle-001
related:
  - kb-spark-sql-catalyst-planning-001
  - kb-iceberg-write-distribution-ordering-001
---
# Partition、Parallelism、Repartition 与 Coalesce

## 30 秒理解

上一节已经建立：

**Stage → Tasks**

现在补上最关键的一层：

**Partition → Task**

对于某个 Stage，

可以先理解：

> **一个 Partition 通常由一个 Task 处理。**

所以：

```text
Partition Count
→ Task Count
→ 可并行工作的数量
```

但真正同时执行多少 Task，还要受：

```text
Executor Count
× Executor Cores
× Available Resources
```

限制。

因此：

**Partition 决定“有多少份工作”**

**Executor Resource 决定“同时能做多少份工作”**

这两个概念必须分开。

## Partition 到底是什么

Partition（分区）是一个 Distributed Dataset 的逻辑数据切片。

例如 1 TB 数据可以被划分成：

```text
P0
P1
P2
...
P199
```

这些 Partition 分散在集群上被 Task 处理。

Partition 不是：

- Executor；
- CPU Core；
- 文件；
- Table Partition。

这几个概念经常被混淆。

尤其要注意：

**Spark Partition**

和：

**Hive / Iceberg Table Partition**

不是同一个层级。

Spark Partition 是：

**计算工作切片。**

Table Partition 是：

**数据组织 / Metadata 语义。**

## 一个 Partition 就一定等于一个输入文件吗

不一定。

读取文件型数据源时，

Spark 会根据：

- File；
- File Size；
- File Split；
- Data Source；
- 配置和规划；

组织 Input Partition。

所以可能出现：

**一个大文件 → 多个 Input Partition**

也可能出现：

**多个小文件 → 被组合到某些读取 Partition**

具体取决于 Data Source 和读取规划。

因此不要用：

> 文件 100 个，所以 Spark 一定 100 个 Partition。

这种简单等式。

## Partition 和 Task 的关系

对某个 Stage：

```text
P0 → Task 0
P1 → Task 1
P2 → Task 2
...
```

所以如果一个 Stage 有：

```text
1000 Partitions
```

通常会有：

```text
1000 Tasks
```

但假设 Cluster 当前只能同时跑：

```text
100 Tasks
```

那 Spark 会分多批次执行。

所以：

```text
1000 Task
≠
1000 并发
```

真正并发大致受可用 Core 和调度资源约束。

## Partition 太少会怎样

假设有：

```text
2 TB 数据
```

却只有：

```text
20 Partitions
```

每个 Partition 平均可能非常大。

后果可能是：

```text
Partition 太大
→ Task 很大
→ 单 Task 执行时间长
→ Memory Working Set 大
→ 并行度不足
→ Cluster 很多 Core 闲着
```

即使有 200 个可用 Core，

只有 20 个 Task 时，

也不可能让 200 个 Core 都持续参与这一 Stage。

所以：

> 加 Executor 不一定提高性能。

如果 Partition 太少，

根本没有足够 Task 可以分发。

## Partition 太多会怎样

反过来，

把一小批数据切成几十万个极小 Partition，

也不一定更快。

后果可能是：

```text
Partition 太小
→ Task 太多
→ Scheduling Overhead
→ Task Startup Cost
→ Shuffle Metadata / File 增长
→ 小文件风险
```

所以 Partition 目标不是：

**越多越好**

而是：

> 每个 Task 有足够工作量，同时又能保持健康的并行度和 Working Set。

具体大小需要结合 Workload 校准，

不能靠一个固定万能数字。

## Parallelism 到底是什么

Parallelism（并行度）可以理解成：

> 某个时刻可以有多少独立工作并行推进。

Spark 中至少要区分：

### Logical Parallelism

来自：

**Partition / Task 数量。**

例如 500 Partition 意味着 Stage 有足够多独立 Task。

### Physical Concurrency

来自：

**Executor Resource。**

例如：

```text
10 Executors
× 4 Cores
≈ 40 Task Slots
```

高层可以理解一次大约能同时运行几十个普通 CPU Task。

但真实调度还会受到：

- Resource Profile；
- Task CPU Requirement；
- Cluster 共享；
- Dynamic Allocation；

等影响。

所以不要把上面的乘法当成永久固定公式。

## Repartition 是什么

`repartition()` 用来重新分布数据。

例如：

```python
df = df.repartition(200)
```

高层含义：

```text
Old Partitions
→ Shuffle
→ Redistribute
→ 200 New Partitions
```

它可以：

- 增加 Partition；
- 减少 Partition；
- 按表达式 / Column 重新分布；
- 改善不均衡分布。

代价是：

**需要 Shuffle。**

因此 `repartition()` 不是免费的“改数字”。

## 为什么 Repartition 可以改善分布

假设原来：

```text
P0 = 50 GB
P1 = 2 GB
P2 = 1 GB
P3 = 1 GB
```

明显不均衡。

Repartition 后可能变成：

```text
P0 = 14 GB
P1 = 13 GB
P2 = 14 GB
P3 = 13 GB
```

这能降低：

- 单个巨大 Task；
- Straggler；
- Memory Hotspot。

但如果数据本身存在极端 Hot Key，

简单 `repartition(key)` 仍可能继续倾斜。

真正 Skew 问题放到第 8 节。

## Coalesce 是什么

`coalesce()` 更常用于：

**减少 Partition 数量。**

例如：

```python
small = df.coalesce(20)
```

典型目标是：

> 上游 Filter 后数据已经很少，不需要继续保留几百个 Partition。

与 `repartition()` 不同，

DataFrame `coalesce()` 通常会尽量避免完整 Shuffle，

通过把已有 Partition 合并成更少 Partition 来减少工作。

优点：

- 成本相对低；
- 减少 Task；
- 减少输出文件数量。

风险：

> 因为没有完整重新洗牌，数据可能不够均衡。

所以如果真正需要：

**Balanced Redistribution（均衡重分布）**

通常要考虑 `repartition()`。

## Repartition 和 Coalesce 怎么选

可以先用一条简单原则。

### 需要增加 Partition

使用：

```text
repartition
```

因为必须产生更多新的分布单元。

### 需要减少 Partition，而且数据本来比较均匀

可以考虑：

```text
coalesce
```

避免不必要的完整 Shuffle。

### 需要减少 Partition，但同时必须重新均衡数据

更适合：

```text
repartition
```

虽然成本更高，但分布更可控。

所以不是：

> 减少分区永远用 coalesce。

要看你是否需要重新分布。

## 一个简单例子

```python
orders = spark.read.parquet("/orders")

paid = orders.filter("status = 'PAID'")

output = paid.coalesce(20)

output.write.parquet("/paid_orders")
```

如果 Filter 后数据量已经很小，

`coalesce(20)` 可以避免保留过多 Task 和大量小输出。

但如果上游 200 Partition 的数据极度不均：

```text
某些 Partition 20GB
某些 Partition 100MB
```

直接 Coalesce 可能继续保留不均衡。

这时可能需要：

```python
paid.repartition(20)
```

用 Shuffle 换更均衡的分布。

## Partition 和输出文件有什么关系

这是 Spark 和 Iceberg / Data Lake 很重要的交界。

写文件时：

```text
Output Tasks
→ Writers
→ Files
```

Partition / Task 数量会强烈影响输出文件数量。

但不要简单背：

```text
1 Spark Partition = 永远 1 Data File
```

因为：

- Dynamic Partition Write；
- Table Partition；
- Writer Fanout；
- File Rolling；
- Data Source 实现；

都可能让一个 Task 产生一个或多个文件。

更准确地说：

> **Spark 的 Task / Partition Distribution 是输出文件数量和大小的重要上游因素。**

后面和 Iceberg Write Ordering / Distribution 连起来时，

这个边界非常重要。

## Small Files 为什么可能从 Spark 开始

假设：

```text
实际只有 20 GB 数据
却使用 10,000 个 Output Tasks
```

那平均每个 Task 的数据很少。

容易形成：

```text
Too many tasks
→ Too many writers
→ Many small files
```

Iceberg 后面可以做 Compaction，

但更好的生产思路通常是：

> 先问为什么 Writer 侧会产生这么碎的数据，而不是永远靠下游 Compaction 擦屁股。

所以 Spark Partition Strategy 和 Iceberg Table Health 是连着的。

## 一个常见错误：为了少文件直接 coalesce(1)

```python
df.coalesce(1).write.parquet(...)
```

确实可能减少输出文件。

但它也会把大量数据压到极少 Task 上：

```text
Parallelism ↓
→ Single Task Working Set ↑
→ Runtime ↑
→ OOM Risk ↑
```

所以：

> 文件越少越好

同样是错误目标。

真正目标是：

**健康的文件大小 + 健康的并行度 + 可接受的写入成本。**

## 为什么这一节现在还不讲 AQE

现代 Spark 可以通过 AQE：

- Coalesce Post-shuffle Partitions；
- 调整 Join Strategy；
- 处理部分 Skew。

但如果现在就直接说：

> AQE 会自动帮你调 Partition。

会掩盖基本模型。

必须先知道：

**Partition / Task / Shuffle**

原本是什么，

下一轮才理解：

> AQE 到底在运行时改变了哪一层。

## 前 5 节现在形成什么模型

到这里可以完整说出：

```text
Spark Application
→ Driver / Executors
→ Lazy Transformations
→ Action
→ Job
→ Shuffle Boundaries
→ Stages
→ Partitions
→ Tasks
→ Executors execute
```

并且已经知道：

```text
Partition Count
→ Task Count
→ Parallelism
→ Task Size
→ Output File Shape
```

这就是 Spark Core Execution Model。

## 关联知识

下一节进入 **Spark SQL、Catalyst 与 Physical Plan**。

现在已经知道：

> Spark 怎么把工作分布式跑起来。

下一步才进入：

> 对 SQL / DataFrame 来说，Spark 到底怎样决定“应该以什么 Physical Plan 跑”？
