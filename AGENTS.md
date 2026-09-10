# AGENTS.md

# DataRoadmap Agent Rules

任何 AI 或代码 Agent 修改本仓库时必须遵守以下规则。

## Product rules

1. 不把 DataRoadmap 做成“大而全”的技术百科。
2. 主项目技术栈深学；同类型非主栈技术以横向比较和选型为主。
3. Knowledge 默认 Production First。
4. Project Case 只记录真实项目事实，禁止虚构规模、吞吐、SLA 或生产经历。
5. 大规模系统能力放入 Scale Lab，不伪装成真实项目经验。
6. Interview Question 优先来自真实企业面经或高可信公开资料。
7. 禁止为了覆盖知识点而批量编造“看起来像面试题”的问题。
8. V1 用户端答案必须是预制内容，不接运行时 AI 题解。
9. 所有重要实体使用稳定 ID 关联。
10. 中文主讲；重要英文术语首次出现时提供中文含义。

## Frontstage content boundary

前台只显示对学习、面试和决策有直接价值的信息。

禁止原样渲染：

- publishable / content_status / stack_role；
- seed / backlog / needs_fact_check；
- 构建、Validator、Front Matter、Registry 等实现细节；
- Evidence 内部可靠性等级、Mapping Type、Source URL；
- 内容设计原则和版本流水说明。

内部字段可以保留在 Content-as-Code 中，但必须转换成用户语言或隐藏。

## Dynamic number rules

所有可能随内容或用户状态变化的前台数字必须由数据计算，不允许复制常量到 JSX：

```text
Stage Count
Knowledge Count
Current Learning Position N / M
Interview Total / Filtered Count
Question Rank
Evidence Count
Company Count
Company Group Count
Future Answer / Scenario Count
```

其中：

```text
30 秒回答 / 30 秒理解
L1-L5
Scale Lab 的 10B / 100 Writers 等场景约束
```

属于语义或场景参数，不是动态库存数字。

Interview Evidence 的当前事实源：

```text
canonical-frequency-v0.3.8.yaml
+
canonical-frequency-supplement-v1.yaml
```

`verified_direct.ids` 和 `verified_direct.companies` 用于生成前台数量；Evidence YAML 用于展示公司、岗位、轮次、平台和日期。

## Design System

事实源：

```text
DESIGN.md
content/design/components-v1.yaml
```

当前版本：Design System V1.1。

核心规则：

1. Mobile First，390px 为关键验证基准。
2. Row / Section / Divider 优先于 Card。
3. 主正文 >=16px。
4. Signal Blue 是唯一 Accent。
5. 默认无 Shadow。
6. 禁止 Gradient Decoration / Glassmorphism / Neon AI。
7. Touch Target >=44px。
8. Evidence 在 Interview UI 必须可见。
9. Project Fact 与 Scale Lab 必须保持真实性边界。
10. Click Affordance 必须有真实行为。

## Interaction rules

- Bottom Navigation 固定 Learn / Interview / Scale / Projects。
- Evidence 使用 BottomSheet。
- Evidence 数字是信息，不是点击目标；只有“面经依据”展开。
- Technology Chip 与 Advanced Filter 必须视觉区分。
- Advanced Filter 使用 BottomSheet。
- 长代码可折叠。
- Reading Segment 只切展示模式，不复制内容。
- Sheet 必须支持 focus trap / Escape / restore focus。
- 学习进度目前表示最近阅读位置，不冒充完成率。

## Web engineering baseline

```text
React
TypeScript
Vite
Markdown / YAML
Static First
GitHub Pages
```

- `content/` 是事实源。
- V1 不引入 Backend、Database 或运行时 AI。
- GitHub Pages 使用 `/data-roadmap/` base。
- Build 必须先 Content Validation + Typecheck。
- Stable ID 是跨 Knowledge / Interview / Project / Scale 的关联键。
- Workflow 变更与普通 ZIP 更新分离。

## Change policy

顶级导航、颜色架构、Typography Scale、核心组件 Anatomy、Evidence Visibility Policy、Project/Scale Truthfulness Boundary 变化时，必须更新 Design System 版本。
