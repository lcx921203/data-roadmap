---
id: kb-iceberg-overview-001
type: knowledge
title: Apache Iceberg
title_cn: Iceberg 总览
stage_id: "04"
domain: lakehouse
topic: iceberg
order: 1
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: v0.6.1_read_model
project_relevance:
  - north-america
project_fact_status: needs_fact_check
summary: "先建立 Iceberg 的核心心智模型：Catalog 定位当前表状态，Snapshot 固定一个逻辑版本，再通过 Manifest 元数据找到真正的数据与删除信息。"
prerequisites:
  - kb-storage-file-formats
related:
  - kb-iceberg-metadata-snapshot-001
  - kb-iceberg-manifest-tree-001
scale_scenarios:
  - sc-iceberg-10b-backfill-001
  - sc-iceberg-streaming-small-files-001
---

# Apache Iceberg

## 30 秒理解

Iceberg 是 **Table Format（表格式）**，不是 Parquet 的替代品。

Parquet 解决“一个文件怎么存”；Iceberg 解决“一张表当前由哪些文件组成、当前版本是什么、如何提交变化、如何演进”。

先记住一条主链：

**Catalog → Table Metadata → Snapshot → Manifest List → Manifest → Data / Delete Content**

后面 6 节只是在把这条链逐层拆开。

## Iceberg 到底解决什么问题

对象存储里可以有很多 Parquet 文件，但“有文件”并不等于“有一张可靠的表”。

一个真正可用的表还需要回答：

- 当前哪些文件属于这张表；
- 哪些旧文件已经被替换；
- Reader 应该看到哪个稳定版本；
- 多个 Writer 同时写入时谁能提交成功；
- Schema 和 Partition 改变后旧文件怎么继续读；
- 查询怎样在真正扫描数据前先排除大量无关文件。

Iceberg 把这些问题从“目录约定”提升成显式的表元数据。

## 三层心智模型

可以把 Iceberg 先分成三层。

**第一层：表状态入口**

Catalog 保存或定位当前 Table Metadata。Reader 从这里进入当前表状态。

**第二层：元数据索引**

Table Metadata、Snapshot、Manifest List、Manifest 一层层缩小范围，并描述当前版本包含哪些 Content File。

**第三层：物理内容**

Data File 保存真实行数据；Delete File / Deletion Vector 保存哪些行在当前版本中不可见。

这三层合起来，才是一张 Iceberg 表。

## 为什么不靠目录 List

传统 Hive 风格常把分区直接映射成目录，再通过目录和文件 List 发现数据。

Iceberg 的关键变化是：

**Reader 不去猜“目录里现在有哪些文件”，而是读取一个已经提交成功的表状态。**

因此即使对象存储里存在尚未提交或已经失效的文件，只要它们不在当前 Metadata 引用链里，就不属于当前可见表状态。

## Iceberg 在架构中的位置

Spark、Flink、Trino 属于 Compute Engine（计算引擎）；S3、OSS、HDFS 属于 Storage（存储）。

Iceberg 位于两者之间，定义：

- 表状态；
- Schema 与 Partition；
- Snapshot；
- Data / Delete File 的元数据索引；
- Commit 语义。

所以同一张 Iceberg 表可以被多个支持 Iceberg 的引擎读取，而不是绑定某一个计算框架。

## 为什么先学“读”，再学“写”

这一章前半段先回答：

**Reader 怎样从 Catalog 一路找到当前应该读取的行？**

顺序是：

**表状态 → Snapshot → Manifest → Data/Delete → Partition/Schema → Trino Read Path**

等读路径完整以后，再进入：

**Write → Commit → Maintenance → Troubleshooting**

这样写入、并发提交和维护都能挂回已经建立好的表状态模型，而不是变成孤立知识点。

## 关联知识

下一节进入 **Table Metadata 与 Snapshot**。

先回答最基础的问题：为什么一个 Reader 能看到一个稳定版本，而不是写入过程中不断变化的文件集合。
