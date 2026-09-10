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

## Design system status

Design System V1 已于 V0.4.2 冻结。

工程实现必须以：

```text
DESIGN.md
content/design/components-v1.yaml
```

为事实源。

## Design rules

1. Mobile First，390px 是关键设计基准。
2. Row / Section / Divider 优先于 Card。
3. 主正文 >= 16px。
4. 只使用一个主 Accent：Signal Blue。
5. 默认无 Shadow；层级使用留白、Surface、Hairline。
6. 禁止装饰性 Gradient、Glassmorphism、Neon AI。
7. Learn / Interview 共用内容源，不复制两套 Markdown。
8. Evidence 在 Interview UI 必须可见。
9. Project Fact 与 Scale Lab 必须视觉与语义分离。
10. Touch Target >= 44px。
11. 支持 iOS Safe Area 与 Reduced Motion。
12. Technical Diagram 在 Mobile 优先纵向。
13. 不为了“好看”修改 PRODUCT / CONTENT / CONTENT_MODEL 信息架构。

## Interaction rules

- Bottom Navigation 固定四项：Learn / Interview / Scale / Projects。
- Evidence Detail 使用 Bottom Sheet。
- Full Filter 使用 Bottom Sheet。
- 长代码默认可折叠。
- Reading Segment 只控制展示，不创建第二份内容。
- Sheet 必须支持 focus trap / Escape / restore focus。
- Pressed State 不使用缩放 Bounce。

## Change policy

以下变更必须明确升级 Design System 版本：

- 顶级导航；
- Color architecture；
- Typography scale；
- 核心 Component Anatomy；
- Evidence visibility policy；
- Project / Scale truthfulness boundary。

局部 2–4px spacing、图标替换、普通文案调整不需要升级主版本。
