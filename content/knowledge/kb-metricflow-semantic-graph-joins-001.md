---
id: kb-metricflow-semantic-graph-joins-001
type: knowledge
title: Semantic Graph, Join Logic & Fan-out Safety
title_cn: Semantic Graph、Join Logic 与 Fan-out 安全
stage_id: '06'
domain: semantic
topic: metricflow
order: 6
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: metricflow_l5_v1
summary: MetricFlow 把 Semantic Model 视为图节点，把共享 Entity 关系视为 Join Path。Entity Type 决定哪些方向的 Join 被允许，从而尽量阻止 Fan-out 和 Chasm。Join Graph 是语义查询图，不是数据库物理执行计划。
prerequisites:
  - kb-metricflow-entities-grain-001
  - kb-metricflow-simple-metrics-001
related:
  - kb-metricflow-ratio-derived-001
---
# Semantic Graph、Join Logic 与 Fan-out 安全

## 30 秒理解

MetricFlow 最重要的能力之一不是：

> 帮你少写一个 JOIN。

而是：

> **根据业务 Entity 关系，只允许语义上安全的 Join Path。**

主链：

```text
Semantic Model
= Graph Node

Shared Entity
= Relationship / Edge

Entity Type
= Join Cardinality Semantics

↓
MetricFlow
selects valid path
↓
Generated SQL
```

所以 Semantic Graph 不是数据库 ER 图的简单复制，

也不是 dbt DAG。

## 先回顾：dbt DAG 和 Semantic Graph

dbt DAG：

```text
stg_orders
→ fct_orders
```

回答：

> 构建 `fct_orders` 前要先准备谁？

Semantic Graph：

```text
orders
-- customer -->
customers
```

回答：

> 查询 Order Metric 时，能不能访问 Customer Dimension？

一个是：

**Transformation Dependency**

一个是：

**Semantic Query Relationship。**

## 为什么自动 Join 必须依赖 Entity Type

假设：

### orders

```text
customer
→ foreign
```

### customers

```text
customer
→ primary
```

这表示：

```text
many orders
→ one customer
```

从 Orders 出发去 Customer：

```text
Foreign → Primary
```

不会增加 Order Row 数量，

通常是安全的。

所以 MetricFlow 可以生成类似：

```sql
orders
left join customers
  on orders.customer_id = customers.customer_id
```

## 为什么反方向可能危险

如果从：

```text
customers
```

出发 Join：

```text
orders
```

关系变成：

```text
Primary → Foreign
```

一个 Customer 可能有 100 个 Order。

原来：

```text
1 customer row
```

Join 后：

```text
100 rows
```

如果你在 Customer Grain 上已有一个金额或状态值，

它可能被复制 100 次。

这就是：

**Fan-out（扇出）。**

## Fan-out 是什么

定义可以压成：

```text
one source row
→ joins to multiple target rows
→ output row count expands
```

例如：

```text
customer
→ orders
```

Customer：

```text
customer_id=1
lifetime_limit=1000
```

Orders：

```text
order A
order B
order C
```

Join 后：

```text
1000
1000
1000
```

如果再：

```sql
sum(lifetime_limit)
```

得到：

```text
3000
```

业务结果直接被放大。

## Chasm Join 是什么

Chasm Join（裂谷连接）通常发生在：

> 多个 Many-side Fact 通过某个中间对象连接。

例如：

```text
customers
← orders
← returns
```

如果错误把：

```text
orders
JOIN returns
```

按 Customer 直接拉平，

可能出现：

```text
3 orders × 2 returns
= 6 rows
```

两个 Fact 都被重复。

这不是普通 SQL Syntax Error。

而是：

> **查询结果在关系基数上被污染。**

## MetricFlow 当前怎样限制危险 Join

当前 Join 规则的核心直觉：

### 通常安全

```text
Foreign → Primary
Foreign → Unique
Primary ↔ Primary
Primary ↔ Unique
Unique ↔ Unique
```

### 通常禁止

```text
Primary / Unique → Foreign
Foreign → Foreign
```

原因不是：

> MetricFlow 不会写 SQL。

而是：

> 这些方向容易制造 Fan-out / Chasm。

所以 Entity Type 本质上就是：

**Semantic Cardinality Contract（语义基数契约）。**

## Entity Type 声明错会发生什么

假设真实 Customer Dimension：

```text
customer_id
不是唯一
```

却声明：

```text
type: primary
```

MetricFlow 会根据 Metadata 推理：

```text
这个 Join 是安全的
```

但真实数据却会扩行。

所以：

```text
Semantic Validation
不能替代
Data Quality
```

生产上应结合：

```text
dbt unique / not_null tests
+
Entity Type
```

一起保护。

## 为什么 Fact → Dimension 常用 Left Join

从 Fact 查询 Metric：

```text
orders
```

再访问：

```text
customer country
```

通常应该保留所有 Fact Row。

如果某些 Order 没有匹配到 Customer：

```text
inner join
```

会把 Order 丢掉。

所以当前 MetricFlow 在典型 Fact → Dimension 路径上主要使用：

**Left Join。**

这里讲的是：

**生成 SQL 的关系策略。**

数据库最后实际用 Hash Join 还是 Broadcast：

> 仍然是底层 Engine 的 Physical Plan。

## Multi-fact 为什么不直接普通 Join

例如同时查询：

```text
sales
returns
```

两个都是 Fact。

直接在明细层 Join：

```text
sales × returns
```

很容易 Chasm。

当前 MetricFlow 的高层策略是：

```text
先分别聚合到共同 Grouping Grain
→ 再组合结果
```

当前官方示例使用：

**Full Outer Join**

来保留双方存在但另一侧缺失的数据点。

这就是：

> Metric Composition

和：

> Raw Fact Join

之间的重要区别。

## Ratio 为什么可以跨 Semantic Model

假设：

```text
metric A
```

来自 Model A，

```text
metric B
```

来自 Model B。

如果要：

```text
A / B
```

MetricFlow 不一定把两个 Raw Table 直接 Join。

更合理的是：

```text
A
→ aggregate to common dimensions

B
→ aggregate to common dimensions

then
→ join aggregated results
→ calculate ratio
```

第 7 节再展开。

## 什么是 Multi-hop Join

Direct Join：

```text
orders
→ customer
```

Multi-hop：

```text
orders
→ customer
→ country
```

MetricFlow 可以沿 Entity Graph 连续导航。

这样 Consumer 可以问：

```text
Revenue
by Country Name
```

而不需要知道：

```text
orders.customer_id
customers.country_id
country.country_name
```

所有物理路径。

## 当前 Multi-hop 上限怎么理解

当前官方文档描述：

> 到达一个 Dimension 的 Join Path 最多 **2 hops**。

例如：

```text
orders
→ customer
→ country
```

可以。

再继续：

```text
→ region
```

当前就可能超过直接支持边界。

但这条一定要标记：

**Version-sensitive（版本敏感）**。

它不是 Semantic Layer 永久理论。

以后 dbt / MetricFlow 版本变化必须重新核对。

## 为什么要限制 Hop

不是因为第三个 Join SQL 写不出来。

而是因为路径越长：

```text
Possible Join Paths ↑
Ambiguity ↑
Cardinality Risk ↑
Generated SQL Complexity ↑
```

系统更难回答：

> 到底走哪条业务关系才是正确语义？

限制 Hop 是：

**Correctness / Predictability Trade-off。**

## Ambiguous Path 是什么

假设从 Order 到 Region 有两条路径：

```text
order
→ customer
→ region
```

另一条：

```text
order
→ store
→ region
```

如果 Consumer 只说：

```text
Revenue by Region
```

系统需要知道：

> Customer Region 还是 Store Region？

如果两条路径都可能合法，

这就是：

**Ambiguous Semantic Path（语义路径歧义）。**

生产语义层必须优先暴露：

**明确业务含义**

而不是：

> “系统能 Join 就全部允许。”

## Qualified Dimension 为什么重要

前面学过：

```text
customer__country
```

它不只是命名习惯。

它在告诉 Semantic Graph：

```text
我要 Customer Entity 上的 Country
```

Multi-hop 时路径语义更重要，

因为：

```text
country
```

可能在多个对象上都存在。

## Semantic Graph 不应该承担什么

它不负责决定：

```text
Hash Join
Broadcast Join
Sort Merge
Partition Pruning
Shuffle
Memory
```

那些是：

**Target Query Engine**

的职责。

MetricFlow 负责：

```text
which semantic models?
which relationships?
which dimensions?
which aggregation grain?
```

然后生成 SQL。

## 一个完整查询因果链

用户请求：

```text
Revenue
by customer__country
```

MetricFlow 依次需要确认：

```text
1. Revenue 属于哪个 Semantic Model？
2. Revenue 的 Grain / Time 是什么？
3. 当前 Model 是否拥有 customer Entity？
4. customer 在目标 Model 是 Primary / Unique 吗？
5. Join Direction 是否安全？
6. country 是否是可达 Dimension？
7. 是否存在 Ambiguous Path？
8. 生成 SQL
9. 交给 Target Engine 执行
```

这比：

```text
“自动帮我 Join”
```

精确得多。

## 下一步

现在已经有：

```text
Simple Metric
+
Safe Semantic Graph
```

所以终于可以把多个 Metric 组合起来。

下一节进入：

**Ratio 与 Derived Metrics。**
