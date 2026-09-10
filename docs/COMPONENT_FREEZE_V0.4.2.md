# Component Freeze V0.4.2

> 本轮将 V0.4.1 原型中的 Component Candidates（候选组件）冻结为 Design System V1。

## 1. Freeze 结果

V0.4.1 中的核心候选组件：

```text
App Shell
Top Bar
Bottom Navigation
Stage Row
Question Row
Metadata
Badge
Filter Chip
Quick Answer
Reading Segment
Quick Navigation
Evidence
Code
Diagram
Scale
Project Fact Boundary
```

均可以在 390px 原型中成立。

V0.4.2 新补充并冻结：

```text
Bottom Sheet
Evidence Disclosure
Interaction States
Accessibility State Rules
Code Collapse / Copy
Filter Apply Flow
```

## 2. 为什么需要 Bottom Sheet

手机端两类信息天然不适合永远塞进正文：

```text
Evidence Detail
Full Filters
```

因此 V1 统一使用 BottomSheet，而不是：

- 多层 Modal；
- 新页面来回跳；
- Dropdown；
- 右侧 Drawer。

Desktop 可以把同一组件适配为 Popover / Side Panel，但内容模型不变。

## 3. Question Detail 最终结构

```text
Top Bar
↓
Frequency / Domain / Level
↓
Question
↓
Evidence Summary
↓
Quick Answer
↓
Interview | Learn
↓
Mode Sections
↓
Related
```

Evidence 点击后：

```text
Bottom Sheet
→ Company / Role / Round / Date / Mapping
```

## 4. Learn Detail 最终结构

```text
Top Bar
↓
Stage / Topic
↓
Title
↓
Summary
↓
Depth / Stack Role
↓
Quick Navigation
↓
30 秒理解
↓
Article
↓
Production
↓
Project / Scale / Interview Links
```

## 5. Code 最终规则

短代码：

```text
Expanded
```

长代码：

```text
Collapsed by default
```

避免 150 行代码把移动端正文切断。

Copy 成功在按钮本身反馈，不制造 Toast 噪音。

## 6. Filter 最终规则

列表页面顶部只显示少量快捷 Filter Chip。

完整条件：

```text
Domain
Level
Frequency
Company
Curated
```

进入 BottomSheet。

URL Query 保存 Apply 后状态，便于 Back 和 Share。

## 7. Truthfulness UI

Project Case：

```text
Actual
Boundary
Scale Extension
```

三者必须有清晰 Section 标题。

`Scale Extension` 强制显示：

```text
HYPOTHETICAL SCALE LAB
```

即使视觉设计以后微调，这条规则也不允许删除。

## 8. Design System V1 冻结范围

冻结：

- Color architecture；
- Typography scale；
- Spacing scale；
- Row-over-Card；
- Navigation；
- Core Component Anatomy；
- Interaction State Model；
- Evidence Disclosure；
- Project / Scale boundary；
- Accessibility baseline。

未冻结到像素级：

- 最终 Icon Set；
- 2–4px 局部 Padding；
- Desktop Detail Sidebar；
- Dark Mode；
- Search Result Page 的细节。

## 9. 进入 V0.5 的条件

全部满足：

```text
[x] Content Model 稳定
[x] Interview Evidence Model 稳定
[x] Information Architecture 稳定
[x] 390px 原型完成
[x] Component Inventory 冻结
[x] Interaction State 冻结
[x] Accessibility Baseline 冻结
[x] Design System V1 冻结
```

因此下一阶段可以正式开始：

# V0.5 Web Foundation

技术基线：

```text
React
TypeScript
Vite
Markdown / YAML
GitHub Pages
```
