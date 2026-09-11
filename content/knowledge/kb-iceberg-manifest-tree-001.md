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
content_status: v0.6.1_spine
project_relevance:
  - north-america
project_fact_status: needs_fact_check
summary: "一个 Snapshot 通过 Manifest List 引用多个 Manifest；每个 Manifest 只追踪一种 Content、只对应一个 Partition Spec，但可以覆盖该 Spec 下多个 Partition Value。"
prerequisites:
  - kb-iceberg-metadata-snapshot-001
related:
  - kb-iceberg-row-level-changes-001
  - kb-iceberg-partition-evolution-001
  - kb-iceberg-trino-read-path-001
---

# Manifest List & Manifest

## 30 秒理解

先抓住主关系：

**1 个 Snapshot → 1 个 Manifest List → N 个 Manifest → 每个 Manifest 记录 M 个 Content Files。**

这里的 Content File 有两类：

- Data File（数据文件）；
- Delete File / Deletion Vector（删除信息，取决于表格式版本）。

但要注意一个很重要的限制：

> **同一个 Manifest 要么是 Data Manifest，要么是 Delete Manifest，不能同时混放 Data File 和 Delete File。**

一个 Snapshot 的 Manifest List 可以同时列出 Data Manifests 和 Delete Manifests。

## Manifest List 记录什么

Manifest List 是某个 Snapshot 的 Manifest 索引。

它记录的是 **Manifest 级别**的信息，例如：

- Manifest 文件位置与大小；
- Manifest 的 Content 类型：data 或 deletes；
- Partition Spec ID；
- added / existing / deleted files count；
- Partition Summary（分区范围摘要）；
- Manifest 的 Sequence Number（序列号）等。

因此 Reader 可以先在 Manifest List 这一层判断哪些 Manifest 值得继续读取。

完整的 Query Pruning（查询裁剪）链路放到后面的 **Trino Read Path & Pruning** 统一讲，这里先只建立结构。

## Manifest 记录什么

Manifest 是一个 **Immutable Avro File（不可变 Avro 元数据文件）**。

它保存一组 Manifest Entry。每条 Entry 指向一个 Content File，并记录：

- file path；
- partition data；
- record count；
- file size；
- column metrics，例如 lower / upper bounds、null counts；
- status：added / existing / deleted；
- sequence number 等追踪信息。

`status = deleted` 表示这个 Content File 在元数据生命周期中的删除状态，**不等于“这是一个行级 Delete File”**。两者不要混淆。

## Manifest 与 Partition 的关系

Manifest **不等于一个 Partition**。

更准确的规则是：

> **一个 Manifest 只对应一个 Partition Spec（分区规范），但可以包含这个 Spec 下多个不同 Partition Value 的文件。**

例如同一个 Spec 是 `days(event_time)`，一个 Manifest 完全可以记录：

- `2026-09-10` 的多个 Data File；
- `2026-09-11` 的多个 Data File；
- `2026-09-12` 的多个 Data File。

前提是这些文件都使用同一个 Partition Spec。

当 Partition Spec 演进时，旧文件继续留在旧 Spec 对应的 Manifest，新数据使用新 Spec，并进入与新 Spec 对应的 Manifest。

所以不能把 Manifest 理解成：

`partition=2026-09-10/` 目录下面固定存在一个 `manifest.avro`。

Iceberg 的 Metadata Tree（元数据树）和对象存储目录布局是两套概念。

## 为什么需要 Manifest List + Manifest 两层

如果 Snapshot 直接保存成千上万甚至上百万个 Content File 路径，每次提交与查询规划都要处理一个巨大的文件清单。

两层结构解决两个问题：

- **复用**：新 Snapshot 可以继续引用已有 Manifest；
- **裁剪**：先用 Manifest List 的摘要筛 Manifest，再进入 Manifest 看具体文件。

因此 Manifest 不只是“文件列表”，它也是 Iceberg Metadata Index（元数据索引）的一部分。

## Manifest 为什么不会被下一次 Commit 继续写满

Manifest 写出后就是不可变文件。

因此：

**旧 Manifest 没达到 8 MB ≠ 下一次 Commit 会重新打开它继续追加。**

新写入会产生新的 Manifest；提交时可以继续复用旧 Manifest，也可能根据 Commit 类型和 Manifest Merge 策略生成合并后的新 Manifest。

`8 MB`、自动 Merge 和 `rewriteManifests` 的完整含义统一放到 **Maintenance & Metadata Growth** 讲，避免在结构章节提前混入治理机制。

## 这一节先记住什么

只记住四句话：

1. **一个 Snapshot 有一个 Manifest List。**
2. **一个 Manifest List 可以引用多个 Manifest。**
3. **一个 Manifest 只追踪一种 Content，并且只对应一个 Partition Spec。**
4. **Manifest 是不可变的；新 Snapshot 可以复用旧 Manifest。**

下一节进入 Data File / Delete File，解释 Manifest 最终追踪的“内容文件”到底是什么，以及 Iceberg 怎样表达行级 Update / Delete。
