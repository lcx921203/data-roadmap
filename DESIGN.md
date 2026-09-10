# DataRoadmap Design System

> Version: **1.2 / Interview Semantics Revision at V0.6.0.6**
>
> Product character: **Technical Editorial Learning System（技术编辑型学习系统）**

V1.2 延续 V1.1 的 Mobile-first 视觉语言，重点冻结 Interview 内“规模追问”和“关联追问”的组件语义。

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

## 16. Projects

Project List 使用用户熟悉的项目名称为主标题；关联技术作为 Secondary Metadata。

不重复显示：

```text
Projects
PROJECTS
项目案例
```

一个页面只保留必要层级。

## 17. Dynamic Numbers

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

## 18. BottomSheet

- mobile max-height 82vh；
- top radius 14px；
- tap outside；
- close button；
- Escape；
- focus trap；
- restore focus。

## 19. Project Truthfulness

Project Case 继续区分：

```text
Actual
Boundary
Knowledge Mapping
Interview Mapping
Scale Extension
```

Production Pattern / Scale / Curated Extension 不得自动变成真实项目经历。

## 20. Change Policy

以下变化继续要求版本化：

- 顶级导航；
- Color Architecture；
- Typography Scale；
- Core Component Anatomy；
- Evidence Visibility Policy；
- Project / Scale Truthfulness Boundary；
- Interview Follow-up Semantics。
