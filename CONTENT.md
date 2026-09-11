# CONTENT.md

# DataRoadmap 内容选型与学习深度规范

> Version: **1.2 / Content Clarity First at V0.6.0.10**

## 1. 内容总原则

> **内容正确性优先，知识结构优先；主栈深学，同类横向对比；生产实现优先，项目案例只写真实事实；完整规模训练进入 Scale Lab；面试题由真实面经校准。**

DataRoadmap 不建设“大数据百科全书”。


## 2. Content Clarity First（内容讲清楚优先）

Knowledge 的首要目标不是“内容多”或“图多”，而是让学习者形成稳定、连续、可复述的知识模型。

优先级：

```text
Correctness
→ Knowledge Structure
→ Causal / Dependency Order
→ Completeness
→ Presentation
→ Decoration
```

其中 Presentation 包括 Diagram、Card、动效等；它们不能反过来驱动知识结构。

### 一个概念，一个主讲位置

每个核心概念必须有唯一的 Primary Teaching Location（主讲位置）。

其他章节再次出现时，只允许：

- 必要回顾；
- 当前链路中的角色说明；
- 明确的下一层深化；
- 指向主讲位置的关联。

禁止在多个章节重复从头讲同一套定义和机制。

### 层层递进

一个章节的新内容必须能回答：

> 为什么现在学这个？

推荐顺序：

```text
是什么 / 为什么需要
→ 它和上一层什么关系
→ 核心机制
→ 生产问题
→ 大规模放大后发生什么
→ 治理 / 维护 / 排障
```

前置概念没有建立时，不提前塞入后续复杂机制。

### 第一次讲清 vs 后续深化

例如 Manifest：

```text
结构章节
→ Manifest List / Manifest / Data File 的关系与职责

写入章节
→ 新 Commit 如何产生 / 复用 Manifest

规模章节
→ 为什么 Manifest 会越来越碎

维护章节
→ Merge / Rewrite 如何治理
```

这是递进，不是重复。

### 去碎片化审计

每次补充知识后，必须检查：

- 是否与其他章节重复；
- 是否应该移动到更合适的主讲位置；
- 是否缺少前置概念；
- 是否突然跳到后续机制；
- 是否同一个结论在多个地方反复出现；
- 是否存在“这里补一点、那里补一点”的碎片化结构。

如果新增内容破坏主线，优先重组原内容，而不是继续追加一段。

### 表达形式选择

默认优先级：

```text
普通文字 / 一句话关系链
→ 列表 / 表格
→ 轻量结构表达
→ Technical Diagram
```

只有当**非线性关系、并发分支、状态转换、多路径故障**无法用文字更清楚地表达时，才使用 Diagram。

Diagram 是辅助工具，不是默认内容形态。


## 4. Learning Depth（学习深度）

### L1 — Awareness｜了解
知道是什么、定位和基本用途。

### L2 — Comparison｜对比与选型
掌握核心思想、优缺点、同类差异、适用场景和选型依据。

### L3 — Working Knowledge｜工作掌握
能够正确使用、解释主要机制、理解常用配置并处理典型问题。

### L4 — Deep Production｜深入生产
进一步掌握内部机制、性能、故障、并发、一致性、可观测与运维。

### L5 — Core Stack｜深度掌握

除 L1–L4 外，还需要：

- 生产架构；
- Production Code / Configuration；
- 有价值的源码关键路径；
- 项目真实映射；
- 规模追问与 Scale Lab 映射；
- 真实面试题与追问；
- 关键同类技术选型。

L1–L5 表示 **Learning Depth（学习深度）**，不是“题目难度 1–5”。

## 4. Stack Role

内部允许：

- `core`
- `comparison`
- `foundation`
- `production`

这些属于内容模型，不直接原样显示在前台。

## 5. Production First

主栈知识优先回答：

1. 解决什么生产问题；
2. 架构位置；
3. 内部机制；
4. 生产代码 / 配置；
5. 规模、并发和故障放大后发生什么；
6. 如何观测、恢复和控制成本；
7. 项目是否有真实锚点；
8. 真实面试是否存在证据。

## 6. Project Case

固定区分：

```text
Actual
Boundary
Knowledge Mapping
Interview Mapping
Scale Extension
```

不得把 Production Pattern 或 Scale Lab 写成真实个人经历。

## 7. 顶级 Scale Lab

顶级导航 `Scale` 对应独立 **Production Scenario（生产场景）**。

它不围绕某一道面试题，而是完整训练：

```text
Scenario
Scale Parameters
Constraints
Failure / Bottleneck
Design
Trade-offs
Observability
Cost
Recovery
```

例如：

```text
100 亿行 Backfill
100 个 Writer 并发提交
10 秒级写入造成小文件爆炸
```

这些 Scenario 必须保持 `hypothetical: true`，除非明确引用已核验真实项目事实。

## 8. Interview 内的“规模追问”

Interview Answer 中禁止再把局部规模扩展标题显示为 `Scale Lab`。

统一语义：

```text
规模追问
```

它回答：

> 如果当前这道题的数据量、并发、SLO 或故障约束继续放大，答案要怎么变化？

它是当前题的一段追问，不是独立 Scale Lab。

如果内容值得完整展开，应建立独立 `sc-*` Scenario，并通过站内 Mapping 关联。

## 9. Interview Bank

Interview Bank 与 Knowledge Base 解耦。

题目进入题库必须尽量保存：

- company
- role
- round
- source_type
- source_url
- source_date
- verified
- frequency
- knowledge mappings
- scenario mappings

不得为了 Knowledge 完整性自动生成“高频面试题”。

## 10. 关联追问与答案

主问题的追问不能永久只放一个题目列表。

前台统一显示：

```text
关联追问
```

每条追问有三种状态：

### A. Evidence-backed Canonical Question

如果追问本身有真实、独立 Interview Evidence：

```text
追问
→ canonical_question_id
→ 独立 Interview Detail
→ 自己的 Evidence + Curated Answer
```

### B. Curated Extension

没有独立频次证据，但属于高价值自然追问：

```text
追问
→ 站内展开
→ 精简 Curated Answer
```

不得把它标成“真实高频追问”。

### C. Pending

如果答案还没整理：

```text
答案整理中
```

但重点题应逐步减少 Pending。

V1 不使用 Runtime AI 临时生成追问答案。

## 11. Answer Structure V1.1

主问题推荐：

```text
这道题在考什么
30 秒回答
核心 / 完整原理
Production 实现
故障排查
代码 / 配置（需要时）
常见错误回答
项目怎么结合（有真实锚点时）
规模追问
关联追问
```

Interview / Learn 两种阅读模式读取同一份内容源。

## 12. Frontstage / Backstage Boundary

前台不直接显示：

- `publishable`
- `content_status`
- `needs_fact_check`
- `reliability_grade`
- `mapping_type`
- Source URL
- 内容版本与流水状态

Evidence 原始 URL 留在后台用于核验，不要求用户离开 DataRoadmap。
