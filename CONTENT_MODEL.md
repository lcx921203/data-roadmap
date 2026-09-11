# CONTENT_MODEL.md

# DataRoadmap Content Model V1.1

## 1. 三类前台用户内容资产

```text
Knowledge
技术知识
   │
   ├──────── Scale Scenario
   │          规模化场景
   │
   └──────── Interview Question
              真实面试题
```

对应公共产品入口：

```text
Learn
Interview
Scale
```

`Interview Evidence` 是 Interview 的后台证据层，不作为第四个前台内容资产。

Project / Resume / Personal Case 资料属于 **Backstage Editorial Context（后台编辑上下文）**，不作为公共产品 Tab。

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

prerequisites:
  - kb-iceberg-snapshot

related:
  - kb-iceberg-manifest-file

interview_relevance: []
scale_scenarios: []

status: draft
---
```

规则：

- Knowledge 是可复用知识，不依赖作者个人项目才能成立。
- Production Pattern 属于 Knowledge 正文。
- Interview frequency 必须由真实 Interview Evidence 校准。

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

正式 Interview Question 与单个来源解耦，一道标准题可以由多条独立面试证据共同支持。

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

频率必须来自 Evidence corpus，不凭编辑感觉标记 high。

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
interviews: []

hypothetical: true
status: draft
---
```

规则：

- Scale Scenario 是生产场景训练。
- 默认保持 `hypothetical: true`。
- 没有运行证据时，不转换成真实项目经历。

---

## 7. Backstage Project Context

仓库中历史 `project-mapping.yaml`、`content/projects/` 或 `pj-*` 文件可以暂时保留，用于：

- 作者自己的事实核验；
- 内容编辑参考；
- 个人简历 / 面试准备。

但它们：

```text
不是前台内容资产
不是顶级 Route
不是公共 Cross-Tab Navigation 的目标
```

`project_relevance` 等旧字段可以暂时作为 Backstage Metadata（后台元数据）存在，后续逐步清理；前台不得依赖这些字段。

---

## 8. ID Convention

公共内容：

```text
kb-*   Knowledge
iq-*   Interview Question
ev-*   Interview Evidence
sc-*   Scale Scenario
```

历史 / 后台：

```text
pj-*   Backstage project context only
```

ID 一旦发布尽量保持稳定。

---

## 9. Public Truthfulness Boundary

```text
Knowledge
= 可复用技术知识与 Production Pattern

Scale Scenario
= 明确标注的生产规模训练

Interview Question
= 有真实 Interview Evidence 的问题
```

三者可以互相引用，但不得混写成同一种事实。

个人项目事实不再承担公共产品内容类型的职责。
