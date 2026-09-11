# Trino Knowledge Spine V0.7.0

## 目标

这一阶段只冻结 Trino 的知识结构，不写正文。

Trino 不能被拆成一组平铺术语：

```text
Coordinator
Worker
Split
Join
Memory
Resource Group
...
```

必须形成一条因果链：

```text
Trino 是什么
→ 谁运行 Query
→ 怎么访问外部数据
→ SQL 怎么变成 Plan
→ Plan 怎么变成执行单元
→ 执行单元怎么 Scan
→ Join 为什么产生数据移动
→ 为什么形成 Memory / Exchange 压力
→ 多 Query 为什么产生资源竞争
→ 节点失败以后如何恢复
→ 最后如何观测、排障和做容量规划
```

---

## 与 Iceberg 的边界

Iceberg 已经冻结：

```text
Table Metadata
→ Snapshot
→ Manifest List
→ Manifest
→ Candidate Data Files
→ Delete Applicability
```

Trino 不重新讲这条链。

Trino 从 Query Engine 视角继续：

```text
SQL
→ Coordinator
→ Catalog / Connector
→ Logical / Distributed Plan
→ Stage / Task / Split
→ Worker Scan
→ Join / Exchange
→ Result
```

一句话：

> Iceberg 回答“当前表状态下哪些文件应该读”；Trino 回答“查询引擎怎样把数据源变成一个真正运行的分布式 Query”。

---

## 11 节主线

### 01｜Trino 总览与核心心智模型

回答：

- Trino 是什么；
- 为什么它不是数据库；
- 为什么能够查询多个异构数据源；
- 一条 Query 的高层链路是什么。

这一节绝不深入 Connector SPI、Optimizer、Task、Resource Group。

### 02｜Coordinator、Worker 与 Query Lifecycle

回答：

- Coordinator 做什么；
- Worker 做什么；
- Query 从提交到完成经历什么；
- Scheduling 在整个生命周期中的位置。

这一节不提前讲 Connector SPI、Join 选择和 FTE。

### 03｜Catalog、Connector 与 SPI 边界

回答：

- `catalog.schema.table` 背后是什么；
- Connector 怎样把不同数据源翻译成 Trino 能理解的 Metadata / Statistics / Split；
- Pushdown 能力为什么取决于 Connector。

这一节不重新讲 Iceberg Metadata Tree，也不进入 Plan Runtime。

### 04｜从 SQL 到 Distributed Plan

回答：

```text
SQL
→ Parser
→ Analyzer
→ Logical Plan
→ Optimizer
→ Distributed Plan
```

重点建立 Query Planning 模型。

这一节不深入 Task Runtime、Join CBO 细节和 Memory。

### 05｜Stage、Task、Split、Driver 与 Operator

回答：

- Distributed Plan 怎样真正跑起来；
- Stage / Task / Split 分别是什么层级；
- Worker 内部怎样继续并行执行。

这一节不提前讲 Join 选型、Resource Group 和 Iceberg Delete。

### 06｜Scan、Pushdown 与 Iceberg Read Boundary

回答：

```text
Connector
→ Split Enumeration
→ Predicate / Projection Pushdown
→ Candidate Scan
→ Worker
```

这里引用 Iceberg Read Path，但不复制 Iceberg 内容。

### 07｜Statistics、CBO、Join 与 Dynamic Filtering

因果链：

```text
Statistics
→ Cost Estimation
→ Join Order
→ Build / Probe
→ Broadcast / Partitioned
→ Dynamic Filtering
→ Less Scan
```

这一节要让用户理解：

> Statistics 错，不只是 EXPLAIN 不好看，而可能直接把 Join Strategy 选错。

### 08｜Memory、Exchange 与大查询压力

因果链：

```text
Join / Aggregate / Sort
→ Memory
→ Exchange / Network
→ Skew
→ Spill / Failure
```

Spill 要讲机制与代价，但不再作为现代 Trino 的默认“大查询解决方案”。

### 09｜Concurrency、Queue 与 Resource Group

从：

```text
一个 Query
```

升级到：

```text
很多 Query 同时进入集群
```

回答：

- 为什么单 Query 很快但集群仍然会崩；
- Queue 解决什么；
- Resource Group 怎样限制并发和隔离工作负载。

### 10｜Fault-Tolerant Execution 与失败恢复

回答：

- `retry-policy=QUERY` 和 `TASK` 的思想差异；
- Task Retry 为什么需要 Exchange Manager；
- 为什么把中间 Exchange 数据持久化后才有可能只重做局部 Task；
- FTE 为什么有额外成本。

必须明确：

```text
FTE ≠ Spill
Retry ≠ Free
```

### 11｜Observability、Troubleshooting 与 Capacity

最后把前面重新串起来：

```text
Query 慢
→ Planning?
→ Scan?
→ Join / Exchange?
→ Memory / Skew?
→ Queue / Resource Group?
→ Worker Failure / Retry?
```

这一节不再引入新的核心机制，只负责形成生产排障因果模型。

---

## Interview 边界

当前只登记已有 Evidence 支撑的入口：

```text
iq-olap-engine-selection-001
iq-sql-performance-plan-index-001
```

这里只表示它们与 Trino 学习内容相关。

不表示：

```text
Trino 专项高频
```

Trino-specific Frequency 仍然必须等真实 Evidence。

---

## Freeze Definition

V0.7.0 冻结：

- 11 节顺序；
- 每节职责；
- 每节前置依赖；
- 每节“不讲什么”；
- Iceberg / Trino 边界；
- 当前 Interview Evidence 边界。

尚未开始：

- 11 篇正文；
- Trino Scale Scenario；
- Trino Interview Answer；
- Trino UI 修改。

下一步才进入正文。
