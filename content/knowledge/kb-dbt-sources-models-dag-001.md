---
id: kb-dbt-sources-models-dag-001
type: knowledge
title: Sources, Models, ref(), source() & Dependency Graph
title_cn: Sources、Models、ref()/source() 与 Dependency Graph
stage_id: '05'
domain: modeling
topic: dbt
order: 3
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: dbt_l5_v1
summary: source() 与 ref() 不只是生成表名，它们把 Source、Model 等资源之间的依赖显式交给 dbt，从而形成可按拓扑顺序构建、可追踪血缘、可做影响分析的 DAG。
prerequisites:
  - kb-dbt-project-runtime-001
related:
  - kb-dbt-jinja-macros-adapters-001
---
# Sources、Models、ref()/source() 与 Dependency Graph

## 30 秒理解

dbt 最核心的工程化能力之一是：

> **把“SQL 里隐含的表依赖”，变成 Framework 能理解的资源依赖。**

主链：

```text
Declared Source
→ source()

Upstream Model
→ ref()

↓
Dependency Graph
↓
Build Order / Lineage / Impact Analysis
```

先记最重要的区别：

```text
source()
= 引用 dbt 项目之外已经存在的上游数据源

ref()
= 引用 dbt 管理的另一个资源 / Model
```

## Source 是什么

Source 表示：

> dbt 不负责创建，但 dbt Transformation 会读取的上游 Relation。

例如业务库同步到 Warehouse：

```text
raw.app_orders
```

可以声明：

```yaml
sources:
  - name: app
    schema: raw

    tables:
      - name: orders
      - name: customers
```

然后 Model 使用：

```sql
select *
from {{ source('app', 'orders') }}
```

这里 Source 的价值不只是：

> 少写一次 `raw.app_orders`。

更重要的是：

- dbt 知道这是一个 Source Resource；
- 可以给它加 Description；
- 可以做 Freshness；
- 可以做 Test；
- 可以建立 Source → Model Lineage。

## Model 是什么

最常见的 dbt Model 是一个：

```text
SELECT statement
```

例如：

```sql
-- models/staging/stg_orders.sql

select
    order_id,
    customer_id,
    order_ts,
    amount
from {{ source('app', 'orders') }}
where is_deleted = false
```

源文件表达的是：

> 这个 Model 的数据逻辑是什么。

它最终变成：

- View；
- Table；
- Incremental Relation；
- 或其他 Materialization；

留到第 5 节。

## ref() 到底做两件什么事

例如：

```sql
select *
from {{ ref('stg_orders') }}
```

`ref()` 至少有两个关键作用。

### 第一：解析 Relation Name

它会根据：

- Target；
- Schema；
- Alias；
- Adapter；
- Resource Config；

生成正确 Relation。

避免写死：

```sql
analytics_prod.stg_orders
```

### 第二：声明 Dependency

更重要：

```text
fct_orders
→ depends on
stg_orders
```

dbt 因此能把两个 Model 连进 DAG。

所以：

> **ref() 是 Dependency Declaration，不只是字符串模板。**

## source() 也不只是字符串替换

例如：

```sql
from {{ source('app', 'orders') }}
```

dbt 知道：

```text
stg_orders
depends on
source.app.orders
```

于是 DAG 可以出现：

```text
source.app.orders
        ↓
    stg_orders
        ↓
    fct_orders
```

这对：

- Documentation；
- Freshness；
- Lineage；
- Selection；

都很重要。

## 为什么直接写表名会破坏工程能力

比较：

```sql
from analytics.stg_orders
```

与：

```sql
from {{ ref('stg_orders') }}
```

第一种只有数据库知道：

> SQL 读了某张表。

但 dbt Project Graph 不一定知道：

> 当前 Model 应该依赖哪个 Resource。

于是会失去或削弱：

- Build Order；
- Environment Resolution；
- Graph Selection；
- Impact Analysis；
- Lineage。

所以在 dbt 管理的 Model 之间，

优先使用：

**ref()**

不是为了“语法好看”，

而是为了保留 Graph Semantics。

## DAG 是什么

DAG：

**Directed Acyclic Graph（有向无环图）**。

例如：

```text
source.app.orders
        ↓
    stg_orders
        ↓
    int_orders_enriched
        ↓
    fct_orders
        ↓
   mart_daily_sales
```

箭头表示：

> 下游依赖上游。

因为不能出现循环依赖：

```text
A → B → C → A
```

否则就不存在合法的构建顺序。

## DAG 决定什么

### Build Order

如果：

```text
fct_orders
depends on
stg_orders
```

dbt 就知道：

```text
stg_orders
must be ready first
```

### Lineage

可以回答：

> 这个 Model 的数据来自哪里？

### Downstream Impact

如果修改：

```text
stg_orders
```

可以进一步问：

> 哪些 Model 可能受影响？

### Selection

后面第 11 节会学：

```text
select node + parents / children
state:modified
defer
```

这些能力都建立在 DAG 上。

## DAG 不是什么

dbt DAG **不是数据库 Physical Execution Plan**。

例如：

```text
stg_orders
→ fct_orders
```

只表达：

> fct_orders 依赖 stg_orders。

它没有表达：

> fct_orders 内部 SQL 是 Hash Join 还是 Sort Merge Join。

真正物理执行由目标平台决定。

所以：

```text
dbt DAG
= resource dependency graph

database execution plan
= physical SQL runtime plan
```

这是两个完全不同的层级。

## 一个三层 Model 示例

### Source

```yaml
sources:
  - name: app
    schema: raw

    tables:
      - name: orders
      - name: customers
```

### Staging

```sql
-- stg_orders.sql

select
    order_id,
    customer_id,
    amount
from {{ source('app', 'orders') }}
```

### Intermediate

```sql
-- int_orders_with_customer.sql

select
    o.order_id,
    o.amount,
    c.customer_segment
from {{ ref('stg_orders') }} o
left join {{ ref('stg_customers') }} c
    on o.customer_id = c.customer_id
```

### Mart

```sql
-- fct_orders.sql

select *
from {{ ref('int_orders_with_customer') }}
```

DAG：

```text
source.orders → stg_orders ─────────┐
                                    ├→ int_orders_with_customer → fct_orders
source.customers → stg_customers ───┘
```

这才是“dbt 分层”的工程表达。

## 一个 Model 可以 ref 多个上游吗

当然可以。

例如 Join：

```sql
from {{ ref('stg_orders') }} o
join {{ ref('dim_customer') }} c
```

DAG 会表达：

```text
stg_orders ─────┐
                ├→ current_model
dim_customer ───┘
```

这会影响 Build Order 和 Impact Analysis。

## 一个上游可以有很多下游吗

同样可以：

```text
stg_orders
├→ fct_orders
├→ daily_sales
└→ customer_ltv
```

所以 DAG 不是一条链，

而是整个 Project 的 Dependency Network。

## 为什么分层目录不等于 DAG

你可以把文件放成：

```text
models/staging/
models/intermediate/
models/marts/
```

但真正依赖关系仍来自：

```text
ref()
source()
```

目录只是组织方式。

如果一个 `marts/` Model 直接读 Raw Table：

```sql
from raw.orders
```

它仍然可能绕开 Staging。

所以：

> **Folder Convention ≠ Dependency Enforcement。**

## DAG 和数仓 ODS/DWD/DWS 是什么关系

dbt 可以实现很多建模分层，

但 DAG 本身并不规定：

```text
必须 ODS → DWD → DWS → ADS
```

项目可以使用：

```text
staging
intermediate
marts
```

也可以有其他结构。

Stage 03 负责：

> 为什么业务上需要某种分层。

dbt 负责：

> 怎样用 Graph 和 Code 实现这种分层。

## source() / ref() 为什么对开发环境特别重要

如果 Dev Target 使用：

```text
alice_dev
```

而 Prod 使用：

```text
analytics
```

同一段：

```sql
{{ ref('stg_orders') }}
```

可以解析成当前环境对应 Relation。

这比写死：

```text
prod.analytics.stg_orders
```

安全很多。

因此：

```text
Dependency Graph
+
Environment Resolution
```

其实是一件事的两个侧面：

> dbt 必须知道你引用的是“哪个资源”，才能为它解析“当前环境里的哪个 Relation”。

## 下一步为什么要学 Jinja / Macro

到这里，我们已经知道：

```text
Source
→ Model
→ ref/source
→ DAG
```

但 dbt Model 里还有：

```text
{{ ... }}
{% ... %}
```

它们不是数据库 SQL。

下一步要回答：

> dbt 在把 SQL 发给数据库之前，到底怎样通过 Jinja / Macro 生成最终 SQL？

## 关联知识

下一节进入 **Jinja、Macros、Packages 与 Adapter Abstraction**。
