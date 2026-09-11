---
id: kb-metricflow-simple-metrics-001
type: knowledge
title: Simple Metrics, Aggregation & Additivity
title_cn: Simple Metrics、聚合与可加性
stage_id: '06'
domain: semantic
topic: metricflow
order: 5
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: metricflow_l5_v1
summary: 当前 MetricFlow 用 Simple Metric 表达基础聚合指标。Simple Metric 直接引用 Semantic Model 中的列或表达式，定义聚合方式、过滤与时间语义，并作为 Ratio、Derived、Cumulative、Conversion 的基础构件。
prerequisites:
  - kb-metricflow-dimensions-time-001
related:
  - kb-metricflow-semantic-graph-joins-001
  - kb-metricflow-ratio-derived-001
---
# Simple Metrics、聚合与可加性

## 30 秒理解

前四节已经回答：

```text
数据在哪个 dbt Model？
→ Semantic Model

一行代表什么业务对象？
→ Entity / Grain

指标可以按什么切？
→ Dimension / Time Dimension
```

现在终于进入：

> **到底要算什么数？**

当前 dbt v1.12+ MetricFlow 的基础指标对象是：

**Simple Metric（简单指标）**。

可以先压成：

```text
Column / Expression
+
Aggregation
+
Optional Filter
+
Metric Time
→ Simple Metric
```

例如：

```text
order_total
+
sum
→ revenue
```

Simple Metric 是后面：

- Ratio；
- Derived；
- Cumulative；
- Conversion；

的基础构件。

## 旧 Measure 为什么不能再当当前主线学

旧版 MetricFlow 常见：

```text
Measure
→ Metric
```

当前规范已经发生变化：

```text
Measure
→ deprecated

Simple Metric
→ current primitive metric object
```

所以现在应该建立：

```text
Semantic Model
├─ Entity
├─ Dimension
└─ Simple Metric
```

而不是继续把 Measure 当成必须先定义的一层。

这里的“Measure”仍可以作为数据建模里的普通概念词使用，

但：

> **不要把旧 MetricFlow Measure YAML 当当前主规范。**

## 一个最小 Simple Metric

当前写法可以是：

```yaml
models:
  - name: fct_orders

    semantic_model:
      enabled: true

    agg_time_dimension: ordered_at

    metrics:
      - name: revenue
        type: simple
        agg: sum
        expr: order_total
```

这四行最重要：

```text
name
type: simple
agg
expr
```

含义：

```text
revenue
= sum(order_total)
```

## `expr` 是什么

`expr` 指定：

> 被聚合的 Column 或 SQL Expression。

例如：

```yaml
expr: order_total
```

也可以是更轻量的表达式。

但要记住 Stage 05 的边界：

如果逻辑已经变成：

- 多层 Join；
- 很复杂的 CASE；
- 需要独立测试；
- 改变数据 Grain；

那更适合先在 dbt Model 中工程化。

Semantic Metric 的 `expr` 更适合：

> **清晰、稳定、真正属于指标语义的表达式。**

## `agg` 决定什么

`agg` 决定：

> 多行数据怎样合成指标值。

当前常见包括：

```text
sum
count
count_distinct
average
min
max
median
percentile
sum_boolean
```

最关键的不是背函数列表，

而是理解：

```text
不同 Aggregation
→ 不同业务语义
```

例如：

```text
sum(order_total)
→ Revenue

count(order_id)
→ Order Rows

count_distinct(customer_id)
→ Distinct Customers

average(order_total)
→ Average Order Value
```

## `count` 和 `count_distinct` 为什么不能随便换

假设：

```text
fct_order_items
grain = one row per item
```

直接：

```text
count(order_id)
```

统计的是：

> Item Row 上出现了多少个 order_id 值。

不是：

> 有多少个 Order。

真正订单数可能要：

```text
count_distinct(order_id)
```

所以指标聚合永远依赖：

**真实 Grain。**

这就是为什么第三节先教 Entity / Grain，

第五节才教 Metric。

## Metric Filter 是什么

Simple Metric 可以定义自己的过滤语义。

例如：

```yaml
- name: paid_revenue
  type: simple
  agg: sum
  expr: order_total
  filter: |
    {{ Dimension('order__status') }} = 'paid'
```

这代表：

```text
paid_revenue
```

本身就包含：

> 只统计 Paid Order。

于是 BI、App、Agent 不需要每次自己重写：

```sql
where status = 'paid'
```

这就是 Semantic Layer 统一口径的核心价值之一。

## Metric Filter 和 Query Filter 有什么区别

### Metric Filter

属于指标定义本身：

```text
paid_revenue
永远只计算 paid
```

### Query Filter

属于本次分析条件：

```text
revenue
where country = 'US'
```

一个定义：

**Metric Meaning（指标含义）**

一个定义：

**Query Context（查询上下文）。**

如果把业务定义全部留给 Query Filter，

指标口径还是会重新散落到 Consumer。

## 什么叫 Additive Metric

Additive（可加性）回答：

> 指标能不能沿某个 Dimension 先分组，再把分组结果相加，仍然得到正确总值？

例如 Revenue：

```text
US Revenue
+
CA Revenue
+
UK Revenue
=
Global Revenue
```

在 Country 维度通常是可加的。

Order Amount 按：

```text
day
country
product
```

通常也比较容易做 Sum。

## 什么叫 Non-additive

有些指标不能在某些 Dimension 上直接相加。

最经典例子：

```text
Account Balance
```

假设：

```text
Sep 1 balance = 100
Sep 2 balance = 120
Sep 3 balance = 90
```

你不能说：

```text
monthly balance
= 100 + 120 + 90
= 310
```

因为 Balance 是：

**状态值**

不是：

**流量值。**

它可能需要：

```text
last value
```

或其他业务规则。

这就是：

**Non-additive Dimension（不可加维度）**。

## `non_additive_dimension` 的意义

Current Simple Metric 可以声明：

```text
non_additive_dimension
```

帮助 MetricFlow 表达：

> 这个指标沿某个 Dimension 不能普通累加。

重要的是理解业务语义：

```text
Metric
+
Dimension
→ aggregation behavior
```

而不是把它当成一个“性能参数”。

如果 Non-additive 规则错了，

最终指标可以：

```text
SQL 完全合法
但业务结果错误
```

## Semi-additive 怎么理解

有些指标：

```text
按 Region 可以加
按 Time 不可以加
```

例如：

```text
end-of-day inventory
```

同一天：

```text
Warehouse A + B + C
```

可以得到总库存。

但：

```text
Day 1 + Day 2 + Day 3
```

没有业务意义。

所以生产指标设计需要问：

```text
这个 Metric
在哪些 Dimension 可加？
在哪些 Dimension 不可加？
```

不是简单分：

```text
这个指标可加 / 不可加
```

两类。

## `fill_nulls_with` 解决什么

假设某天：

```text
没有订单
```

聚合结果可能是：

```text
NULL
```

但业务希望：

```text
0
```

当前 Simple Metric 可以使用：

```yaml
fill_nulls_with: 0
```

这改变的是：

**Metric Result Semantics。**

因为：

```text
NULL
```

和：

```text
0
```

在业务上不是永远等价。

### NULL

可能表示：

> 没有可计算数据。

### 0

表示：

> 明确计算后结果为零。

所以不要机械地给所有 Metric：

```text
fill_nulls_with: 0
```

## `join_to_timespine` 是什么

当前 Simple Metric 还可以：

```yaml
join_to_timespine: true
```

让指标和 Time Spine 对齐，

从而补出连续时间点。

例如实际数据只有：

```text
Sep 1
Sep 3
```

Time Spine 可能提供：

```text
Sep 1
Sep 2
Sep 3
```

配合：

```text
fill_nulls_with: 0
```

可以得到：

```text
Sep 1 = 10
Sep 2 = 0
Sep 3 = 20
```

但 Time Spine 的完整机制放到第 8 节。

## Simple Metric 为什么是高级 Metric 的基础

例如：

### Revenue

```text
Simple Metric
```

### Cost

```text
Simple Metric
```

然后：

```text
Profit
= Revenue - Cost
→ Derived Metric
```

或者：

```text
Conversion Rate
= Converted Users / Opportunities
→ advanced semantic calculation
```

所以现在的 Metric Graph 更像：

```text
Simple Metrics
→ reusable metric building blocks
→ advanced metrics
```

而不是每个复杂指标都重新从底层 Column 写 SQL。

## 一个生产判断顺序

定义 Simple Metric 时依次问：

```text
1. 底层 Semantic Model Grain 是什么？
2. expr 真正代表什么业务值？
3. agg 应该是 sum / count / distinct / average 还是别的？
4. Metric 自带哪些业务 Filter？
5. 默认 Metric Time 是哪个？
6. 哪些 Dimension 上可加？
7. 哪些 Dimension 上不可加？
8. NULL 应该保留还是转成 0？
9. 是否需要连续 Time Spine？
```

如果只回答：

```text
“Revenue 就是 sum(amount)”
```

通常还不够生产级。

## 下一步

到这里我们已经有：

```text
Entity
Dimension
Simple Metric
```

下一个问题是：

> MetricFlow 怎样知道 Revenue 可以去 Customer Model 找 Country，却不能走一条会把 Revenue 放大的危险 Join？

这就是：

**Semantic Graph 与 Join Safety。**
