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
content_status: v0.6.1_read_model
project_relevance:
  - north-america
project_fact_status: needs_fact_check
summary: "Snapshot 通过 Manifest List 引用多个 Manifest；一个 Manifest 只追踪一种 Content、只对应一个 Partition Spec，但可覆盖该 Spec 下多个 Partition Value。"
prerequisites:
  - kb-iceberg-metadata-snapshot-001
related:
  - kb-iceberg-row-level-changes-001
  - kb-iceberg-partition-evolution-001
  - kb-iceberg-trino-read-path-001
---

# Manifest List & Manifest

## 30 秒理解

先记住数量关系：

**1 个 Snapshot → 1 个 Manifest List → N 个 Manifest → 每个 Manifest 记录 M 个 Content File。**

再记住两个限制：

**一个 Manifest 只追踪 Data 或 Deletes 其中一种 Content。**

**一个 Manifest 只对应一个 Partition Spec，但可以覆盖这个 Spec 下多个 Partition Value。**

Manifest 写出后是不可变的。

## Manifest List 负责什么

Manifest List 是 Snapshot 到 Manifest 的索引层。

它保存 Manifest 级别的信息，例如：

- Manifest 文件位置和大小；
- Content 类型：data 或 deletes；
- Partition Spec ID；
- Added / Existing / Deleted File Count；
- Partition Summary；
- Sequence Number 等。

所以 Reader 不需要一开始就打开所有 Manifest。

它可以先利用 Manifest List 中的摘要判断哪些 Manifest 值得继续看。

完整 Pruning（裁剪）过程放到第 7 节 Trino Read Path 统一串起来。

## Manifest 负责什么

Manifest 是不可变的 Avro 元数据文件，里面是一组 Manifest Entry。

每个 Entry 指向一个 Content File，并记录这个文件的：

- 路径；
- Partition Data；
- Record Count；
- File Size；
- Column Metrics，例如 Lower / Upper Bounds、Null Counts；
- Status：added / existing / deleted；
- Sequence Number 等。

这里有一个容易混淆的点：

**Manifest Entry 的 `status = deleted` 表示这个 Content File 在元数据生命周期中的状态，不等于“这个 Entry 是一个行级 Delete File”。**

行级 Delete 是下一节的另一个概念。

## Data Manifest 和 Delete Manifest 为什么分开

Iceberg 的一个 Manifest 可以保存 Data Files，或者保存 Delete Files / Deletion Vector Metadata。

**不能在同一个 Manifest 中同时混放两种 Content。**

一个 Snapshot 的 Manifest List 可以同时引用：

- Data Manifests；
- Delete Manifests。

这样 Scan Planning（扫描规划）时可以先分别处理数据和删除信息，再判断哪些删除信息适用于哪些 Data File。

## Manifest 与 Partition 的关系

Manifest 不是“一个 Partition 一个 Manifest”。

更准确的关系是：

**1 个 Manifest = 1 个 Partition Spec + 这个 Spec 下若干 Partition Value 的 Content File。**

例如 Partition Spec 是 `days(event_time)`，同一个 Manifest 可以同时包含：

- 2026-09-10 的文件；
- 2026-09-11 的文件；
- 2026-09-12 的文件。

所以“相近分区是否在同一个 Manifest”不是由“一个分区一个 Manifest”决定的，而受写入顺序、Manifest 生成和后续 Rewrite 等因素影响。

当 Partition Spec 演进时，旧文件继续由旧 Spec 对应的 Manifest 描述，新文件进入新 Spec 对应的 Manifest。

## 为什么需要两层元数据

如果 Snapshot 直接保存几十万甚至上百万个 Content File 路径，会让每次提交和查询规划都处理巨大的文件清单。

Manifest List + Manifest 两层主要带来两个价值：

- **复用**：新 Snapshot 可以继续引用旧 Manifest；
- **裁剪**：先筛 Manifest，再筛具体 Content File。

所以 Manifest 不只是“文件列表”，它也是查询规划前的元数据索引。

## Manifest 为什么不是“写满再切”

Manifest 一旦写出就是不可变文件。

因此旧 Manifest 即使远小于 8 MB，下一次 Commit 也不会把它重新打开继续追加。

新写入会产生新的 Manifest；新的 Snapshot 可以复用旧 Manifest，也可以在后续策略中引用重新合并或重写后的 Manifest。

**8 MB 到底控制什么、100 个 Manifest 又控制什么，统一放到 Maintenance 章节讲。**

## 关联知识

到这里已经知道 Manifest 最终指向 Content File。

下一节继续向下拆：

**Data File 到底是什么？Delete File 又是什么？一行数据被删除后，为什么原来的 Parquet 还可能继续存在？**
