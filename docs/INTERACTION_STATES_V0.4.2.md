# Interaction States V0.4.2

## 1. State model

所有可交互组件都必须明确状态，而不是只画 Default。

最小状态：

```text
default
pressed
focus-visible
disabled（适用时）
```

有选择关系时增加：

```text
selected / active
```

有异步状态时再增加：

```text
loading
success
error
```

V1 Static-first 页面暂时不为了“完整”人为加入不存在的 Loading。

## 2. Bottom Navigation

```text
default
active
focus-visible
```

切换后：

- URL / route 改变；
- active 项变 Signal Blue；
- 其他项回到 Ink Muted；
- 不播放缩放 Bounce。

## 3. Evidence Disclosure

```text
Question Detail
↓ tap Evidence
Bottom Sheet Opening
↓
Evidence List
↓ close / outside / Escape
Return to same scroll position
```

打开时：

- 背景滚动锁定；
- Focus 移入 Sheet；
- 关闭后 Focus 回到触发按钮。

## 4. Filter

移动端完整筛选：

```text
Filter button
↓
Bottom Sheet
↓
Change selections
↓
Apply
↓
Question List
```

是否“即时应用”在 V1 采用：

> Sheet 内即时更新选中状态，点击 Apply 后关闭并正式更新 URL Query。

这样 Back / Share 可以保留筛选状态。

## 5. Code Block

### Short

默认 Expanded。

### Long

默认 Collapsed：

```text
Code preview
Show code
```

展开后：

```text
Header
language / filename
Copy
Collapse
```

Copy 成功只显示短暂文本状态：

```text
Copied
```

不弹全局 Toast，避免打断阅读。

## 6. Reading Segment

切换：

```text
Interview
↔
Learn
```

仅影响展示 Section。

不重新加载 Markdown。

切换后尽量保持接近当前语义位置，而不是永远跳到页面顶部。

## 7. Row

Pressed 状态只使用 Surface 变化。

```text
default     transparent
pressed     #F6F6F3
```

不做缩放。

## 8. Quick Navigation

点击锚点：

- 平滑滚动；
- Sticky Top Bar 偏移；
- URL hash 可选更新；
- Reduced Motion 时使用瞬时跳转。

## 9. Bottom Sheet Motion

```text
duration 180ms
translateY only
overlay opacity
```

Reduced Motion：

```text
duration 0
```

## 10. Destructive actions

V1 当前没有删除、支付、账户危险操作。

因此 Design System 不创建假想的危险确认流程。
