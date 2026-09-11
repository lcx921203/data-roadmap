---
id: kb-trino-query-lifecycle-001
type: knowledge
title: Coordinator, Worker & Query Lifecycle
title_cn: Coordinator、Worker 与 Query Lifecycle
stage_id: '04'
domain: lakehouse
topic: trino
order: 13
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: trino_l5_v1
summary: Trino 的 Coordinator 负责接收、分析、规划和调度 Query，Worker 负责执行被分配的 Task；Query Lifecycle 把两者串成一条完整运行链。
prerequisites:
  - kb-trino-overview-001
related:
  - kb-trino-catalog-connector-spi-001
---
# Coordinator、Worker 与 Query Lifecycle

## 30 秒理解

一个 Trino Cluster 最先要分清两个角色：

**Coordinator（协调节点）**

负责：

**接 Query → 分析 → 规划 → 调度 → 跟踪执行**

**Worker（工作节点）**

负责：

**执行 Task → 读取 Split → 运行 Operator → 和其他 Task 交换数据**

所以不是每个 Worker 都自己理解一遍 SQL。

一条 Query 的高层生命周期可以先记成：

**Submit → Admission / Planning → Scheduling → Running → Result**

具体内部状态很多，但现在最重要的是先理解职责和阶段，而不是背枚举值。

## Coordinator 到底负责什么

Coordinator 是 Query 的“大脑”。

它承担的核心职责包括：

- 接收 Client 请求；
- Parse SQL；
- Analyze Table / Column / Type；
- 获取 Catalog / Connector Metadata；
- 生成 Logical Plan；
- 执行 Optimizer；
- 生成 Distributed Plan；
- 切分 Stage；
- 调度 Task 到 Worker；
- 跟踪 Query 和 Task 状态；
- 协调最终结果返回。

所以如果一个问题发生在：

**SQL 还没有真正开始扫描数据之前**

比如：

- SQL 解析很慢；
- Metadata 获取很慢；
- Planning 很慢；
- Stage 长时间没调度出去；

首先要看 Coordinator 侧，而不是直接加 Worker。

## Worker 到底负责什么

Worker 是执行节点。

它接收 Coordinator 下发的 Task，并真正做数据处理。

典型工作包括：

- 从 Connector 读取 Split；
- 执行 Filter；
- 执行 Projection；
- 执行 Aggregation；
- 构建或 Probe Join；
- Sort；
- Window；
- 与其他 Worker 做 Exchange；
- 把部分结果继续发送到下游 Stage。

Worker 不负责重新决定：

> 这个 SQL 应该怎么优化？

它执行的是已经被 Planner / Optimizer 规划好的分布式工作。

## 为什么 Coordinator 和 Worker 要分开

如果每个 Worker 都自己解析、优化和决定 Join 顺序，就会出现：

- 每个节点需要重复做全局规划；
- 很难形成统一的执行计划；
- 很难协调跨 Worker 的 Stage Dependency；
- 很难统一管理 Query 生命周期。

所以 Trino 把：

**全局理解与调度**

集中在 Coordinator，

把：

**并行数据处理**

分散到 Worker。

这就是后面理解 Stage / Task 的基础。

## Query 提交以后发生什么

以一个简单 SQL 为例：

```sql
SELECT region, SUM(amount)
FROM lakehouse.sales.orders
GROUP BY region;
```

高层链路可以这样理解。

### 1. Client 提交 Query

CLI、JDBC、BI Tool 或 Application 通过 Trino 的 Client Protocol 提交 SQL。

这时 Query 只是文本。

### 2. Admission / Queue

如果集群配置了 Resource Group（资源组）和并发限制，Query 可能需要等待资源。

这一节只知道：

**Query 不一定提交后马上执行。**

具体 Queue / Resource Group 放到第 9 节。

### 3. Parse 与 Analyze

Coordinator 需要知道：

- SQL 语法是否合法；
- `lakehouse.sales.orders` 是否存在；
- `region` 和 `amount` 是什么类型；
- `SUM(amount)` 是否合法；
- 当前 Session / Catalog / Schema 是什么。

这时就会开始调用 Connector Metadata。

### 4. Planning 与 Optimization

Coordinator 把 SQL 变成 Plan，并进行优化。

例如：

- Filter 能不能提前；
- Aggregation 在哪一层做；
- 数据如何分布；
- 后续是否需要 Exchange。

第 4 节专门讲。

### 5. Scheduling

Distributed Plan 形成以后，Coordinator 开始决定：

- 哪些 Stage 可以启动；
- 哪些 Worker 执行哪些 Task；
- Split 分配给哪些 Task。

### 6. Worker Execution

Worker 真正执行 Scan 和 Operator。

如果多个 Stage 之间需要交换数据，就通过 Exchange 把数据发给其他 Task。

### 7. Result 返回

最终 Stage 生成结果，并通过 Coordinator / Client Protocol 返回给调用方。

## Query Lifecycle 为什么对排障重要

以后你看到：

> Trino Query 很慢

第一反应不能是“性能差”。

应该先问：

**慢在哪个生命周期阶段？**

例如：

**Planning 慢**

可能和：

- Metadata；
- Connector；
- Table / Partition 数量；
- Plan 复杂度；

有关。

**Running 慢**

才更多可能和：

- Scan；
- Join；
- Exchange；
- Memory；
- Skew；

有关。

**Queued 很久**

更可能和：

- 并发；
- Resource Group；
- Cluster Capacity；

有关。

因此 Query Lifecycle 是后面整个 Production Troubleshooting 的坐标系。

## Coordinator 是不是也能执行 Task

从心智模型上先把 Coordinator 和 Worker 职责分开最重要。

生产部署通常会避免让 Coordinator 承担大量数据处理，以保护 Planning 和 Scheduling。

Trino 也允许通过配置决定 Coordinator 是否参与 Worker Task 调度。

所以不要把：

**Coordinator = 永远绝对不执行任何数据处理**

当成协议级铁律。

更准确地说：

> Coordinator 的首要职责是全局 Query Management；Worker 的首要职责是数据执行。

## 这一节先不要学什么

现在不要提前展开：

- Connector SPI 具体接口；
- Optimizer Rule；
- Broadcast / Partitioned Join；
- Resource Group 配置；
- Task Retry；
- Fault-Tolerant Execution。

因为这些都需要前面的执行模型先建立完整。

## 关联知识

下一节进入 **Catalog、Connector 与 SPI 边界**。

现在已经知道 Coordinator 在 Planning 时要向外部数据源获取 Table、Column、Statistics 和 Split 信息。

下一节回答：

> Trino 自己不存这些数据，它到底通过什么接口把不同系统接进来？
