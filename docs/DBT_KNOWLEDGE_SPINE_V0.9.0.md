# dbt Knowledge Spine V0.9.0

## 目标

V0.9.0 只冻结 dbt Learn 的因果结构。

不写 12 篇正文，不改 UI，不创建空文章。

dbt 最容易学成两种碎片：

```text
ref()
source()
incremental
test
macro
snapshot
...
```

或者：

```text
一堆 YAML 配置
+
一堆 CLI 命令
```

这两种方式都无法回答：

> 一段业务建模 SQL，怎样从项目代码变成有依赖、有物理持久化、有增量状态、有质量保护、有接口约束、可以在 CI 和生产里安全演进的数据模型？

所以 V1 冻结一条因果链。

## 12 节主线

```text
01 dbt 是什么
→ 02 Project / Target / Adapter / Command Lifecycle
→ 03 Source / Model / ref / source / DAG
→ 04 Jinja / Macro / Package / Adapter Abstraction
→ 05 Materialization
→ 06 Incremental Model
→ 07 Snapshot / History
→ 08 Tests / Freshness / Reconciliation
→ 09 Contract / Version / Change Safety
→ 10 Docs / Artifact / Lineage / Metadata
→ 11 Selection / State / Defer / CI
→ 12 Production Troubleshooting / Cost / Orchestration Boundary
```

## 01｜dbt 总览

先建立最高层：

```text
Raw / Source Relations
→ dbt Transformation Code
→ Compiled SQL
→ Target Data Platform
→ Modeled Relations
```

dbt 解决的是：

```text
Transformation as Code
```

不是：

```text
Ingestion Engine
Storage Engine
Query Optimizer
General-purpose Orchestrator
```

## 02｜Project、Target、Adapter 与 Command Lifecycle

回答：

> dbt 到底怎样从目录里的 SQL/YAML 变成目标平台上的一次执行？

主线：

```text
Project
→ parse resources
→ compile Jinja / refs
→ adapter
→ execute on target
```

并先区分：

```text
parse
compile
run
build
```

不做 CLI 百科。

## 03｜Sources、Models 与 DAG

这是 dbt 的核心工程化价值之一：

```text
source()
+
ref()
→ explicit dependency graph
→ build order
→ lineage
→ impact analysis
```

重点不是 `ref()` 的字符串语法，而是：

> 依赖从隐含的 Table Name 变成可被系统理解的资源关系。

## 04｜Jinja、Macro、Package 与 Adapter

回答：

> dbt 为什么能让 SQL 代码复用，而且又能适配不同 Warehouse / Engine？

核心：

```text
Jinja / Macro
→ compile-time code generation
→ compiled SQL
```

以及：

```text
adapter abstraction / dispatch
→ platform-specific behavior
```

但不把 Jinja 学成编程语言大全。

## 05｜Materialization

同一个 SELECT 可以有不同的持久化策略。

当前学习范围：

```text
View
Table
Incremental
Ephemeral
Materialized View
```

关键不是背类型，而是判断：

```text
freshness
query cost
build cost
storage
debuggability
adapter support
```

## 06｜Incremental Model

这一节是 dbt 最容易“会写代码但不理解状态”的地方。

主线：

```text
existing target table
+
new / changed source rows
→ incremental filter
→ unique_key
→ strategy
→ update target
```

必须把以下问题连起来：

```text
Late Arrival
Idempotency
Duplicate
Full Refresh
Backfill
Schema Change
```

同时明确：

**dbt microbatch incremental strategy ≠ Structured Streaming Engine。**

## 07｜Snapshot

Snapshot 解决的是：

> 上游 Relation 自己只保留当前状态，但我们需要记录它过去是什么样。

主线：

```text
Mutable Source
→ Snapshot
→ Detect Change
→ Historical Versions
```

它是 SCD2 的一种 dbt 实现方式。

SCD2 业务建模理论仍属于 Stage 03。

## 08｜Tests、Freshness 与 Reconciliation

把质量分成不同问题：

```text
Data Test
→ 当前数据是否违反规则？

Unit Test
→ 模型 SQL 对给定输入是否产生预期输出？

Source Freshness
→ 上游数据有没有按时到？

Reconciliation
→ 业务结果能不能和可信基准对上？
```

不再把所有东西都叫 `test`。

## 09｜Contract、Version 与 Change Safety

Tests 更多回答：

> 现在的数据对不对？

Contract 回答：

> 下游到底可以依赖哪些 Column / Type？

Model Version 回答：

> Breaking Change 怎么让新旧消费者迁移，而不是一刀切把所有下游打坏？

这是 dbt 从“SQL 文件管理”进入 Data Product Interface 的关键一步。

## 10｜Docs、Artifacts、Lineage 与 Metadata

dbt Project 不只有数据库 Relation。

它还产生：

```text
resource graph
run results
catalog metadata
documentation metadata
```

V1 稳定线常见 JSON artifacts，例如：

```text
manifest
run_results
catalog
sources
```

但当前 dbt v2 正在演进 artifact format，所以正文不能把某个文件格式冻结成永久架构真理。

这里同时建立 DataHub 边界：

```text
dbt artifact / project lineage
→ DataHub ingestion
→ enterprise catalog / cross-system governance
```

## 11｜Selection、State、Defer 与 CI

前面已经有：

```text
DAG
+
Artifacts
```

现在才能理解：

```text
state:modified
```

为什么成立。

核心：

```text
previous project state
vs
current project state
→ changed nodes
→ impacted graph
→ targeted CI
```

`defer` 则解决：

> 当前隔离开发环境没有构建的上游 Relation，怎样安全引用另一个环境中已有的 Relation？

重点是 change-aware CI，不是 Selector 语法大全。

## 12｜Production Closure

最后一节不再增加新 dbt 资源。

生产排障先分：

```text
Parse?
Compile?
Database Execute?
Materialization?
Incremental State?
Test / Freshness?
Environment / Permission?
```

再进入：

```text
rerun
full refresh
cost
concurrency
deployment
observability
```

最后明确 dbt / Dagster 边界。

更准确的说法不是：

> dbt 什么调度都不能做。

而是：

> dbt Core 的核心职责是 transformation build semantics；部署平台可以调度 dbt job，而跨系统资产编排在本学习体系里由 Dagster Vertical 负责。

这避免使用已经过时的绝对表述。

## 与 Stage 03 数仓建模的边界

Stage 03：

```text
Grain
Fact
Dimension
SCD
Star / Snowflake
```

dbt：

```text
把这些建模决策写成
SQL + Dependencies + Tests + Contracts + CI
```

所以 dbt 不重新发明维度建模。

## 与 MetricFlow / Semantic Layer 的边界

dbt 最终交付的是：

```text
tested / governed models
```

Stage 06 再在这些模型上建立：

```text
Entity
Dimension
Measure
Metric
Join Graph
Semantic Query
```

因此 V0.9 不提前写 MetricFlow。

## 与 Dagster 的边界

dbt DAG 是：

```text
transformation dependency graph
```

Dagster Asset Graph 可以跨：

```text
ingestion
dbt
quality
serving
external systems
```

两者有交集，但不是同一层级。

## Interview Evidence

目前真实 Interview Bank **没有直接验证过的 dbt 专属题**。

因此 V0.9.0 只登记可以自然关联的现有真实问题：

```text
数仓分层
数据质量
迟到事实数据
SCD1 / SCD2
Data Product System Design
```

这些关系以后只表示：

```text
适合一起学习
```

不表示：

```text
dbt 高频面试题
```

## Freeze

V0.9.0 冻结：

- 12 节顺序；
- 每节唯一职责；
- prerequisites / handoff；
- must-explain / must-not-cover；
- dbt / Dimensional Modeling / MetricFlow / Dagster / DataHub / Execution Engine 边界；
- Stable v1 + v2-aware 版本策略；
- 真实 Interview Seed 边界。

正文从 V0.9.1 开始。
