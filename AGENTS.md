# AGENTS.md

# DataRoadmap Agent Rules

任何 AI 或代码 Agent 修改本仓库时必须遵守以下规则。

## Product

1. 主栈深学，同类横向比较。
2. Knowledge 默认 Production First。
3. Project Case 只写真实事实，不虚构规模、吞吐、SLA 或事故经历。
4. 顶级 Scale 是独立假设生产场景。
5. Interview Question 优先来自真实面经 Evidence。
6. V1 用户端答案必须是预制内容，不使用 Runtime AI 临时题解。
7. 中文主讲，重要英文术语首次出现时附中文解释。

## Interview semantics

Interview Answer 内：

```text
Scale Lab
```

旧内容允许继续读取，但前台必须显示为：

```text
规模追问
```

它只表示当前题的规模化追问，不等价于顶级 Scale Lab。

关联追问规则：

- Evidence-backed：有独立真实 Evidence 时可成为 Canonical Question；
- Curated Extension：无独立频次证据时可提供站内精简答案；
- Pending：未整理时明确答案整理中；
- Curated Extension 不得标成“真实高频追问”；
- 禁止 Runtime AI 即时生成追问答案。

## UI semantics

只有真正代码、SQL、配置、命令进入黑色 CodeBlock。

禁止用 CodeBlock 显示：

- 规模参数；
- P0/P1/P2 资产等级；
- 架构职责；
- 普通流程说明；
- KPI 或约束列表。

这些应使用 Row / Divider / Constraint Surface。

## Frontstage boundary

禁止原样显示：

- publishable / content_status / needs_fact_check；
- reliability / mapping_type / independence_group；
- source URL；
- seed / backlog / version pipeline；
- 内部设计和构建说明。

## Dynamic numbers

前台会变化的数字全部从 Content Registry / User State 动态计算：

- Stage / Knowledge Count；
- Learning Position；
- Interview Total / Filtered Count；
- Rank；
- Evidence / Company Count。

React 不复制硬编码库存数字。

## Design System

事实源：

```text
DESIGN.md
content/design/components-v1.yaml
```

当前：Design System V1.4。

核心：

- Mobile First；
- Row / Divider 优先；
- Body >=16px；
- Touch >=44px；
- Signal Blue 单 Accent；
- 默认无 Shadow；
- 禁止 Glassmorphism / decorative gradient；
- Evidence 必须可见；
- Top-level Scale 与 Interview 规模追问必须语义区分。
- 描述性 Metadata 统一使用 `A · B · C`，不做假交互 Chip。
- Continue Learning 可使用唯一的低频 Signal Border 流动高光；仅限边框，无外发光/Shadow/多色霓虹；Reduced Motion 必须关闭。
- Interview 规模追问不显示 `INTERVIEW FOLLOW-UP` 内部 Kicker，ASCII 树符号要转换为视觉层级。
- 关联追问整行可点击，`+ / −` 只是状态指示，不做圆形二级按钮。

## Web baseline

```text
React
TypeScript
Vite
Markdown / YAML
Static First
GitHub Pages
```


## Technical Diagram rules

技术结构、流程、分支关系优先考虑 Diagram，不使用黑色 CodeBlock 模拟图。

Markdown Directive：

```text
```diagram-<stable-id>
```
```

规则：

- 390px Mobile First；
- 不把桌面宽图整体缩小；
- Diagram Text 必须是真实 DOM Text；
- Diagram 使用低饱和 Semantic Palette，但不得扩散到普通 UI；
- 不允许仅靠颜色表达含义；
- 每张图必须有文字 Caption；
- 默认无 Shadow / Neon / Glass；
- 一对多关系必须从连接结构上可见；
- Diagram 只表达结构，正文继续解释为什么；
- SQL / Config / Command 仍使用 CodeBlock。
