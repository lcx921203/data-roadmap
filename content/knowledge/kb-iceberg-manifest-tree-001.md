---
id: kb-iceberg-manifest-tree-001
type: knowledge
title: Manifest List & Manifest
title_cn: Manifest List 与 Manifest
stage_id: "04"
domain: lakehouse
topic: iceberg
order: 3
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: v0.6.0_spine
project_relevance:
  - north-america
project_fact_status: needs_fact_check
summary: "Manifest List 是 Snapshot 到 Manifest 的索引层；Manifest 记录 Data/Delete File 及分区、统计信息。理解它才能解释 Metadata Pruning。"
prerequisites:
  - kb-iceberg-metadata-snapshot-001
related:
  - kb-iceberg-partition-evolution-001
  - kb-iceberg-trino-read-path-001
---

# Manifest List & Manifest

## 30 秒理解

最容易混淆的一点是：

```text
一张表
不等于
一个 Manifest List
```

每个 Snapshot 通常有自己的 Manifest List；Manifest 可以被多个 Snapshot 复用。Manifest 本身也**不是某一个分区的固定文件**，它可以记录多个 Data File，并携带这些文件的 Partition Data 与 Column Metrics（列统计）。

## 元数据树

```text
Table Metadata
    ↓
Snapshot
    ↓
Manifest List
    ↓
Manifest A ── Data File 1
           ├─ Data File 2
           └─ Data File 3

Manifest B ── Data File 4
           └─ Delete File 1
```

Manifest List 存的是“Manifest 的元数据”，例如 Manifest 级别的文件数和 Partition Summary（分区范围摘要）。

Manifest 存的是“Content File 的元数据”，例如：

```text
file path
partition data
record count
file size
lower / upper bounds
null counts
status: added / existing / deleted
```

## 为什么要两层

如果 Snapshot 直接列出一百万个 Data File，那么每次提交和规划都要处理巨大列表。

两层结构让系统可以：

- 复用旧 Manifest；
- 先在 Manifest List 层排除不相关 Manifest；
- 再在 Manifest 层排除不相关 Data File；
- 避免每次 Snapshot 都重写整个文件清单。

## Metadata Pruning

假设查询：

```sql
SELECT *
FROM orders
WHERE order_date = DATE '2026-09-10'
  AND user_id = 1001;
```

简化裁剪路径：

```text
Partition Summary
→ skip unrelated Manifest

File Partition + Metrics
→ skip unrelated Data File

Parquet statistics
→ skip Row Group
```

这也是为什么 Iceberg 的查询优化不只是“分区裁剪”。

## Manifest 与 Partition 的关系

Manifest **不属于某个固定 Partition**。

一个 Manifest 可以包含多个分区的数据文件。Manifest List 中保存的 Partition Summary 可以描述这些文件覆盖的分区范围，用于更早地裁剪。

因此不能把它理解成：

```text
partition=2026-09-10/
  manifest.avro
```

Iceberg 的 Metadata Tree 与物理目录布局是两套概念。

## Production 实现

关注两个极端：

```text
Manifest 太碎
→ planning 要打开很多 Manifest

Manifest 太大
→ 单次 metadata read / rewrite 变重
```

需要结合写入频率、表规模和查询模式做 Manifest Merge / Rewrite，而不是设置一个全公司统一数字。

## 故障排查

查询 Planning 变慢时，不要第一反应增加 Trino Worker。

先确认：

```text
Snapshot count
Manifest count
Manifest entries
Data file count
Partition selectivity
Column metrics availability
```

如果大量 Manifest 无法被 Predicate 排除，问题可能出在 Metadata Layout，而不是执行阶段 CPU。

## 大规模下会发生什么

当 Streaming 持续微批提交时，Data File 和 Manifest 数量都会增长。后续 Maintenance 必须同时考虑：

```text
Rewrite Data Files
+
Rewrite Manifests
```

两者解决的问题不同。

## 关联知识

下一节进入 Hidden Partitioning 与 Partition Evolution，理解为什么改变分区策略不需要重写历史 Schema。
