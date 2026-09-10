# DataRoadmap Design System

> Version: **1.1 / Mobile Validation Revision at V0.6.0.5**
>
> Product character: **Technical Editorial Learning System（技术编辑型学习系统）**

V1.1 是 V1 的移动端验证修订，不改变顶级信息架构、颜色体系或产品性格。

```text
Content is the interface.
Evidence is the trust layer.
```

## 1. Product Character

DataRoadmap 应该像：

```text
结构清楚的技术编辑内容
+
开发者文档级阅读体验
+
面试前可快速切换的复习工具
```

关键词：

```text
Editorial
Technical
Calm
Precise
Readable
Evidence-led
Mobile-first
```

禁止：

```text
Card Wall
Gradient Decoration
Glassmorphism
Neon AI
Heavy Shadow
Gamification Dashboard
```

## 2. Color

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
- Primary Action；
- Current Learning State；
- Diagram Active Path。

不使用透明模糊背景制造 Glass Surface。TopBar / BottomNavigation 使用不透明 Canvas + Hairline。

## 3. Typography

移动端：

```text
Display       34 / 1.12 / 650
H1            28 / 1.20 / 650
H2            22 / 1.32 / 650
H3            18 / 1.40 / 620
Body          16 / 1.72 / 400
Small         14 / 1.55 / 400
Meta          12 / 1.45 / 500
Mono          13 / 1.60 / 400
```

中文正文默认 >=16px；导航与 Metadata 可使用 Meta Scale。

## 4. Spacing / Radius / Border

```text
Spacing:
4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64

Radius:
4 / 6 / 10 / 14 / full

Default Border:
1px Hairline

Default Shadow:
none
```

Row / Section / Divider 优先于 Card。

## 5. Information Architecture

```text
Learn
Interview
Scale Lab
Projects
```

Mobile 使用 Bottom Navigation；Desktop 使用 Left Sidebar。

## 6. Continue Learning

首页唯一允许使用较明显 Signal Soft Surface 的区域之一，因为它表达“当前学习状态”。

结构：

```text
继续学习                  第 N / M 节
Stage · Topic
Current Knowledge
Summary
Progress Position
```

规则：

- 整块可点击；
- 不放孤立的蓝色“继续” CTA；
- Signal Soft + 纯 Signal 系 Hairline；
- 无 Shadow；
- N / M 从当前 Stage 内容集合动态计算；
- Progress 表示最近学习位置，不冒充完成率。

## 7. StageRow

结构：

```text
Stage Number
Title
Short Summary
```

整行可点击。

V1.1 经移动端验证后移除 Chevron：整行布局与 Pressed State 已足以表达列表交互，避免右侧图标造成对齐噪音。

## 8. QuestionRow

结构：

```text
Current Rank
Frequency Band
Evidence Count · Company Count
Question
Answer Status
```

Question 是视觉主角。

Rank、Evidence Count、Company Count 必须来自当前 Content Registry / Frequency Registry，不允许写死到 React 文案。

## 9. Interview Discovery

Search 与 Quick Technology Chip 分工：

```text
Search
= 问题 / 场景 / 故障 / 关键词

Technology Chip
= Spark / Flink / Kafka / SQL / ...
```

技术 Chip 独占横向滚动行，不与 Advanced Filter 挤在同一裁剪容器里。

Advanced Filter 属于题目列表操作，应放在 List Heading 附近，并使用：

```text
Filter Icon + 筛选 + Active Count
```

完整筛选使用 BottomSheet。

Selected Technology Chip：

```text
Ink background
White text
```

不使用 Signal Blue Fill。

## 10. Evidence Summary

题目标题附近必须显示：

```text
Frequency Band
N 份面经 · M 家公司
面经依据 ›
```

只有“面经依据”是展开操作。数字和 Frequency Band 本身不是独立点击入口。

## 11. Evidence Disclosure

移动端使用 BottomSheet。

前台字段：

```text
Evidence Overview
Company
Role
Round
Publisher
Date
```

分组方式：

```text
Overview
↓
按公司
↓
Company Group
↓
Interview Records
```

禁止把以下后台审计字段直接显示给普通用户：

```text
source_url
reliability_grade
mapping_type
independence_group
review_status
```

Source URL 继续保留在后台 Evidence YAML 中供核验，但不作为前台外跳入口。

## 12. Dynamic Numbers

所有会随着内容增长或用户状态变化的数字都必须由数据计算。

必须动态：

```text
Stage Count
Knowledge Count
Current Learning Position N / M
Interview Total Count
Filtered Interview Count
Question Rank
Evidence Count
Company Count
Company Group Count
Answer-ready Count（如未来展示）
Scale Scenario Count（如未来展示）
```

允许固定的数字：

```text
30 秒回答 / 30 秒理解
L1–L5 Learning Depth
Scale Lab 中定义好的 10B / 100 Writers 等场景约束
Design Token 尺寸
```

历史校准文件中的数字可以冻结，但 React 前台不得复制一份硬编码。

## 13. Quick Answer

```text
background Signal Soft
border     Signal Hairline
radius     10px
padding    18–20px
```

它是阅读强调容器，不是 CTA。

## 14. Reading Segment

```text
Interview | Learn
```

只控制同一内容源的展示模式。

## 15. Code Block

- 短代码直接展开；
- 长代码默认折叠；
- 横向滚动；
- Copy >=44px Touch Target；
- 不强制折行；
- Inline Code 与 Fenced CodeBlock 样式严格分离。

## 16. Scale Lab

详情按：

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

Scale 首页展示具体 Scenario，不展示内容模板。

## 17. Project Truthfulness

Project Case 固定区分：

```text
Actual
Boundary
Knowledge Mapping
Interview Mapping
Scale Extension
```

未核验事实不得进入 Actual。

## 18. BottomSheet

```text
mobile max-height 82vh
top radius        14px
background        Raised
overlay           rgba(17,17,17,.26)
```

必须支持：

- tap outside close；
- close button；
- Escape；
- focus trap；
- restore focus。

## 19. Interaction

```text
pressed feedback immediate
micro transition 140ms
panel transition 180ms
```

支持 `prefers-reduced-motion`。

## 20. Accessibility

```text
Touch Target           >=44×44
Body                   >=16px
WCAG                    AA
Keyboard Focus          visible
Color-only semantics   forbidden
Bottom Nav safe area   required
Code horizontal scroll required
```

## 21. Responsive

Mobile 0–767：

```text
20px page padding
single column
bottom navigation
bottom sheet
vertical technical diagrams
progressive disclosure
```

Desktop 1100+：

```text
Sidebar      240–272
Reading      680–760
Local TOC    200–240
```

## 22. Change Policy

需要继续版本化 Design System：

- Top-level Navigation；
- Color architecture；
- Typography scale；
- Core component anatomy；
- Evidence visibility policy；
- Project / Scale truthfulness boundary。

普通 spacing、图标 glyph、边框轻微调整、文案微调不要求升级主版本。
