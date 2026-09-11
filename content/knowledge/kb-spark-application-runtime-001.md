---
id: kb-spark-application-runtime-001
type: knowledge
title: Driver, Executor, Cluster Manager & Application Lifecycle
title_cn: Driver、Executor、Cluster Manager 与 Application Lifecycle
stage_id: '02'
domain: compute
topic: spark
order: 2
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: spark_l5_v1
summary: Spark Application 由 Driver 负责全局控制和调度，Cluster Manager 负责资源分配，Executor 负责执行 Task 并保存 Application 的运行数据。
prerequisites:
  - kb-spark-overview-001
related:
  - kb-spark-dataframe-lazy-dag-001
---
# Driver、Executor、Cluster Manager 与 Application Lifecycle

## 30 秒理解

一个经典 Spark Cluster Application 可以先记成：

```text
spark-submit
    ↓
Driver
    ↓
Cluster Manager
    ↓
Executor A
Executor B
Executor C
```

三类角色先一次分清：

**Driver（驱动进程）**

负责：

**运行用户主程序 + 建立计划 + 调度 Task + 跟踪 Application**

**Cluster Manager（集群资源管理器）**

负责：

**给 Application 分配计算资源**

**Executor（执行进程）**

负责：

**真正运行 Task + 保存 Application 的运行数据**

所以：

> Driver 是“大脑”，Executor 是“执行者”，Cluster Manager 是“资源分配者”。

## Spark Application 是什么

Spark Application 不是一个 Task，也不是一个 Job。

它是用户提交的一次完整 Spark 应用运行实例。

官方定义可以压缩成：

**Application = Driver + Executors**

例如执行：

```bash
spark-submit jobs/daily_sales.py
```

通常就是启动一个 Application。

这个 Application 生命周期里可能包含：

- 一个 Job；
- 多个 Job；
- 很多 Stage；
- 大量 Task。

所以层级不要混：

```text
Application
└─ Job
   └─ Stage
      └─ Task
```

后面第 4 节再正式讲 Job / Stage / Task。

## Driver 到底负责什么

Driver 是 Application 的控制中心。

用户程序的主逻辑运行在这里。

例如 PySpark：

```python
from pyspark.sql import SparkSession

spark = (
    SparkSession.builder
    .appName("daily-sales")
    .getOrCreate()
)

orders = spark.read.parquet("s3://lake/orders")
result = orders.groupBy("region").count()
result.write.parquet("s3://serving/result")
```

从高层看，Driver 会参与：

- 创建 SparkSession / SparkContext；
- 运行用户控制逻辑；
- 建立 DataFrame / RDD 依赖；
- 生成和提交执行工作；
- 切分并调度 Task；
- 跟踪 Executor 和 Task 状态；
- 收集部分结果；
- 维护 Application 生命周期。

所以如果 Driver 出问题，

整个 Application 通常都无法正常继续协调。

## Executor 到底负责什么

Executor 是为某个 Spark Application 启动的执行进程。

它最主要的工作是：

- 接收 Driver 下发的 Task；
- 读取数据 Partition；
- 执行计算；
- 做 Shuffle Read / Write；
- 为 Cache / Persist 保存数据；
- 把 Task 状态和结果反馈给 Driver。

一个 Executor 通常能并行运行多个 Task，

具体同时跑多少取决于它可用的 CPU Core 和调度情况。

因此：

**Executor ≠ 一个 Task**

也不是：

**一个 Executor 只能处理一个 Partition。**

更准确地说：

> Executor 是长期存在的 Application 级执行进程，Task 才是一份具体工作。

## 为什么每个 Application 有自己的 Executor

经典 Spark Application 模型中，

每个 Application 会获得自己的一组 Executor。

这带来一个很重要的边界：

**不同 Application 的 Task 不会直接在同一个 Executor JVM 里混跑。**

这样可以形成一定的：

- Scheduling Isolation；
- Memory Isolation；
- Failure Isolation。

但它也意味着：

> 两个 Spark Application 不能把某个 Executor 内存中的 Cache 当成共享缓存直接复用。

跨 Application 共享数据通常仍然需要：

- External Storage；
- Table；
- Cache Service；

等外部机制。

## Cluster Manager 到底做什么

Cluster Manager 不负责理解：

> 这个 SQL 应该做 Broadcast Join 还是 Sort Merge Join？

它的核心职责是：

**资源管理。**

Spark 当前常见 Cluster Manager 包括：

- Spark Standalone；
- YARN；
- Kubernetes。

Driver 会向 Cluster Manager 申请资源，

然后在 Cluster 上获得 Executor。

所以：

```text
Driver
→ request resources
→ Cluster Manager
→ allocate executors
```

Cluster Manager 决定：

> Application 能拿到多少、在哪些 Node 上拿到资源。

Spark Driver 再决定：

> 这些 Executor 上具体跑哪些 Task。

这是两个不同层级。

## 为什么 Driver 必须能和 Executor 通信

Driver 不只是提交时出现一次，然后消失。

在整个 Application 生命周期里，

Driver 需要持续：

- 向 Executor 下发 Task；
- 接收 Task 状态；
- 处理失败；
- 调度新的工作；
- 协调整个执行图。

所以 Driver 和 Executor 之间必须持续可通信。

这也是为什么生产部署时：

**Driver 的网络位置、稳定性和资源**

都很重要。

如果把 Driver 放在离 Worker 很远、网络不稳定的位置，

Application 控制面本身就会受到影响。

## Client Mode 和 Cluster Mode

这里先只理解 Driver 在哪里。

### Client Mode

```text
提交端机器
└─ Driver

Cluster
└─ Executors
```

Driver 跑在提交命令所在的外部客户端环境。

优点：

- 交互调试直观；
- Driver 日志容易直接看到。

风险：

- 提交机器断开；
- 网络离 Cluster 太远；
- 本地环境不稳定；

都可能影响 Driver。

### Cluster Mode

```text
Cluster
├─ Driver
└─ Executors
```

Driver 被部署到 Cluster 内部。

通常更适合长期运行的生产 Job。

这里只记：

> Deploy Mode 决定 Driver 的运行位置。

不要把它和：

**Executor 数量**

混在一起。

## Driver 需要大量数据吗

通常不应该。

一个常见危险操作是：

```python
rows = huge_df.collect()
```

`collect()` 会把结果返回 Driver。

如果数据非常大：

```text
大量数据
→ Driver
→ Driver Memory Pressure
→ OOM
```

所以分布式计算的基本原则是：

> 大数据尽量留在 Executor 侧并行处理，只把真正小的结果返回 Driver。

这也是为什么后面讲 Action 时，

不能把所有 Action 都理解成：

> 把数据拉回 Driver。

有些 Action 会：

- 写外部 Storage；
- 统计 Count；
- 返回少量结果；

行为不同。

## Application 从提交到运行的高层链路

可以压缩成：

**1. 提交 Application**

```text
spark-submit
```

**2. 启动 Driver**

Driver 创建 Spark Runtime。

**3. 连接 Cluster Manager**

申请 Executor Resource。

**4. 启动 Executors**

每个 Executor 准备执行 Task。

**5. Driver 构建计算**

用户代码建立 DataFrame / RDD Transformation。

**6. 触发执行**

Action 或 Write 让 Driver 开始真正调度。

**7. Executors 运行 Task**

处理 Partition，产生中间结果或最终输出。

**8. Application 结束**

Driver 退出，Executor 也随之释放。

## Driver 慢和 Executor 慢不是一回事

以后排障先区分：

### Driver / Control Plane 问题

例如：

- Driver GC；
- 大量 Task Scheduling；
- 很大的 Plan；
- collect 大量结果；
- Driver OOM。

### Executor / Data Plane 问题

例如：

- Task 很慢；
- Shuffle；
- Skew；
- Executor OOM；
- GC；
- Spill。

如果不先分清角色，

就会出现：

> Executor OOM，加 Driver Memory。

这种没有对准问题层级的调参。

## 这一节先不要学什么

现在先不展开：

- Job / Stage / Task 精确划分；
- Catalyst；
- Join Strategy；
- Executor Memory 配置；
- YARN / Kubernetes 内部机制。

因为下一步还要先回答：

> Driver 为什么知道“后面要做哪些计算”？

## 关联知识

下一节进入 **DataFrame、Dataset、Lazy Evaluation 与 DAG**。

现在已经知道谁在控制 Application。

下一步回答：

> 为什么 `filter()`、`select()`、`groupBy()` 写完以后，Spark 经常还没有真正去读完整数据？
