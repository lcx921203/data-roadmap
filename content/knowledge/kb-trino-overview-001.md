---
id: kb-trino-overview-001
type: knowledge
title: Trino Overview & System Mental Model
title_cn: Trino 总览与核心心智模型
stage_id: '04'
domain: lakehouse
topic: trino
order: 12
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: trino_l5_v1
summary: 先建立 Trino 的核心心智模型：它是分布式 SQL Query Engine，不拥有业务数据存储，通过 Coordinator、Connector 与 Worker 把外部数据源变成一个可执行的分布式查询。
prerequisites: []
related:
  - kb-trino-query-lifecycle-001
  - kb-iceberg-trino-read-path-001
---
# Trino 总览与核心心智模型

## 30 秒理解

Trino 是 **Distributed SQL Query Engine（分布式 SQL 查询引擎）**。

它最核心的能力不是“自己把数据存下来”，而是：

**让一个 SQL Query（查询）跨多个 Worker 并行执行，并通过 Connector（连接器）访问外部数据源。**

先记住这条主链：

**Client → Coordinator → Catalog / Connector → Workers → Data Source → Result**

Trino 负责：

- 解析 SQL；
- 生成和优化 Query Plan（查询计划）；
- 把计划拆成分布式执行单元；
- 调度 Worker；
- 通过 Connector 访问 Iceberg、Hive、MySQL、PostgreSQL 等数据源；
- 汇总并返回结果。

数据真正放在哪里、表格式怎样维护 Snapshot、底层数据库怎样持久化数据，并不是 Trino 自己完成的。

## 为什么说 Trino 不是数据库

很多人第一次接触 Trino，会因为它支持 SQL、Table、Schema、Catalog，就把它理解成一个数据库。

这个理解不够准确。

传统数据库通常同时拥有：

**Storage（存储） + Transaction（事务） + Query Engine（查询引擎）**

而 Trino 的核心职责主要是：

**Query Engine**

它自己没有一个统一的业务数据存储层要求所有数据必须先导入 Trino。

例如同一个 Trino Cluster 可以同时访问：

- Iceberg 表；
- Hive 表；
- MySQL；
- PostgreSQL；
- 其他支持的 Data Source。

所以 Trino 更像一个统一的 SQL 计算与访问层。

## Trino 为什么能查不同数据源

关键不是 Trino 内核“天生理解所有数据库”。

真正的关键是 **Connector（连接器）**。

每一种 Connector 都负责把外部系统的概念翻译成 Trino 能理解的统一接口。

比如 Trino 需要知道：

- 有哪些 Schema；
- 有哪些 Table；
- Column 名称和 Data Type 是什么；
- 数据位于哪里；
- 能不能把 Filter 下推到数据源；
- 怎样把实际数据读成 Trino 的执行输入。

所以：

**Trino Core 不直接理解 Iceberg Manifest，也不直接理解 MySQL Storage Engine。**

它通过对应 Connector 与这些系统交互。

后面第 3 节会专门讲这层边界。

## 一条 Query 的高层链路

用户执行：

```sql
SELECT customer_id, SUM(amount)
FROM lakehouse.sales.orders
WHERE order_date >= DATE '2026-09-01'
GROUP BY customer_id;
```

先不要管 Join、Memory 和 Pushdown。

只看最高层：

**第一步：Client 提交 SQL**

CLI、JDBC、BI 工具或应用把 SQL 发给 Trino。

**第二步：Coordinator 理解 Query**

Coordinator 负责：

- Parse（解析）；
- Analyze（语义分析）；
- Plan（规划）；
- Optimize（优化）；
- Schedule（调度）。

**第三步：Connector 告诉 Trino 外部数据是什么**

例如 `lakehouse` 这个 Trino Catalog 对应 Iceberg Connector。

Connector 帮 Trino拿到表、列、类型、统计信息和可读取的数据范围。

**第四步：Coordinator 把计划分发给 Worker**

Worker 不重新设计 Query。

它执行 Coordinator 已经规划好的 Task。

**第五步：Worker 访问 Data Source 并处理数据**

Worker 执行 Scan、Filter、Aggregation、Join 等 Operator。

**第六步：结果返回 Client**

最终结果沿执行链路汇总，再返回调用方。

## Trino 的优势来自哪里

Trino 常被用于 Interactive Analytics（交互式分析），但它不是靠某一个“神奇优化”变快。

性能来自多层共同作用：

- 多 Worker 并行；
- Pipeline Execution（流水线执行）；
- Predicate / Projection Pushdown（谓词 / 列下推）；
- Partition / File Pruning（分区 / 文件裁剪）；
- Cost-Based Optimization（基于成本的优化）；
- Join Distribution；
- Dynamic Filtering（动态过滤）；
- 尽量减少不必要的数据扫描和网络移动。

所以以后排查 Trino 慢查询时不能只问：

> Worker 数够不够？

真正要看：

**计划是否合理、数据是否裁剪、Join 是否选对、Exchange 是否过重、Memory 是否健康、并发是否失控。**

这些会在后面的章节逐步建立。

## Trino 和 Spark 是什么关系

不要把问题简化成：

**Trino 快，Spark 慢**

或者：

**Trino 只能查，Spark 才能算**

这两种说法都不准确。

更合理的理解是：

**Trino**

更强调分布式 SQL Query Engine、交互式分析、联邦查询和 SQL-first 工作负载。

**Spark**

是更通用的数据计算引擎，除了 SQL，还覆盖更广泛的数据处理、编程 API 和批流计算场景。

现实架构里两者经常共同存在。

比如：

**Spark / Flink 写 Iceberg**

**Trino 查询同一批 Iceberg 表**

而不是必须二选一。

## Trino 和 Iceberg 的边界

这是整个 Trino Vertical Slice 最重要的边界之一。

Iceberg 已经回答：

**当前 Snapshot 下，哪些 Data / Delete Content 构成表状态，以及哪些文件应该成为候选读取对象。**

Trino 接下来回答：

**拿到外部数据源提供的 Metadata / Split 以后，如何把一个 SQL 真正变成分布式 Query。**

所以后面 Trino 第 6 节提到 Iceberg 时，只讲 Trino 视角的：

**Connector → Split → Scan**

不会重新讲：

**Snapshot → Manifest List → Manifest → Delete Applicability**

## 这一章接下来怎么学

Trino 先按 Query 的真实生命周期往下拆：

**Trino 是什么**

→ **Coordinator / Worker**

→ **Catalog / Connector**

→ **SQL → Plan**

→ **Stage / Task / Split / Driver / Operator**

等“Query 是怎么跑起来的”完整以后，再进入：

**Scan → Join → Memory → Concurrency → FTE → Troubleshooting**

## 关联知识

下一节进入 **Coordinator、Worker 与 Query Lifecycle**。

先回答：

> 一条 SQL 进入 Trino 后，到底是谁接住它，谁规划它，谁执行它？
