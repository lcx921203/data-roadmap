# CONTENT_MODEL.md

# DataRoadmap Content Model V1

## 1. 四类独立用户内容资产

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

`Interview Evidence` 是 Interview Bank 的后台证据层，不作为第五种前台内容资产。

---

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

interview_frequency: unrated
status: draft
---
```

`interview_frequency` 必须由真实 Interview Evidence corpus 校准，不凭编辑感觉标记 high。

---

## 3. Interview Evidence Schema

```yaml
---
id: ev-yyyy-source-001
type: interview_evidence

source:
  url: ""
  source_type: first_hand_interview_experience
  publisher: ""
  author_handle: ""
  published_at: null
  captured_at: ""
  reliability: B

interview_context:
  company: null
  role: null
  seniority: null
  round: null
  location: null

raw_question: ""
normalized_question: ""

origin_fingerprint: ""
independence_group: ""

knowledge_candidates: []
scenario_candidates: []

review:
  extraction_status: pending
  human_verified: false
  notes: ""
---
```

规则：

- 无真实来源，不创建伪 Evidence。
- 转载 / 镜像共享同一个 `independence_group`。
- 一个 `independence_group` 最多贡献一次频率。
- 缺失的公司、岗位、轮次、日期保持 `null`，不猜测。

---

## 4. Canonical Interview Question Schema

```yaml
---
id: iq-topic-question-001
type: interview

question: ""

difficulty: senior

knowledge: []
scenarios: []
projects: []

evidence:
  ids: []
  independent_count: 0
  company_count: 0
  first_seen_at: null
  last_seen_at: null

frequency:
  global: unrated
  score: 0
  by_role: {}
  by_company: {}

verification:
  publishable: false
  reviewed_at: null

related_questions: []

status: draft
---
```

正式 Interview Question 与单个 `source_url` 解耦，因为一道标准题可以由多条独立面试证据共同支持。

只有真实 Evidence 通过来源审核、标准化和去重后，才能设置：

```yaml
verification:
  publishable: true
```

---

## 5. Frequency Model

原始指标：

```text
evidence_count
independent_evidence_count
company_count
recent_12m_count
recent_24m_count
first_seen_at
last_seen_at
```

基础证据权重：

```text
A = 1.00
B = 0.75
C = 0.35
D = 0
```

频率等级：

```text
unrated
emerging
repeated
high_frequency
long_tail
```

具体阈值由真实 corpus 分布校准，不预设“出现 N 次就是高频”的固定结论。

---

## 6. Scale Scenario Schema

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

---

## 7. Project Case Schema

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

---

## 8. ID Convention

```text
kb-*   Knowledge
iq-*   Interview Question
ev-*   Interview Evidence
sc-*   Scale Scenario
pj-*   Project Case
```

ID 一旦发布尽量保持稳定，不使用显示标题作为关联键。

---

## 9. Truthfulness Boundary

```text
Project Case
= 用户真实项目事实

Production Pattern
= 行业生产方案

Scale Scenario
= 假设规模化训练

Interview Question
= 有真实面试 Evidence 的问题
```

四者互相引用，但不得混写成同一类事实。
