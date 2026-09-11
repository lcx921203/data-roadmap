# DataRoadmap Design System

> Version: **1.9 / Iceberg V1 UI Freeze**
>
> Product character: **Technical Editorial Learning System（技术编辑型学习系统）**

```text
Content is the interface.
Evidence is the trust layer.
Navigation should support reading, not compete with it.
```

## 1. Product Character

关键词：

```text
Editorial
Technical
Calm
Precise
Readable
Evidence-led
Mobile-first
One-hand friendly
```

禁止：

```text
Card Wall
Gradient Decoration
Glassmorphism
Neon AI
Heavy Shadow
Gamification Dashboard
Decorative Motion
```

公共产品只保留：

```text
Learn
Interview
Scale
```

---

## 2. Core Reading Principle

DataRoadmap 的连贯性首先来自**内容本身**：

```text
Prerequisite
→ Mechanism
→ Cause
→ Consequence
→ Design
→ Trade-off
→ Recovery
```

UI 不负责“制造”知识顺序。

UI 只在用户真正容易丢失上下文时提供定位能力。

必须同时保护：

```text
Continuity      连贯性
Causal Model    因果模型
Fast Positioning 快速定位
Structure       结构性
Truthfulness    准确性
```

原则：

> 不要让用户依赖短期记忆来使用产品；也不要为了表达连贯性而过度增加视觉结构。

---

## 3. Color

```text
Canvas          #FCFCFA
Surface         #F6F6F3
Surface Raised  #FFFFFF
Surface Strong  #EEEDE8

Ink             #171717
Ink Soft        #5F5F5B
Ink Muted       #8A8A84

Hairline        #E4E4DE
Hairline Strong #D2D2CB

Signal Blue     #315DDC
Signal Strong   #2346B5
Signal Soft     #EEF2FF
```

Signal 只用于：

- Active；
- Link；
- Focus；
- Current Reading / Learning State；
- Primary Action。

---

## 4. Typography

```text
Display  34 / 1.12 / 650
H1       28 / 1.20 / 650
H2       22 / 1.32 / 650
H3       18 / 1.40 / 620
Body     16 / 1.72 / 400
Small    14 / 1.55 / 400
Meta     12 / 1.45 / 500
Mono     13 / 1.60 / 400
```

正文最低 16px。

不通过缩小正文解决移动端密度问题。

---

## 5. Base Layout

- Mobile baseline = 390px；
- Mobile page padding = 20px；
- Touch Target >= 44×44；
- Row / Section / Divider 优先于 Card；
- Default Shadow = none；
- iOS Safe Area 必须支持；
- Reduced Motion 必须支持。

---

## 6. Three-Tab Navigation

一级导航统一为：

```text
Learn
Interview
Scale
```

Mobile Bottom Navigation：

- `Surface Raised`；
- 顶部 `Hairline Strong`；
- 三等分；
- Safe Area 在导航内部；
- Active 使用 Signal；
- 不使用大 Pill；
- 不使用重阴影。

Desktop Navigation 使用与 Mobile 相同的命名：

```text
Learn
Interview
Scale
```

---

## 7. Learn

Learn 回答：

> 我应该理解什么？

保留安静的：

```text
Learn Home
→ Stage List
→ Knowledge List
→ Knowledge Detail
```

连贯性由以下机制承担：

```text
Continue Learning
Stage order
Previous / Next
Reading Directory
```

Stage 页面不额外增加序号轨道、流程线或 Sticky Current State。

知识的真正前后关系由内容结构表达。

---

## 8. Interview

Interview 回答：

> 企业会怎么问？我应该怎么回答？

保留：

```text
Search
Technology Filter
Advanced Filter
Evidence-backed Question List
```

不为了“连贯性”增加额外 Sticky Result Header。

Frequency 必须来自 Interview Evidence。

Reading Segment：

```text
面试回答 | 深入理解
```

---

## 9. Scale

Scale 回答：

> 规模、并发、可靠性和成本约束扩大后，系统怎么设计？

Scale List 的结构冻结为：

```text
Domain
→ Training Theme
→ Scenario
```

当前：

```text
湖仓 / Lakehouse
├─ 容量与回填
│  └─ 100 亿行历史回填
├─ 持续写入与表健康
│  └─ 10 秒级提交后的文件膨胀
└─ 并发提交与恢复
   └─ 100 个 Writer 并发提交
```

规则：

- 只有一个 Domain 时，不显示领域筛选；
- 只有一个 Domain 时，不使用 Sticky Domain Header；
- 多个 Domain 真正出现后，才显示领域筛选；
- 多个 Domain 真正出现后，才启用 Sticky Domain Context；
- 不使用横向 Domain Tab；
- Scenario 默认 `hypothetical: true`。

Scale Navigation 的事实源：

```text
content/scale-navigation-v1.yaml
```

---

## 10. One-Hand Reading Directory

长文章使用左侧悬浮目录控件。

```text
Left-edge Floating Control
→ Right-side Reading Drawer
```

Floating Control：

- 默认位于左侧中下区域；
- 只允许上下拖动；
- 位置保存在 Local Storage；
- 点击打开 / 收起目录；
- 最小触摸区域 >= 44px；
- 不使用重阴影。

Reading Drawer：

- 从右侧滑入；
- 保留左侧 Scrim（遮罩区域）；
- 宽度约 86vw；
- 不显示左侧脏边；
- 不显示底部“收起目录”按钮。

关闭方式：

```text
点击左侧遮罩
向右滑动
再次点击左侧悬浮目录
Escape
```

目录层级通过：

```text
H2 Weight
H3 Indentation
Spacing
Current Section Soft Blue
```

表达。

目录项之间默认不加 Divider。

当前章节同时使用：

- `Signal Soft` 背景；
- `Signal Strong` 文字；
- “当前”文本。

---

## 11. Reading Page Hierarchy

```text
TopBar
↓
Article Header
↓
Quick Understanding / Main Line
↓
Body
  Contextual Relations where relevant
↓
Primary Continuation
```

Learn Detail：

```text
正文
→ 上一节 / 下一节
```

Scale Detail：

```text
Scenario
→ Parameters
→ Constraints
→ Failure / Bottleneck
→ Design
→ Trade-offs
→ Observability
→ Cost
→ Recovery
```

Interview Detail：

```text
Question
→ Evidence
→ Answer / Deep Understanding
```

---

## 12. Contextual Relations

跨 Tab 关联放在真正相关的 Section / Detail Item 附近。

形式：

```text
Scale · 100 个 Writer 并发提交 →
Interview · 高并发系统如何保证一致性与容错？ →
Learn · 乐观提交、冲突与恢复 →
```

规则：

- 使用紧凑文本 Link；
- 不做大 Card；
- 不在文章 Footer 堆大块 Cross-link List；
- 宁可没有，也不做牵强映射；
- Relation ≠ Interview Frequency；
- Relation ≠ Real Project Fact。

---

## 13. Secondary Metadata

描述性 Metadata 使用：

```text
A · B · C
```

例如：

```text
Iceberg · L5 · 深度掌握
并发 · Commit · 重试 · 可靠性
```

非交互 Metadata 不做 Chip。

---

## 14. Bottom Sheet vs Reading Drawer

BottomSheet 用于：

- Interview Evidence；
- Filters；
- 短时选择操作。

Reading Directory 专用 Right-side Drawer。

两者不混用。

---

## 15. Technical Diagram

Diagram 是 Secondary Learning Aid。

简单线性关系优先文字：

```text
Snapshot
→ Manifest List
→ N Manifest
→ M Data Files
```

只有以下关系明显难以用文字追踪时才使用图：

- Non-linear Branch；
- Concurrent Flow；
- State Transition；
- Retry / Rollback；
- Many-to-Many Dependency。

---

## 16. Accessibility

必须：

- Touch Target >= 44px；
- Focus Visible；
- Reduced Motion；
- Drawer Focus Trap；
- Restore Focus；
- `aria-current`；
- Progress `role=progressbar`；
- 不能只靠颜色表达状态；
- viewport 支持 `viewport-fit=cover`。

---

## 17. Truth Boundary

```text
Learn
= reusable knowledge

Scale
= hypothetical production-pressure training

Interview
= evidence-backed interview content
```

Project / Resume / Personal Case 仅属于 Backstage Editorial Context。

旧 `ProjectsPage` 源码即使暂时保留，也不得：

- 出现在 Route；
- 出现在 Mobile Navigation；
- 出现在 Desktop Navigation；
- 成为公共 Cross-Tab 目标。

---

## 18. V1.9 Frozen Rules

Iceberg V1 UI 冻结：

```text
Three-Tab Public Navigation
Calm Editorial Visual Language
Original Learn Home / Stage Presentation
Original Interview Discovery Presentation
Scale Domain → Theme → Scenario Hierarchy
Left-edge Reading Control
Right-side Reading Drawer
Directory Current Section Highlight
Directory without Row Dividers
Contextual Section Relations
Bottom Navigation Separation
Secondary Metadata Grammar
```

后续不得因为“看起来更完整”重新加入：

- Projects 前台 Tab；
- 横向 Quick Navigation 作为长文主目录；
- Top-right-only Directory；
- Stage 序号轨道；
- 单领域 Sticky Scale Header；
- Interview Sticky Result Header；
- Footer 大块 Cross-link；
- Heavy Shadow；
- Card Wall；
- 为了表达连贯性而重复制造视觉进度结构。

只有两类原因可以重新打开 Iceberg UI：

1. 明确的可用性问题；
2. 明确的视觉 / 交互 Bug。
