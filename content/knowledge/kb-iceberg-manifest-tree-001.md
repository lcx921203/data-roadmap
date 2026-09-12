---
id: kb-iceberg-manifest-tree-001
type: knowledge
title: Manifest List & Manifest
title_cn: Manifest List 与 Manifest
stage_id: '04'
domain: lakehouse
topic: iceberg
order: 3
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: iceberg_l5_v1_1_refactor
project_relevance:
- north-america
project_fact_status: needs_fact_check
summary: Snapshot 通过 Manifest List 间接引用 Content File。Manifest List 先做 Manifest 级索引，Manifest 再记录具体 Data / Delete File 及其分区和统计信息，从而支持复用、裁剪和增量提交。
prerequisites:
- kb-iceberg-metadata-snapshot-001
related:
- kb-iceberg-row-level-changes-001
- kb-iceberg-partition-evolution-001
- kb-iceberg-trino-read-path-001
---
# Manifest List 与 Manifest

## 30 秒理解

先把最重要的数量关系记住：

**1 个 Snapshot → 1 个 Manifest List → N 个 Manifest → 每个 Manifest 记录 M 个 Content File**

它们存在的主要原因不是“文件分类好看”，而是两个字：

**复用 + 裁剪。**

新 Snapshot 不需要重新列出整张表所有 Data File；查询也不需要一开始打开所有 Manifest。

## 为什么 Snapshot 不直接记录所有文件

假设一张表有：

```text
100 万个 Data File
```

如果每个 Snapshot 都直接保存 100 万个路径：

- Commit 元数据会很大；
- 每次查询都要处理巨大文件列表；
- 每次新增少量文件也会重复大量旧信息。

Iceberg 因此加入两层索引：

```text
Snapshot
↓
Manifest List
↓
Manifest
↓
Content File
```

其中旧 Manifest 还能被新 Snapshot 继续复用。

所以一次小 Append（追加）不需要把历史所有文件重新描述一遍。

## Manifest List 负责什么

Manifest List 可以先理解成：

> Snapshot 的 Manifest 索引。

它会记录每个 Manifest 的一些高层信息，例如：

- Manifest 路径；
- Content 类型；
- Partition Spec ID；
- 文件数量摘要；
- Partition Summary（分区摘要）；
- Sequence Number（序列号）等。

Reader 可以先用这些摘要判断：

> 这个 Manifest 有没有可能包含查询需要的数据？

如果不可能，就不需要继续打开那个 Manifest。

这就是第一层 Metadata Pruning（元数据裁剪）。

## Manifest 负责什么

Manifest 是不可变的 Avro 元数据文件。

里面的 Manifest Entry（清单条目）会指向具体 Content File，并保存这类信息：

- File Path（文件路径）；
- Partition Data（分区值）；
- Record Count（记录数）；
- File Size（文件大小）；
- Column Metrics（列统计），例如 Lower / Upper Bounds（上下界）、Null Count（空值数）；
- Status（added / existing / deleted）；
- Sequence Number。

这些信息让 Reader 在真正打开 Parquet 以前，还能继续做第二层 File Pruning（文件裁剪）。

## 一个很容易混的点：deleted 不等于 Delete File

Manifest Entry 有状态：

```text
added
existing
deleted
```

这里的：

```text
status = deleted
```

表示：

> 这个 Content File 在元数据演进中被从新的表状态移除了。

它不等于：

> 这是一个用于删除行的 Delete File。

Row-level Delete（行级删除）是下一节的另一个对象。

这两个“delete”名字很像，但完全不是同一层。

## Data Manifest 和 Delete Manifest 为什么分开

一个 Manifest 只追踪一种 Content 类型。

可以是：

- Data Manifest；
- Delete Manifest。

不会在同一个 Manifest 里把两种 Content 混在一起。

但一个 Snapshot 的 Manifest List 可以同时引用：

```text
Data Manifests
+
Delete Manifests
```

这样 Reader 可以分别规划：

> 哪些 Data File 是候选数据？

以及：

> 哪些 Delete 信息可能影响这些 Data File？

## Manifest 和 Partition 到底是什么关系

一个非常常见的误解是：

> 一个 Partition 对应一个 Manifest。

不对。

更准确地说：

**一个 Manifest 只对应一个 Partition Spec（分区规则版本），但可以包含这个 Spec 下多个不同 Partition Value（分区值）的文件。**

例如：

```text
Partition Spec
= days(event_time)
```

同一个 Manifest 完全可以包含：

```text
2026-09-10
2026-09-11
2026-09-12
```

多个日期分区的 Data File。

所以一定要分清：

```text
Partition Spec
≠
Partition Value
≠
Manifest
```

后面 Partition Evolution 会继续把这件事讲透。

## 为什么 Manifest 是不可变的

Manifest 一旦写出就不会原地追加。

假设昨天产生：

```text
manifest-A.avro
```

今天又写入新 Data File，并不是：

> 打开 manifest-A，然后继续往里面 Append。

更接近：

```text
旧 Manifest 保留
+
产生新 Manifest
+
新 Snapshot 的 Manifest List 同时引用它们
```

如果后续需要整理 Manifest，会生成新的 Manifest，再由新的 Snapshot 引用。

这和 Data File 一样，体现了 Iceberg 的核心设计：

**用新的不可变对象表达新状态，而不是在旧对象上原地修改。**

## 两层元数据怎样帮助查询

假设 Query：

```sql
WHERE event_date = DATE '2026-09-12'
```

Reader 可以先：

```text
Manifest List
→ 用 Partition Summary 排除明显无关 Manifest
```

再进入剩余 Manifest：

```text
Manifest Entry
→ 用 Partition Data / Column Metrics 排除无关 Data File
```

最后才真正打开少量候选 Parquet。

所以查询链不是：

```text
100 万文件
→ 全部打开
→ 再过滤
```

而是：

```text
先筛 Manifest
→ 再筛 File
→ 最后 Scan
```

完整 Read Path 放到第 7 节统一串起来。

## 生产环境什么时候最关心 Manifest

当出现：

> 数据量没暴涨，但 Query Planning 越来越慢。

这时不要只盯 Worker CPU。

更应该看：

- Manifest Count；
- Manifest Entries；
- File Count；
- Manifest 是否过碎；
- Partition Summary 是否有选择性。

因为问题可能发生在：

**Metadata Planning（元数据规划）**

而不是：

**Data Scan（数据扫描）。**

## 8 MB 和 100 个 Manifest 现在要不要背

不要。

当前 Iceberg 有自动 Manifest Merge（自动清单合并）的相关配置，但它属于 Maintenance（维护）策略。

这一节只需要先记：

- Manifest 不会“写满了继续追加”；
- Manifest 多不等于一定错；
- 数量增长最终要结合 Planning Cost 判断。

具体 Target Size 和 Merge Threshold 到第 10 节再讲。

## 这一节真正要掌握什么

必须掌握：

- `Snapshot → Manifest List → Manifest → Content File`；
- Manifest List 是 Manifest 级索引；
- Manifest 是具体文件级索引；
- Manifest 不等于 Partition；
- Manifest 不可变，新 Snapshot 可以复用旧 Manifest；
- Data Manifest 与 Delete Manifest 分开。

生产上要会判断：

- Planning 慢是否来自 Manifest / File 数量膨胀；
- 为什么增加 Worker 可能完全解决不了 Metadata Planning 慢。

了解即可：

- Manifest List / Manifest 所有 Avro 字段；
- 自动 Merge 的具体默认参数。

下一节进入最底层的数据可见性：

**Data File 还在的时候，为什么其中某些行仍然可以在当前 Snapshot 中不可见？**
