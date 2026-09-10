# Frontstage Cleanup V0.6.0.2

## Purpose

清理“内部内容模型直接泄漏到用户页面”的问题，并修复截图中确认的交互与渲染问题。

## Fixed

### Learn
- 删除“按系统能力学习，而不是按工具列表刷课程”等内容设计规则。
- `Roadmap` 改为“学习路线”。
- Roadmap 右箭头移除。
- 删除写死的 `42%`。
- Knowledge 页面访问后，用 `localStorage` 记录最近学习位置。
- 首页显示真实的“第 N / M 节”。
- 继续学习区域改成无描边 Surface + 明确“继续/开始”操作。

### Knowledge
- 不再显示 `core`、`v0.6.0_spine` 等内部字段。
- 只显示学习者有意义的 `L5 高阶` 与 Topic。
- 清理 Knowledge 正文中的 Project Fact Check / V0.6.0 / DataRoadmap 编辑说明。
- 保留真正的 Production / Scale 内容。

### Interview List
- 删除 `REAL EVIDENCE · V1`、`Publishable`、`Evidence scope`、`Curated` 等内部字段。
- Frequency Band 转成人类语言。
- `11 direct · 5 companies` 转为“11 条独立面经 · 5 家公司”。
- Search 现在是真实输入框。
- Filter 现在有实际筛选行为。

### Interview Detail
- Frequency 只出现一次。
- “核心重复题”和“11 条独立面经 · 5 家公司”不再是两个假点击区域。
- 只有“查看面经来源”按钮打开 Bottom Sheet。
- Bottom Sheet 改成“面经来源”用户语言。
- 移除 Answer Status / Project Mapping 内部 Footer。
- 未整理答案只显示“答案整理中”。

### Code
旧样式 `.quick-answer code` 误命中 fenced CodeBlock 的 `<pre><code>`，导致 Safari 中出现灰色碎片背景。

现在区分：

```text
Inline Code
vs
Fenced CodeBlock
```

Block code 强制透明内层背景、保留完整黑色 Code Surface。

### Scale
- 删除 Training Model 模板首页。
- 首页直接展示三个真实的 Scale Scenario Seed。
- “Hypothetical” 仍保留在数据层作为真实性约束，不作为大标题占据用户页面。
- TopBar 使用单行 `Scale`。

### Projects
- 移除 Fact Boundary、Fact Check、needs_fact_check 等内部状态。
- 当前只展示项目与相关主题。
- 真正 Actual 内容仍等待后续 Project Case 事实核验。

## Learning progress semantics

当前没有“课程完成/考试通过”状态，因此首页进度条表示：

> 最近一次打开的 Knowledge 在当前 Stage 中的位置。

它不是“完成率”，也不是写死演示值。

后续如果增加 Complete 按钮，再把 Progress 升级为真正 Completion Progress。
