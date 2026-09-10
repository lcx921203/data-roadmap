---
id: kb-iceberg-overview-001
type: knowledge
title: Apache Iceberg
stage_id: "04"
domain: lakehouse
learning_depth: L5
stack_role: core
content_status: foundation_seed
summary: "开放表格式如何用 Metadata、Snapshot 与 Manifest 把对象存储上的文件组织成可演进、可事务提交的逻辑表。"
---

# Apache Iceberg

## 30 秒理解

Iceberg 是 **Table Format（表格式）**，不是新的数据文件格式。底层数据仍然可以是 Parquet、ORC 等文件，但 Reader 不再通过“扫描目录里有哪些文件”来定义一张表，而是读取一个已经提交的 Snapshot（快照）。

这让表具备 Snapshot 隔离、Schema Evolution（模式演进）、Partition Evolution（分区演进）和更可靠的并发提交语义。

## 架构位置

```text
CDC / Batch / Events
        ↓
Spark / Flink
        ↓
Apache Iceberg
        ↓
Trino / Serving
```

Iceberg 位于计算引擎和对象存储之间的表管理层。Spark、Flink 负责读写计算，Trino 等查询引擎消费已提交的表状态。

## 核心原理

### Metadata → Snapshot → Manifest

一条简化读取链路：

```text
Table Metadata
    ↓
Snapshot
    ↓
Manifest List
    ↓
Manifest
    ↓
Data File
```

Snapshot 指向一次已提交的表状态。Manifest List 组织本次 Snapshot 涉及的 Manifest，Manifest 再记录 Data File / Delete File 等文件级元数据。

因此读取一张表的关键不是“目录下现在有多少 Parquet”，而是“当前 Snapshot 引用了哪些文件”。

### 为什么这很重要

对象存储通常没有传统数据库那种目录级事务。Iceberg 把提交点放在 Metadata / Snapshot 层，使 Reader 只看到完整提交后的版本。

## Production 实现

生产环境重点不是创建一张 Iceberg 表就结束，而是持续管理：

- Commit Concurrency（提交并发）；
- Small Files（小文件）；
- Manifest 数量和规划成本；
- Snapshot Expiration；
- Compaction；
- Schema / Partition Evolution；
- Writer Distribution 与 Ordering。

## 性能与故障

常见问题包括：

- Writer 并发过高导致 Commit 冲突和重试；
- 大量小文件让扫描和规划开销上升；
- Snapshot / Manifest 长期不维护导致 Metadata 膨胀；
- 错误的分区或写入分布让下游查询扫描过多数据。

排查时需要把问题拆成：

```text
Write
↓
Commit
↓
Metadata Planning
↓
File Scan
↓
Query Engine
```

不能把所有慢查询都归因于 Iceberg 本身。

## 关联内容

这个页面目前是 V0.5.2 的 **Foundation Seed（详情页基础种子）**，用来验证 Knowledge Markdown → Front Matter → React Detail 的完整链路。

V0.6 会把 Iceberg 扩展为完整 L5 Vertical Slice，包括 Manifest、分区、Write Ordering、Schema Evolution、并发提交、维护、故障恢复、项目映射、Scale Lab 与 Interview Mapping。
