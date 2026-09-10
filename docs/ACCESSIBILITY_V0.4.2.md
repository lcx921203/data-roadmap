# Accessibility V0.4.2

## Baseline

DataRoadmap V1 以 WCAG AA 为最低目标。

## Touch

```text
minimum target = 44 × 44px
```

尤其：

- Back；
- Search；
- Copy；
- Overflow；
- Bottom Navigation；
- Evidence expand；
- Filter。

## Type

中文正文：

```text
>= 16px
line-height ≈ 1.7
```

Meta 不承担唯一关键信息。

## Focus

键盘环境：

```text
2px Signal focus ring
2px offset
```

Focus 不得仅靠背景变化。

## Color

禁止：

```text
green = true
red = false
```

而没有 Label / Icon / Text。

例如 Project Fact 必须同时写：

```text
VERIFIED PROJECT FACT
```

## Bottom Sheet

必须：

- `role="dialog"`；
- `aria-modal="true"`；
- 有可访问名称；
- Focus trap；
- Escape close；
- 关闭后 Restore Focus。

## Segment

如果作为页面内内容视图切换，使用：

```text
tablist
tab
tabpanel
```

并支持 Arrow Key。

## Code

代码必须：

- 可横向滚动；
- Copy Button 有 accessible name；
- 折叠按钮暴露 `aria-expanded`；
- 不依赖语法高亮颜色表达结构。

## Diagram

每张核心 Diagram：

- 有文本标题；
- 有文字版关系；
- Active / Failure 同时用文字或线型区分；
- 不把 Diagram 作为唯一知识载体。

## Motion

支持：

```text
prefers-reduced-motion: reduce
```

用户请求减少动画时：

- Sheet 无位移动画；
- Anchor 无 smooth scroll；
- 状态变化立即发生。

## Safe Area

iOS：

```css
padding-bottom: env(safe-area-inset-bottom)
padding-top: env(safe-area-inset-top)
```

Bottom Navigation 必须把 Safe Area 算入自身高度。

## Dynamic Type

正式 React 实现阶段需要验证：

```text
100%
120%
150%
```

优先允许纵向增长，不以截断正文解决。
