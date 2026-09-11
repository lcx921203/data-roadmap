---
id: kb-metricflow-entities-grain-001
type: knowledge
title: Entities, Semantic Grain & Join Keys
title_cn: Entities、语义粒度与 Join Key
stage_id: '06'
domain: semantic
topic: metricflow
order: 3
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: metricflow_l5_v1
summary: Entity 表示 Customer、Order、Transaction 等业务对象，同时充当 Semantic Model 之间的 Join Key。当前 Entity 类型为 Primary、Unique、Foreign、Natural；类型声明会直接影响 MetricFlow 能否安全生成 Join。
prerequisites:
  - kb-metricflow-semantic-model-001
related:
  - kb-metricflow-dimensions-time-001
  - kb-metricflow-semantic-graph-joins-001
---
# Entities、语义粒度与 Join Key

## 30 秒理解

Entity（实体）在 MetricFlow 里同时承担两个角色：

```text
业务对象
+
Semantic Join Key
```

例如：

```text
Customer
Order
Transaction
Campaign
```

都是业务 Entity。

如果两个 Semantic Model 都声明同名：

```text
customer
```

MetricFlow 才有可能知道：

> 它们可以通过 Customer 关系连接。

当前 Entity 类型：

```text
primary
unique
foreign
natural
```

类型不是装饰 Metadata。

它直接参与：

**Join Safety（连接安全性）**。

## Entity 为什么不仅仅是主键

在传统数据库里，我们习惯说：

```text
Primary Key
Foreign Key
```

但 Semantic Layer 关心的不只是数据库 Constraint。

它还需要回答：

> 一个业务对象在这个 Semantic Model 中是什么关系角色？

例如：

### orders

```text
order_id
→ order primary

customer_id
→ customer foreign
```

### customers

```text
customer_id
→ customer primary
```

于是语义图看到：

```text
orders
-- customer foreign -->
customers
-- customer primary
```

这才形成安全的业务关系。

## 最基本的 Entity 示例

```yaml
models:
  - name: fct_orders

    semantic_model:
      enabled: true

    columns:
      - name: order_id
        entity:
          type: primary
          name: order

      - name: customer_id
        entity:
          type: foreign
          name: customer
```

这里不是说：

> dbt 帮数据库创建了 Primary / Foreign Constraint。

它是在告诉 MetricFlow：

```text
order_id
→ 每个 Order 在这个 Model 中唯一

customer_id
→ 多个 Order 可以属于同一个 Customer
```

## Entity Type ≠ Database Constraint

这条必须单独记。

配置：

```yaml
entity:
  type: primary
```

主要是：

**Semantic Relationship Declaration（语义关系声明）**。

它并不等价于：

```sql
PRIMARY KEY (...)
```

一定已经在数据库中被 Enforcement（强制执行）。

所以如果你把一个有重复值的 Column 声明成 `primary`，

MetricFlow 不会把错误数据自动修复。

真正生产上应该同时有：

```text
dbt Data Test
+
Semantic Entity Definition
```

一层验证数据，

一层声明语义。

## Primary Entity

当前语义下，Primary 表示：

> 这个 Key 在该表粒度上唯一标识记录，并且不应为空。

例如：

```text
orders
grain = one row per order

order_id
→ primary
```

如果：

```text
one order has many item rows
```

却仍然把：

```text
order_id
→ primary
```

那你的 Entity 声明和真实 Grain 已经冲突。

后面的 Join / Metric 都可能出错。

## Unique Entity

Unique 表示：

> 非空值保持唯一，但它可以只覆盖业务对象的一个子集，也允许 Null。

例如一个 Date Dimension 里某个：

```text
date_day
```

可以作为 Unique Entity，

让多个业务时间角色：

```text
ordered_at
delivered_at
```

通过不同 Semantic Entity 名称映射到同一日期表。

它和 Primary 最大的直觉区别是：

```text
Primary
→ model's complete row identity

Unique
→ unique joinable key, potentially partial / nullable
```

## Foreign Entity

Foreign 表示：

> 这个 Model 里可能重复出现同一个 Entity。

例如：

```text
orders.customer_id
```

一个 Customer 可以有很多 Order，

所以：

```text
customer
→ foreign
```

它可以：

- 重复；
- 为空；
- 指向另一个 Semantic Model 中的 Primary / Unique Entity。

这正是最常见的：

```text
many orders
→ one customer
```

关系。

## Natural Entity

Natural Entity（自然实体键）表示：

> 由真实业务属性形成、能够唯一识别记录的 Key。

例如：

```text
sales_person_id
```

可能是某个 SCD Type II Dimension 中的 Natural Key。

当前 MetricFlow 文档有一个非常具体的边界：

> **Natural Entity 当前用于 SCD Type II 维度场景。**

所以不要把它泛化成：

> “任何业务键都应该 type: natural”。

Stage 03 会继续负责业务键 / 代理键建模理论。

## Semantic Grain 是什么

可以把 Semantic Grain（语义粒度）理解成：

> **这个 Semantic Model 的一行代表什么。**

例如：

```text
fct_orders
→ one row per order

fct_order_items
→ one row per order item

dim_customer
→ one row per current customer
```

Entity Type 必须与真实 Grain 一致。

## 为什么 Grain 错会直接把 Metric 算错

假设：

```text
fct_order_items
grain = one row per item
```

一个订单：

```text
order_id=100
```

有 3 个 Item。

如果错误声明：

```text
order_id
→ primary
```

实际上数据里：

```text
100
100
100
```

不是唯一。

后面 MetricFlow 如果基于错误关系推理 Join，

就可能：

- 重复；
- Fan-out；
- 错误聚合。

所以：

```text
Grain correctness
→ Entity correctness
→ Join correctness
→ Metric correctness
```

这是一条因果链。

## 没有物理 Primary Key Column 怎么办

有些聚合表天然没有单一：

```text
row_id
```

例如：

```text
bookings_monthly
```

可能是一行：

```text
month + market
```

当前新规范允许：

```yaml
primary_entity: booking_month
```

声明一个：

**Virtual Primary Entity（虚拟 Primary Entity）**。

它主要用于告诉语义层：

> 这个 Model 的语义主 Entity 是谁。

它不要求一定映射到某个真实物理 Column，

也不会因为写了这个名字自动改变 SQL Query Generation。

所以不要把：

```text
primary_entity
```

误认为数据库里一定存在同名主键列。

## 多 Column Entity 怎么理解

当前 MetricFlow 支持 Entity 由：

```text
single column
or
multiple columns / expression
```

表达。

例如业务 Grain 是：

```text
date_key + brand_code
```

可以通过：

```text
derived_semantics
```

把多个 Column 组合成一个 Join Key。

高层概念：

```text
(date_key, brand_code)
→ one semantic entity
```

真正重点仍然是：

> 组合后的 Key 是否真的对应业务 Grain。

不是拼字符串语法本身。

## Entity 还可以当 Dimension 使用

Current MetricFlow 允许：

> Entity 自己也可以作为 Grouping Dimension。

例如：

```text
revenue
by
customer
```

本质上是把指标聚合到：

```text
customer entity grain
```

所以 Entity 不只负责 Join，

它还定义了一个非常重要的：

**业务聚合粒度。**

## 为什么 Entity Name 跨 Model 要一致

MetricFlow 识别 Join Key 使用的是：

```text
Entity Name
```

不是单纯看底层 Column Name。

例如：

### orders

```yaml
customer_id:
  entity:
    type: foreign
    name: customer
```

### customers

```yaml
customer_key:
  entity:
    type: primary
    name: customer
```

底层 Column 一个叫：

```text
customer_id
```

一个叫：

```text
customer_key
```

只要都明确表示同一个：

```text
customer Entity
```

Semantic Graph 才能理解关系。

## Entity Name 不是全局物理字段名

Entity Name 的目的：

> 表达同一个业务对象。

所以不要把它设计成：

```text
tableA_customer_id
tableB_customer_key
```

否则语义上反而失去统一对象。

正确目标是：

```text
customer
```

统一表示 Business Entity。

## 一个完整关系例子

### orders

```text
order
→ primary

customer
→ foreign
```

### customers

```text
customer
→ primary
```

### customer_segments

```text
customer
→ foreign

segment
→ foreign / other relationship depending on grain
```

MetricFlow 后面能不能从：

```text
revenue
```

走到：

```text
customer country
```

取决于这些 Entity Type 是否形成合法关系。

所以第 6 节 Join Graph 不是凭空出现的。

它建立在这一节的 Entity 定义上。

## 这一节排障时最先问什么

Metric 出现：

```text
重复
突然翻倍
无法 Group By 某个 Dimension
无法找到 Join Path
```

先不要直接怀疑 Metric Formula。

先问：

```text
1. Semantic Model 一行是什么 Grain？
2. Entity Name 是否表达同一个业务对象？
3. Primary / Unique 是否真的唯一？
4. Foreign 是否允许重复？
5. 是否错误声明了 Natural？
```

很多“指标问题”其实是：

**Entity Modeling 问题。**

## 下一步

现在已经有：

```text
Semantic Model
+
Entity
```

下一步回答：

> 指标可以按照哪些业务属性、哪些时间粒度切分？

这就是：

**Dimension 与 Time Dimension。**
