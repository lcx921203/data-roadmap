---
id: kb-dbt-project-runtime-001
type: knowledge
title: Project, Target, Adapter & Command Lifecycle
title_cn: Project、Target、Adapter 与 Command Lifecycle
stage_id: '05'
domain: modeling
topic: dbt
order: 2
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: dbt_l5_v1
summary: dbt Project 先被解析为资源图，再经过编译生成 SQL，通过 Adapter 提交到目标数据平台执行。Project、Profile/Target 与 Adapter 分别解决项目定义、环境连接和平台差异。
prerequisites:
  - kb-dbt-overview-001
related:
  - kb-dbt-sources-models-dag-001
---
# Project、Target、Adapter 与 Command Lifecycle

## 30 秒理解

运行一次 dbt，可以先压成：

```text
dbt Project
→ Parse
→ Resolve Resources / Dependencies
→ Compile
→ Adapter
→ Target Data Platform
→ Execute
```

三个概念先分清：

**Project**

回答：

> 这个数据转换工程里有哪些资源和规则？

**Target**

回答：

> 这次要在哪个环境、哪个数据平台连接上执行？

**Adapter**

回答：

> dbt 怎样把统一的 Framework 行为映射到具体平台能力？

## dbt Project 是什么

dbt Project 是一组可共同解析的 dbt 资源和配置。

最核心入口通常是：

```text
dbt_project.yml
```

例如：

```yaml
name: analytics
version: '1.0'
config-version: 2

profile: analytics

model-paths:
  - models

models:
  analytics:
    staging:
      +materialized: view
    marts:
      +materialized: table
```

它表达：

- Project Name；
- Resource Path；
- 默认配置；
- 使用哪个 Profile；
- 某些目录级配置。

所以 `dbt_project.yml` 更像：

> **项目级配置入口。**

不是数据库连接密码文件。

## Profile / Target 解决什么问题

dbt 需要知道：

> SQL 最终提交到哪里？

经典 dbt Core v1 环境里通常通过 `profiles.yml` 定义连接和多个 Target。

例如概念上：

```yaml
analytics:
  target: dev

  outputs:
    dev:
      type: postgres
      host: localhost
      user: dev_user
      dbname: analytics
      schema: alice_dev

    prod:
      type: postgres
      host: prod-db
      user: prod_user
      dbname: analytics
      schema: analytics
```

这里重点不是 PostgreSQL 参数。

重点是：

```text
one logical dbt project
+
different target
→ different execution environment
```

于是：

```text
dev
staging
prod
```

可以使用同一套 Model Code，

但落到不同 Relation Namespace。

## 为什么开发环境不能把表名写死

如果 Model 里直接写：

```sql
select *
from prod_analytics.stg_orders
```

那开发环境即使 Target 是：

```text
alice_dev
```

也可能仍然硬读生产 Relation。

dbt 希望尽量通过：

```text
ref()
source()
target-aware relation resolution
```

来避免这种环境耦合。

所以 Project / Target 不是部署细节，

而是：

> **可重复开发环境的基础。**

## Adapter 是什么

不同数据平台的：

- SQL Dialect；
- Relation Type；
- Merge；
- Materialized View；
- Schema；
- Catalog；
- Transaction；
- DDL；

都不同。

dbt 不可能假设：

> 所有 Warehouse 都完全一样。

Adapter 层负责把 Framework 行为映射到具体平台。

可以高层理解：

```text
dbt framework intent
→ adapter
→ platform-specific SQL / API behavior
```

例如：

```text
create schema
quote identifier
incremental merge
relation exists?
```

可能都需要平台适配。

## Adapter 不等于 Query Optimizer

这是一个非常重要的边界。

Adapter 可以告诉 dbt：

> 如何跟这个平台交互。

但真正一条 SQL：

```sql
select ...
join ...
```

如何做：

- Hash Join；
- Broadcast；
- Partition Pruning；
- Shuffle；
- Memory；

仍由目标平台执行引擎决定。

所以：

```text
dbt adapter
≠
database optimizer
```

## Parse 是什么

Parse（解析）阶段可以高层理解为：

> 扫描 Project，理解有哪些 dbt Resources、Config、Dependencies。

例如识别：

- Models；
- Sources；
- Tests；
- Snapshots；
- Macros；
- Seeds；
- Resource Config。

最终要形成：

**Project Graph。**

当前先记：

```text
Project files
→ parse
→ resource graph
```

Artifact 细节放到第 10 节。

## Compile 是什么

Compile（编译）解决的是：

> 把带 dbt/Jinja 语义的代码变成目标平台可以执行的 SQL。

例如源代码：

```sql
select *
from {{ ref('stg_orders') }}
where order_date >= current_date - 7
```

编译后会变成类似：

```sql
select *
from "analytics"."alice_dev"."stg_orders"
where order_date >= current_date - 7
```

真正的 Relation 名字取决于：

- Target；
- Adapter；
- Naming Config；
- Resource Config。

因此排障时非常重要：

> **先看 Compiled SQL，再判断数据库到底执行了什么。**

## Execute 是什么

Compile 之后，

dbt 才通过 Adapter 把 SQL 提交给目标平台。

例如一个 Table Model，

最终可能执行：

```text
create table ...
as
select ...
```

一个 View Model 可能执行：

```text
create view ...
as
select ...
```

具体 DDL 取决于：

**Materialization + Adapter。**

第 5 节再完整讲。

## dbt parse、compile、run、build 怎么区分

不需要背所有 CLI。

先只记四个核心层次。

### dbt parse

重点：

```text
Project
→ Resource Graph
```

适合检查和生成项目解析结果。

### dbt compile

重点：

```text
dbt source code
→ compiled SQL
```

通常不以构建数据库 Relation 为目标。

### dbt run

重点：

```text
selected models
→ materialize models
```

它主要面向 Model 执行。

### dbt build

更接近：

```text
selected DAG resources
→ execute in dependency order
→ models / tests / seeds / snapshots and related buildable resources
```

所以从学习模型看：

```text
run
⊂
build-style project workflow
```

但不要简单理解成：

> build 只是 run 后面自动拼一个 test。

它是面向 DAG Resources 的统一构建命令。

## 一个完整例子

执行：

```bash
dbt build --target prod
```

高层过程：

```text
1. Load project configuration
2. Resolve target
3. Load adapter
4. Parse resources
5. Resolve dependencies
6. Compile selected nodes
7. Execute nodes in graph order
8. Run related validations
9. Produce runtime metadata / artifacts
```

这就是后面所有 dbt 机制的骨架。

## 为什么 Compile 和 Database Execute 要分开

例如：

```text
Compilation Error
```

可能来自：

- Jinja；
- Macro；
- ref 不存在；
- Config；
- Syntax generated incorrectly。

而：

```text
Database Error
```

可能来自：

- Permission；
- Warehouse SQL Syntax；
- Missing Relation；
- Type Mismatch；
- Timeout；
- Engine OOM。

如果不分层，

就会把所有错误都叫：

> dbt 跑挂了。

生产排障必须知道：

```text
Parse?
Compile?
Execute?
```

是哪一层。

## v1 和 v2 为什么现在要谨慎

当前稳定生产学习基线仍然使用 dbt Core v1.12.x 的稳定语义。

dbt Core v2.0 正在 Beta，

底层实现已经转向 Rust / Fusion foundation。

因此以后正文需要区分：

**Framework Semantics**

例如：

- Project；
- Model；
- ref；
- DAG；
- Compile；

这些是稳定概念。

与：

**Implementation Detail**

例如：

- Parser Internals；
- Artifact Storage Format；
- Adapter Packaging；

这些可能随 v2 演进。

## 这一节先不要学什么

暂时不深入：

- ref DAG 细节；
- Macro Dispatch；
- Materialization；
- Incremental；
- Adapter Support Matrix；
- 所有 CLI 参数。

下一步先回答：

> Project 里的 Source、Model 到底怎样连接成一个 DAG？

## 关联知识

下一节进入 **Sources、Models、ref()/source() 与 Dependency Graph**。
