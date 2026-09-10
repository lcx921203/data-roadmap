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

前台网页只显示对学习、面试和决策有直接价值的信息。

允许显示：

- 知识正文；
- 面试题与答案；
- 真实面经来源；
- 学习深度等用户可理解标签；
- Scale Lab 的具体训练场景；
- 项目案例中已确认的事实；
- 导航、搜索、筛选、继续学习等用户操作。

禁止把以下内部信息原样渲染到用户页面：

- `publishable`、`content_status`、`stack_role` 等内容流水字段；
- `v0.x.x_*`、`seed`、`backlog`、`needs_fact_check` 等开发/编辑状态；
- “为什么这样设计内容”“本轮新增”“当前 DataRoadmap 会……”等编辑说明；
- Validator、Typecheck、Bundle、Registry、Front Matter 等实现细节；
- Project Fact Check 等后台真实性审核流程；
- Evidence 的内部模型术语，除非已经转成用户可理解的“面经来源/出现记录”。

内部字段可以继续保留在 Content-as-Code 中，但必须通过 View Model / formatter 转成用户语言，或完全隐藏。

页面出现 Click Affordance（可点击外观）时必须有真实行为。未实现的搜索、筛选、箭头、按钮不要提前展示。

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

## Web engineering baseline

V0.5 起正式 Web App 技术基线：

```text
React
TypeScript
Vite
Markdown / YAML
Static First
GitHub Pages
```

工程规则：

1. `content/` 是内容事实源，不在 React 页面复制第二份 Taxonomy / Interview Bank。
2. V1 不引入 Backend、Database 或运行时 AI。
3. GitHub Pages 项目路径固定使用 `base: /data-roadmap/`。
4. 静态部署阶段优先 Hash Routing，避免 Pages 子路径刷新 404。
5. Build 必须先执行 Content Validation 和 TypeScript Typecheck。
6. Stable ID 是跨 Knowledge / Interview / Project / Scale 的关联键。
7. 页面组件不允许绕过 Frozen Design Tokens 私自新增品牌色。
8. 依赖新增必须说明为什么不能用现有 Web Platform / React 能力解决。
9. 不在 Feature Code 中硬编码真实项目事实；Project Fact 必须来自已核验内容。
10. Workflow 文件变更与普通 ZIP 更新分离处理，因为 `Apply DataRoadmap package` 排除 `.github/workflows/*`。

## Interaction rules

- Bottom Navigation 固定四项：Learn / Interview / Scale / Projects。
- Evidence Detail 使用 Bottom Sheet。
- Evidence 的频次与公司数量是静态信息；只有明确的“查看面经来源”控件打开 Bottom Sheet。
- Full Filter 使用 Bottom Sheet。
- 长代码默认可折叠。
- Reading Segment 只控制展示，不创建第二份内容。
- Sheet 必须支持 focus trap / Escape / restore focus。
- Pressed State 不使用缩放 Bounce。
- 学习位置使用本地状态时必须说明真实语义；不能用写死百分比冒充进度。

## Change policy

以下变更必须明确升级 Design System 版本：

- 顶级导航；
- Color architecture；
- Typography scale；
- 核心 Component Anatomy；
- Evidence visibility policy；
- Project / Scale truthfulness boundary。

局部 Bug Fix、点击区域修正、2–4px spacing、图标替换、普通文案调整不需要升级主版本。
