# DESIGN.md

# DataRoadmap Design System

> Version: **0.4.0 / Foundation**
>
> Product character: **Technical Editorial Learning System（技术编辑型学习系统）**

DataRoadmap 不是课程商城、刷题排行榜、企业后台，也不是一面墙的彩色卡片。

它应该像：

```text
一本结构清楚的技术杂志
+
一套可以快速查阅的开发者文档
+
一个面试前能迅速切换到“答题状态”的学习工具
```

设计目标只有一个：

> **让复杂技术内容更容易理解、定位、复习和表达。**

---

## 1. Design Direction

### 关键词

```text
Editorial      编辑感
Technical      技术感
Calm           克制
Precise        精确
Readable       易读
Evidence-led   证据驱动
Mobile-first   移动优先
```

### 不做什么

- 不复用此前已推翻的「沉浸式面试」视觉方案。
- 不做 Apple 官网仿站。
- 不做 Linear 深色仿站。
- 不复制 Mintlify 的绿色品牌色。
- 不复制 Notion 的彩色卡片体系。
- 不把 WIRED 的报纸排版机械搬到学习产品。
- 不使用装饰性渐变作为主要品牌表达。
- 不用大量浮层阴影制造“高级感”。
- 不把首页做成卡片瀑布流。
- 不为了“科技感”使用霓虹、发光边框、玻璃拟态。
- 不用无意义插画替代技术图示。

---

## 2. Reference Synthesis

DataRoadmap 参考 `VoltAgent/awesome-design-md` 的方式不是拼贴 UI，而是抽取不同系统最适合本产品的设计原则。

### From Mintlify

取：

- Reading-first（阅读优先）的文档结构；
- Desktop 的 Sidebar / Article / TOC 三栏思路；
- Code 与正文明确分层；
- Accent 只承担 CTA / Active State；
- 文档导航的低噪音层级。

不取：

- Mintlify Green；
- Marketing Hero 的天空渐变；
- 大量 Pill Button。

### From Notion

取：

- Warm Neutral（温和中性色）；
- 低噪音 Surface；
- 轻量 Hairline Border；
- 长内容的舒适阅读节奏。

不取：

- 多彩 Feature Cards；
- 插画驱动的品牌首页；
- 紫色作为主品牌语言。

### From Apple

取：

- 大量留白；
- UI Chrome（界面装饰）退后；
- 一个主交互色；
- 系统字体优先；
- 少阴影、少装饰。

不取：

- Photography-first；
- 商品展示式超大 Hero；
- Apple Blue 原样复制。

### From Linear

取：

- 精确的组件状态；
- Accent 克制使用；
- Hairline + Surface 层级；
- 技术产品的紧凑信息密度。

不取：

- 全站深色；
- Lavender 品牌色；
- 过度“开发者工具化”的冷感。

### From WIRED

取：

- 内容本身成为视觉主体；
- 强标题 + 轻 Metadata 的编辑层级；
- Row / Divider 比 Card 更常用；
- 类型、栏目、来源等 Metadata 有明确视觉位置。

不取：

- 传统报刊式超高密度；
- 大量 Serif 正文；
- 0px 圆角作为全局规则。

---

## 3. Core Visual Language

### 3.1 Canvas

默认 Light-first：

```text
Canvas          #FCFCFA
Surface         #F6F6F3
Surface Raised  #FFFFFF
Ink             #171717
```

整体是偏暖的近白色，不使用纯冷灰作为主背景。

### 3.2 Accent

DataRoadmap 只设一个主交互色：

```text
Signal Blue     #315DDC
Signal Soft     #EEF2FF
Signal Strong   #2346B5
```

用途仅限：

- 当前导航；
- 链接；
- Focus；
- 关键 CTA；
- 当前阅读位置；
- 图示中的 Active Path。

禁止把 Accent 当装饰色铺满卡片。

### 3.3 Semantic Colors

```text
Success   #19714A
Warning   #A15C00
Danger    #B42318
Info      = Signal Blue
```

Semantic Color（语义色）必须对应真实状态，不用于美化。

---

## 4. Color Tokens

```yaml
colors:
  canvas: "#FCFCFA"
  surface: "#F6F6F3"
  surface-raised: "#FFFFFF"
  surface-strong: "#EEEDE8"

  ink: "#171717"
  ink-soft: "#5F5F5B"
  ink-muted: "#8A8A84"
  ink-faint: "#B4B4AE"

  hairline: "#E4E4DE"
  hairline-strong: "#D2D2CB"

  signal: "#315DDC"
  signal-strong: "#2346B5"
  signal-soft: "#EEF2FF"

  success: "#19714A"
  success-soft: "#EDF8F2"

  warning: "#A15C00"
  warning-soft: "#FFF6E8"

  danger: "#B42318"
  danger-soft: "#FFF0EE"

  code-canvas: "#111318"
  code-surface: "#181B21"
  code-ink: "#F3F4F6"
  code-muted: "#A9AFBA"
```

---

## 5. Typography

### Font Strategy

V1 不依赖专有字体。

```text
UI / Chinese / Body
system-ui
-apple-system
BlinkMacSystemFont
"Segoe UI"
"PingFang SC"
"Hiragino Sans GB"
"Microsoft YaHei"
sans-serif
```

Code：

```text
ui-monospace
"SFMono-Regular"
"SF Mono"
Menlo
Consolas
monospace
```

原则：

- 中文正文优先可读性；
- 不为了 Editorial 感强行使用宋体正文；
- 身份主要通过排版比例、编号、Divider 和 Metadata 建立；
- Mono 只用于代码、ID、Token、技术标签。

### Mobile Type Scale

```text
display      34 / 1.12 / 650
h1           28 / 1.20 / 650
h2           22 / 1.32 / 650
h3           18 / 1.40 / 620
body         16 / 1.72 / 400
body-strong  16 / 1.65 / 600
small        14 / 1.55 / 400
small-strong 14 / 1.50 / 600
meta         12 / 1.45 / 500
mono         13 / 1.60 / 400
```

中文长文正文保持 `16px`，不使用 14px 作为主正文。

### Reading Width

Desktop 正文理想宽度：

```text
680–760px
```

移动端：

```text
viewport - 40px
```

默认左右 `20px` Page Padding。

---

## 6. Spacing

采用 4px 基础节奏：

```yaml
spacing:
  1: 4px
  2: 8px
  3: 12px
  4: 16px
  5: 20px
  6: 24px
  8: 32px
  10: 40px
  12: 48px
  16: 64px
```

推荐：

```text
Page horizontal mobile     20px
Section gap                40–48px
Subsection gap             24–32px
Paragraph gap              16px
Inline group gap           8–12px
```

留白承担层级，不靠每一块都包 Card。

---

## 7. Radius / Border / Shadow

### Radius

```yaml
radius:
  xs: 4px
  sm: 6px
  md: 10px
  lg: 14px
  full: 9999px
```

规则：

- List Row：通常无外卡片圆角；
- Quick Answer：10px；
- Code：10px；
- Scale Scenario：10–14px；
- Badge：6px 或 full；
- 大面积卡片不超过 14px。

### Border

默认：

```text
1px solid #E4E4DE
```

Border 是主要层级工具。

### Shadow

默认无 Shadow。

仅允许：

- Sticky / Floating 控件；
- Modal / Command Palette；
- 必要的 Overlay。

推荐：

```text
0 8px 30px rgba(20, 20, 18, 0.08)
```

禁止多层厚重投影。

---

## 8. Information Architecture

V1 顶级产品入口：

```text
Learn
Interview
Scale Lab
Projects
```

Search 是跨模式能力，不成为独立 Tab。

### Mobile Navigation

底部固定 4 项：

```text
Learn | Interview | Scale | Projects
```

当前项：

- Icon / Label 使用 `Signal Blue`；
- 其余使用 `Ink Muted`；
- 不使用带背景的大胶囊 Active State。

### Desktop Navigation

Desktop：

```text
Left Sidebar
├── Learn
├── Interview
├── Scale Lab
└── Projects
```

文章页可以进一步变成：

```text
Sidebar | Reading Column | Local TOC
```

---

## 9. Home / Entry Philosophy

DataRoadmap 不做营销型首页。

默认打开应尽快进入内容。

推荐结构：

```text
DataRoadmap
From Data Engineering to AI

Continue
最近阅读 / 最近面试题

Explore
00 Foundations
01 Ingestion
02 Compute
...
10 AI Data Agent
11 Production Architecture

High-signal Interview
当前最值得复习的真实题
```

禁止：

- 轮播图；
- 大幅品牌宣传 Hero；
- 今日学习进度仪表盘；
- Streak；
- 排行榜；
- 无意义统计数字。

---

## 10. Learn Mode

Learn 首页优先使用 **List / Section / Row**。

Stage Row：

```text
02
Compute Engines

Spark · L5
Flink · L5
Spark vs Flink · L3

6 topics
```

视觉上以：

- Stage Number；
- 标题；
- 1 行摘要；
- 关键技术；
- 深度标签

建立层级。

不要每个技术都做一张彩色卡片。

### Knowledge Detail

Mobile：

```text
Back + Search
↓
Eyebrow / Stage
↓
Title
↓
Summary
↓
Depth / Stack Role / Related
↓
Quick Navigation
↓
Article
```

Production Pattern、Project Case、Scale Lab、Interview Evidence 是正文中的结构化模块。

---

## 11. Interview Mode

Interview 首页不是“随机刷题”。

默认按 Evidence Priority 排序。

Question Row：

```text
CORE VERIFIED
11 direct · 5 companies

数仓为什么要分层？
ODS / DWD / DWS / ADS...

Warehouse · L5
```

### Question Detail

顶部必须优先显示：

```text
Question
Frequency / Evidence
30 秒回答
```

然后提供模式切换：

```text
Interview | Learn
```

Interview Mode 优先展示：

- 这道题在考什么；
- 30 秒回答；
- Troubleshooting / Answer Framework；
- 常见错误；
- 真实追问。

Learn Mode 展开：

- 核心原理；
- Production；
- Code；
- Project；
- Scale Lab。

同一个 Markdown，不维护两份内容。

---

## 12. Evidence UI

Evidence 是 DataRoadmap 的产品差异点，不能藏在页面底部。

### Compact Evidence Line

```text
11 direct · 5 companies · Core verified
```

### Expanded Evidence

展开后显示：

```text
ByteDance · 数据开发 · 一面
Meituan · 大数据开发 · 二面
Didi · 数据开发 · 一面
...
```

必须区分：

- Direct Evidence；
- Topic-only Candidate；
- 未验证来源。

禁止使用“99% 高频”“大厂必问”这类没有证据定义的营销文案。

---

## 13. Component Language

### Prefer Row Over Card

默认顺序：

```text
Plain Section
→ Divider Row
→ Bordered Container
→ Card
→ Floating Card
```

只有内容需要明确 containment（容器边界）时才升级为 Card。

### Quick Answer

Quick Answer 是 Interview 页最重要的 Card：

```text
Signal Soft background
Signal hairline
10px radius
20px padding
```

不使用大图标，不使用渐变。

### Badge

Badge 用于短状态：

```text
L5
CORE
Verified
Project Fact
Scale Lab
```

不把整句说明塞进 Badge。

### Code

Code 使用 Dark Technical Surface：

```text
#111318
```

代码块：

- 默认允许折叠；
- Mobile 横向滚动；
- Header 显示 language / filename；
- Copy 按钮为低噪音 icon action。

---

## 14. Technical Diagram Language

DataRoadmap 优先使用技术图示，不使用装饰插画填充页面。

### Diagram Types

```text
Architecture Diagram
Pipeline / Data Flow
State / Lifecycle
Comparison
Failure / Recovery Flow
```

### Node

```text
Canvas / Surface Raised
1px Hairline
8–10px radius
```

Active / current node：

```text
Signal Soft
Signal border
```

### Edge

默认：

```text
1.25px Ink Muted
```

Active path：

```text
1.5px Signal
```

### Text

- Node Title：14px / 600；
- Node Note：12px / 400；
- Technical Token：Mono 12–13px。

### Mobile Rule

宽图必须重排成纵向。

优先：

```text
Source
↓
Kafka
↓
Flink
↓
Iceberg
↓
Serving
```

而不是在 390px 宽屏上硬塞 8 个横向节点。

### Semantics

颜色不是分类的唯一方式。

同时使用：

- Label；
- Border；
- Node Shape；
- Position；
- Legend。

---

## 15. Project Case Visual Rule

Project Case 页面首先声明事实状态：

```text
ACTUAL
BOUNDARY
MAPPING
SCALE EXTENSION
```

`Actual` 和 `Scale Lab` 必须视觉上明显不同。

推荐：

```text
Actual
普通白色内容区域

Scale Extension
浅灰 / Signal Soft 容器
明确标注 “Hypothetical Scale Lab”
```

不能让用户误以为 Scale Lab 是真实生产经历。

---

## 16. Scale Lab Visual Rule

Scale Lab 应像“系统设计练习”，不是游戏关卡。

顶部：

```text
Scenario
10B rows · 1M events/s · 5 min recovery SLO
```

然后：

```text
Constraints
↓
Failure / Bottleneck
↓
Design
↓
Trade-offs
↓
Observability
↓
Cost
```

不使用星级、金币、积分、XP。

---

## 17. Motion

Motion 只用于帮助理解状态变化。

```text
micro transition   140ms
panel transition   180ms
```

推荐：

- Accordion；
- Segment switch；
- Bottom sheet；
- TOC active indicator。

禁止：

- Bounce；
- 长时间入场动画；
- Parallax；
- 装饰性浮动。

必须支持：

```css
@media (prefers-reduced-motion: reduce)
```

---

## 18. Accessibility

最低要求：

- 主正文 16px；
- Tap Target >= 44 × 44px；
- 文字 / 背景达到 WCAG AA；
- Focus 可见；
- 不只通过颜色表达状态；
- Code 支持水平滚动；
- Diagram 有文本说明；
- 底部导航不覆盖正文；
- iOS Safe Area 使用 `env(safe-area-inset-bottom)`。

---

## 19. Responsive Model

### Mobile: 0–767

```text
20px page padding
Single column
Bottom Navigation
Collapsible deep sections
Vertical diagrams
```

### Tablet: 768–1099

```text
24px page padding
Reading column + optional local navigation
```

### Desktop: 1100+

```text
Sidebar 240–272
Reading 680–760
Local TOC 200–240
```

不为了填满大屏把正文拉到 1200px。

---

## 20. Design Acceptance Checklist

任何新页面在进入代码前检查：

```text
[ ] 第一眼能看出当前是在 Learn / Interview / Scale / Project 哪个模式
[ ] 主内容比 UI Chrome 更醒目
[ ] Mobile 390px 下不依赖横向大布局
[ ] 没有无意义 Card
[ ] 没有装饰性 Gradient
[ ] Accent 没有被滥用
[ ] 30 秒回答能在第一屏附近找到
[ ] Evidence 可以被看到和展开
[ ] Project Fact 与 Scale Lab 没有混淆
[ ] Code 可滚动 / 折叠
[ ] Diagram 在手机上可读
[ ] 触控目标 >= 44px
```

---

# Design Statement

DataRoadmap 的高级感不来自阴影、玻璃、插画或动画，而来自：

```text
清楚的信息结构
+
克制的视觉层级
+
真正有价值的技术内容
+
可信 Evidence
+
优秀的阅读节奏
```

> **Content is the interface. Evidence is the trust layer.**
