---
id: iq-data-governance-framework-001
type: interview
question: "数据治理应该从哪些方面展开？如何衡量治理效果？"
domain: governance
learning_depth: L5
answer_format_version: "1.0"

evidence:
  direct_independent_count: 4
  direct_company_count: 4

frequency:
  status: repeated_verified
  final_industry_frequency: false

verification:
  question_intent_reviewed: true
  dedup_reviewed: true
  answer_curated: true
  content_review_status: v0_3_7
  publishable: false

project_connection:
  status: needs_project_fact_check

status: answer_ready
---

# 数据治理应该怎么做？如何衡量效果？

## 这道题在考什么

这题不是让你背“标准、质量、元数据、安全”几个名词，而是看你能否把治理做成一套可运行的工程系统：

```text
资产可发现
→ 口径可理解
→ 责任可追踪
→ 质量可验证
→ 变更可评估
→ 权限可控制
→ 效果可度量
```

高级岗位还要说明：治理不是额外审批流程，而应该尽可能进入开发、发布和运行链路。

## 30 秒回答

我会从元数据、数据标准、血缘、质量、Owner、权限与审计、生命周期七个方面做治理。核心不是把信息录进一个平台，而是把这些规则和数据资产、Pipeline、Metric、发布流程绑定。

衡量治理效果不能只看“录入了多少张表”，而应该看结果，例如核心资产 Owner 覆盖率、字段/指标可理解率、血缘覆盖率、质量规则覆盖率、事故定位时间、Schema 变更影响分析成功率、重复指标减少量和敏感数据违规事件。治理最终要改善数据可信度和工程效率。

## 核心原理

治理对象不是只有表。

```text
Data Asset
├── Table / View
├── Column
├── Pipeline
├── Metric
├── Dashboard
├── API
└── Data Product
```

围绕每个资产至少要能回答：

```text
它是什么？
谁负责？
从哪里来？
谁在使用？
质量怎样？
能不能访问？
改了会影响谁？
```

### Metadata（元数据）

包含：

- Schema；
- Description；
- Owner；
- Tags；
- Domain；
- Freshness；
- Usage；
- Version。

### Lineage（血缘）

血缘真正的工程价值是：

```text
Change Impact
Incident Diagnosis
Root Cause Analysis
```

不是画一张漂亮的 DAG。

### Quality（质量）

把：

```text
not null
unique
freshness
business reconciliation
```

绑定到资产和分区，质量结果再通过血缘计算影响范围。

### Ownership（责任）

Owner 不能只是一个永远失效的联系人字段。

生产里要能确定：

```text
谁审批变更
谁处理事故
谁定义口径
谁承担 SLO
```

### Security / Audit（安全与审计）

至少区分：

- 数据分类；
- 敏感字段；
- Role / Policy；
- 谁访问过；
- 为什么访问；
- 是否越权。

## Production 实现

一种可落地的链路：

```text
dbt / SQL / Flink / Spark / Dagster
        ↓
Metadata Ingestion
        ↓
Metadata Platform
        ↓
Catalog + Lineage + Ownership
        ↓
Quality / Impact / Policy
        ↓
Alert / Review / Audit
```

治理要尽量自动化采集，而不是让开发者手工维护一整套重复元数据。

例如模型发布前：

```text
Schema Change
↓
Lineage Impact
↓
识别受影响 Metric / Dashboard
↓
Contract / Quality Check
↓
必要时人工 Review
↓
Deploy
```

## 故障排查

假设一个核心指标错误，但不知道谁改了上游：

```text
Metric
↓
Semantic Model
↓
Serving / Mart
↓
Upstream Models
↓
Source
```

同时查询：

```text
最近 Schema / SQL 变更
最近 Pipeline Run
质量失败记录
Owner
消费方
```

目标是把 MTTR（平均修复时间）从“群里找人”变成可查询的证据链。

## 常见错误回答

- “上 DataHub 就叫完成治理。”
- “把所有表补上中文注释就完成治理。”
- “治理效果看录入资产数量。”
- “血缘只用来展示依赖关系。”
- “所有治理规则都靠人工审批。”

## 项目怎么结合

DataRoadmap 的治理方向可以和 DataHub、dbt、Dagster、Semantic Layer 关联，但具体哪些自动血缘、字段级血缘、质量规则和 Owner 流程真实落地，必须在 Project Case 发布前逐项核验。

## Scale Lab

假设：

```text
100,000 个数据资产
10,000 个指标
数百个团队
```

此时治理难点会变成：

- Metadata Ingestion 成本；
- 字段级血缘计算成本；
- 搜索与索引；
- Domain 隔离；
- 多租户权限；
- Metadata Freshness；
- 大规模变更影响分析。

不能每次 Schema 变化都全图扫描，通常需要增量更新和资产优先级。

## 真实关联追问

1. 数据治理和数据管理有什么区别？
2. 自动血缘怎么做？
3. 字段级血缘如何解析？
4. dbt 和 DataHub 在血缘里分别承担什么？
5. 如何做 Schema Change Impact？
6. 治理平台本身如何保证元数据新鲜度？
