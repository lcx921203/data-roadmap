# Design Reference Review V0.4.0

## 目标

V0.4 不再从“选一个喜欢的 App 风格”开始，而是先回答：

> DataRoadmap 的内容结构需要什么样的视觉系统？

参考仓库：

```text
VoltAgent/awesome-design-md
```

重点研究：

- Mintlify
- Notion
- Apple
- Linear
- WIRED

## 1. Mintlify

最值得借的是 Developer Documentation（开发者文档）结构。

它的系统把营销表面和文档表面区分开，文档本身采用 Sidebar / Prose / TOC 的三栏阅读结构，并把 Mono Code 与普通正文做明确区隔。

DataRoadmap 采用：

```text
Desktop:
Navigation
| Reading
| Local TOC
```

但 Mobile 会收敛成单栏。

不采用 Mintlify 的绿色品牌视觉和天空渐变 Hero。

## 2. Notion

最值得借的是中性 Surface 和内容节奏。

Notion 的设计分析大量使用：

```text
white canvas
warm gray surfaces
hairline borders
```

这适合长内容，但 DataRoadmap 不采用它的多彩 Feature Card 体系，因为我们的主要任务不是展示产品模块，而是阅读技术内容。

## 3. Apple

最值得借：

> UI chrome should recede.

Apple 的设计分析以单一交互蓝色、大面积留白、系统字体和低装饰为主。

DataRoadmap 借留白、系统字体和单 Accent 原则，但不做商品展示型页面，也不复制 Apple Blue。

## 4. Linear

Linear 的价值是精确：

- 明确的 surface ladder；
- hairline；
- restrained accent；
- UI state；
- technical density。

DataRoadmap 借这些“工程感”，但不使用近纯黑全站，也不把产品做成 issue tracker 风格。

## 5. WIRED

WIRED 对 DataRoadmap 最重要的启发：

> Editorial product 不需要让每一块内容都变成 Card。

它大量依赖：

```text
type hierarchy
rows
dividers
metadata
```

而不是 shadow/elevation。

DataRoadmap 的 Stage List、Question List、Evidence List 都优先使用 Row。

## 6. 最终合成

```text
Mintlify
Reading Architecture
        +
Notion
Warm Neutral Surface
        +
Apple
Whitespace / Quiet Chrome
        +
Linear
Precision / State
        +
WIRED
Editorial Hierarchy
        ↓
DataRoadmap
Technical Editorial Learning System
```

不是 20% + 20% 的拼贴，而是职责分工。

## 7. 被明确否决的方向

```text
Apple Clone
Linear Clone
Gradient Tech UI
Glassmorphism
Neon AI
Colorful Learning Cards
Gamification Dashboard
Decorative Illustration-first
```

## 8. 进入 Prototype 前的冻结项

V0.4.0 冻结：

- Design Direction
- Light-first Palette
- Signal Blue Accent
- System Typography
- Mobile Type Scale
- Spacing Scale
- Radius / Border / Shadow
- Four top-level product modes
- Row-over-Card
- Evidence UI principle
- Technical Diagram baseline
- Mobile / Desktop responsive model

仍可在 Prototype 后微调：

- Accent 的精确色值；
- 单个组件 Padding；
- Tab / Segmented Control 的细节；
- Desktop Sidebar 宽度；
- Dark Mode。
