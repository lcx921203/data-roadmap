# Iceberg Knowledge Architecture Audit V0.6.0.10

## Audit objective

后续 Iceberg 审计不只检查“知识点有没有写错”，还要检查知识是否形成连续主线。

最高原则：

```text
讲清楚
> 写得多
> 图很多
```

## Dual audit

### A. Correctness Audit

检查：

- 概念定义；
- 数量关系；
- 版本相关配置；
- 读写语义；
- Commit / Retry；
- Manifest Merge / Rewrite；
- Partition / Schema Evolution；
- Trino Read Path；
- Maintenance。

### B. Knowledge Structure Audit

检查：

- 一个概念是否只有一个 Primary Teaching Location；
- 前置知识是否在使用前讲过；
- 是否存在跨章节重复；
- 是否存在碎片化补丁式内容；
- 深化是否有明确层级；
- 当前章节为什么自然引出下一章节；
- Diagram / CodeBlock 是否抢走注意力。

## Proposed learning spine

```text
01 Iceberg 解决什么问题
↓
02 Table Metadata / Snapshot：表状态如何表示
↓
03 Manifest List / Manifest：Snapshot 如何定位文件
↓
04 Partition / Metrics / Pruning：为什么能少扫
↓
05 Write：新文件和新元数据如何产生
↓
06 Commit / Conflict / Retry：新状态如何原子发布
↓
07 Schema / Partition Evolution：为什么能演进
↓
08 Small Files / Manifest Growth：规模放大后为什么变碎
↓
09 Maintenance：Data / Manifest / Snapshot 如何治理
↓
10 Trino Read Path + Troubleshooting：完整串起来
```

## Manifest ownership

为了避免重复：

```text
03
只讲结构 / 数量 / 职责

05
讲新 Commit 如何产生、复用 Manifest

08
讲为什么 Manifest 会增长和碎片化

09
讲 Merge / rewriteManifests / Maintenance
```

## Presentation rule

```text
simple linear relation
→ text chain

comparison
→ list / table

real code/config
→ CodeBlock

complex nonlinear system behavior
→ optional Diagram
```

本轮已经移除两个低收益 Iceberg Diagram；Diagram System 保留，但降级为按需能力。
