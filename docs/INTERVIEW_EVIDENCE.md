# Interview Evidence Model V0.3

> Goal: DataRoadmap 的 Interview Bank 以真实面试证据为入口，而不是从知识树自动生成问题。

## 1. 核心数据流

```text
Raw Interview Source
原始面经来源
        ↓
Evidence Record
证据记录
        ↓
Question Extraction
问题抽取
        ↓
Normalization
标准化表达
        ↓
Deduplication / Clustering
同题去重与聚类
        ↓
Canonical Interview Question
标准面试题
        ↓
Knowledge / Scenario / Project Mapping
知识、规模化场景、项目映射
        ↓
Curated Answer
人工策划的预写题解
```

Interview Question 是公开学习资产。

Evidence Record 是它背后的证据层，不等于新的前台内容栏目。

---

## 2. 什么才算“真实面试证据”

至少需要满足：

1. 来源明确存在，而不是模型生成的引用。
2. 文本明确描述面试、面试复盘、面试题或招聘过程。
3. 能提取出实际被问到的问题，而不是作者自己整理的“可能会问”。
4. 保留原始来源链接或可追溯定位信息。
5. 不把转载、镜像、二次搬运当成多个独立证据。

缺少公司、岗位、轮次、日期时可以收录证据，但可信度降低，不能伪造缺失字段。

---

## 3. Source Reliability
来源可信度

### A — Strong First-hand Evidence

第一人称、可追溯的真实面试复盘，并且至少具有：

- 明确公司
- 明确或可判断岗位方向
- 明确面试过程 / 轮次上下文
- 原始页面可访问
- 内容中能识别具体被问问题

用途：

- 可以支持正式题目进入 Interview Bank
- 可以参与高频计算，权重最高

### B — First-hand but Incomplete

明显是第一人称面试经历，但缺少部分元数据，例如：

- 缺日期
- 缺轮次
- 岗位描述较模糊

用途：

- 可以支持题目
- 参与频次统计，但权重低于 A

### C — Traceable Secondary Source

整理站、题库、文章或社区汇总，但能够追溯到原始面经，或者清楚说明题目来自真实面试反馈。

用途：

- 用于补充和交叉验证
- 不应单独证明“高频”

### D — Untraceable Claim

无法追溯来源的“某大厂必问”“XX 高频 100 题”等内容。

用途：

- 可以作为搜索线索
- 不作为正式 evidence
- frequency contribution = 0

---

## 4. Evidence Independence
独立证据判定

频次不是“网页数量”。

下面情况只算 **1 条独立证据**：

- 同一篇文章被多个网站转载
- 同一作者复制到多个平台
- 聚合站抓取同一个原文
- 一个来源对同一道题重复描述

下面情况可以分别计数：

- 不同候选人的独立面试经历
- 不同日期 / 不同岗位 / 不同轮次的真实独立面试记录
- 不同公司出现同一 canonical question

每条 Evidence 必须有：

```yaml
origin_fingerprint:
independence_group:
```

同一个 `independence_group` 最多贡献一次频次。

---

## 5. Question Normalization
问题标准化

不同面试官可能这样问：

```text
Flink 为什么会发生反压？
Flink backpressure 怎么排查？
你的 Flink 作业反压了，你先看什么？
```

不能机械地当成三道完全不同的题。

先抽取：

```yaml
raw_question: "你的 Flink 作业反压了，你先看什么？"
normalized_question: "Flink Backpressure 如何定位和排查？"
```

再判断 canonical intent：

```text
核心考点：
Backpressure detection + bottleneck diagnosis
```

### 合并条件

当以下内容基本一致时，可进入同一个 question cluster：

- 核心考点
- 期望回答的技术机制
- 面试追问方向

### 不应合并

例如：

```text
Flink 为什么产生反压？
```

与：

```text
Flink 反压时如何做生产故障恢复？
```

高度相关，但第二题明显要求 incident response，应该可以保留为独立 canonical question，并建立 `related_questions`。

---

## 6. Frequency Model
高频判定

V1 不使用“看到很多网页所以高频”的方式。

记录以下原始指标：

```yaml
evidence_count:
independent_evidence_count:
company_count:
recent_12m_count:
recent_24m_count:
first_seen_at:
last_seen_at:
```

### Evidence Weight

初始权重：

```text
A = 1.00
B = 0.75
C = 0.35
D = 0
```

### Recency Weight

```text
<= 12 months  = 1.00
13–24 months  = 0.85
25–48 months  = 0.65
> 48 months   = 0.45
unknown date  = 0.50
```

一个 independence group 只取其中权重最高的一条。

```text
frequency_score
=
Σ(source_reliability_weight × recency_weight)
```

### 初始频率等级

在真实 corpus 足够大之前，不硬编码“high = 5 次”这种伪精确阈值。

先使用：

```text
unrated
emerging
repeated
high_frequency
```

并同时展示：

- 独立证据数量
- 覆盖公司数量
- 最近一次出现日期

当 corpus 达到可用规模后，再根据分位数校准等级：

```text
Top 15%          → high_frequency
15%–40%          → repeated
40%–70%          → emerging
其余              → long_tail
```

这样“高频”来自数据分布，而不是预先拍脑袋。

---

## 7. Company / Role Frequency
频率必须有上下文

一道题可以：

```yaml
global_frequency: repeated

frequency_by_role:
  data_engineer: high_frequency
  data_architect: repeated

frequency_by_company:
  company-a: repeated
  company-b: emerging
```

不能把“某家公司重复出现”直接等价成“整个行业高频”。

前端 V1 可以优先展示：

```text
真实出现 8 次
来自 5 个独立来源
覆盖 3 家公司
最近出现 2026-08
```

比单纯显示“高频 ⭐⭐⭐⭐⭐”更可信。

---

## 8. Evidence Record Schema

Evidence 文件建议存放：

```text
content/interview-evidence/
```

示例结构：

```yaml
---
id: ev-2026-example-001
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

没有真实来源时，不创建伪 Evidence 文件。

---

## 9. Canonical Interview Question Schema

正式问题不再绑定单一 `source_url`：

```yaml
---
id: iq-flink-backpressure-diagnosis-001
type: interview

question: "Flink Backpressure 如何定位和排查？"

difficulty: senior

knowledge:
  - kb-flink-backpressure

scenarios:
  - sc-flink-backpressure-prod-001

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

status: draft
---
```

只有：

```text
存在真实 Evidence
+
通过来源审核
+
完成去重
```

以后才能：

```yaml
verification:
  publishable: true
```

---

## 10. Question Answer Policy

V1 用户看到的是预写、策划过的答案，不在运行时让 AI 临场生成完整答案。

题解结构：

```text
这道题在考什么
↓
30 秒回答
↓
完整题解
↓
生产实现
↓
排查 / 性能 / 故障（适用时）
↓
常见错误回答
↓
项目怎么结合（只有真实可结合时）
↓
Scale Lab
↓
真实关联追问
```

### Project Truthfulness Rule

允许：

> “我项目实际遇到的是 X；如果扩大到 Y 规模，我会从 A/B/C 演进。”

不允许：

> 把 Scale Lab 的百亿数据、超高并发、复杂故障直接写成项目真实经历。

---

## 11. Publishing Gate
发布门槛

一道正式 Interview Question 进入用户题库至少需要：

```text
1 条及以上可追溯的 A/B/C Evidence
        +
Normalized Question
        +
Dedup Review
        +
Knowledge Mapping
        +
Curated Answer
```

标记为 `high_frequency` 还必须有：

```text
多个 independence groups
+
frequency model 计算
+
corpus distribution calibration
```

---

## 12. Corpus Workflow

后续采集时：

```text
01 Search
寻找近期 + 历史真实面经
        ↓
02 Capture
保存来源与元数据
        ↓
03 Extract
只抽取实际面试问题
        ↓
04 Normalize
统一题目表达
        ↓
05 Cluster
去重 / 同题聚类
        ↓
06 Verify
判断来源等级与独立性
        ↓
07 Map
映射 Knowledge / Scale Lab
        ↓
08 Rank
按真实 evidence 计算频率
        ↓
09 Curate
写标准答案
        ↓
10 Publish
进入 Interview Bank
```

---

## 13. V0.3 Definition of Done

V0.3 模型完成条件：

- [x] Source Reliability 定义
- [x] Evidence Independence 定义
- [x] Question Normalization / Dedup 定义
- [x] Frequency 数据模型定义
- [x] Canonical Question 与 Evidence 解耦
- [x] Publishing Gate 定义
- [x] 模板升级
- [ ] 收集第一批真实来源
- [ ] 用真实 corpus 校准 frequency bands
