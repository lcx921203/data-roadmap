---
id: kb-dbt-overview-001
type: knowledge
title: dbt Overview & Transformation Mental Model
title_cn: dbt 总览与 Transformation 心智模型
stage_id: '05'
domain: modeling
topic: dbt
order: 1
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: dbt_l5_v1
summary: dbt 把数据平台里的 SQL Transformation 工程化成可版本控制、可依赖、可测试、可文档化的资源图；它主要负责 Transformation，不负责数据接入，也不替代底层计算引擎。
prerequisites: []
related:
  - kb-dbt-project-runtime-001
---
# dbt 总览与 Transformation 心智模型

## 30 秒理解

dbt 最核心的作用可以压成一句话：

> **把数据转换逻辑从“散落的 SQL 脚本”，变成一个可管理的工程项目。**

先记住最高层主链：

```text
Raw / Source Relations
→ dbt Project
→ SQL + Jinja + Dependency Graph
→ Compile
→ Target Data Platform executes SQL
→ Modeled Relations
```

dbt 主要负责：

- Model Code；
- Dependency；
- Build Order；
- Materialization；
- Test；
- Documentation；
- Artifact；
- CI。

而真正执行 SQL 的通常仍然是：

- Snowflake；
- BigQuery；
- Databricks；
- Postgres；
- Trino；
- 或其他 Adapter 对接的平台。

所以：

**dbt = Transformation Framework**

不是：

**Database / Storage Engine / Query Engine。**

## 为什么传统 SQL 脚本会越来越难维护

假设团队有三段 SQL：

```text
01_clean_orders.sql
02_join_customers.sql
03_daily_sales.sql
```

一开始看起来很简单。

但项目变大以后，会出现：

- 谁依赖谁不清楚；
- 表名写死；
- 开发环境和生产环境容易串；
- SQL 改了不知道影响哪些下游；
- 没有统一测试；
- 失败后不知道哪些需要重跑；
- 文档和真实代码容易漂移；
- 同一逻辑到处复制。

真正的问题不是：

> SQL 不够强。

而是：

> **缺少软件工程层。**

dbt 的价值就在这里。

## dbt 把什么工程化了

### 1. SQL 变成 Model

例如：

```sql
select
    order_id,
    customer_id,
    amount
from ...
```

在 dbt 中它不只是“一个 SQL 文件”。

它可以成为：

**Model Resource（模型资源）**

并拥有：

- 名字；
- 配置；
- 依赖；
- Test；
- Documentation；
- Materialization；
- Metadata。

### 2. 表依赖变成显式 DAG

传统写法：

```sql
from analytics.stg_orders
```

只是一段字符串。

dbt 写法：

```sql
from {{ ref('stg_orders') }}
```

除了生成真实 Relation Name，

还表达：

```text
current_model
depends on
stg_orders
```

于是 dbt 可以建立 DAG。

### 3. SQL 变成可编译代码

dbt Model 不是直接把原文件原样发送给数据库。

中间会经过：

```text
Jinja
ref()
source()
config()
macros
→ compile
→ executable SQL
```

所以以后排障要区分：

```text
source code
vs
compiled SQL
```

### 4. 构建结果变成可验证资产

dbt 可以在 Model 上定义：

- Data Test；
- Unit Test；
- Contract；
- Documentation；
- Freshness。

所以“模型建完了”不再等于：

> SQL 没报错。

还可以进一步问：

> 数据是否满足预期？

## dbt 在 ELT 里的位置

一个典型现代数据平台链路：

```text
Source Systems
→ Ingestion / CDC
→ Raw Data Platform
→ dbt Transformation
→ Modeled Data
→ Semantic Layer / BI / Agent
```

这就是常说的：

**ELT**

```text
Extract
→ Load
→ Transform
```

dbt 最核心的是最后的：

**Transform。**

数据通常已经先进入 Warehouse / Lakehouse，

dbt 再在目标平台里执行 SQL 转换。

## dbt 和传统 ETL 工具有什么区别

传统 ETL 工具常常同时承担：

- Extract；
- Transform；
- Load；
- Workflow；
- GUI Pipeline。

dbt 的核心设计更聚焦：

> **已经有数据平台以后，如何把 Transformation 代码化和工程化。**

它非常强调：

- SQL；
- Git；
- DAG；
- Test；
- Documentation；
- CI。

所以 dbt 的优势并不是：

> 能写 SQL。

任何数据库都能写 SQL。

真正区别是：

> **把 SQL Transformation 放进软件工程工作流。**

## dbt 是不是调度器

这里先建立准确边界。

不应该说：

> dbt 完全不能调度。

因为现代 dbt Platform 有 Job / Orchestration 能力。

但对 **dbt Core** 来说，更稳定的说法是：

> **dbt Core 的核心职责是定义和执行 Transformation Build，不是通用的跨系统 Orchestrator。**

例如：

```text
Kafka ingestion
→ Spark job
→ dbt build
→ ML job
→ external API
```

这种跨系统 Asset 编排，

在我们的学习体系里后面由 Dagster 负责。

dbt 只负责其中：

```text
dbt transformation graph
```

这一段。

## dbt 和底层执行引擎是什么关系

假设 dbt 最终编译出：

```sql
create table analytics.fct_orders as
select ...
from ...
join ...
```

dbt 负责：

```text
依赖
编译
执行顺序
提交 SQL
```

底层数据平台负责：

```text
SQL Parse
Optimizer
Join Strategy
Scan
Shuffle
Memory
Transaction / Storage
```

所以：

> dbt Model 很慢

并不一定代表：

> dbt 自己的执行引擎很慢。

更常见的是：

```text
dbt generated SQL
→ target engine physical execution
→ expensive scan / join / warehouse compute
```

这条边界后面生产排障非常重要。

## dbt 和数仓建模是什么关系

Stage 03 已经负责：

- Grain；
- Fact；
- Dimension；
- SCD；
- Star Schema；
- Snowflake Schema。

dbt 不重新发明这些理论。

正确关系是：

```text
Dimensional Modeling
→ decide what model should mean

dbt
→ implement that model as code
```

比如：

Stage 03 先决定：

> `fct_orders` 的 Grain 是一行一个 Order。

Stage 05 dbt 再负责：

```text
SQL
ref()
tests
contract
CI
```

让这个模型工程化。

## dbt 和 Semantic Layer / MetricFlow 的关系

dbt Model 最终可以提供：

```text
clean
tested
documented
contracted
relations
```

Stage 06 再在这些模型上定义：

- Entity；
- Dimension；
- Measure；
- Metric；
- Join Graph。

所以当前阶段只做到：

```text
Source
→ dbt Models
```

不会提前进入：

```text
MetricFlow Metrics
```

## 一个最小 dbt Model

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

下游：

```sql
-- models/marts/fct_orders.sql

select
    order_id,
    customer_id,
    amount
from {{ ref('stg_orders') }}
```

这两段代码已经表达出：

```text
source app.orders
→ stg_orders
→ fct_orders
```

这就是 dbt 最基础的工程化价值。

## 为什么 dbt 不等于“SQL 文件夹”

因为后面真正重要的是：

```text
SQL
+
Resource Metadata
+
Dependency Graph
+
Materialization
+
Tests
+
Contracts
+
Artifacts
+
CI
```

只有这些组合在一起，

才叫一个真正的 Analytics Engineering Project。

## 接下来怎么学

dbt V1 的主线是：

```text
dbt 是什么
→ Project / Target / Adapter
→ Source / Model / DAG
→ Jinja / Macro
→ Materialization
→ Incremental
→ Snapshot
→ Tests
→ Contracts
→ Artifacts
→ State / CI
→ Production
```

现在先进入第二层：

> 一个 dbt Project 被执行时，到底经历了什么？

## 关联知识

下一节进入 **Project、Target、Adapter 与 Command Lifecycle**。
