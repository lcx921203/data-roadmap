---
id: kb-metricflow-ratio-derived-001
type: knowledge
title: Ratio & Derived Metrics
title_cn: Ratio 与 Derived Metrics
stage_id: '06'
domain: semantic
topic: metricflow
order: 7
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: metricflow_l5_v1
summary: Ratio Metric 用已有 Metric 作为 numerator 与 denominator；Derived Metric 用表达式组合一个或多个已有 Metric，并可对输入 Metric 设置 Alias、Filter 与时间 Offset。它们操作的是聚合后的语义指标，而不是随意拼接底层明细行。
prerequisites:
  - kb-metricflow-simple-metrics-001
  - kb-metricflow-semantic-graph-joins-001
related:
  - kb-metricflow-time-spine-cumulative-001
---
# Ratio 与 Derived Metrics

## 30 秒理解

Simple Metric 解决：

> 单个基础指标怎么算？

高级 Metric 开始解决：

> **多个已定义指标之间怎样形成新的业务指标？**

当前两个最基础的组合类型：

```text
Ratio
→ numerator / denominator

Derived
→ expression(metric A, metric B, ...)
```

核心变化是：

```text
底层 Column 运算
→ 升级成 Metric 之间的运算
```

所以可以真正复用已有统一口径。

## Ratio Metric 是什么

Ratio（比率指标）定义：

```text
numerator
/
denominator
```

例如：

```text
food_orders
/
all_orders
=
food_order_ratio
```

Current YAML：

```yaml
metrics:
  - name: food_order_ratio
    type: ratio
    numerator: food_orders
    denominator: orders
```

这里：

```text
food_orders
orders
```

都应该是已经定义好的 Metric。

## 为什么不要直接写 `sum(a) / sum(b)`

如果每个 Consumer 都重新写：

```sql
sum(paid_orders) / sum(all_orders)
```

会重新出现：

- Filter 不一致；
- Join 不一致；
- 时间语义不一致；
- Null / Grain 处理不一致。

Ratio Metric 让：

```text
numerator semantics
+
denominator semantics
```

都引用受治理 Metric。

这样：

```text
Ratio
```

是在统一 Metric 之上继续组合。

## Numerator / Denominator 可以各自加 Filter

Current Ratio 支持：

```text
name
filter
alias
```

例如：

```yaml
- name: us_food_order_ratio
  type: ratio

  numerator:
    name: food_orders
    filter: |
      {{ Dimension('order__country') }} = 'US'
    alias: us_food_orders

  denominator:
    name: orders
    filter: |
      {{ Dimension('order__country') }} = 'US'
    alias: us_orders
```

这样 Ratio 本身明确表达：

> 美国范围内 Food Order / All Order。

## Ratio 可以跨 Semantic Model 吗

可以。

关键不是：

> 两个 Raw Table 能不能直接 Join。

而是：

> 两个 Input Metric 能不能在共同 Dimension / Grain 上对齐。

高层生成过程：

```text
Metric A
→ aggregate

Metric B
→ aggregate

find common grouping dimensions
→ join aggregated subqueries
→ A / B
```

这比明细层直接 Join 更安全。

## 为什么 Ratio 仍然可能语义错误

例如：

```text
Revenue / Users
```

你想算：

```text
ARPU
```

如果 Revenue 是：

```text
monthly revenue
```

而 Users 是：

```text
all-time registered users
```

SQL 完全能算。

但结果业务上可能没有意义。

所以高级 Metric 正确性依赖：

```text
Metric Time
+
Common Grain
+
Filter Scope
+
Input Metric Meaning
```

Semantic Layer 统一语法，

并不自动替你定义正确业务 KPI。

## Derived Metric 是什么

Derived Metric（派生指标）使用：

```text
expr
```

组合其他 Metric。

例如：

```text
Profit
= Revenue - Cost
```

Current YAML：

```yaml
metrics:
  - name: profit
    type: derived
    expr: revenue - cost

    input_metrics:
      - name: order_total
        alias: revenue

      - name: order_cost
        alias: cost
```

这里：

```text
expr
```

是在：

**Metric Result**

上做运算，

而不是直接对每条 Raw Row 做运算。

## 为什么这个区别很重要

### Row-level calculation

```text
每个订单：
revenue - cost
然后 sum
```

### Metric-level calculation

```text
sum(revenue)
-
sum(cost)
```

对于加法可能结果相同，

但在：

- Average；
- Distinct Count；
- Ratio；
- 不同 Semantic Model；

场景下，

两者可能完全不是一回事。

所以 Derived Metric 是：

> **Aggregated Metric Composition。**

## Derived Metric 的 `input_metrics`

如果只是：

```text
revenue - cost
```

可以直接引用已有 Metric。

当需要额外语义时，

`input_metrics` 可以定义：

```text
alias
filter
offset_window
```

这让同一个基础 Metric 可以在不同角色下重复引用。

## Alias 为什么有价值

例如：

```text
order_total
```

既要代表：

```text
current month
```

又要代表：

```text
previous month
```

如果都叫：

```text
order_total
```

表达式无法区分。

可以：

```yaml
input_metrics:
  - name: order_total

  - name: order_total
    alias: order_total_prev_month
    offset_window: 1 month
```

然后：

```yaml
expr: |
  (order_total - order_total_prev_month)
  / order_total_prev_month
```

这就是：

**MoM Growth（月环比增长）**。

## `offset_window` 是什么

`offset_window` 表示：

> 对某个 Input Metric 使用时间偏移后的值。

例如：

```text
1 week
1 month
```

所以：

```text
current revenue
vs
revenue 1 month ago
```

不需要 Consumer 自己重写 Date Join。

但 Offset 本质上是：

**时间对齐问题。**

因此后面第 8 节会把它和：

**Time Spine**

连接起来。

## Derived Input 也可以 Filter

例如 Profit 只想看：

```text
Food Order
```

可以对：

```text
Revenue
Cost
```

两个 Input Metric 同时加：

```text
is_food_order = true
```

这样：

```text
food_profit
```

成为一个稳定业务定义。

## Ratio 和 Derived 怎么选

### Ratio

如果业务语义天然是：

```text
A / B
```

使用：

```text
type: ratio
```

表达最直接。

### Derived

如果业务公式是：

```text
A - B
A + B
(A - B) / B
A * coefficient
```

使用：

```text
type: derived
```

更自然。

不要因为 Derived 能写除法，

就把所有 Ratio 都塞成 Derived。

专用 Metric Type 的价值就是：

> 让业务含义更明确。

## 高级 Metric 依赖图

现在 Metric 之间也形成一种依赖：

```text
Simple Revenue ──┐
                 ├→ Profit
Simple Cost ─────┘

Simple Food Orders ─┐
                    ├→ Food Order Ratio
Simple Orders ──────┘
```

这和 dbt Model DAG 不同。

这里表达：

**Metric Definition Dependency。**

## Metric Dependency 太深有什么风险

如果：

```text
Metric A
→ Metric B
→ Metric C
→ Metric D
→ Metric E
```

虽然复用性很好，

但 Debug 时会出现：

> 最终值错了，到底是哪一层错？

所以高级指标也要避免：

**不必要的公式层层包装。**

一个好指标图应该：

- 可复用；
- 可解释；
- 能追溯输入 Metric。

而不是追求：

> 所有公式必须拆成十层。

## 跨 Semantic Model 组合时最先问什么

```text
1. Input Metric 各自在哪个 Semantic Model？
2. 它们有哪些共同 Dimension？
3. Metric Time 是否对齐？
4. Filter Scope 是否相同？
5. 聚合 Grain 是否兼容？
6. 是否需要 Semantic Graph Join？
7. 生成 SQL 是否先各自聚合再组合？
```

真正生产级 Ratio / Derived 排障，

首先检查这些语义，

而不是只看最后：

```text
A / B
```

## 下一步

现在已经有：

```text
当前值
上一个月值
Rolling Metric
```

这些时间比较需求。

但真实业务数据往往：

```text
某些日期完全没有 Row
```

MetricFlow 怎样处理连续时间？

这就是：

**Time Spine 与 Cumulative Metric。**
