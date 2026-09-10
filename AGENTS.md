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

## Design rule

视觉设计尚未冻结。

在 `DESIGN.md` 正式完成前：

- 不自行定义完整 Design System
- 不沿用此前已推翻的 UI 方案
- 不批量创建视觉组件
- 不为了“好看”改变 PRODUCT / CONTENT 信息架构
