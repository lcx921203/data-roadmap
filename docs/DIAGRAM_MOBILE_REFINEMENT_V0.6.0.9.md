# Diagram Mobile Refinement V0.6.0.9

## Why

V0.6.0.8 首次在 iPhone Safari 上验证后，结构方向通过，但发现：

1. Diagram 在 Quick Answer 内有轻微 Card-inside-Card 感；
2. 纵向节奏偏长；
3. Manifest List → Manifest 的 T 型线没有方向；
4. Header 的“结构图”属于重复信息；
5. Diagram 内额外“关键关系” Callout 让 Surface 层级过多。

## V1.1 refinement

### Mobile density

```text
Primary Node    52–56px
Compact Node    48–52px
Arrow Gap       30–34px
Canvas Padding  12–14px
```

保持可读性，不通过极小字体压缩图。

### Embedded mode

Quick Answer 已经拥有自己的 Surface，所以内部 Diagram：

```text
no outer border
no nested card
title + canvas + caption
```

Standalone Diagram 仍保留轻量外框。

### Relation grammar

```text
→    引用 / 调用 / 流向
↙ ↘  一对多
- -→ Retry / Rollback / Optional
[ ]  Group / Containment
```

因此 Manifest List 分支增加方向箭头。

### Caption

删除 Diagram Canvas 内重复的“关键关系”卡片。

核心解释进入 Figcaption。

### Header

删除右上角“结构图”。

Diagram 标题已经足够。

## Result

如果本轮手机效果通过，Iceberg Diagram Style 即可冻结，并按同一系统继续：

- Trino Read Path
- Commit / Conflict / Retry
- Partition Evolution
- CDC
- Flink Checkpoint
- Agent Architecture
