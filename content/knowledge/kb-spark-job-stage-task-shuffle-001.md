---
id: kb-spark-job-stage-task-shuffle-001
type: knowledge
title: Job, Stage, Task, Narrow/Wide Dependency & Shuffle
title_cn: Job、Stage、Task、Narrow/Wide Dependency 与 Shuffle
stage_id: '02'
domain: compute
topic: spark
order: 4
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: spark_l5_v1
summary: Action 触发 Job，Job 会按照 Shuffle Dependency 切成 Stage；每个 Stage 再为自己的 Partition 生成 Task。Shuffle 是 Spark 执行模型里最关键的分布式边界之一。
prerequisites:
  - kb-spark-dataframe-lazy-dag-001
related:
  - kb-spark-partition-parallelism-001
---
# Job、Stage、Task、Narrow/Wide Dependency 与 Shuffle

## 30 秒理解

这一节先把 4 个核心概念一次串起来：

**Action**

→ **Job**

→ **Stage**

→ **Task**

Stage 为什么会被切开？

核心原因之一是：

**Shuffle Dependency（Shuffle 依赖）**

所以完整主链可以记成：

```text
Transformation DAG
→ Action
→ Job
→ 遇到 Shuffle Boundary
→ Multiple Stages
→ 每个 Stage 按 Partition 产生 Tasks
```

最重要的一句话：

> **Task 是 Spark 真正发送给 Executor 的工作单位；Stage 是一组可以在同一种数据依赖条件下执行的 Task；Shuffle 会让上下游 Stage 之间必须重新分布数据。**

## Job 是什么

Job 是一次由结果需求触发的并行计算。

例如：

```python
df.count()
```

需要真正得到 Count，

因此会触发 Spark 执行。

又例如：

```python
df.write.parquet("/result")
```

需要真正写出数据，

同样会触发计算。

所以学习阶段先记：

**Action → Job**

但不要把 Job 理解成：

> 整个 Spark Application。

一个 Application 可以有很多 Job。

例如：

```python
df.count()
df.write.parquet("/result")
```

这两个 Action 就可能分别触发计算。

## Stage 是什么

Job 通常不能简单当成一组完全独立的 Task 一次跑完。

原因是某些计算需要先完成一轮数据重新分布，

下游才能继续。

因此 Job 会被切成多个 Stage。

可以先理解：

> **Stage 是一组彼此可以 Pipeline 执行、直到遇到 Shuffle Boundary 为止的 Task。**

例如：

```text
Read
→ Filter
→ Map
→ Shuffle
────────────
→ Aggregate
→ Write
```

可以形成类似：

```text
Stage 1
Read → Filter → Map → Shuffle Write

Stage 2
Shuffle Read → Aggregate → Write
```

Stage 2 依赖 Stage 1 的 Shuffle Output。

## Task 是什么

Task 是 Spark 发给 Executor 的最小核心执行单位之一。

对于某个 Stage：

**一个 Partition 通常对应一个 Task。**

例如某 Stage 有：

```text
200 Partitions
```

就会产生大约：

```text
200 Tasks
```

这些 Task 可以分散到多个 Executor 并行执行。

但注意：

**200 Tasks ≠ 200 个 Task 同时运行。**

真正同时能跑多少还受：

- Executor 数量；
- Executor Core；
- Resource Profile；
- Cluster 当前资源；

限制。

所以：

**Task Count**

和：

**Concurrent Task Count**

不是一个概念。

## Narrow Dependency 是什么

Narrow Dependency（窄依赖）高层可以理解成：

> 一个 Parent Partition 的数据只需要流向有限、确定的 Child Partition，不需要把整个数据集重新洗牌。

典型 Transformation：

- `map`
- `filter`
- `mapPartitions`

例如：

```text
Parent P0 → Child P0
Parent P1 → Child P1
Parent P2 → Child P2
```

这种情况下，

多个 Transformation 往往可以在同一个 Stage 内 Pipeline：

```text
Read Partition
→ Filter
→ Map
→ Project
```

数据不需要先全局落地再重新分发。

## Wide Dependency 是什么

Wide Dependency（宽依赖）意味着：

> 下游 Partition 可能需要来自多个上游 Partition 的数据。

最经典例子：

```python
df.groupBy("customer_id").count()
```

因为相同 `customer_id` 的数据可能原来散落在所有 Partition。

为了让：

```text
customer_id = 123
```

的数据聚到一起，

Spark 必须重新分布数据。

这就进入：

**Shuffle。**

## Shuffle 到底在做什么

Shuffle 是：

**按照新的 Partition Rule，把上游数据重新分配到下游 Partition。**

例如：

```text
Before

P0: A B C
P1: A C D
P2: B D E

按 key 重新分布

After

P0: A A
P1: B B
P2: C C D D E
```

真实分布不是这个简单顺序，

但核心就是：

> 原来不在一起的数据，为了下一步计算，必须跨 Partition / Executor 重新聚集。

## 为什么 Shuffle 会形成 Stage Boundary

如果没有 Shuffle：

Executor 可以处理自己的 Partition：

```text
Read
→ Filter
→ Map
```

一路 Pipeline 下去。

但发生 Shuffle 后：

下游 Task 需要等上游产生它需要的 Shuffle Output。

也就是：

```text
Upstream Tasks
→ Shuffle Write
→ Shuffle Data Ready
→ Downstream Tasks
→ Shuffle Read
```

因此上下游不能再简单作为一条本地 Pipeline。

这就是：

**Shuffle → Stage Boundary**

的核心原因。

## 哪些操作容易产生 Shuffle

典型包括：

- `groupByKey`
- `reduceByKey`
- `join`
- `distinct`
- `repartition`
- 某些排序 / 聚合场景

但在 DataFrame / SQL 里，

不要仅凭 API 名字机械判断最终一定怎样执行。

因为后面 Catalyst / AQE 可能选择：

- Broadcast；
- 不同 Join Strategy；
- 不同 Physical Plan。

所以这一节建立的是：

**Shuffle 的执行机制**

不是：

**所有 SQL 的固定计划。**

## Shuffle 为什么贵

Shuffle 通常会带来：

- Serialization（序列化）；
- Disk I/O；
- Network I/O；
- Shuffle File；
- Memory Buffer；
- 下游重新读取；
- 数据分布不均风险。

可以压缩成：

```text
Local Compute
→ Data Redistribution
→ Disk / Network / Serialization
→ New Partitions
→ Downstream Compute
```

因此很多 Spark 性能问题最终都会和：

**Shuffle Volume**

有关。

但第 8 节才会完整讲 Shuffle Pressure / Skew。

现在先理解边界。

## 一个例子：groupBy 为什么切 Stage

```python
orders = spark.read.parquet("/orders")

result = (
    orders
    .filter("status = 'PAID'")
    .groupBy("customer_id")
    .sum("amount")
)
```

逻辑上：

```text
Read
→ Filter
→ GroupBy customer_id
→ Sum
```

在 `filter` 阶段：

每个 Partition 可以独立处理。

但 `groupBy(customer_id)` 需要：

> 同一个 customer_id 的记录进入同一个目标 Partition。

因此需要：

```text
Stage 1
Read → Filter → Shuffle Write

Stage 2
Shuffle Read → Aggregate
```

这就是 Job / Stage / Shuffle 第一次真正连起来。

## Task 失败会怎样

Spark 的基础容错能力允许 Task Failure 后重新调度。

如果某个 Task 失败：

Driver 可以在可用 Executor 上重新运行对应工作。

恢复可能利用：

- 原始数据；
- Lineage；
- 已存在的 Shuffle Output；
- Cache / Checkpoint；

具体取决于失败发生在哪一层。

现在只记：

> **Task 是可重试的执行单元，Lineage 让很多丢失结果可以重新计算。**

完整 Failure / Retry 留到第 12 节。

## Spark Stage 和 Trino Stage 是一回事吗

不是。

两个系统都使用 `Stage` 这个词，

但不能因为名字相同就认为内部语义完全一样。

Spark 这里最重要的是：

**Shuffle Dependency → Stage Boundary**

Trino Stage 则来自：

**Distributed Plan / Exchange Fragment**

所以学习时要跟随各自 Runtime Model。

## 一个常见错误：看到很多 Stage 就一定不好

Stage 多不一定自动等于性能差。

真正要问：

- 为什么切 Stage？
- Shuffle Data 多大？
- 每个 Stage 有多少 Task？
- 是否存在不必要的数据重分布？
- 下游是否倾斜？

Stage 数量只是现象。

**Shuffle Cost 和 Data Distribution**

才是更关键的因果。

## 这一节先不要学什么

现在先不展开：

- Broadcast Join；
- AQE；
- Shuffle Partition 参数调优；
- Skew Salting；
- Memory / Spill；
- Speculation。

下一节先把：

**Partition → Task → Parallelism**

这条关系讲清。

## 关联知识

下一节进入 **Partition、Parallelism、Repartition 与 Coalesce**。

现在已经知道：

> 一个 Stage 会按 Partition 生成 Task。

下一步自然就是：

> Partition 数量到底怎样影响并行度？为什么不是越多越好？
