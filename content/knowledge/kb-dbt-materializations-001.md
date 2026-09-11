---
id: kb-dbt-materializations-001
type: knowledge
title: Materializations & Physical Persistence
title_cn: Materializations 与物理持久化
stage_id: '05'
domain: modeling
topic: dbt
order: 5
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: dbt_l5_v1
summary: Materialization 决定一个 dbt Model 的 SELECT 最终如何持久化到目标平台。View、Table、Incremental、Ephemeral 和 Materialized View 的核心差异在于查询成本、构建成本、数据新鲜度、可调试性与平台支持边界。
prerequisites:
  - kb-dbt-jinja-macros-adapters-001
related:
  - kb-dbt-incremental-models-001
---
# Materializations 与物理持久化

## 30 秒理解

前 4 节已经知道：

```text
dbt Model
→ ref/source DAG
→ Jinja / Macro
→ Compiled SQL
```

现在要回答：

> 这段 SELECT 最后在数据库里到底变成什么？

这就是：

**Materialization（物化策略 / 持久化策略）**。

当前 dbt 有 5 种内置 Materialization：

```text
view
table
incremental
ephemeral
materialized_view
```

真正需要记住的不是名字，而是：

```text
同一份业务逻辑
→ 不同 persistence strategy
→ 不同 build cost / query cost / freshness / storage / debugability
```

## Materialization 解决什么问题

例如 Model：

```sql
select
    customer_id,
    sum(amount) as total_amount
from {{ ref('fct_orders') }}
group by customer_id
```

这段 SQL 只回答：

> 数据怎么算？

Materialization 再回答：

> 结果以什么形态存在？

可能是：

```text
View
Table
Incremental Table
CTE inside downstream SQL
Database-managed Materialized View
```

所以：

**Model Logic**

和：

**Persistence Strategy**

是两个不同层次。

## View

配置：

```sql
{{ config(materialized='view') }}

select ...
```

高层行为：

```text
dbt run
→ create / replace view
→ store SQL definition
→ query-time compute
```

### 优点

- 几乎不额外存储数据；
- 上游数据变化后，查询通常能看到较新结果；
- 构建很轻；
- 适合轻量 Transformation。

### 代价

如果：

```text
View
→ View
→ View
→ complex join / aggregate
```

下游每次查询都可能重复执行复杂逻辑。

于是：

```text
build cheap
→ query expensive
```

所以 View 特别适合：

- Rename；
- Cast；
- 简单 Filter；
- 轻量 Staging。

## Table

配置：

```sql
{{ config(materialized='table') }}

select ...
```

高层行为：

```text
dbt run
→ execute model SELECT
→ materialize result as table
```

每次正常构建通常会重新生成完整结果。

### 优点

查询时已经是物理结果：

```text
build expensive
→ query cheap
```

特别适合：

- 重型 Transformation；
- 多下游复用；
- BI / Serving 前的稳定结果。

### 代价

如果数据量巨大：

```text
every run
→ full scan / full transform
→ rebuild all rows
```

构建成本会持续增长。

这就自然引出下一节：

**Incremental。**

## Incremental

先只定位，不在本节讲状态细节。

```text
first run
→ build full table

later runs
→ process selected new / changed rows
→ update existing target
```

所以它解决：

> Full Table Rebuild 已经太贵，但模型又必须持续更新。

它本质上仍然是：

**Table-like Persistent Relation**

只不过 Build Strategy 发生了变化。

下一节专门讲：

- `is_incremental()`；
- `this`；
- `unique_key`；
- `merge`；
- Late Arrival；
- Full Refresh；
- Backfill。

## Ephemeral

配置：

```sql
{{ config(materialized='ephemeral') }}

select ...
```

Ephemeral Model 不会直接创建一个可查询 Relation。

dbt 会把它编译进下游 SQL，通常表现成 CTE。

例如：

```text
ephemeral model
→ downstream ref()
→ compiled as __dbt__cte__...
```

所以数据库中不会出现：

```text
analytics.some_ephemeral_model
```

供你直接查询。

### 适合什么

- 很轻的逻辑；
- 只被少量下游复用；
- 不需要独立查询；
- 不希望制造大量中间 Relation。

### 风险

如果大量层级都 Ephemeral：

```text
many models
→ one giant compiled SQL
→ difficult explain / debug
→ target engine optimizer receives very large query
```

所以 Ephemeral 不是：

> 不落表，所以永远最好。

它是用：

**数据库对象数量更少**

换：

**Compiled SQL 更复杂。**

## Materialized View

Materialized View（物化视图）是数据库平台管理的一类对象。

dbt 的 `materialized_view` Materialization 高层上可以理解为：

```text
dbt
→ deploy materialized view definition / config

database platform
→ maintain / refresh physical result
```

它和普通 Table 最大不同在于：

> 数据刷新机制更多交给目标平台。

与 Incremental Model 相比：

```text
incremental
→ dbt invocation drives data update

materialized view
→ database may manage refresh continuously / automatically
```

具体能力取决于 Adapter / Platform。

## Materialized View 为什么不是所有平台都有

因为它依赖目标数据平台能力。

不同数据库可能：

- 支持；
- 不支持；
- 使用不同名称；
- 有完全不同 Refresh / Index / Clustering 机制。

所以：

```text
dbt supports materialized_view concept
≠
every adapter behaves identically
```

这正是 Adapter Boundary。

## 五种 Materialization 怎么选

不要背：

```text
staging=view
mart=table
```

作为死规则。

更合理的是看 5 个维度。

### 1. Query Cost

下游查得频不频繁？

如果 Query 很频繁，

反复计算复杂 View 会很贵。

### 2. Build Cost

完整重建需要多久？

如果每天全量 20 TB：

```text
table full rebuild
```

可能不可接受。

### 3. Freshness

需要：

```text
query-time fresh
```

还是：

```text
每小时 / 每天 build fresh
```

？

### 4. Reuse

有多少下游复用？

被几十个 Model 重复引用的重逻辑，

更值得物化。

### 5. Debugability

是否需要：

```text
select * from intermediate_relation
```

直接检查中间结果？

Ephemeral 在这里就不占优势。

## 一个典型分层例子

可以是：

```text
Source
→ Staging View
→ Heavy Intermediate Table
→ Incremental Fact
→ Serving Table
```

也可能是：

```text
Source
→ Lightweight Ephemeral
→ Materialized View
```

没有唯一模板。

Materialization 是：

> **Workload Decision**

不是：

> **Folder Decision。**

## 为什么不能一上来全用 Incremental

Incremental 会带来额外复杂度：

- 过滤条件；
- 目标状态；
- `unique_key`；
- Late Data；
- Schema Change；
- Backfill；
- Full Refresh；
- 幂等性。

如果一个 Model：

```text
20 秒就能全量跑完
```

为了省几秒引入复杂 Incremental，

反而增加长期维护风险。

所以更合理的演进通常是：

```text
simple materialization first
→ observe full-build cost
→ incremental when justified
```

## Materialization 和底层 Engine 的边界

dbt 决定：

```text
create view?
create table?
merge?
materialized view?
```

但执行这些 SQL 时：

- Scan；
- Join；
- Shuffle；
- Memory；
- Optimizer；

仍由目标 Engine 决定。

所以：

> Materialization 选错是 dbt 设计问题。

而：

> 同一个 Table Build 里某个 Join OOM

可能是底层 Engine / SQL Plan 问题。

## 这一节形成的核心模型

现在可以把一个 Model 分成两层：

```text
SELECT logic
→ what data means

Materialization
→ how result persists
```

下一步要进入最重要的状态型 Materialization：

**Incremental Model。**

## 关联知识

下一节进入 **Incremental Models、Unique Key、Strategies 与 Backfill**。
