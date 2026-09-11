---
id: kb-spark-overview-001
type: knowledge
title: Spark Overview & System Mental Model
title_cn: Spark 总览与核心心智模型
stage_id: '02'
domain: compute
topic: spark
order: 1
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: spark_l5_v1
summary: 先建立 Spark 的核心心智模型：它是分布式计算引擎，不拥有业务数据存储；同一个执行底座可以承载 Batch、Spark SQL 与 Structured Streaming。
prerequisites: []
related:
  - kb-spark-application-runtime-001
---
# Spark 总览与核心心智模型

## 30 秒理解

Spark 是 **Distributed Compute Engine（分布式计算引擎）**。

它最核心的事情不是：

> 把业务数据长期存在哪里？

而是：

> 把一份计算拆成多个并行任务，分发到多个 Executor 上执行，再把中间结果和最终结果组织起来。

先记住这条最高层主链：

**Application Code / SQL**

→ **Driver**

→ **Cluster Manager 获取资源**

→ **Executors**

→ **Tasks 并行处理 Partition**

→ **External Storage / Result**

Spark 自己不是 HDFS、S3、Iceberg，也不是 MySQL。

它通常从这些外部系统读取数据，完成计算，再把结果写回外部系统。

## Spark 到底解决什么问题

假设有 20 TB 订单数据，需要：

- 清洗；
- Join；
- 聚合；
- 回填历史数据；
- 写入 Iceberg；
- 或持续处理增量数据。

如果只靠一台机器：

**CPU、Memory、Disk、Network**

很快就会成为单机瓶颈。

Spark 的基本思路是：

**把数据分成多个 Partition（分区）**

→ **把计算拆成多个 Task（任务）**

→ **让多个 Executor（执行进程）并行处理**

所以它的核心价值来自：

**Distributed Data + Distributed Compute**

而不是某一个 SQL 语法。

## Spark 不是存储系统

这是后面所有边界的基础。

例如：

```python
orders = spark.read.parquet("s3://lake/orders/")
```

Spark 做的是：

**读取外部存储 → 计算**

真正的数据仍然在：

**S3 / HDFS / Object Storage**

里。

再例如：

```python
orders.writeTo("lakehouse.sales.orders").append()
```

Spark 可以参与：

- 计算；
- Partition；
- Sort；
- Writer Task；

但如果目标是 Iceberg Table：

**Snapshot、Manifest、Commit 语义**

属于 Iceberg。

所以后面即使讲 Spark 写 Iceberg，也不会重新学习 Iceberg Metadata Tree。

## Spark 为什么同时能做 Batch、SQL 和 Streaming

Spark 不是三个互不相关的引擎拼在一起。

更合理的心智模型是：

```text
Spark Application Runtime
        ↓
Distributed Execution
        ↓
Spark SQL / DataFrame Engine
        ↓
Batch / Structured Streaming
```

### Batch

处理有边界的一批数据。

例如：

```python
df = spark.read.parquet("/orders/2026/09/10")
result = df.groupBy("region").sum("amount")
result.write.parquet("/daily_region_sales")
```

### Spark SQL / DataFrame

用结构化信息描述计算。

例如：

```python
spark.sql("""
SELECT region, SUM(amount)
FROM orders
GROUP BY region
""")
```

Spark 能看到：

- Column；
- Data Type；
- Filter；
- Join；
- Aggregate；

因此可以进一步做计划优化。

### Structured Streaming

面对持续增长的数据，

仍然使用 DataFrame / SQL 风格表达 Incremental Query（增量查询）。

所以 Spark 的重要统一点是：

> Batch 和 Streaming 并不是两套完全隔离的用户计算语言。

但 Streaming 的 Trigger、State、Watermark、Checkpoint 会在后面单独学习。

## Spark 和 Trino 有什么区别

两者都可以执行 SQL，但定位不同。

### Spark

更偏：

**General Distributed Compute（通用分布式计算）**

典型场景：

- 大规模 ETL；
- Batch Backfill；
- DataFrame Transformation；
- 写入 Lakehouse；
- Structured Streaming；
- 重型计算任务。

### Trino

更偏：

**Distributed SQL Query Engine（分布式 SQL 查询引擎）**

典型场景：

- Interactive Analytics；
- BI Query；
- Federation；
- 多数据源统一 SQL 查询。

所以不是：

**Spark 能算，Trino 不能算。**

而是两者的：

**Runtime Model、Workload、SLO 和资源管理方式**

不同。

在一个 Lakehouse 架构里经常会看到：

**Spark / Flink 写 Iceberg**

→ **Trino 查询 Iceberg**

## Spark 和 Iceberg 的边界

以后会出现：

> Spark 为什么会写出很多小文件？

这是 Spark 和 Iceberg 的交界。

Spark 可以解释：

**Partition 数量**

→ **Writer Task 数量**

→ **数据分布**

→ **输出文件形态**

Iceberg 再解释：

**Data File**

→ **Manifest**

→ **Snapshot**

→ **Atomic Commit**

所以：

**Spark 负责计算侧**

**Iceberg 负责 Table Format 侧**

不要把两者混成一个组件。

## Spark 和 Flink 的边界

Spark 现在已经具备成熟的 Structured Streaming，也持续发展更低延迟的运行模式。

但后面学习 Spark Streaming 时，不能顺便把 Flink 也讲完。

Spark 只讲自己的：

- Incremental Query；
- Micro-batch；
- State；
- Watermark；
- Checkpoint；
- Real-Time Mode 边界。

Flink 后面会独立学习：

- JobManager / TaskManager；
- Operator Chain；
- State Backend；
- Checkpoint Barrier；
- Native Streaming Runtime。

## 一个 Spark Application 的高层过程

例如：

```python
orders = spark.read.parquet("s3://lake/orders")
paid = orders.filter("status = 'PAID'")
daily = paid.groupBy("order_date").sum("amount")
daily.write.mode("overwrite").parquet("s3://serving/daily_sales")
```

先不要分析 Stage 和 Shuffle。

只看最高层：

**第一步：Driver 建立 Application**

用户代码运行在 Driver 侧。

**第二步：Spark 获得 Executor 资源**

Cluster Manager 帮 Application 分配可以执行任务的资源。

**第三步：Transformation 先形成计算关系**

`filter`、`groupBy` 等操作并不一定马上扫描完整数据。

Spark 先建立依赖和执行计划。

**第四步：Action / Write 触发真正执行**

Driver 把计算拆成可执行工作。

**第五步：Executor 并行处理 Partition**

每个 Task 处理自己的数据分区。

**第六步：必要时发生 Shuffle**

如果不同 Partition 的数据需要重新聚集，

就需要跨节点重新分布数据。

## 为什么 Spark 性能不能只看 Executor 数量

以后遇到：

> Spark Job 很慢

不能直接回答：

> 多加 Executor。

因为慢可能来自：

- Partition 太少；
- Partition 太大；
- Shuffle；
- Data Skew；
- Join Strategy；
- Memory；
- GC；
- Spill；
- Driver；
- Streaming State；
- 外部 Storage。

所以完整排障一定是：

**Execution Model**

→ **Data Distribution**

→ **Physical Plan**

→ **Runtime Resource**

而不是参数列表。

## 这一章接下来怎么学

先把 Batch / Spark SQL 的执行骨架建立完整：

**Spark 是什么**

→ **Driver / Executor**

→ **Lazy Evaluation / DAG**

→ **Job / Stage / Task / Shuffle**

→ **Partition / Parallelism**

之后才进入：

**Catalyst → Join / AQE → Skew → Memory**

最后再进入：

**Structured Streaming → State / Watermark / Checkpoint**

## 关联知识

下一节进入 **Driver、Executor、Cluster Manager 与 Application Lifecycle**。

先回答：

> 当一个 Spark Application 真正被提交以后，谁负责控制它，谁真正执行计算，资源又是谁分配的？
