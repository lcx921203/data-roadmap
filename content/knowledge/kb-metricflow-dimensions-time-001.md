---
id: kb-metricflow-dimensions-time-001
type: knowledge
title: Dimensions, Time Dimensions & Aggregation Time
title_cn: Dimensions、Time Dimension 与 Aggregation Time
stage_id: '06'
domain: semantic
topic: metricflow
order: 4
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: metricflow_l5_v1
summary: Dimension 是 Metric 的 Group By / Slice 语义。当前 MetricFlow Dimension 分为 Categorical 与 Time；Time Dimension 需要 Granularity，Semantic Model 通过 agg_time_dimension 指定默认 Metric Time。
prerequisites:
  - kb-metricflow-entities-grain-001
related:
  - kb-metricflow-simple-metrics-001
  - kb-metricflow-time-spine-cumulative-001
---
# Dimensions、Time Dimension 与 Aggregation Time

## 30 秒理解

Entity 回答：

> **“这个数据和哪个业务对象有关？”**

Dimension 回答：

> **“这个指标可以按照什么维度切？”**

例如：

```text
Revenue
by Country
by Product Category
by Customer Segment
by Month
```

其中：

```text
Country
Product Category
Customer Segment
```

是 Categorical Dimension（分类维度）。

```text
Month
Day
Hour
```

来自 Time Dimension（时间维度）。

当前 MetricFlow Dimension 类型只有：

```text
categorical
time
```

## Dimension 在 SQL 里相当于什么

可以先建立一个粗略映射：

```text
Metric
→ aggregation expression

Dimension
→ group by / filter context
```

例如：

```text
Revenue by Country
```

最后生成的 SQL 高层上会像：

```sql
select
    country,
    sum(revenue)
from ...
group by country
```

但 Semantic Layer 的价值是：

> Consumer 不需要自己知道 `country` 到底在哪个 Model、要经过哪条 Join。

## Categorical Dimension

Categorical Dimension（分类维度）用于：

- Country；
- Region；
- Product Category；
- Customer Tier；
- Order Status。

当前配置：

```yaml
columns:
  - name: order_country
    dimension:
      type: categorical
      name: country
```

消费者看到的是：

```text
country
```

底层实际 Column 可以叫：

```text
order_country
```

所以 Dimension Name 也是：

**Semantic Name（语义名称）**。

## Dimension 为什么不是任意 Column 都自动暴露

如果一个 Table 有 150 个 Column，

直接全部暴露给 BI / Agent：

```text
所有 Column
= 所有业务维度
```

通常是错误的。

很多 Column 可能是：

- ETL Technical Field；
- Debug ID；
- Internal State；
- Load Timestamp；
- PII；
- 中间计算字段。

Semantic Layer 的目的不是：

> 把数据库 Schema 原样镜像出去。

而是：

> **显式定义哪些属性具有稳定业务语义。**

## Time Dimension

Time Dimension（时间维度）表示：

```text
Date
Timestamp
Business Event Time
```

例如：

```yaml
columns:
  - name: ordered_at
    granularity: day
    dimension:
      type: time
```

这里有两个关键信息：

```text
type = time
granularity = day
```

## Granularity 是什么

Granularity（时间粒度）表示：

> 这份时间信息最细能可靠到什么层级。

例如：

```text
hour
day
month
```

如果底层时间 Dimension 定义：

```text
granularity: day
```

你可以向更粗粒度查询：

```text
week
month
quarter
year
```

但不能凭空还原更细的：

```text
hour
minute
```

因为底层已经没有那个精度。

所以：

```text
fine → coarse
可以聚合

coarse → fine
无法恢复
```

## Metric Time 是什么

假设 Order 表里有：

```text
created_at
paid_at
shipped_at
refunded_at
```

你查询：

```text
Revenue by Month
```

“Month”到底是哪一个业务时间？

如果没有明确规则，

不同团队可能分别用：

```text
created month
paid month
shipped month
```

这会直接造成指标口径不一致。

因此 MetricFlow 需要：

**Aggregation Time（聚合时间）**。

## `agg_time_dimension` 是什么

当前 Semantic Model 可以指定：

```yaml
agg_time_dimension: ordered_at
```

表示：

> 该 Model 中 Metric 默认使用 `ordered_at` 作为 Aggregation Time。

例如：

```yaml
models:
  - name: fct_orders

    semantic_model:
      enabled: true

    agg_time_dimension: ordered_at

    columns:
      - name: ordered_at
        granularity: day
        dimension:
          type: time
```

以后：

```text
Revenue by metric_time__month
```

高层上默认就是：

```text
ordered_at
→ month
```

## 一个 Metric 可以覆盖默认时间吗

可以。

Semantic Model 有默认：

```text
agg_time_dimension
```

但具体 Metric 可以声明自己的 Aggregation Time。

例如：

```text
orders_created
→ created_at

orders_refunded
→ refunded_at
```

即使它们来自同一个 Model，

也可以表达不同业务时间。

这非常适合：

> 同一个事实模型有多个 Event Time 的场景。

## 为什么 Time Dimension 不等于 Load Time

这是生产中常见错误。

例如：

```text
event_time = order paid time
load_time = warehouse ingestion time
```

如果 Revenue 按：

```text
load_time
```

聚合，

Late Arrival 会把旧业务事件错误记到今天。

语义层通常应该使用：

**Business Event Time**

作为 Metric Time，

除非业务明确要求按处理时间分析。

所以：

```text
Metric Time
≠ automatically ingestion time
```

## Dimension 为什么和 Primary Entity 绑定

Current MetricFlow 中 Dimension 会被绑定到：

> 它所在 Semantic Model 的 Primary Entity。

例如：

```text
dim_customer
primary entity = customer
dimension = country
```

那么完整语义可以理解成：

```text
customer__country
```

而不是一个全局裸：

```text
country
```

这样可以避免不同业务对象里都存在：

```text
status
country
name
```

时发生歧义。

## Fully Qualified Dimension Name

MetricFlow 常通过：

```text
entity__dimension
```

引用跨 Semantic Model Dimension。

例如：

```text
customer__country
```

表达：

> Customer Entity 上的 Country Dimension。

这比只写：

```text
country
```

更清楚地说明业务上下文。

## 为什么这对 Join 很关键

假设：

```text
revenue
```

定义在 Orders。

消费者请求：

```text
revenue by customer__country
```

MetricFlow 需要先确定：

```text
orders
→ customer entity
→ customer semantic model
→ country dimension
```

所以：

```text
Dimension Request
```

实际上会触发：

```text
Semantic Graph Navigation
```

下一阶段第 6 节才会把 Join Path 完整展开。

## Derived Dimension 是什么

有些业务维度并不是一个现成 Column。

例如：

```text
quantity > 10
→ is_bulk
```

当前规范可以通过：

```text
derived_semantics
```

使用 SQL Expression 创建语义 Dimension。

高层示例：

```yaml
derived_semantics:
  dimensions:
    - name: is_bulk
      type: categorical
      expr: "case when quantity > 10 then true else false end"
```

它的价值是：

> 业务分类规则仍然在 Semantic Layer 中统一定义。

而不是每个 Dashboard 都自己写一遍 CASE。

## Derived Dimension 不等于复杂 dbt Transformation

如果一个逻辑：

- 很复杂；
- 多处复用；
- 需要测试；
- 需要物化；
- 影响 Grain；

更适合先在 dbt Model 中工程化。

Semantic Layer 的 Expression 更适合：

> 轻量、稳定、真正属于语义表达的逻辑。

这是 dbt / Semantic Layer 的职责边界。

## 不同 Metric Time Grain 一起查询会怎样

当前 MetricFlow 可以处理不同时间 Granularity 的 Metric。

例如：

```text
Metric A
→ daily

Metric B
→ monthly
```

一起查询时，

结果需要对齐到双方都能表达的时间层级。

当前文档描述的默认行为是：

> 返回到较粗的共同 Granularity。

因此不要期待：

```text
monthly source
```

自动变成真实：

```text
daily detail
```

## `is_partition` 是什么

Current Time Dimension 还可以提供：

```text
is_partition
```

表示该时间字段对应特定数据时间窗口 / Partition 语义。

这会参与一些跨表时间 Join 的正确性判断。

这一节只需要知道：

> 它是 Time Semantic Metadata，不是替代 Iceberg / Warehouse Physical Partition。

所以：

```text
MetricFlow is_partition
≠
Iceberg partition spec
```

## Time Dimension 和 Time Spine 有什么区别

### Time Dimension

来自业务数据：

```text
orders.ordered_at
```

表示：

> 事件真实发生在哪个时间。

### Time Spine

是一张连续时间骨架：

```text
Jan 1
Jan 2
Jan 3
...
```

主要解决：

- 缺失时间段；
- Cumulative；
- Offset；
- Conversion；
- 连续时间对齐。

所以：

```text
Time Dimension
→ event time semantics

Time Spine
→ continuous calendar scaffold
```

第 8 节再深入 Time Spine。

## 到这里前四节已经形成什么模型

现在已经完整建立：

```text
Why Semantic Layer
↓
dbt Model → Semantic Model
↓
Entity defines business object / join key
↓
Dimension defines slicing / grouping semantics
↓
Time Dimension defines business time
```

下一步才应该进入：

> 到底“算什么数”？

也就是当前规范里的：

**Simple Metric。**
