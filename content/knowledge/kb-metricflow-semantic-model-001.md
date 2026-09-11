---
id: kb-metricflow-semantic-model-001
type: knowledge
title: dbt Model to Semantic Model & Current Spec
title_cn: dbt Model → Semantic Model 与当前语义规范
stage_id: '06'
domain: semantic
topic: metricflow
order: 2
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: metricflow_l5_v1
summary: 当前 dbt v1.12+ 规范把 Semantic Model 直接作为 dbt Model 的语义注解。一个 dbt Model 对应一个 Semantic Model，继续在同一 YAML 定义 Entity、Dimension、Aggregation Time 和 Simple Metric。
prerequisites:
  - kb-metricflow-overview-001
related:
  - kb-metricflow-entities-grain-001
---
# dbt Model → Semantic Model 与当前语义规范

## 30 秒理解

先记住这条边界：

```text
dbt Model
→ 数据怎么构建

Semantic Model
→ 这份数据在业务语义上代表什么
```

当前 dbt v1.12+ 规范中，

Semantic Model 不再需要你把它理解成一套和 dbt Model 完全分离的独立对象文件。

更准确的模型是：

```text
dbt Model Definition
+
semantic_model metadata
+
Entity / Dimension / Metric annotations
→ Semantic Model Node
```

## dbt Model 和 Semantic Model 有什么不同

假设 dbt 已经构建：

```text
fct_transactions
```

它的 SQL 可能是：

```sql
select
    transaction_id,
    customer_id,
    transaction_date,
    order_country,
    transaction_total
from ...
```

dbt 只知道：

- 这些 Column；
- 资源依赖；
- Materialization；
- Tests；
- Contract。

但 MetricFlow 还需要知道：

```text
transaction_id
→ Transaction Entity

customer_id
→ Customer Entity

transaction_date
→ Time Dimension

order_country
→ Categorical Dimension

transaction_total
→ 可以形成 Revenue Metric
```

这些就是 Semantic Metadata。

## 当前 Semantic Model 写在哪里

当前 v1.12+ 规范是：

> **在 dbt Model 的 YAML 定义中直接启用 `semantic_model`。**

最小示例：

```yaml
models:
  - name: fact_transactions

    semantic_model:
      enabled: true

    agg_time_dimension: transaction_date

    columns:
      - name: transaction_id
        entity:
          type: primary
          name: transaction

      - name: customer_id
        entity:
          type: foreign
          name: customer

      - name: transaction_date
        granularity: day
        dimension:
          type: time

      - name: order_country
        dimension:
          type: categorical

    metrics:
      - name: transaction_total
        type: simple
        agg: sum
        expr: transaction_total
```

这一份配置把：

```text
physical model schema
```

提升成：

```text
semantic model
```

## 一个 dbt Model 对应几个 Semantic Model

当前规范：

```text
one dbt model
→ one semantic model
```

可以给 Semantic Model 一个不同的显示名称：

```yaml
semantic_model:
  enabled: true
  name: transactions
```

如果不写 `name`，

默认沿用 dbt Model Name。

## 为什么 Semantic Model 仍然依赖 dbt Model

因为 Semantic Layer 不保存另一份业务事实数据。

它依赖：

```text
dbt-built relation
```

作为实际 Query Source。

也就是说：

```text
dbt build
→ creates / maintains relation

MetricFlow
→ understands how that relation can participate in semantic queries
```

所以如果上游 dbt Model：

- Grain 错；
- 重复；
- 数据漏；
- Contract 变；

Semantic Layer 不会神奇地把它修正。

## Semantic Model 是不是新的 Table

不是。

配置：

```yaml
semantic_model:
  enabled: true
```

不会因为这句话自动制造：

```text
another semantic_model table
```

Semantic Model 主要是：

**Metadata / Semantic Node。**

它告诉 MetricFlow：

> 怎样解释现有 dbt Model。

所以：

```text
semantic model
≠ physical materialization
```

## 为什么这叫 Semantic Graph Node

MetricFlow 把 Semantic Model 看成：

**Node（节点）**。

例如：

```text
orders
customers
products
```

每个 Node 里声明：

- Entities；
- Dimensions；
- Simple Metrics；
- Time Semantics。

Entity 再把不同 Semantic Model 连接起来。

于是：

```text
Semantic Models
+
Entities
→ Semantic Graph
```

第 6 节再深入 Join Graph。

## 当前 YAML 为什么和旧资料不一样

旧版 MetricFlow 教程经常看到独立：

```yaml
semantic_models:
  - name: ...
    model: ref(...)
    entities:
    dimensions:
    measures:
```

当前 dbt v1.12+ 新规范则更接近：

```yaml
models:
  - name: ...
    semantic_model:
      enabled: true
    columns:
      ...
    metrics:
      ...
```

这不是简单缩进变化。

最重要的语义变化之一是：

```text
Measures deprecated
→ Simple Metrics become current primitive aggregation objects
```

所以后面示例全部以当前规范为主。

## 为什么把 Entity / Dimension 放到 Column 上

当前规范强调：

```text
physical column
→ semantic annotation
```

例如：

```yaml
- name: customer_id
  entity:
    type: foreign
    name: customer
```

这样可以非常直观地表达：

```text
customer_id 这个 Column
在语义层中扮演 customer Entity 的 Foreign Key 角色
```

同样：

```yaml
- name: country
  dimension:
    type: categorical
```

表达：

```text
country Column
可以作为指标切片维度
```

## Column 一定只能做一种 Semantic Role 吗

当前 Column 定义里，

一个 Column Entry 通常不能同时直接声明：

```text
entity
+
dimension
```

如果需要更加复杂、不是 1:1 对应某个物理 Column 的语义，

当前规范提供：

```text
derived_semantics
```

例如通过 SQL Expression 派生：

- Entity；
- Dimension。

这一节只知道它存在，

第 3、4 节分别展开。

## `agg_time_dimension` 是什么

如果 Semantic Model 定义 Metric，

MetricFlow 需要知道：

> 默认按照哪个时间 Column 做 Metric Time 聚合？

例如：

```yaml
agg_time_dimension: transaction_date
```

以后查询：

```text
transaction_total by month
```

MetricFlow 才知道默认业务时间是：

```text
transaction_date
```

而不是：

```text
load_time
update_time
```

这件事非常重要，

因为一个事实表可能同时有：

- created_at；
- paid_at；
- shipped_at；
- refunded_at。

第四节专门讲。

## Semantic Model 和 dbt Contract 的关系

dbt Contract：

```text
customer_id exists
customer_id type = bigint
```

Semantic Model：

```text
customer_id
= customer entity
= foreign relationship role
```

一个保证：

**Physical Interface（物理接口）**

一个声明：

**Business Semantics（业务语义）**。

所以 Semantic Layer 建在稳定 Contracted Model 上更可靠。

## Semantic Model 和 dbt DAG 有什么关系

Semantic Model 对应一个 dbt Model，

所以它仍然和 dbt Resource 存在依赖联系。

但是：

```text
dbt DAG dependency
```

不自动等于：

```text
MetricFlow join relationship
```

例如：

```text
fct_orders
ref(dim_customers)
```

在 Transformation SQL 中有依赖，

不代表 MetricFlow 一定应该通过某个 Entity 自动 Join。

相反，

两个 dbt Model 即使没有直接 `ref()`，

如果它们在语义上共享合法 Entity，

Semantic Graph 仍可能让 Query 使用这条关系。

## `semantic_manifest` 高层上是什么

dbt / MetricFlow 会把解析后的 Semantic Metadata 输出成机器可读信息。

可以高层理解为：

```text
Semantic Models
Entities
Dimensions
Metrics
Relationships
→ semantic metadata artifact
```

后面 Metric Query / API / Tool 可以消费它。

这里不冻结具体 Artifact 内部 Schema，

因为它仍然是版本敏感实现。

## 这一节真正要记住的结构

以后看到一个当前 Semantic Model，

先从这四层读：

```text
1. dbt Model 是什么？
2. semantic_model 是否启用？
3. 哪些 Column 被声明为 Entity / Dimension？
4. 默认 Metric Time 是什么？
```

然后才去看 Metric。

否则一上来只看指标 Formula，

很容易忽略真正决定 Join 和 Grain 的 Semantic Structure。

## 下一步

现在我们已经有：

```text
dbt Model
→ Semantic Model Node
```

下一个问题是：

> 这个 Node 到底代表哪个业务对象？和其他 Node 怎样连接？

这就是：

**Entity 与 Semantic Grain。**
