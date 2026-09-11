# DataRoadmap Design System

> Version: **1.6 / Content Clarity First at V0.6.0.10**
>
> Product character: **Technical Editorial Learning System（技术编辑型学习系统）**

V1.6 保留 Technical Diagram 作为可选能力，但将内容正确性与知识结构提升为最高优先级。Diagram 只有在明显降低理解成本时才使用，不能为了视觉丰富而增加认知负担。

```text
Content is the interface.
Evidence is the trust layer.
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

Signal 只用于 Active、Link、Focus、Primary Action、Current Learning State 和 Diagram Active Path。

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

## 4. Base Layout

- Mobile 20px page padding；
- Row / Section / Divider 优先于 Card；
- Default Border = 1px Hairline；
- Default Shadow = none；
- Touch Target >=44×44；
- 支持 iOS Safe Area 与 Reduced Motion。

## 5. Information Architecture

```text
Learn
Interview
Scale
Projects
```

`Scale` 是完整生产场景入口。

Interview Detail 中的规模扩展不得使用与顶级 `Scale Lab` 相同的视觉/命名层级。

## 6. Continue Learning

结构：

```text
继续学习                  第 N / M 节
Stage · Topic
Current Knowledge
Summary
Position Bar
```

- 整块点击；
- Signal Soft Surface + Signal Hairline；
- 允许仅在 1px Border 内使用低频 Signal 单色流动高光；
- 动效周期建议 7–9 秒，无外发光、无 Shadow、无多色霓虹；
- `prefers-reduced-motion: reduce` 时必须关闭流动高光并回退静态 Hairline；
- 无单独 CTA；
- 无 Shadow；
- N / M 动态；
- Position 不是 Completion。

## 7. Interview Discovery

```text
Search
= 问题 / 场景 / 故障 / 关键词

Technology Chips
= 快速进入某技术题集

Filter
= 频次 / 答案状态 / 后续高级条件
```

Filter 放在它实际影响的 Question List 附近，使用独立 Filter Control，不与 Technology Pill 混淆。

## 8. Evidence Summary

题目附近：

```text
Frequency Band
N 份面经 · M 家公司
面经依据 ›
```

只有“面经依据”可点击。

## 9. Evidence Disclosure

移动端 BottomSheet：

```text
题目出现记录
N 份面经 · M 家公司

按公司
Company A · n份
  Role / Round
  Publisher · Date
```

公司按记录数降序；同公司内部按日期降序。

不显示 Source URL、内部 Reliability、Mapping Type。

## 10. Quick Answer

Signal Soft + Signal Hairline，是阅读强调容器，不是 CTA。

## 11. Reading Segment

```text
Interview | Learn
```

同一份 Curated Answer，不复制内容。

Interview 模式优先：

- 考察点；
- 排障；
- 常见错误；
- 项目结合；
- 规模追问；
- 关联追问。

Learn 模式优先：

- 核心 / 完整原理；
- Production；
- 配置 / 代码；
- 故障机制；
- 深入技术内容。

## 12. Interview Scale Follow-up

组件名称：

```text
ScaleFollowUpSection
```

前台标题：

```text
规模追问
```

它是当前题的局部规模扩展。

禁止：

- 标题写 `Scale Lab`；
- 用黑色 CodeBlock 表示规模参数、架构约束或 P0/P1/P2 分级；
- 出现 Copy 按钮；
- 让用户误以为这是顶级 Scale Scenario。

`text` fenced block 在这个 Section 内应转换为轻量 Row / Divider / Constraint Surface，而非 Code Surface。

前台不显示 `INTERVIEW FOLLOW-UP` 等内部英文 Kicker。树状文本中的 `├── / └──` 不直接打印，转换为真正的视觉层级。

## 13. Related Follow-ups

组件名称：

```text
FollowUpDisclosure
```

前台标题：

```text
关联追问
```

交互：

```text
Question                         +
↓ tap
Concise Curated Answer
```

- Question Row >=44px；
- 使用 Hairline 分隔；
- 整行是唯一点击区域；`+ / −` 只作为安静状态指示，不使用圆形按钮边框；
- 默认折叠；
- 一次可展开一条；
- 不使用 Card Wall；
- Curated Extension 不冒充 Evidence-backed 高频题；
- 有 Canonical Question ID 时后续可跳站内完整题目详情；
- 无答案时明确“答案整理中”；
- 禁止 Runtime AI 即时补答案。

## 14. Code Block

只有真正的代码、配置、命令、SQL 才进入 CodeBlock。

以下内容不得默认使用黑色 CodeBlock：

- 规模参数；
- KPI；
- 架构职责；
- P0/P1/P2 分级；
- 普通流程文本；
- 纯概念列表。

## 15. Scale

顶级 Scale Detail 使用完整系统设计结构：

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

Scale List 的难度字段只有在用户有明确解释和筛选价值时才显示；不得直接打印 `SENIOR` 等内部枚举。

Scale List 不重复显示 `Scale / SCALE LAB / 生产场景` 三层标题；保留 TopBar `Scale` + 页面标题 `生产场景` 即可。

场景的 Secondary Metadata 使用统一中点语法，例如：`数据规模 · 资源隔离 · 查询 SLO · 成本`，不把纯描述性元信息做成独立 Chip。

## 16. Projects

Project List 使用用户熟悉的项目名称为主标题；关联技术作为 Secondary Metadata。

不重复显示：

```text
Projects
PROJECTS
项目案例
```

一个页面只保留必要层级。


## 17. Metadata Grammar

纯描述性、同层级的 Secondary Metadata 统一使用：

```text
A · B · C · D
```

适用：

- Scale 场景训练重点；
- Projects 关联技术；
- Company / Role / Round 等简短并列元信息。

规则：

- 中点两侧保留一个空格；
- 非交互 Metadata 不做 Chip / Pill；
- Chip 只用于真实筛选、选择或状态切换；
- 同一页面相同语义使用相同排版语言。

## 18. Motion

默认原则仍然是 Calm / Reduced Motion Friendly。

允许的 Current State Motion Exception：

```text
Continue Learning
→ 1px Signal Border Moving Highlight
```

限制：

- 只允许 Continue Learning 当前学习状态使用；
- 只在 Border 内运动；
- Signal Blue 单色系；
- 推荐 7–9 秒一圈；
- 无外发光；
- 无 Shadow；
- 无多色 Gradient / Neon；
- 不在 Question / Scale / Projects / Evidence 卡片复制；
- `prefers-reduced-motion` 必须关闭；
- 不支持 Mask 的浏览器自动回退静态 Hairline。

动效用于提示“当前状态”，不用于装饰。


## 19. Technical Diagram System

Technical Diagram 是 **Secondary Learning Aid（次级学习辅助）**。

使用前必须先问：

> 不画图，能不能用一句话关系链或短文本更快、更完整地讲清楚？

如果能，默认不用图。

只有下列关系在文字中明显变得难以追踪时，才使用 Technical Diagram：

```text
Non-linear Branch
Concurrent Flow
State Transition
Retry / Rollback
Many-to-Many Dependency
Complex Read / Write Path
```

像 `Snapshot → Manifest List → N Manifest → M Data Files` 这种简单线性层级，优先直接用文字关系链，而不是大图。

### Mobile-first

390px 下必须首先可读。

移动端默认：

```text
纵向主链
↓
必要时双列分支
↓
节点下短说明
```

不得把桌面宽图整体缩小塞进手机。

Desktop 可以增加横向空间和并列信息，但必须使用同一份 Diagram Data / Component，不维护两套内容。

### Diagram Palette

主 UI 仍保持 Signal Blue 单 Accent。

Diagram 内允许独立的低饱和 Semantic Palette，用于区分不同“节点类型”，不是交互状态：

```text
Blue    external / catalog
Green   table metadata
Amber   snapshot / state
Violet  list / index
Rose    manifest / change
Cyan    data file / storage object
```

限制：

- 只在技术图内部使用；
- 低饱和浅底 + 深色文字；
- 不作为按钮或导航颜色；
- 不依赖颜色单独表达语义；
- 节点必须有文字标签；
- 禁止 Neon、强 Gradient、Heavy Shadow。

### Diagram Anatomy

```text
DiagramFrame
├─ Header
├─ Canvas
│  ├─ DiagramNode
│  ├─ DiagramArrow
│  └─ DiagramBranch
└─ Caption
```

默认：

- 1px Border；
- 10px Radius；
- no shadow；
- 结构优先于装饰；
- 文本使用系统字体，不生成图片文字。

### Content-as-Code

Markdown 使用 Diagram Directive：

```text
```diagram-iceberg-metadata-tree
```
```

Renderer 将 `diagram-*` fence 交给 TechnicalDiagram，而不是 CodeBlock。

这样 Diagram：

- 与 Markdown 一起版本管理；
- 可响应式；
- 文字可搜索；
- 可复制；
- 不会像 PNG 一样缩放模糊；
- 不依赖 Figma / AI 生图额度。

### Accessibility

- Diagram 内文字必须是真实 DOM Text；
- 必须有 `figcaption` 或等价文字说明；
- 关系不能只靠颜色；
- 手机无需横向拖动才能理解主关系；
- 关键图不得要求用户放大后才能读；
- 后续复杂 SVG 需要 Text Fallback。

### Diagram vs CodeBlock

以下优先 Diagram：

- Metadata Tree；
- 读取路径；
- 写入 / Commit 流程；
- 一对多结构；
- 状态转换。

以下保持 CodeBlock：

- SQL；
- Python；
- YAML / JSON；
- Shell Command；
- 真实配置；
- 需要复制执行的代码。

纯文本结构不再为了“像图”而塞进黑色 CodeBlock。



### Mobile Density V1.1

首轮 390px 实测后，单概念技术图应优先控制纵向密度：

- 主节点高度约 52–56px；
- Compact Node 约 48–52px；
- 单段 Arrow Gap 约 30–34px；
- Canvas Mobile Padding 约 12–14px；
- 一张单概念图如果持续超过一个移动端内容视口，优先拆成两张图，而不是继续缩小文字；
- 不为压缩高度把节点文字降到不可读。

### Embedded Diagram

当 Diagram 已经位于 Quick Answer / 30 秒理解等有 Surface 的容器中：

- 不再增加完整外框；
- 不制造 Card inside Card；
- Header / Canvas / Caption 使用同一父 Surface；
- 仅用 Hairline 分隔必要区域。

Standalone Diagram 仍可保留轻量 1px 外框。

### Header

Diagram Header 只保留真正有内容价值的标题。

删除：

```text
结构图
流程图
技术图
```

等重复类型 Badge。标题本身已经表达内容，不额外解释“这是一张图”。

### Relation Grammar

连接线必须表达关系，而不只是装饰：

```text
实线单箭头
= 引用 / 调用 / 数据流 / 顺序

实线分叉箭头
= 一对多引用 / 分流

虚线箭头
= Retry / Rollback / Optional Path

无箭头括线 / Group
= 纯分组 / 包含
```

Directional Relationship 必须有 Arrow Head。

例如：

```text
Manifest List
↙             ↘
Manifest A     Manifest B
```

表示“Manifest List 引用多个 Manifest”，不能只画一个没有方向的 T 型括线。

### Caption over Callout

图后的关键关系说明优先进入 `figcaption`。

避免：

```text
Diagram
↓
关键关系 Card
↓
正文
```

形成重复 Surface。

只有需要特别警告、失败语义或用户操作时，才在 Diagram Canvas 之外增加额外 Callout。

### Semantic Color Stability

同一技术域内，同一种语义节点跨图保持同一颜色。

Iceberg V1：

```text
Catalog / External       Blue
Table Metadata           Green
Snapshot / State         Amber
Manifest List / Index    Violet
Manifest / Change        Rose
Data / Storage Object    Cyan
```

不要为了“每个节点颜色不同”继续无限扩充 Palette。


## 20. Dynamic Numbers

动态计算：

- Stage Count；
- Knowledge Count；
- Current Learning Position；
- Interview Total / Filtered Count；
- Current Rank；
- Evidence Count；
- Company Count；
- Company Record Count。

`30 秒回答`、L1–L5 和 Scale Scenario 的固定约束不是库存数字。

## 21. BottomSheet

- mobile max-height 82vh；
- top radius 14px；
- tap outside；
- close button；
- Escape；
- focus trap；
- restore focus。

## 22. Project Truthfulness

Project Case 继续区分：

```text
Actual
Boundary
Knowledge Mapping
Interview Mapping
Scale Extension
```

Production Pattern / Scale / Curated Extension 不得自动变成真实项目经历。

## 23. Change Policy

以下变化继续要求版本化：

- 顶级导航；
- Color Architecture；
- Typography Scale；
- Core Component Anatomy；
- Evidence Visibility Policy；
- Project / Scale Truthfulness Boundary；
- Interview Follow-up Semantics。

- Metadata Grammar；
- Current State Motion exception。

- Technical Diagram System；
- Diagram Semantic Palette。

- Diagram Mobile Density；
- Diagram Relation Grammar；
- Embedded Diagram flattening。


## 24. Learning Clarity over Visualization

用户学习页面遵循：

```text
Correctness
→ Knowledge Structure
→ Reading Flow
→ Visual Aid
```

规则：

- 图不能成为理解某知识点的唯一入口；
- 图不能遗漏正文中的关键限制条件；
- 图如果需要大量解释才能读懂，应优先改回文字；
- 简单层级关系优先一句话链路；
- 复杂非线性关系才考虑 Diagram；
- 删除不产生明显认知收益的图；
- 视觉丰富度不是 Knowledge 页 KPI。

当前 Iceberg `Metadata Tree` 与 `Manifest Tree` 两张图从前台正文移除，保留 Diagram 能力作为后续复杂场景的可选工具。
