---
id: pj-north-america-iceberg-001
type: project_case
project: north-america
topic: iceberg

title: North America Project · Iceberg
title_cn: 北美项目 · Iceberg

status: fact_boundary_v1
truth_status: artifact_verified_demo_boundary

verification:
  basis: user_project_artifacts
  reviewed_at: 2026-09-11
  scope: code_and_project_docs
  production_runtime_proven: false

knowledge:
  - kb-iceberg-overview-001
  - kb-iceberg-metadata-snapshot-001
  - kb-iceberg-manifest-tree-001
  - kb-iceberg-partition-evolution-001
  - kb-iceberg-schema-evolution-001
  - kb-iceberg-row-level-changes-001
  - kb-iceberg-write-distribution-ordering-001
  - kb-iceberg-commit-concurrency-001
  - kb-iceberg-maintenance-small-files-001
  - kb-iceberg-trino-read-path-001
  - kb-iceberg-production-troubleshooting-001

scenarios:
  - sc-iceberg-10b-backfill-001
  - sc-iceberg-streaming-small-files-001
  - sc-iceberg-concurrent-commit-001

interviews:
  - iq-lake-vs-warehouse-001
  - iq-large-dataset-tech-selection-001
  - iq-system-concurrency-fault-tolerance-001
---

# 北美项目 · Iceberg

> **Project Fact Boundary（项目事实边界）**
>
> 这里的 `Actual` 只表示：已有项目工程资料可以支持的实现事实。
> 它不等于真实生产环境规模证明，也不把后续生产级设计写成已经发生过的项目经历。

## Actual｜当前可以确认的项目事实

### 1. 项目本身是现代数据平台 Demo，而不是生产部署证明

项目以 **Shopify Order Domain（Shopify 订单域）** 为业务切片，重新实现现代数据平台链路。

因此，这个 Project Case 可以说明：

- 为什么采用 Lakehouse（湖仓）；
- Iceberg 在整条数据链路中的位置；
- 数据如何从 Raw 进入结构化版本；
- dbt / MetricFlow / Dagster 如何继续消费或组织这些数据。

但不能仅凭这个 Demo 推导出真实生产规模、SLO 或线上稳定性结论。

### 2. Iceberg 属于项目工程实现范围

已有项目工程资料中，Lakehouse 主链路明确包含 Iceberg。

项目链路围绕：

```text
Shopify
  ↓
Raw / Normalize
  ↓
Iceberg
  ↓
dbt
  ↓
MetricFlow
```

基础运行环境还包含：

```text
Object Storage
  +
Polaris Catalog
  +
Spark Compute
  +
Iceberg Table
```

这说明 Iceberg 不是后来为了学习临时附加的知识点，而是项目 Lakehouse 设计与工程实现范围的一部分。

### 3. Raw / Normalize 路径与 Iceberg 表语义有工程代码对应

项目工程资料中存在 Raw ingestion（原始采集）与 Normalize（规范化）路径，并以 Iceberg 作为 Lakehouse 表层。

项目还围绕业务版本、幂等写入以及 Raw → Structured Source 的链路组织代码和验收入口。

这里可以作为项目事实使用的是：

> 项目代码围绕 Iceberg 表构建了 Raw / Normalize 数据链路。

但这并不自动证明所有 Iceberg L5 内部机制都曾在真实故障中被实际处理。

### 4. 项目存在后续编排工程，但验收状态需要保留边界

项目资料中已经存在 Dagster Definitions、Resources、Assets、Asset Checks 等代码，以及 dbt lineage 的接入设计。

但是在已有阶段性验收记录里，Dagster 依赖安装、`dagster definitions validate`、完整 Raw → Source → dbt Materialize、失败演练等仍有尚未完成或尚未验证的项目。

因此：

> 可以说“相关工程代码已经补入项目”。

不能直接升级成：

> “完整生产编排链路已经经过生产验证”。

---

## Boundary｜当前不能作为真实项目经历宣称的内容

以下内容目前不能进入 `Actual`：

### Iceberg 内部机制 ≠ 项目实际故障经历

Learn 中已经完成的这些知识：

- Snapshot / Metadata
- Manifest List / Manifest
- Partition Evolution
- Schema Evolution
- Row-level Changes
- Write Distribution / Ordering
- Optimistic Commit / Conflict
- Small Files / Maintenance
- Trino Read Path
- Production Troubleshooting

都可以解释这个项目。

但除非以后出现明确项目证据，否则不能说：

> “北美项目实际发生过这些问题，我在项目里逐项处理过。”

### 不声明生产规模数字

当前不声明：

- 100 亿行历史回填；
- 100 个并发 Writer；
- 10 秒一次 Streaming Commit；
- 具体线上 QPS；
- 具体线上 P95 / P99；
- 具体集群规模；
- 具体 SLO / SLA；
- 真实生产成本数字。

这些属于 Scale Lab（规模化训练），不是项目事实。

### DataHub / Data Agent 不自动算当前 Iceberg Actual

历史项目资料中，DataHub 与 Data Agent 曾被放在后续演进路线。

除非有独立完成证据，否则不能因为总架构图里出现它们，就把它们写成 Iceberg Project Case 的已落地事实。

---

## Knowledge Mapping｜Iceberg 知识如何解释项目

这里的 Mapping（映射）只表达：

> 这个知识点对理解项目有帮助。

不表达：

> 项目一定真实经历过这个问题。

### 直接架构相关

- `kb-iceberg-overview-001`
  - 解释为什么项目使用 Lakehouse / Iceberg。
- `kb-iceberg-metadata-snapshot-001`
  - 解释 Iceberg 如何组织表版本。
- `kb-iceberg-trino-read-path-001`
  - 解释查询引擎读取 Iceberg 时的基本路径。

### 写入与版本语义相关

- `kb-iceberg-row-level-changes-001`
- `kb-iceberg-write-distribution-ordering-001`
- `kb-iceberg-commit-concurrency-001`

这些知识用于解释：

- Raw / Normalize 写入；
- 业务版本；
- 幂等与更新；
- 多 Writer 时生产系统会遇到什么问题。

其中并发冲突属于可扩展的生产知识，不自动视为本项目真实故障。

### 元数据与演进相关

- `kb-iceberg-manifest-tree-001`
- `kb-iceberg-partition-evolution-001`
- `kb-iceberg-schema-evolution-001`

这些知识用于理解：

- Iceberg 元数据树；
- 分区策略变化；
- Schema 变化为什么能保持兼容。

### 运维与稳定性相关

- `kb-iceberg-maintenance-small-files-001`
- `kb-iceberg-production-troubleshooting-001`

这些知识用于回答：

> 如果这个 Demo 被扩大为真实生产系统，需要如何维护和排障？

它们属于 Production Pattern（生产模式）解释，不等于项目已有生产事故。

---

## Scale Extension｜规模化扩展

以下三个场景全部保持：

```text
HYPOTHETICAL SCALE LAB
```

即：假设规模训练，不是项目经历。

### 10B Historical Backfill

`sc-iceberg-10b-backfill-001`

讨论：

- 大规模历史回填；
- 写入吞吐；
- 提交窗口；
- 小文件；
- 查询影响；
- 成本与恢复。

### Streaming Small Files

`sc-iceberg-streaming-small-files-001`

讨论：

- 高频提交；
- 小文件增长；
- Manifest 压力；
- Compaction / Rewrite 策略。

### Concurrent Writers

`sc-iceberg-concurrent-commit-001`

讨论：

- 多 Writer 并发；
- 乐观提交；
- 冲突；
- Retry Storm；
- 隔离与恢复。

这些场景和项目技术域有关，但不是对项目历史事实的描述。

---

## Interview Mapping｜面试映射

当前只连接已有真实 Interview Evidence 支持的标准题：

- `iq-lake-vs-warehouse-001`
- `iq-large-dataset-tech-selection-001`
- `iq-system-concurrency-fault-tolerance-001`

这里仍然遵守：

> 有知识相关性，不代表可以声称“这就是 Iceberg 高频题”。

Iceberg-specific frequency（Iceberg 专属频率）必须等待真实 Interview Evidence 校准。
