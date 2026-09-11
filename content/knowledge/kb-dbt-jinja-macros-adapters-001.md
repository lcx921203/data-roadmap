---
id: kb-dbt-jinja-macros-adapters-001
type: knowledge
title: Jinja, Macros, Packages & Adapter Abstraction
title_cn: Jinja、Macros、Packages 与 Adapter Abstraction
stage_id: '05'
domain: modeling
topic: dbt
order: 4
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: dbt_l5_v1
summary: dbt 在 SQL 提交给数据库之前先执行 Jinja。Macro 本质上是编译期 SQL 代码生成；Package 提供跨项目复用，Adapter/dispatch 用于隔离部分平台差异。
prerequisites:
  - kb-dbt-sources-models-dag-001
related:
  - kb-dbt-materializations-001
---
# Jinja、Macros、Packages 与 Adapter Abstraction

## 30 秒理解

dbt 文件里经常同时存在两种语言：

```text
SQL
+
Jinja
```

例如：

```sql
select *
from {{ ref('stg_orders') }}
where order_date >= '{{ var("start_date") }}'
```

数据库不会理解：

```text
{{ ref(...) }}
{{ var(...) }}
```

dbt 会先执行 Jinja：

```text
dbt source code
→ Jinja / Macro evaluation
→ compiled SQL
→ database
```

所以：

> **Jinja / Macro 是编译期机制，不是数据库逐行运行的业务函数。**

## `{{ }}` 和 `{% %}` 是什么

### `{{ ... }}`

通常用于：

> 输出一个表达式结果。

例如：

```sql
{{ ref('stg_orders') }}
```

或：

```sql
{{ cents_to_dollars('amount') }}
```

结果会被写进 Compiled SQL。

### `{% ... %}`

通常用于：

> 控制逻辑。

例如：

```jinja
{% if target.name == 'prod' %}
    where event_date >= current_date - 30
{% else %}
    where event_date >= current_date - 3
{% endif %}
```

这是 dbt Compile 时执行的逻辑。

不是数据库里的：

```sql
CASE WHEN ...
```

## Compile Time 和 Query Runtime 必须分开

例如：

```jinja
{% if target.name == 'dev' %}
limit 1000
{% endif %}
```

这个判断发生在：

**dbt Compile Time。**

最后发给数据库的可能直接是：

```sql
select *
from analytics.orders
limit 1000
```

数据库只看到最终 SQL。

所以：

```text
Jinja condition
≠
SQL runtime condition
```

这是后面 Macro 排障的基础。

## Macro 是什么

Macro 可以理解成：

> 一个可复用的 Jinja 函数，用来生成 SQL 片段。

例如：

```sql
-- macros/cents_to_dollars.sql

{% macro cents_to_dollars(column_name) %}
    ({{ column_name }} / 100.0)
{% endmacro %}
```

Model：

```sql
select
    order_id,
    {{ cents_to_dollars('amount_cents') }} as amount
from {{ ref('stg_orders') }}
```

编译后类似：

```sql
select
    order_id,
    (amount_cents / 100.0) as amount
from analytics.stg_orders
```

数据库最终执行的仍然只是 SQL。

## Macro 为什么有价值

假设几十个 Model 都有：

```sql
case
    when status = 'PAID' then 1
    else 0
end
```

如果业务逻辑完全一致，

可以考虑抽成 Macro。

价值：

- 避免复制；
- 改一处统一生效；
- 统一 SQL Pattern；
- 隔离平台差异。

这就是 DRY：

**Don't Repeat Yourself（不要重复自己）**。

## 为什么不能把所有 SQL 都抽成 Macro

过度抽象会出现：

```text
simple SQL
→ macro calls macro
→ macro calls dispatch
→ generated SQL difficult to read
```

结果：

- Debug 困难；
- Compiled SQL 难定位；
- 新人难理解；
- 逻辑控制流隐藏。

所以好的原则是：

> **重复且稳定的 SQL Pattern 才值得抽象。**

不是：

> 一切 SQL 都要 Macro 化。

## Macro 和数据库 UDF 有什么区别

Macro：

```text
Compile Time
→ generates SQL
```

数据库 UDF：

```text
Query Runtime
→ database executes function
```

例如 Macro：

```jinja
{{ cents_to_dollars('amount_cents') }}
```

编译成：

```sql
(amount_cents / 100.0)
```

数据库从来没有执行名叫：

```text
cents_to_dollars
```

的函数。

所以：

**dbt Macro ≠ Database UDF。**

## Jinja 里的 config() 是什么

Model 可以使用：

```sql
{{ config(
    materialized='table',
    tags=['finance']
) }}

select ...
```

这里 `config()` 不是生成业务 Column。

它在 Compile / Resource Configuration 期间告诉 dbt：

> 这个 Resource 应该怎么被构建或分类。

例如：

- Materialization；
- Tags；
- Contract；
- Incremental Config。

Materialization 第 5 节再完整展开。

## `target` 为什么有用

dbt Jinja Context 可以访问当前 Target。

例如概念上：

```jinja
{% if target.name == 'dev' %}
    ...
{% endif %}
```

这允许开发环境和生产环境产生不同的：

- Sampling；
- Schema Behavior；
- Temporary Limits；

但必须谨慎。

如果 Dev 和 Prod 的核心业务逻辑差异过大，

可能出现：

> 开发测试通过，但生产执行的是另一套 SQL。

所以环境分支应该用于：

**环境差异**

而不是：

**复制两套业务逻辑。**

## Package 是什么

Package 用于：

> 在多个 dbt Project 之间复用 Macro / Resource 等能力。

可以高层理解：

```text
shared dbt package
→ project A
→ project B
→ project C
```

典型价值：

- 通用 Macro；
- Date Utility；
- Test；
- Adapter Helper。

Package 的重点是：

**跨项目代码复用。**

当前 V1 不需要背 Package Manager 的全部细节。

## Package 的风险是什么

外部 Package 也是依赖。

因此要考虑：

- Version；
- Compatibility；
- Upgrade；
- Breaking Change；
- Supply / Maintenance。

不要因为：

> 能装 Package

就把整个项目的关键业务逻辑交给未经治理的第三方依赖。

## Adapter Abstraction 为什么需要

不同平台可能有不同 SQL：

例如日期差计算：

```text
DATEDIFF
DATE_DIFF
TIMESTAMP_DIFF
...
```

如果 Macro 直接写死某个平台 SQL，

Package 就很难复用。

dbt 提供 Adapter Abstraction，

让同一个逻辑可以根据目标平台选择不同实现。

## adapter.dispatch 怎么理解

高层模型：

```text
common macro name
→ dispatch
→ adapter-specific implementation
```

例如概念上：

```jinja
{% macro my_date_diff(start_date, end_date) %}
    {{ return(adapter.dispatch('my_date_diff')(
        start_date,
        end_date
    )) }}
{% endmacro %}
```

然后不同 Adapter / Namespace 可以实现：

```text
default__my_date_diff
postgres__my_date_diff
snowflake__my_date_diff
...
```

重点不是背命名语法。

真正要理解：

> **同一个 dbt Project 可以把平台差异集中封装，而不是让每个 Model 都写一堆 if database=...。**

## Adapter Abstraction 不是“跨库 SQL 自动完全兼容”

即使有 Adapter 和 Macro，

不同平台仍然可能在：

- Data Type；
- Transaction；
- Incremental Strategy；
- Materialized View；
- Catalog；
- Constraint；
- DDL；

上能力不同。

所以：

```text
adapter abstraction
≠
all warehouses behave identically
```

正确理解是：

> dbt 提供统一 Framework 接口，并允许平台差异被适配。

## Compiled SQL 为什么是排障第一入口之一

假设源 Model：

```sql
select
    {{ some_macro('amount') }}
from {{ ref('orders') }}
```

报数据库语法错误。

你不能只看 Source Code。

应该先看：

```text
Compiled SQL
```

因为真正发给数据库的是：

> Macro + Jinja + ref() 解析之后的结果。

所以排障链：

```text
Source dbt code
→ Compiled SQL
→ Database Error
```

先确认：

> 错误是 dbt 生成错了，还是数据库执行错了？

## Jinja 写得越复杂越好吗

不是。

dbt 最健康的代码通常仍然让：

**SQL 语义保持可读。**

Jinja 适合：

- 少量条件；
- Config；
- 重复 SQL Pattern；
- Platform Abstraction。

如果业务逻辑大量变成：

```text
nested loops
nested if
macro recursion
```

就说明：

> Transformation 代码可能已经过度元编程。

## 前 4 节现在形成什么模型

到这里可以完整说出：

```text
dbt Project
→ discover resources
→ target / adapter
→ source() / ref()
→ dependency DAG
→ Jinja / macros
→ compile
→ executable SQL
→ target data platform
```

这就是 dbt Project & DAG 的核心骨架。

还没有进入：

**这个 Model 最终到底变成 View、Table、Incremental 还是 Ephemeral？**

那是下一节。

## 关联知识

下一节进入 **Materializations 与 Physical Persistence**。
