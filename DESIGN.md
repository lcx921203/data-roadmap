# DESIGN.md

# DataRoadmap Design System

> Version: **1.0 / Frozen at V0.4.2**
>
> Product character: **Technical Editorial Learning System（技术编辑型学习系统）**

DataRoadmap 的设计系统从 V0.4.2 起进入 V1 Frozen（V1 冻结）状态。

后续进入 React / TypeScript 实现时，默认不得改变以下基础原则：

```text
Content is the interface.
Evidence is the trust layer.
```

---

## 1. Product Character

DataRoadmap 不是课程商城、刷题排行榜、企业后台，也不是一面墙的彩色卡片。

它应该像：

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

---

## 2. Visual Rules

### Canvas

```text
Canvas          #FCFCFA
Surface         #F6F6F3
Surface Raised  #FFFFFF
Ink             #171717
```

### Accent

唯一主 Accent：

```text
Signal Blue     #315DDC
Signal Strong   #2346B5
Signal Soft     #EEF2FF
```

只用于：

- Active；
- Link；
- Focus；
- Primary Action；
- Diagram Active Path。

禁止将 Accent 作为装饰背景大面积铺色。

### Semantic

```text
Success   #19714A
Warning   #A15C00
Danger    #B42318
```

只表达真实状态。

---

## 3. Typography

### Sans

```text
system-ui
-apple-system
BlinkMacSystemFont
"Segoe UI"
"PingFang SC"
"Hiragino Sans GB"
"Microsoft YaHei"
sans-serif
```

### Mono

```text
ui-monospace
"SFMono-Regular"
"SF Mono"
Menlo
Consolas
monospace
```

### Mobile scale

```text
Display       34 / 1.12 / 650
H1            28 / 1.20 / 650
H2            22 / 1.32 / 650
H3            18 / 1.40 / 620
Body          16 / 1.72 / 400
Body Strong   16 / 1.65 / 600
Small         14 / 1.55 / 400
Meta          12 / 1.45 / 500
Mono          13 / 1.60 / 400
```

中文正文默认 16px。

---

## 4. Spacing

基础单位 4px：

```text
4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64
```

默认：

```text
Mobile Page Padding   20px
Section Gap           40–48px
Subsection Gap        24–32px
Paragraph Gap         16px
```

---

## 5. Radius / Border / Shadow

```text
Radius:
4 / 6 / 10 / 14 / full

Border:
1px #E4E4DE

Shadow:
default = none
overlay = 0 8px 30px rgba(20,20,18,.08)
```

Row 优先，Card 次之。

---

## 6. Top-level Information Architecture

```text
Learn
Interview
Scale Lab
Projects
```

Search 是 Global Action（全局操作），不是第五个 Tab。

Mobile：Bottom Navigation。

Desktop：Left Sidebar。

---

## 7. Frozen Component Inventory

V1 核心组件：

```text
AppShell
TopBar
BottomNavigation
StageRow
QuestionRow
MetadataLine
Badge
FilterChip
QuickAnswer
ReadingSegment
QuickNavigation
EvidenceSummary
EvidenceDisclosure
CodeBlock
DiagramNode
DiagramEdge
ScaleKPI
ConstraintCallout
ProjectFactState
ScaleExtensionState
BottomSheet
```

组件状态、交互和可访问性规则见：

```text
content/design/components-v1.yaml
docs/COMPONENT_FREEZE_V0.4.2.md
docs/INTERACTION_STATES_V0.4.2.md
docs/ACCESSIBILITY_V0.4.2.md
```

---

## 8. Navigation

### Bottom Navigation

固定四项：

```text
Learn | Interview | Scale | Projects
```

规则：

- 高度 72–80px + safe area；
- 每项触控区域 >= 44×44；
- Active 仅改变 Icon / Label 为 Signal Blue；
- 不使用大胶囊背景；
- Detail Page 仍保留 Bottom Navigation，除非进入沉浸式临时 Overlay。

### Top Bar

List Page：

```text
Title / Brand
Global Search
```

Detail Page：

```text
Back
Context Title
Overflow / Search
```

---

## 9. List Rows

### StageRow

```text
Stage Number
Title
Short Summary
Depth / Core tags
Chevron
```

整行可点击。

状态：

```text
default
pressed
focus-visible
disabled
```

Pressed：

```text
background = Surface
```

不靠阴影。

### QuestionRow

```text
Rank + Frequency Band
Evidence Count
Question
Domain · Level · Curated Status
```

Question 必须是视觉主角。

Evidence 必须可见。

---

## 10. Quick Answer

QuickAnswer 是 Interview Detail 最重要的强调容器。

```text
background    Signal Soft
border        Signal Hairline
radius        10px
padding       18–20px
```

它不是 CTA。

禁止：

- Gradient；
- 大 Icon；
- 厚 Shadow；
- 动画高亮。

---

## 11. Reading Segment

```text
Interview | Learn
```

这是 Presentation Mode（展示模式），不是两个内容源。

状态：

```text
default
selected
focus-visible
```

Selected：

```text
white surface
Ink text
```

不得用强蓝底填满整个 Segment。

---

## 12. Evidence

### EvidenceSummary

默认一行：

```text
11 direct · 5 companies
```

可附 Frequency Band。

必须提供展开入口。

### EvidenceDisclosure

移动端使用 BottomSheet。

BottomSheet 显示：

```text
Source
Company
Role
Round
Date
Mapping Type
```

Direct Evidence 与 Topic-only Candidate 必须视觉区分。

Evidence 关闭时不丢失当前滚动位置。

---

## 13. Filters

Question List Filter：

```text
Domain
Level
Frequency
Company
Curated
```

列表顶部只保留少量高频 Chip。

完整筛选器使用 BottomSheet。

Filter 状态：

```text
default
selected
disabled
focus-visible
```

Selected Chip：

```text
Ink background
White text
```

而不是 Signal Blue，以避免 Accent 过载。

---

## 14. Code Block

状态：

```text
collapsed
expanded
copied
focus-visible
```

移动端默认规则：

- 短代码直接展开；
- 长代码默认 Collapse；
- 横向滚动；
- Header 显示 language / filename；
- Copy 为 44px Touch Target；
- 不自动折行破坏代码结构。

---

## 15. Technical Diagram

### Node

```text
default
active
warning
failure
```

Default：

```text
Raised Surface
Hairline
8–10px Radius
```

Active：

```text
Signal Soft
Signal Border
```

Failure：

```text
Danger Soft
Danger Border
```

### Edge

```text
default    neutral solid
active     signal solid
retry      warning dashed
rollback   danger dashed
```

Mobile 优先纵向重排。

---

## 16. Scale Lab

Scale 页面按：

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

ScaleKPI 只是参数展示，不游戏化。

禁止：

- 星级；
- XP；
- 金币；
- 排行榜。

---

## 17. Project Fact Boundary

Project Case 固定区分：

```text
Actual
Boundary
Knowledge Mapping
Interview Mapping
Scale Extension
```

### ProjectFactState

`verified_project_fact`：

```text
Success semantic
但不使用大面积绿色卡片
```

### ScaleExtensionState

必须出现：

```text
HYPOTHETICAL SCALE LAB
```

它使用 Neutral / Signal Soft 容器，不得与 Actual 使用同一状态样式。

---

## 18. Bottom Sheet

BottomSheet 用于：

- Evidence；
- Filters；
- 长列表辅助选择。

规则：

```text
mobile max-height: 82vh
radius top: 14px
drag handle: optional
background: Raised
overlay: rgba(17,17,17,.26)
```

必须支持：

- tap outside close；
- close button；
- Escape on keyboard；
- focus trap；
- restore focus。

---

## 19. Interaction Timing

```text
pressed feedback      immediate
micro transition      140ms
panel transition      180ms
```

只允许：

- opacity；
- background；
- transform <= 4px；
- sheet slide。

禁止：

- bounce；
- parallax；
- decorative floating；
- long entrance animation。

支持：

```css
@media (prefers-reduced-motion: reduce)
```

---

## 20. Accessibility

最低要求：

```text
Tap Target             >= 44×44
Body                   >= 16px
WCAG                    AA
Keyboard Focus          visible
Color-only semantics    forbidden
Bottom Nav safe area    required
Code horizontal scroll  required
Diagram text fallback   required
```

Modal / BottomSheet：

```text
aria-modal
focus trap
restore focus
Escape close
```

Segment / Tabs 必须使用正确语义。

---

## 21. Responsive

### Mobile 0–767

```text
20px page padding
single column
bottom navigation
bottom sheet
vertical diagram
progressive disclosure
```

### Tablet 768–1099

```text
24px padding
reading column
optional local navigation
```

### Desktop 1100+

```text
Sidebar      240–272
Reading      680–760
Local TOC    200–240
```

---

## 22. Design Change Policy

V1 Frozen 后，以下修改需要更新 `DESIGN.md` 版本：

- Top-level Navigation；
- Color system；
- Typography scale；
- Core component behavior；
- Project / Scale truthfulness boundary；
- Evidence visibility policy。

以下可在实现中微调而不升级 Design System 主版本：

- 2–4px Padding；
- Border 色轻微调整；
- Icon glyph；
- 单组件文案；
- non-core spacing。

---

# Design Statement

DataRoadmap 的高级感来自：

```text
Information Architecture
+
Typography
+
Reading Rhythm
+
Evidence
+
Production-grade Technical Content
```

不是来自：

```text
Gradient
Glass
Shadow
Illustration
Animation
```
