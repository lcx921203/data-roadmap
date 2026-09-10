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

## Content rules

新增 Knowledge 前先确认：

- stack_role
- learning_depth
- domain
- topic
- role_relevance

新增 Interview Question 前必须确认来源信息。

新增 Project Case 时必须明确真实边界。

新增 Scale Scenario 时必须注明规模维度与训练目标。

## Design rules

设计系统从 V0.4.0 起由根目录 `DESIGN.md` 约束。

必须：

1. Mobile First，以 390px 宽屏可用性作为关键检查点。
2. 优先 Row / Section / Divider，只有需要明确 containment 时使用 Card。
3. 主正文不小于 16px。
4. 默认只使用一个主 Accent：Signal Blue。
5. Accent 只用于交互、Focus、Active Path 和关键状态，不做装饰铺色。
6. 默认无 Shadow；层级优先通过留白、Surface 和 Hairline 表达。
7. 禁止装饰性 Gradient、Glassmorphism、Neon AI 风格。
8. 技术内容优先使用 Technical Diagram，不用无意义插画占据正文。
9. Learn / Interview 共用内容源，不复制两套 Markdown。
10. Project Fact、Production Pattern 和 Scale Lab 必须视觉与语义分离。
11. Evidence 在 Interview UI 中必须可见，不允许藏成不可发现的脚注。
12. Touch Target >= 44px，支持 iOS Safe Area 和 reduced motion。
13. 不为了“好看”改变 PRODUCT / CONTENT / CONTENT_MODEL 的信息架构。

## Reference rule

`VoltAgent/awesome-design-md` 用于学习设计描述和抽取设计原则。

禁止直接复制：

- 品牌名称；
- 品牌色；
- 专有字体；
- 商标；
- 页面构图；
- 组件视觉组合。

DataRoadmap 必须保持自己的 Technical Editorial Learning System 方向。
