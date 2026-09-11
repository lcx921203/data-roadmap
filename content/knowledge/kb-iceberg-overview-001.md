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
content_status: v0.6.1_spine
project_relevance:
  - north-america
project_fact_status: needs_fact_check
summary: "先建立主线：Iceberg 用 Metadata、Snapshot、Manifest 和原子提交，把对象存储上的文件组织成可事务、可演进的逻辑表。"
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

Iceberg 是 **Table Format（表格式）**，不是 Parquet 的替代品。Parquet 解决“单个文件怎么存”，Iceberg 解决“一张表由哪些文件组成、当前版本是什么、如何提交、如何演进、如何让多个引擎看到一致的表状态”。

先只记住一条主链：

**Catalog → Table Metadata → Snapshot → Manifest List → Manifest → Data / Delete Files**

Reader 读取的是某个已提交 Snapshot 所代表的稳定表状态，而不是临时去目录里猜“现在有哪些文件”。这条主链先解决“表状态最终如何定位到真实数据文件”，后面的章节再逐层展开每一层为什么存在。

## 为什么需要它

传统 Hive 风格表常把分区目录放进 Metastore，再依赖文件系统 List 找数据文件。数据规模上来以后，会遇到分区元数据膨胀、目录 List 开销、Schema/Partition 演进困难，以及多 Writer 提交一致性等问题。

Iceberg 把“表状态”显式写进 Metadata Tree（元数据树），让计算引擎能在对象存储上获得更接近数据库表的版本与提交语义。

## 在架构中的位置

```text
MySQL / SaaS / Events
        ↓
Kafka / Batch
        ↓
Spark / Flink
        ↓
      Iceberg
        ↓
Trino / Spark / Flink
        ↓
Semantic / Serving / BI / Agent
```

Spark、Flink、Trino 是 Engine（引擎）；S3、OSS、HDFS 是 Storage（存储）；Iceberg 处在两者之间，定义表的元数据、快照、文件集合和提交协议。

## Iceberg 的完整链路

Iceberg 的读写与运维可以沿下面这条链理解：

```text
表状态
→ Table Metadata / Snapshot
→ Manifest List / Manifest
→ Data File / Delete File
→ Partition / Schema
→ Trino Read Path / Pruning
→ Write Distribution / Ordering
→ Commit
→ Maintenance
→ Production Troubleshooting
```

理解这条线后，再看源码、配置和故障现象会容易很多。

## Production 实现

生产设计至少要回答：

- Catalog 用什么，谁保存当前 Metadata Pointer；
- Writer 如何分布数据、控制文件尺寸；
- 并发 Commit 冲突如何重试；
- Snapshot / Manifest / Orphan File 如何维护；
- Schema / Partition 如何无停机演进；
- Query 如何利用 Manifest 与文件统计裁剪；
- 监控哪些指标能提前发现小文件、元数据膨胀和 Commit Contention（提交争用）。

## 大规模下会发生什么

当写入频率、分区数、并发 Writer、Backfill 规模继续增长，最先出现的问题往往不是“Parquet 读不动”，而是：

```text
Too many tiny files
        +
Too many manifests
        +
Commit contention
        +
Planning cost
        +
Maintenance pressure
```

因此 Iceberg 的生产能力，本质上是“文件布局 + 元数据布局 + 提交协议 + 生命周期维护”四件事一起做。

## 关联知识

下一节先进入最上层的 **Table Metadata 与 Snapshot**，理解为什么 Reader 能看到稳定版本。
