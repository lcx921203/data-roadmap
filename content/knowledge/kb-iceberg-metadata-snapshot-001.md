---
id: kb-iceberg-metadata-snapshot-001
type: knowledge
title: Table Metadata & Snapshot
title_cn: 表元数据与快照
stage_id: "04"
domain: lakehouse
topic: iceberg
order: 2
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: v0.6.1_read_model
project_relevance:
  - north-america
project_fact_status: needs_fact_check
summary: "Catalog 定位当前 Table Metadata；Table Metadata 指向当前 Snapshot；Snapshot 是不可变的逻辑表版本，而不是一份全量数据副本。"
prerequisites:
  - kb-iceberg-overview-001
related:
  - kb-iceberg-manifest-tree-001
  - kb-iceberg-commit-concurrency-001
---

# Table Metadata & Snapshot

## 30 秒理解

Iceberg 的 Reader 不是从数据目录开始，而是先找到 **Current Table Metadata（当前表元数据）**。

Table Metadata 再告诉 Reader 当前 Snapshot 是谁。

**Snapshot = 某一时刻不可变的逻辑表版本，不是全表数据复制。**

只有已经成功提交并成为 Current 的 Snapshot，才属于当前可见表状态。

## Catalog 与 Table Metadata

不同 Catalog 的实现可以不同，但对 Reader 来说都有一个共同职责：

**找到这张表当前使用哪份 Table Metadata。**

Table Metadata 维护的是表级信息，例如：

- Current Schema；
- Partition Specs；
- Sort Orders；
- Table Properties；
- Snapshot 列表与历史；
- Current Snapshot ID；
- Branch / Tag 等 Snapshot Reference。

因此 Table Metadata 描述的是“这张表现在是什么状态”，而不是存放业务行数据。

## Snapshot 到底是什么

Snapshot 可以理解成一个不可变的版本节点。

它不会复制整张表，而是继续向下引用 Manifest List，再通过 Manifest 找到这个版本需要的数据和删除信息。

所以应该记成：

**Snapshot = 文件集合的逻辑版本**

而不是：

**Snapshot = 一份完整的数据副本**

这也是 Iceberg 能保留多个历史版本而不必每次复制全表的基础。

## Reader 为什么能看到稳定版本

假设 Reader 开始查询时读取到了 Snapshot S10。

此时另一个 Writer 提交了 S11。

已经基于 S10 开始规划的 Reader 仍然可以继续沿 S10 的 Metadata 引用链完成这次读取；新的 Reader 再进入时，才可能看到更新后的 Current Snapshot。

这里先只理解一个结论：

**Reader 先固定一个已提交的表状态，再读取这个状态引用的文件。**

并发 Commit、Validation 和 Retry 放到后面的 Commit 章节集中讲。

## “文件已经写出来”和“数据已经可见”不是一回事

Writer 可以先把 Parquet、Manifest 等文件写到对象存储。

但只要 Current Table Metadata 没有成功切换到包含这些文件的新状态，Reader 就不会因为“目录里出现了文件”自动把它们读进来。

因此：

**Physical File Exists（物理文件存在） ≠ Visible Table State（当前表状态可见）**

这个区别是理解 Iceberg 一致性的核心。

## Time Travel 为什么成立

历史 Snapshot 如果仍被 Metadata 保留，并且其引用的文件还没有被生命周期策略清理，就可以继续作为历史版本读取。

所以 Time Travel（时间旅行）的基础不是“备份了一份表”，而是：

**历史 Snapshot + 仍然有效的 Metadata 引用链**

至于 Snapshot Expiration（快照过期）怎样控制历史窗口，放到 Maintenance 章节统一讲。

## 这一节和下一节怎么连接

现在已经知道：

**Table Metadata → Current Snapshot**

但 Snapshot 自己并不会直接塞进成千上万个 Data File 路径。

下一节继续向下：

**Snapshot → Manifest List → Manifest**

回答一个 Snapshot 怎样高效找到大量 Content File。
