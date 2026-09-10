# CONTENT_MODEL.md

# DataRoadmap Content Model V1

## 1. 四类独立内容资产

```text
Knowledge
技术知识
   │
   ├──────── Project Case
   │          真实项目案例
   │
   ├──────── Scale Scenario
   │          规模化场景
   │
   └──────── Interview Question
              真实面试题
```

Production Pattern 属于 Knowledge 的正文核心，不单独伪装成项目经验。

## 2. Knowledge Schema

```yaml
---
id: kb-iceberg-manifest-list
type: knowledge

title: Manifest List
title_cn: Manifest 列表

domain: lakehouse
topic: iceberg

learning_depth: L5
stack_role: core
difficulty: intermediate

project_relevance:
  - north-america

role_relevance:
  data_engineer: high
  data_architect: high
  ai_data_engineer: medium

prerequisites:
  - kb-iceberg-snapshot

related:
  - kb-iceberg-manifest-file

comparison:
  - kb-hudi-metadata-overview
  - kb-delta-transaction-log-overview

interview_frequency: high
status: draft
---
```

## 3. Interview Schema

```yaml
---
id: iq-example-001
type: interview

question: ""

company: []
role: []
round: []

source_type: interview_experience
source_url: ""
source_date: ""

verified: false
frequency: medium
difficulty: senior

knowledge: []
scenarios: []
projects: []

status: draft
---
```

只有获得真实来源后再创建正式 Interview 文件。

## 4. Scale Scenario Schema

```yaml
---
id: sc-example-001
type: scenario

title: ""
domain: ""

scenario_type:
  - troubleshooting

difficulty: senior

scale_dimensions:
  - throughput
  - reliability

knowledge: []
projects: []
interviews: []

status: draft
---
```

## 5. Project Case Schema

```yaml
---
id: pj-example-001
type: project_case

project: north-america
title: ""

business_scale: small_medium

knowledge: []
scenarios: []

status: draft
---
```

## 6. ID Convention

```text
kb-*   Knowledge
iq-*   Interview Question
sc-*   Scale Scenario
pj-*   Project Case
```

ID 一旦发布尽量保持稳定，不使用显示标题作为关联键。
