---
id: kb-metricflow-overview-001
type: knowledge
title: Semantic Layer & MetricFlow Mental Model
title_cn: 语义层与 MetricFlow 心智模型
stage_id: '06'
domain: semantic
topic: metricflow
order: 1
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: metricflow_l5_v1
summary: Semantic Layer 把散落在 SQL、BI、应用和 Agent 中的指标口径收敛成可复用语义。MetricFlow 根据 Semantic Model、Entity、Dimension 和 Metric 生成一致的语义查询 SQL，但它不是新的数据库或计算引擎。
prerequisites:
  - kb-dbt-overview-001
  - kb-dbt-contracts-versions-001
related:
  - kb-metricflow-semantic-model-001
---
# 语义层与 MetricFlow 心智模型

## 30 秒理解

先把 Semantic Layer（语义层）压成一句话：

> **把“业务想问什么”与“底层表怎么 Join、怎么算”之间建立一个统一的语义接口。**

没有语义层时，同一个指标可能被重复写在：

```text
BI SQL
Dashboard
Notebook
Application
Agent SQL
```

最后出现：

```text
Revenue A
≠ Revenue B
≠ Revenue C
```

MetricFlow 要解决的是：

```text
dbt Models
→ Semantic Definitions
→ Metric Query
→ Generated SQL
→ Target Data Platform
```

它负责：

- Semantic Model；
- Entity；
- Dimension；
- Metric；
- Semantic Graph；
- Query Generation；
- Validation。

但它不是：

- Warehouse；
- Query Engine；
- Serving Database；
- Agent Runtime。

## 为什么只有 dbt Model 还不够

dbt 已经可以把 Transformation 做得很好：

```text
Source
→ stg_orders
→ fct_orders
→ dim_customer
```

并且有：

- Test；
- Contract；
- Documentation；
- Lineage；
- CI。

但 dbt Model 主要回答：

> **数据模型如何被构建。**

它不会自动回答：

> Revenue 到底是哪一列怎么算？

也不会自动回答：

> Revenue by customer_country 需要经过哪条业务关系？

更不会自动保证：

> BI、App、Agent 用的是同一个 Revenue 定义。

所以 dbt 解决：

**Transformation Engineering（转换工程）**

Semantic Layer 继续解决：

**Business Semantics（业务语义）。**

## 指标为什么容易失控

假设公司定义：

```text
GMV
= paid order amount
- refunded amount
```

如果没有统一语义层：

### BI A

```sql
sum(order_amount)
where status = 'paid'
```

### BI B

```sql
sum(order_amount - refund_amount)
```

### Agent

```sql
sum(order_amount)
where payment_time is not null
```

三个 SQL 看起来都“有道理”，

但其实已经是三套口径。

真正的问题不是：

> SQL 写错了。

而是：

> **业务定义没有一个机器可执行的权威入口。**

## Semantic Layer 做了什么

Semantic Layer 把业务语义显式定义出来。

可以先理解成四层：

```text
Physical Model
→ Semantic Model
→ Metric Definition
→ Semantic Query
```

### Physical Model

例如：

```text
fct_orders
dim_customers
```

由 dbt 构建。

### Semantic Model

告诉 MetricFlow：

```text
这个模型代表什么业务对象？
哪些 Column 是 Entity？
哪些是 Dimension？
默认时间是什么？
```

### Metric

告诉系统：

```text
到底聚合什么？
怎么聚合？
怎么组合？
```

### Semantic Query

消费者只表达：

```text
我要 metric = revenue
group by customer__country
time grain = month
```

MetricFlow 再负责生成实际 SQL。

## MetricFlow 是什么

MetricFlow 可以高层理解成：

> **Semantic Graph + Metric Query Generation Engine。**

它拿到：

```text
Metric
Dimensions
Filters
Time Range
```

再根据语义图决定：

- 从哪个 Semantic Model 出发；
- 哪些 Dimension 可以到达；
- 是否需要 Join；
- 使用哪些 Entity 做 Join；
- 最终怎样生成 SQL。

所以 MetricFlow 不只是：

> 指标 YAML 解析器。

更重要的是：

> **它把语义定义转成可执行 Query Plan / SQL。**

## MetricFlow 不是 Query Engine

假设 MetricFlow 最后生成：

```sql
select
    customer.country,
    sum(orders.order_total)
from ...
join ...
group by ...
```

真正执行这条 SQL 的仍然是：

- Snowflake；
- BigQuery；
- Databricks；
- Redshift；
- 或当前官方支持的其他平台。

目标平台决定：

- Scan；
- Hash Join；
- Shuffle；
- Memory；
- Spill；
- Physical Plan。

所以：

```text
MetricFlow
→ semantic SQL generation

Data Platform
→ physical SQL execution
```

这是后面性能排障的核心边界。

## Semantic Graph 和 dbt DAG 不是一回事

dbt DAG：

```text
stg_orders
→ fct_orders
```

表达：

> `fct_orders` 构建依赖 `stg_orders`。

MetricFlow Semantic Graph：

```text
orders
→ customer entity
→ customers
```

表达：

> 一个订单指标可以通过 customer 业务关系访问客户维度。

一个是：

**Build Dependency Graph（构建依赖图）**

一个是：

**Semantic Relationship Graph（语义关系图）**。

不能混为一谈。

## 为什么语义层对 BI 有价值

BI 不再需要每张图都重新写：

```text
Join
Filter
Aggregation
Metric Formula
```

而是尽量消费：

```text
governed metric
+
governed dimensions
```

这样：

```text
Dashboard A
Dashboard B
Notebook
```

共享同一个定义。

## 为什么语义层对 Agent 更重要

Agent 最大风险之一是：

> 模型会自己拼 SQL，但不知道真正业务口径。

如果 Agent 直接面对所有 Raw Table：

```text
LLM
→ guesses tables
→ guesses joins
→ guesses metric formula
```

结果可能语法正确，

但业务口径错误。

如果给 Agent 一个：

**Semantic Query Tool**

它可以表达：

```text
metric = conversion_rate
group_by = customer__region
```

真正 Join 和 Metric Formula 由受治理 Semantic Layer 控制。

因此：

```text
Semantic Layer
→ narrows the agent's freedom
→ improves governed correctness
```

Stage 10 再讲 Agent Planner / Router / Executor。

## Semantic Layer 和 DataHub 也不是一回事

MetricFlow 主要定义：

```text
how to compute governed metrics
```

DataHub 后面主要负责：

```text
enterprise discovery
ownership
glossary
cross-system lineage
governance
```

两者可以共享 Metadata，

但职责不同。

## Semantic Layer 和 Serving Table 也不是一回事

Semantic Layer 回答：

> 这个指标怎么算？

Serving Layer 回答：

> 怎样把结果以低延迟、高并发方式服务出去？

例如：

```text
MetricFlow query
→ generated SQL
→ warehouse
```

如果每次现场计算太慢，

后面可能需要：

```text
Serving Table
OLAP
Cache
Export
Precomputation
```

这些属于 Stage 09 的物理 Serving 设计。

所以：

```text
semantic consistency
≠
low-latency serving
```

## 一个最小心智示例

假设有两个 dbt Model：

```text
fct_orders
dim_customers
```

语义层声明：

```text
fct_orders
- Entity: order
- Foreign Entity: customer
- Time Dimension: ordered_at
- Metric: revenue

dim_customers
- Entity: customer
- Dimension: country
```

消费者提出：

```text
revenue
by
customer__country
```

MetricFlow 可以沿：

```text
revenue
→ fct_orders
→ customer entity
→ dim_customers
→ country
```

找到合法语义路径，

再生成 SQL。

这就是后面 11 节所有内容的主轴。

## 当前版本为什么要特别注意

MetricFlow / dbt Semantic Layer 正处于快速演进期。

当前 dbt v1.12+ 规范已经发生一个非常重要的变化：

```text
旧：Measure → Metric
新：Simple Metric 直接定义基础聚合
```

所以我们整个 V1 都以：

**当前语义规范**

为主，

旧 Measure 只作为 Migration Context（迁移背景）出现。

## 这 12 节最终要回答什么

整个 MetricFlow Vertical 最终回答：

> **已经有稳定 dbt Model 以后，怎样把 Business Entity、Dimension、Metric、Join 和 Time Semantics 变成一个可验证、可查询、可被 BI / App / Agent 共同消费的语义系统？**

下一步先进入真正的资源入口：

**dbt Model → Semantic Model。**
