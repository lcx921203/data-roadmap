---
id: kb-metricflow-conversion-metrics-001
type: knowledge
title: Conversion Metrics & Entity-Time Matching
title_cn: Conversion Metrics 与 Entity-Time Matching
stage_id: '06'
domain: semantic
topic: metricflow
order: 9
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: metricflow_l5_v1
summary: Conversion Metric 衡量某个 Entity 的 Base Event 在指定时间窗口内是否导致 Conversion Event。它不是普通 Ratio，因为必须在聚合之前先按 Entity 与 Event Time 匹配事件，再计算 Conversions 或 Conversion Rate。
prerequisites:
  - kb-metricflow-time-spine-cumulative-001
  - kb-metricflow-semantic-graph-joins-001
related:
  - kb-metricflow-query-validation-001
---
# Conversion Metrics 与 Entity-Time Matching

## 30 秒理解

很多人第一次看到 Conversion Metric 会想：

```text
Conversion Rate
=
Conversions / Visits
```

那是不是一个 Ratio 就够了？

**不一定。**

真正的 Conversion 问题是：

> **哪个 Conversion Event 属于哪个 Base Event？**

所以它必须先做：

```text
Entity Matching
+
Time Window Matching
+
Event Attribution
↓
then aggregate
↓
Conversion Rate / Conversion Count
```

这就是它和普通 Ratio 的根本区别。

## 一个业务例子

问题：

> 用户访问网站以后，7 天内购买的比例是多少？

Base Event：

```text
Visit
```

Conversion Event：

```text
Purchase
```

Entity：

```text
User
```

Window：

```text
7 days
```

完整含义：

```text
same user
+
purchase after visit
+
purchase within 7 days
→ conversion
```

## Current Conversion Metric 的核心参数

高层结构：

```yaml
metrics:
  - name: visit_to_purchase_7d
    type: conversion

    entity: user

    calculation: conversion_rate

    base_metric: visits

    conversion_metric: purchases

    window: 7 days
```

最核心五件事：

```text
Base Metric
Conversion Metric
Entity
Window
Calculation
```

## `base_metric` 是什么

Base Metric 表示：

> 转化机会从哪里开始？

例如：

```text
Visits
Signups
Trials
Product Views
```

它定义：

**Opportunity Population（机会集合）。**

如果 Base 定义错，

Conversion Rate 的分母从一开始就错。

## `conversion_metric` 是什么

Conversion Metric Input 表示：

> 什么事件算成功？

例如：

```text
Purchase
Subscription Activated
Order Paid
Exam Completed
```

它本身也是已经定义好的 Metric。

所以 Conversion 仍然复用：

**Metric Layer**

而不是重新从 Raw Column 写一整套 SQL。

## `entity` 为什么是必填

因为系统必须知道：

> Base Event 和 Conversion Event 属于同一个谁？

例如：

```text
Visit.user_id
Purchase.user_id
```

通过：

```text
user Entity
```

对齐。

如果没有 Entity，

系统只有两个 Event Count：

```text
100 Visits
20 Purchases
```

你最多算：

```text
20 / 100
```

但无法证明：

> 这 20 个 Purchase 是由这 100 个 Visit 中的哪些 User 产生。

所以 Conversion 的核心不是除法。

而是：

**Entity Attribution。**

## `window` 解决什么

例如：

```text
User Sep 1 visit
User Oct 20 purchase
```

算不算转化？

取决于业务定义。

如果：

```text
window = 7 days
```

就不算。

当前 Window 可以表达类似：

```text
7 days
1 week
3 months
```

如果不设 Window，

当前语义默认可以视为：

**无限窗口。**

但生产 KPI 通常应该明确业务 Window，

否则很容易把：

> 很久以后发生的独立事件

错误归到早期机会。

## Conversion 事件匹配是聚合前发生的

这是这一节最重要的机制。

普通 Ratio 可以高层：

```text
aggregate A
aggregate B
A / B
```

Conversion 必须先：

```text
Base Event Rows
JOIN
Conversion Event Rows

on same Entity
and valid Time Relationship
```

然后确定：

> Conversion 应该归属哪个 Base Event。

最后才能：

```text
aggregate opportunities
aggregate conversions
calculate rate
```

所以：

```text
Conversion
≠ Ratio with a fancy name
```

## “最近的 Base Event”怎么理解

假设同一用户：

```text
Sep 1 Visit
Sep 4 Visit
Sep 7 Purchase
```

Sep 7 Purchase 同时落在：

```text
Sep 1 + 7d
Sep 4 + 7d
```

两个窗口里。

如果两个 Visit 都算一次，

一个 Purchase 会被重复归因。

Current MetricFlow 的生成逻辑会把 Conversion Event 连接到：

> **最接近它的有效 Base Event。**

可以高层理解：

```text
eligible base events
→ choose nearest valid base event
→ deduplicate conversion attribution
```

这是为什么 Conversion SQL 通常比普通 Ratio 复杂很多。

## Event Grain 为什么非常重要

假设 Purchase Source 里：

```text
one purchase
```

因为 CDC Replay 出现两行。

Semantic Layer 如果把它们当：

```text
two conversion events
```

Conversion Rate 就会上升。

所以 Source / dbt Model 必须先保证：

```text
Event Grain
Event Identity
Deduplication
```

正确。

MetricFlow 不是 Event Dedup Engine。

## `calculation` 可以是什么

当前 Conversion 主要支持两种输出语义：

```text
conversion_rate
conversions
```

### conversion_rate

```text
converted opportunities
/
base opportunities
```

### conversions

返回：

```text
conversion count
```

同一套 Event Matching，

可以选择不同最终输出。

## Base / Conversion Input 也可以 Filter

例如：

```text
只看 Facebook Visit
→ Purchase
```

可以给 Base Metric 加：

```text
referrer = facebook
```

这样 KPI 变成：

> Facebook Visit 的 7-Day Purchase Conversion。

所以 Filter 仍然属于：

**指标业务口径的一部分。**

## `constant_properties` 是什么

有些 Conversion 不只要求：

```text
same user
```

还要求 Base / Conversion 在某些属性上保持一致。

例如：

```text
Visit.referrer
=
Purchase.referrer
```

或者：

```text
same campaign
same tenant
same account
```

Current Conversion 可以使用：

```text
constant_properties
```

明确这些约束。

它的含义是：

> Conversion 必须保持某个业务 Context 一致。

## Constant Property 为什么不能乱加

如果属性变化本来就是业务过程的一部分，

强行要求一致：

```text
base_property = conversion_property
```

会漏掉真正转化。

例如：

```text
User Visit Device
```

和：

```text
Purchase Device
```

不一定相同。

所以 Constant Property 是：

**Business Attribution Rule**

不是：

> 越多越准确。

## Conversion Window 与 Time Spine 的关系

Conversion 本质上依赖：

```text
Event Time
+
Window Boundary
```

MetricFlow 的时间语义需要 Time Spine 支撑统一时间处理。

所以：

```text
Time Dimension
→ when event happens

Time Spine
→ continuous time semantics

Conversion Window
→ how far event relationship is valid
```

三者不能混。

## Conversion Rate 为什么可能“看起来下降”但不是 Bug

例如定义从：

```text
window = 30 days
```

改成：

```text
window = 7 days
```

相同数据下：

```text
Conversions ↓
Conversion Rate ↓
```

这是：

**Metric Definition Change**

不是数据错误。

所以生产 Metric 变更一定要记录：

```text
Window
Entity
Base Filter
Conversion Filter
Constant Properties
```

这些都属于 KPI Contract。

## Late Event 会怎样影响 Conversion

假设 Purchase 实际发生：

```text
Sep 5
```

但数据：

```text
Sep 10
```

才进入 Warehouse。

如果重新查询历史，

它可能改变过去某一天的 Conversion Result。

所以 Conversion Metric 同样受到：

- Late Arrival；
- Source Completeness；
- Event Time Correctness；

影响。

Semantic Layer 可以统一规则，

但不能消除 Source Data 的迟到事实。

## Conversion 和 Marketing Attribution 是一回事吗

不是。

Conversion Metric 可以表达：

```text
Base Event
→ Conversion Event
```

的 Entity-Time 匹配。

但完整 Marketing Attribution 还可能涉及：

- Multi-touch；
- First Touch；
- Last Touch；
- Weighted Attribution；
- Channel Credit；
- Cross-device Identity。

这些不是本节的 MetricFlow 核心职责。

不要把：

```text
Conversion Metric
```

夸大成：

> 完整 Attribution Platform。

## Conversion 排障顺序

看到 Conversion Rate 异常，按顺序问：

```text
1. Base Metric 是谁？
2. Conversion Metric 是谁？
3. 两边 Event Grain 正确吗？
4. Entity 是否真能唯一对应业务对象？
5. Window 多长？
6. Event Time 用的是哪个字段？
7. Constant Properties 是否过严或缺失？
8. Late Event 是否改变历史？
9. 是否出现重复 Conversion Event？
10. Generated SQL 如何做事件匹配与去重？
```

不要第一反应：

> “20 / 100 为什么不是 20%？”

真正错误可能在除法发生之前。

## 到这里 Metric 类型主线已经完整

现在已有：

```text
Simple
→ 基础聚合

Ratio
→ A / B

Derived
→ Metric Expression

Cumulative
→ Metric over Time Window

Conversion
→ Entity + Time Event Matching
```

下一步不再继续定义新 Metric Type。

而是要回答：

> **Consumer 真正发起一个 Metric Query 时，MetricFlow 到底怎样解析 Graph、生成 SQL、验证 Query？**

这就是第 10 节。
