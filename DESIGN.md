# DataRoadmap Design System

> Version: **1.7.1 / One-Hand Reading Interaction**
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
- 正文与底栏之间保留 breathing space；
- Active 只使用 Signal Blue；
- 允许 2px 安静 Active Indicator；
- 不使用大 Pill；
- 不使用大 Shadow；
- Safe Area 在导航层内部计算。

---

## 6. Top Bar

### List / Home

TopBar 承担：

- Brand / Tab Context；
- 必要的全局操作。

### Reading Detail

Detail TopBar 只保留：

```text
Back
Context
```

目录不再依赖 TopBar 右上角入口。

原因：

- 右上角是单手操作最难触达区域之一；
- 长文目录属于阅读辅助工具，不应该挤占固定顶部导航；
- 目录必须在文章滚动过程中持续可达。

---

## 7. One-Hand Reading Directory

长文章使用：

```text
Right-edge Floating Control
↓
Right-side Reading Drawer
├─ Reading Progress
├─ Current Section
└─ Full Section Tree
   ├─ H2
   └─ H3
```

### Floating Control

规则：

- 默认吸附右侧中下区域；
- 只允许上下拖动，不在正文中自由漂移；
- 位置保存在本地；
- 点击打开 / 收起目录；
- 不使用 Heavy Shadow；
- 不遮挡标题与主操作；
- 最小触摸区域 >= 44px。

### Side Drawer

从右侧进入。

移动端宽度约：

```text
86vw
```

必须保留左侧一小段 Scrim（遮罩区），让用户能感知“这是侧层，不是新页面”。

关闭方式：

```text
点击左侧遮罩
向右滑动
再次点击悬浮目录
底部“收起目录”
Escape（键盘）
```

不把“关闭”只放在右上角。

### Directory Hierarchy

目录项之间默认**不加横线**。

层级通过：

```text
H2 weight
H3 indentation
spacing
active soft-blue background
```

表达。

当前章节：

- `Signal Soft` 背景；
- `Signal Strong` 文字；
- 保留“当前”文字提示；
- 不依赖颜色作为唯一状态。

### Progress

Reading Progress 是位置感，不是 Completion Badge。

当前使用章节位置估算进度。

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
  Contextual Relations where relevant
↓
Primary Continuation
```

### Learn Detail

优先：

```text
正文
→ 上一节 / 下一节
```

跨 Tab 关联不再统一堆在文章最下面。

如果某个 Scale / Interview 与具体小节直接相关，就放在该小节标题附近。

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

与 Learn / Interview 的关系放在对应 Detail Item 附近，而不是只在文章底部出现。

### Interview Detail

Interview 与 Learn / Scale 的关联放在题目 Header / Evidence 之后，用户不需要读到底部才发现延伸内容。

---

## 9. Contextual Relation Grammar

Cross-tab Relation（跨 Tab 关联）是一种 Navigation Action（导航动作），不是描述性 Metadata。

前台形式：

```text
Scale · 100 个 Writer 并发提交 →
Interview · 高并发系统如何保证一致性与容错？ →
Learn · 乐观提交、冲突与恢复 →
```

规则：

- 放在最相关的 H2 / H3 / Detail Item 附近；
- 使用紧凑文本 Link，不做大 Card；
- Type Label 可以使用 Signal；
- Target Title 使用 Soft Ink；
- 一次只展示明确关系；
- 宁可没有，也不为了“知识图谱完整”强行关联。

关系表示：

```text
useful together in this context
```

不表示：

```text
high interview frequency
real project fact
```

Section-level Relationship 的事实源：

```text
content/mappings/*-section-relations-*.yaml
```

UI 不硬编码题目或场景名称。

---

## 10. Secondary Metadata Grammar

描述性 Metadata 统一：

```text
A · B · C
```

例如：

```text
Iceberg · L5 · 深度掌握
数据规模 · 资源隔离 · 查询 SLO · 成本
```

非交互 Metadata 不做 Chip。

---

## 11. Learn

Learn 回答：

> 我应该理解什么？

Learn 是连续学习路径，不是知识卡片墙。

Detail 重点：

- 30 秒理解；
- 知识递进；
- 章节级关系；
- 上一节 / 下一节。

---

## 12. Interview

Interview 回答：

> 企业会怎么问？我应该怎么回答？

Evidence 频率只能来自真实 Evidence。

Reading Segment：

```text
面试回答 | 深入理解
```

关联 Learn / Scale 放在问题上方阅读区域，不放成大块 Footer。

---

## 13. Scale

Scale 回答：

> 规模、并发、可靠性、成本约束扩大后怎么设计？

Scale Scenario 默认：

```yaml
hypothetical: true
```

它是生产训练，不是项目经历。

章节 / Detail Item 可以直接挂对应 Learn / Interview Link。

---

## 14. Quick Answer / Main Line

Quick Answer 使用：

- Signal Soft；
- Signal Hairline；
- 无 Shadow。

它是阅读强调，不是 CTA。

---

## 15. Bottom Sheet vs Side Drawer

`BottomSheet` 继续用于：

- Interview Evidence；
- Filters；
- 其他短时操作。

`Reading Directory` 不再使用 BottomSheet。

长文章目录统一使用：

```text
Right-side Reading Drawer
```

---

## 16. Code Block

只有真实代码、SQL、配置、命令使用 CodeBlock。

不得使用黑色代码块表达普通流程与架构说明。

---

## 17. Technical Diagram

Diagram 是 Secondary Learning Aid。

简单线性关系优先文本：

```text
Snapshot
→ Manifest List
→ N Manifest
→ M Data Files
```

只有非线性、并发、状态转换等确实需要时才使用图。

---

## 18. Motion

动效只表达状态，不做装饰。

目录 Drawer 只使用轻量进入 / 退出 Transition。

Reduced Motion 必须关闭非必要 Transition。

---

## 19. Accessibility

- Touch Target >= 44px；
- Focus Visible；
- Reduced Motion；
- Drawer Focus Trap；
- Restore Focus；
- `aria-current`；
- Progress `role=progressbar`；
- 不能只靠颜色表达状态；
- Mobile Drawer 至少提供一种不依赖顶部按钮的关闭方式。

---

## 20. V1.7.1 Freeze Rules

V1.7.1 冻结：

```text
Three-Tab Navigation
Right-edge Reading Control
Right-side Reading Drawer
Directory without row dividers
Contextual Section Relations
Bottom Navigation Separation
Secondary Metadata Grammar
```

后续 UI Review 不再重新引入：

- Projects 前台 Tab；
- 横向 Quick Navigation 作为长文目录；
- Top-right-only Reading Directory；
- 大块 Footer Cross-link 列表作为主要关系入口；
- Heavy Shadow；
- Card Wall。
