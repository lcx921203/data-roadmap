---
id: kb-trino-query-planning-001
type: knowledge
title: SQL to Logical & Distributed Plan
title_cn: 从 SQL 到 Distributed Plan
stage_id: '04'
domain: lakehouse
topic: trino
order: 15
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: trino_l5_v1
summary: Coordinator 把 SQL 经 Parse、Analyze、Logical Planning 与 Optimization 转换成 Distributed Plan；Plan 是理解 Trino 性能和执行路径的核心中间层。
prerequisites:
  - kb-trino-catalog-connector-spi-001
related:
  - kb-trino-stage-task-split-001
---
# 从 SQL 到 Distributed Plan

## 30 秒理解

SQL 不是直接发给 Worker 执行。

Coordinator 需要先完成一条转换链：

**SQL Text**

→ **Parser**

→ **AST**

→ **Analyzer**

→ **Logical Plan**

→ **Optimizer**

→ **Distributed Plan**

Worker 最终执行的不是原始 SQL 字符串，而是 Distributed Plan 拆出来的实际执行工作。

所以理解 Trino 性能，必须从：

> SQL 写了什么

继续走到：

> Trino 实际计划怎么做。

## Parser：先把 SQL 变成结构

例如：

```sql
SELECT customer_id, SUM(amount)
FROM lakehouse.sales.orders
WHERE order_date >= DATE '2026-09-01'
GROUP BY customer_id;
```

Parser（解析器）首先关心语法。

它会把 SQL Text 解析成 AST（Abstract Syntax Tree，抽象语法树）。

这一步主要回答：

- SELECT 在哪里；
- FROM 是什么；
- WHERE 是什么表达式；
- GROUP BY 有哪些字段；
- Function Call 是什么。

它还没有决定：

> 这张表到底怎么扫最划算？

## Analyzer：语法合法还不够

SQL 能 Parse，不代表它语义正确。

Analyzer（分析器）继续回答：

- `lakehouse.sales.orders` 是否存在；
- `customer_id` 是否存在；
- `amount` 是什么 Data Type；
- `SUM(amount)` 是否支持；
- Column 引用是否有歧义；
- Function / Cast 是否合法；
- Session / Catalog / Schema 应该如何解析。

这里会大量依赖前一节讲的：

**Catalog / Connector Metadata**

所以：

**Analyzer 和 Connector 是连起来的。**

如果 Metadata 获取很慢，Planning 也可能慢。

## Logical Plan：先表达“要做什么”

完成语义分析以后，Planner 会形成 Logical Plan（逻辑计划）。

可以把它理解成一个 Operator Tree（算子树）的高层表示。

例如：

```text
Aggregation
↑
Filter
↑
Table Scan
```

它表达：

1. 先从 Orders 读取数据；
2. Filter 掉不满足日期条件的数据；
3. 再按 customer_id 聚合。

这里关心的是：

**逻辑上需要哪些操作。**

还没有完整表达：

- 哪个 Worker 做；
- 数据怎么跨节点移动；
- Stage 怎么拆。

## Optimizer：为什么同一个 SQL 可以有不同计划

Logical Plan 形成后，Optimizer 会做一系列优化。

高层可以先分成两类。

### Rule-based Optimization

根据确定性规则重写 Plan。

例如：

- 去掉不必要的表达式；
- 尽量让 Filter 提前；
- 简化部分表达式；
- 做 Projection Pruning。

### Cost-based Optimization

利用 Statistics 和 Cost Model 比较候选计划。

例如以后会看到：

- Join Order；
- Join Distribution；
- Build / Probe 选择。

这一节只知道：

**Optimizer 会改变 Plan。**

具体 Join 决策放到第 7 节。

## Distributed Plan：开始考虑“在哪执行”

Logical Plan 解决：

> 要做什么？

Distributed Plan 开始解决：

> 这些操作怎样拆到多个节点上一起做？

这时会出现非常重要的边界：

**Exchange**

因为某些 Operator 之间需要重新分布数据。

例如 Group By：

```text
Worker A ─┐
Worker B ─┼→ Exchange → Final Aggregation
Worker C ─┘
```

或者 Join：

需要让具有相同 Join Key 的数据按照某种方式进入合适的执行节点。

因此 Distributed Plan 是：

**Logical Operator + Distribution Requirement**

真正开始接近集群运行形态的地方。

## 为什么 EXPLAIN 很重要

不要把 EXPLAIN 理解成：

> DBA 才看的东西。

对 Trino 来说，它是连接：

**SQL**

和：

**实际执行计划**

最直接的观察工具之一。

例如：

```sql
EXPLAIN
SELECT *
FROM tpch.tiny.orders
WHERE orderkey > 100;
```

也可以根据需要观察不同计划类型。

例如：

```sql
EXPLAIN (TYPE LOGICAL)
SELECT *
FROM tpch.tiny.orders
WHERE orderkey > 100;
```

以及：

```sql
EXPLAIN (TYPE DISTRIBUTED)
SELECT *
FROM tpch.tiny.orders
WHERE orderkey > 100;
```

学习阶段不要先背 EXPLAIN 里所有 Node。

先训练一个能力：

> SQL 里写的 Filter、Aggregation、Join，最后在 Plan 里落到了哪里？

## Planning 慢不等于 Worker 慢

这是一个非常重要的生产思维。

如果 Query 很久都还没真正开始大规模执行，问题可能出在：

- Metadata 获取；
- Connector；
- 大量 Partition / File 枚举；
- Plan 复杂度；
- Optimizer；
- Statistics。

这时加 Worker 往往没有直接作用。

反过来：

如果 Planning 很快、Running 很慢，

才更多进入：

- Scan；
- Join；
- Exchange；
- Memory；
- Skew。

所以后面排障第一步经常是：

**Planning 还是 Execution？**

## 为什么这一节还不讲 Join Strategy

虽然 Join Strategy 本质上是 Plan 的一部分，但现在如果立刻深入：

- Join Reordering；
- Broadcast；
- Partitioned；
- Dynamic Filtering；

会把知识链打散。

现在只建立：

**SQL → Logical Plan → Optimizer → Distributed Plan**

下一阶段先把 Distributed Plan 变成真实执行单元。

等 Stage / Task / Split 明白以后，再进入 Scan 和 Join。

## 关联知识

下一节进入 **Stage、Task、Split、Driver 与 Operator**。

现在已经有了 Distributed Plan。

下一步回答：

> Plan 不是代码，它到底怎样被拆成 Worker 真正能执行的工作？
