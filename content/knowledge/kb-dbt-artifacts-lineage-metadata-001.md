---
id: kb-dbt-artifacts-lineage-metadata-001
type: knowledge
title: Docs, Artifacts, Lineage & Metadata Integration
title_cn: Docs、Artifacts、Lineage 与 Metadata Integration
stage_id: '05'
domain: modeling
topic: dbt
order: 10
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: dbt_l5_v1
summary: dbt 不只生成数据库 Relation，也会产生项目图、运行结果、Catalog、Freshness 等机器可读 Artifact。这些 Artifact 支撑 Docs、State-aware CI、运行分析和 DataHub 等外部元数据系统。
prerequisites:
  - kb-dbt-contracts-versions-001
related:
  - kb-dbt-state-defer-ci-001
---
# Docs、Artifacts、Lineage 与 Metadata Integration

## 30 秒理解

dbt 一次 Invocation 不只产生：

```text
Table / View
```

还会产生：

**Machine-readable Artifacts（机器可读产物）**。

可以先记：

```text
dbt Project
→ Parse / Build / Test / Docs / Freshness
→ Artifacts

Artifacts
→ Docs
→ State
→ CI
→ Lineage
→ Run Analysis
→ External Metadata Systems
```

所以：

> Artifact 是 dbt 从“执行工具”变成“可集成工程系统”的关键接口之一。

## 为什么 Artifact 很重要

假设外部 CI 想知道：

> 哪些 Model 被修改了？

它不能只看：

```text
git diff *.sql
```

因为 dbt Resource 还可能受：

- Config；
- Macro；
- Dependency；
- Contract；
- Source；
- Package；

影响。

dbt 自己解析 Project 后，

已经形成完整资源图和 Metadata。

Artifact 就是把这些内部结果：

> 以稳定、机器可读的形式输出。

## manifest 是什么

`manifest` 可以先理解成：

> **dbt Project Graph 的机器可读快照。**

里面包含大量资源信息，例如：

- Model；
- Source；
- Test；
- Snapshot；
- Macro；
- Dependency；
- Config；
- Metadata。

所以它可以回答：

```text
有哪些 Node？
谁依赖谁？
每个资源配置是什么？
```

后面第 11 节的：

```text
state:modified
```

就是利用：

**Previous Manifest**

和：

**Current Project State**

做比较。

## manifest 和数据库 Catalog 有什么区别

Manifest 主要描述：

> dbt Project 认为应该有什么。

例如：

```text
Model definition
Dependency
Config
Description
```

数据库 Catalog 更接近：

> 数据平台实际存在的 Relation / Column Metadata。

例如：

- Database；
- Schema；
- Relation；
- Column；
- Data Type。

所以：

```text
manifest
→ logical/project metadata

catalog
→ database-observed metadata
```

二者结合，

才能生成更完整的 Documentation。

## run_results 是什么

`run_results` 记录：

> 一次 dbt Invocation 里各个 Node 的执行结果。

例如可以包含：

- Success / Error；
- Execution Time；
- Adapter Response；
- Message；
- Timing；
- Invocation Metadata。

所以它回答：

```text
Project 是什么？
→ manifest

这次到底跑得怎么样？
→ run_results
```

这是两类不同 Artifact。

## sources Artifact 是什么

运行：

```bash
dbt source freshness
```

会产生 Source Freshness 相关 Artifact。

它可以记录：

- Source；
- Freshness 状态；
- Age / Timestamp；
- Result。

所以：

```text
Source Freshness
→ not only console output
→ machine-readable result
```

外部平台可以进一步：

- 展示；
- 告警；
- 历史趋势分析。

## catalog Artifact 是什么

通常通过：

```bash
dbt docs generate
```

获取目标平台中的：

- Relation；
- Column；
- Type；
- Database Metadata。

它和 Manifest 结合后，

Documentation 可以同时展示：

```text
what project declares
+
what warehouse actually has
```

## semantic_manifest 为什么这一节只轻轻带过

当前 Artifact 列表里还可能包含：

```text
semantic_manifest
```

但它属于：

**Semantic Layer / MetricFlow**

的结构信息。

本 Stage 只需要知道：

> dbt Artifact 系统也能承载 Semantic Metadata。

真正：

- Entity；
- Dimension；
- Metric；
- Semantic Graph；

仍然留到 Stage 06。

## Docs 从哪里来

dbt Documentation 并不是人工再写一套 Wiki。

它可以结合：

- YAML Description；
- Model Metadata；
- Manifest；
- Catalog；
- Lineage Graph；

生成项目 Documentation。

所以：

```text
Code
+
Metadata
→ Docs
```

比：

```text
Code changed
→ remember to manually update separate wiki
```

更不容易漂移。

但：

> Docs 自动生成 ≠ Description 自动有意义。

如果 YAML 里什么都没写，

自动页面也不会凭空产生高质量业务定义。

## dbt Lineage 是怎么来的

核心来自：

```text
ref()
source()
```

显式依赖。

例如：

```text
source.orders
→ stg_orders
→ fct_orders
→ mart_revenue
```

Manifest 可以把这条 Graph 表达出来。

所以 dbt Lineage 的优势是：

> 依赖在代码里显式声明。

不是靠扫描 Production Query Log 猜测。

## dbt Lineage 的边界

dbt 很擅长：

```text
dbt Resource Graph
```

但不能因此说：

> dbt 自动掌握整个企业所有平台的完整血缘。

例如：

```text
Kafka
→ Flink
→ Iceberg
→ dbt
→ MetricFlow
→ BI
```

dbt 只天然知道：

> 自己 Project 内以及 Source / Exposure 等显式集成范围。

跨平台 Enterprise Lineage，

后面由 DataHub 等 Governance System 统一汇总。

## Column-level Lineage 怎么理解

Model-to-Model Lineage 相对直接：

```text
ref()
→ dependency edge
```

Column-level Lineage 则更复杂：

```text
source.price
→ expression
→ revenue
```

需要进一步解析：

- SQL Expression；
- Alias；
- Join；
- CTE；
- Macro Generated SQL。

不同工具 / Runtime 对 Column Lineage 的支持深度也可能不同。

所以在 dbt 这一节只固定：

> dbt Project Metadata 是 Column Lineage 的重要输入之一。

不提前宣称：

> 任意 SQL / Macro 都能 100% 自动解析字段级血缘。

## DataHub 怎么利用 dbt Metadata

高层可以理解：

```text
dbt artifacts / metadata
→ DataHub ingestion
→ enterprise metadata graph
```

DataHub 可以把 dbt 里的：

- Model；
- Description；
- Ownership；
- Lineage；
- Test / Run Metadata；

与其他平台资产结合。

于是：

```text
dbt-only graph
```

可以进入：

```text
cross-system governance graph
```

具体 DataHub Ingestion Pipeline 放到 Stage 08 再讲。

## Artifact 为什么是 CI 的基础

假设昨天 Production Build 的 Manifest：

```text
manifest_old
```

今天 PR 里的 Project：

```text
manifest_new
```

dbt 可以比较：

```text
old
vs
new
→ which nodes changed?
```

再沿 DAG 扩散：

```text
changed node
→ impacted downstream
```

这就是下一节：

**State-aware Selection / Defer / CI**

的基础。

没有前一次 Artifact，

就没有：

```text
project state comparison
```

## Artifact 是不是永久稳定 API

不是。

当前 dbt Artifact 有明确：

```text
dbt_schema_version
```

而且不同 Artifact：

> 可以独立版本演进。

所以外部系统读取：

```text
manifest.json
```

不能假设：

> 所有 dbt 版本 Schema 永远不变。

正确做法是：

```text
read artifact metadata
→ inspect schema version
→ parse compatible version
```

这对 DataHub / Internal Tooling 都很重要。

## 当前常见 Artifact

在当前 v1.12 线里，常见包括：

```text
manifest.json
run_results.json
catalog.json
sources.json
semantic_manifest.json
osi_document.json
```

但学习重点不是背文件列表。

真正应该知道：

```text
Project Graph
Execution Results
Catalog Metadata
Freshness
Semantic Metadata
```

这些不同职责。

## Artifact 和 Log 有什么区别

### Log

面向：

```text
人类排障
streaming execution messages
```

### Artifact

面向：

```text
structured machine-readable state / results
```

例如：

```text
run log says model failed
```

适合现场 Debug。

而：

```text
run_results
```

更适合：

- 自动分析；
- Dashboard；
- Trend；
- CI；
- External Integration。

## 一套 Metadata 分层

可以这样记：

### Code Metadata

```text
SQL
YAML
description
config
```

### Graph Metadata

```text
manifest
dependency
resource identity
```

### Runtime Metadata

```text
run_results
freshness result
```

### Warehouse Metadata

```text
catalog
columns
types
```

### Enterprise Metadata

```text
DataHub
cross-system lineage
ownership
search
governance
```

这样就不会把：

> dbt Docs、Artifact、DataHub

混成同一个东西。

## 为什么 Artifact 是很强的架构接口

因为它把 dbt 内部状态暴露成：

```text
versioned structured contract
```

外部系统无需：

> 直接 Hook dbt Python / Rust 内部对象。

而是读取：

```text
Artifact
```

这使得：

- CI；
- Metadata；
- Docs；
- Governance；

和 dbt Runtime 解耦。

## 到这里 10 节形成的完整模型

现在 dbt 已经从：

```text
Project
→ DAG
→ Compile
→ Materialize
→ Incremental
→ Snapshot
→ Quality
→ Contract
→ Version
→ Artifact
```

形成一个完整工程体系。

最后两节不再增加很多新 Resource。

它们要回答：

```text
怎样只 Build 有变化的部分？
怎样在 CI 中复用 Production 上游？
线上失败时从哪一层排查？
```

## 下一步

下一节进入：

**Selection、State、Defer 与 CI。**
