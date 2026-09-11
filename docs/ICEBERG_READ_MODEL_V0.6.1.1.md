# Iceberg Read Model V0.6.1.1

## Goal

把 01–07 从“七篇各自正确的文章”收成一条连续 Read Model：

```text
Table State
→ Snapshot
→ Manifest
→ Data / Delete
→ Partition
→ Schema
→ Trino Read Path
```

## Content rules applied

- 每个概念只保留一个主讲位置；
- Pruning 只在 Trino Read Path 完整展开；
- Commit / Retry / Maintenance 不在前半段抢讲；
- 30 秒理解只保留真正能在 30 秒形成的心智模型；
- 普通关系不再使用黑色 text CodeBlock；
- 01–07 仅保留真正 SQL 示例的 fenced CodeBlock。

## Mobile reading fix

截图暴露的主要问题不是字号，而是两个叠加因素：

1. Quick Answer 中的 Markdown blockquote 使用浏览器默认左右 margin，导致关键句被压成窄列并连续换行；
2. Quick Navigation 使用整排大 Pill，视觉权重高于正文。

V0.6.1.1:
- reset `.quick-answer blockquote`；
- 统一 quick-answer 段落 / 列表 16px 阅读密度；
- Quick Navigation 保持 44px touch target，但改成轻量文本 Anchor；
- 30 秒理解正文同步收短，避免一张 Quick Answer 占掉整屏。

## Next

V0.6.1.2:
Write Distribution → Commit → Maintenance → Troubleshooting
