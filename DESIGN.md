# DataRoadmap Design System

> Version: **1.7 / Three-Tab Reading Foundation**
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

DataRoadmap 不是作者项目展示站，也不是 Dashboard 产品。

公共产品只保留：

```text
Learn
Interview
Scale
```

---

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
- Current Reading / Learning State。

---

## 3. Typography

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

原则：

- 正文最低 16px；
- 不通过缩小文字解决移动端密度；
- 用层级、留白、目录和折叠解决长内容问题。

---

## 4. Base Layout

- Mobile page padding = 20px；
- Touch Target >= 44×44；
- Row / Section / Divider 优先于 Card；
- Default Border = 1px Hairline；
- Default Shadow = none；
- iOS Safe Area 必须支持；
- Reduced Motion 必须支持。

---

## 5. Three-Tab Navigation

公共一级导航：

```text
Learn
Interview
Scale
```

### Bottom Navigation

Bottom Navigation 是独立的 App Navigation Surface（应用导航层）。

必须：

- 使用 `Surface Raised`；
- 顶部使用 `Hairline Strong`；
- 正文与底栏之间保留额外 breathing space；
- Active 只使用 Signal Blue；
- 允许 2px 安静 Active Indicator；
- 不使用大 Pill；
- 不使用大 Shadow；
- Safe Area 在导航层内部计算。

禁止让 Bottom Navigation 看起来像正文最后一行。

---

## 6. Top Bar

### List / Home

TopBar 只承担：

- Brand / Tab Context；
- 必要的全局操作。

### Reading Detail

Detail TopBar：

```text
Back
Context
Directory
```

目录入口必须在长文中固定可达。

目录按钮使用：

```text
list icon + 目录
```

不使用浮动大按钮，不覆盖正文。

---

## 7. Reading Directory

长文章不再使用横向 Quick Navigation 作为主要目录。

原因：

- 长标题难扫描；
- 横向内容不可完整预见；
- 无法表达章节层级；
- 用户缺少整篇位置感。

统一使用：

```text
Directory Trigger
↓
Bottom Sheet
├─ Reading Progress
├─ Current Section
└─ Full Section Tree
   ├─ H2
   └─ H3
```

### Current Section

当前章节：

- `Signal Soft` 背景；
- `Signal Strong` 文字；
- 不使用 Shadow；
- 不使用大 Card。

### Progress

Reading Progress 是位置感，不是 Completion Badge。

当前 V1.7 使用章节位置估算进度。

---

## 8. Reading Page Hierarchy

统一阅读结构：

```text
TopBar
↓
Article Header
  Title
  Summary
  Secondary Metadata
↓
Quick Understanding / Main Line
↓
Body
↓
Primary Continuation
↓
Cross-Tab Extensions
```

### Learn Detail

必须：

```text
正文
→ 上一节 / 下一节
→ 相关 Scale
→ 真实 Interview
```

同 Tab 学习连续性优先于跨 Tab 延伸。

### Scale Detail

保持：

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

目录解决移动端跳转，不删生产深度。

---

## 9. Secondary Metadata Grammar

描述性 Metadata 统一：

```text
A · B · C
```

适用：

- `Iceberg · L5 · 深度掌握`
- `数据规模 · 资源隔离 · 查询 SLO · 成本`
- Company / Role / Round

规则：

- 非交互 Metadata 不做 Chip；
- Chip 只用于 Filter / Choice / State；
- 相同语义使用相同语法。

---

## 10. Learn

Learn 回答：

> 我应该理解什么？

Learn 是连续学习路径，不是知识卡片墙。

首页重点：

- 当前学习位置；
- 学习路线；
- Stage 顺序。

Detail 重点：

- 30 秒理解；
- 知识递进；
- 上一节 / 下一节；
- 再进入 Scale / Interview。

---

## 11. Interview

Interview 回答：

> 企业会怎么问？我应该怎么回答？

Discovery：

```text
Search
Technology Filter
Advanced Filter
Question List
```

Evidence：

```text
Frequency Band
N 份面经 · M 家公司
面经依据
```

频率只能来自 Evidence。

Reading Segment 前台名称：

```text
面试回答 | 深入理解
```

不得再使用 `Interview | Learn` 造成顶级 Tab 混淆。

---

## 12. Scale

Scale 回答：

> 规模、并发、可靠性、成本约束扩大后怎么设计？

Scale Scenario 默认明确：

```yaml
hypothetical: true
```

它是生产训练，不是项目经历。

Scale Detail 可以很长，但必须通过 Directory 提供结构感。

---

## 13. Cross-Tab Extensions

Cross-link 是 Secondary Extension（次级延伸）。

视觉优先级：

```text
Primary Content
> Same-Tab Continuation
> Cross-Tab Extension
```

Cross-link 表示：

```text
useful together
```

不表示：

```text
high interview frequency
real project fact
```

---

## 14. Quick Answer / Main Line

Quick Answer 使用：

- Signal Soft；
- Signal Hairline；
- 无 Shadow。

它是阅读强调，不是 CTA。

---

## 15. Bottom Sheet

统一 BottomSheet 支持：

- `aria-modal`；
- Focus Trap；
- Escape Close；
- Restore Focus；
- Mobile max-height 82vh；
- 顶部圆角约 14px。

适用：

- Evidence；
- Filters；
- Reading Directory。

---

## 16. Code Block

只有真实代码、SQL、配置、命令使用 CodeBlock。

不得使用黑色代码块表达：

- 架构职责；
- 规模参数；
- KPI；
- P0/P1/P2；
- 普通流程文本。

---

## 17. Technical Diagram

Diagram 是 Secondary Learning Aid。

先问：

> 不画图，能否用一句短关系链更快讲完整？

简单线性关系优先文本：

```text
Snapshot
→ Manifest List
→ N Manifest
→ M Data Files
```

只有以下关系明显难以用文字追踪时使用图：

```text
Non-linear Branch
Concurrent Flow
State Transition
Retry / Rollback
Many-to-Many Dependency
Complex Read / Write Path
```

规则：

- Mobile-first 390px；
- 真实 DOM Text；
- No heavy shadow；
- 不依赖颜色表达关系；
- 一张图太高时拆图，不缩小文字。

---

## 18. Motion

动效只表达状态，不做装饰。

允许：

```text
Continue Learning
→ low-frequency signal border motion
```

限制：

- 单色 Signal；
- no outer glow；
- no shadow；
- no neon；
- Reduced Motion 关闭。

---

## 19. Accessibility

- Touch Target >= 44px；
- Focus Visible；
- Reduced Motion；
- BottomSheet Focus Trap；
- Reading Directory 使用 `aria-current`；
- Progress 使用 `role=progressbar`；
- 不能只靠颜色表达状态。

---

## 20. V1.7 Freeze Rules

V1.7 冻结：

```text
Three-Tab Navigation
Reading Directory
Bottom Navigation Separation
Secondary Metadata Grammar
Detail Reading Hierarchy
Same-Tab-before-Cross-Tab Priority
```

后续 UI Review 可以调整具体 spacing，但不能重新引入：

- Projects 前台 Tab；
- 横向 Quick Navigation 作为长文主目录；
- 描述性 Metadata Chip 化；
- Heavy Shadow；
- Card Wall。
