---
id: kb-iceberg-trino-read-path-001
type: knowledge
title: Trino Read Path on Iceberg
title_cn: Trino 读取 Iceberg 的路径
stage_id: "04"
domain: lakehouse
topic: iceberg
order: 9
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: v0.6.0_spine
project_relevance:
  - north-america
project_fact_status: needs_fact_check
summary: "Trino 先加载 Iceberg 表状态，再利用 Manifest/Partition/File Metrics 规划 Split，Worker 最后读取 Parquet/ORC/Avro；规划慢与扫描慢是不同问题。"
prerequisites:
  - kb-iceberg-maintenance-small-files-001
related:
  - kb-iceberg-production-troubleshooting-001
---

# Trino Read Path on Iceberg

## 30 秒理解

Trino 查 Iceberg 时不是：

```text
Metastore
→ list partition directory
→ list files
→ scan all
```

核心链路是：

```text
Catalog
↓
Current Table Metadata
↓
Snapshot
↓
Manifest List
↓
Manifest
↓
Candidate Data Files
↓
Splits
↓
Workers read Parquet/ORC/Avro
```

所以 Query Performance 需要区分 **Planning（规划）** 与 **Execution（执行）**。

## Coordinator 规划阶段

Coordinator / Iceberg Connector 需要：

1. 加载表 Metadata；
2. 确定 Snapshot；
3. 根据 Predicate 做 Partition/Metadata Pruning；
4. 读取需要的 Manifest；
5. 从 File Metrics 进一步筛选文件；
6. 生成可调度的 Split。

如果这里很慢，增加 Worker 数量通常帮助不大。

## Worker 执行阶段

Worker 接收 Split 后读取对象存储里的文件，再利用：

```text
Parquet statistics
Predicate pushdown
Column projection
Dynamic filtering
```

减少实际读取。

如果 Planning 很快但 Scan 慢，才更多看文件尺寸、压缩、网络、列裁剪、Join、Spill 和 Worker 资源。

## Metadata Tables

排查 Iceberg 表时，不要只看业务表。

Trino Connector 可以查询类似：

```sql
SELECT *
FROM "orders$files";

SELECT *
FROM "orders$partitions";

SELECT *
FROM "orders$properties";
```

不同 Trino 版本支持的 Metadata Table 名称和列可能有所差异，生产上以实际 Connector 版本文档为准。

它们能帮助回答：

```text
到底有多少文件
每个文件多大
分区数据分布如何
当前表属性是什么
```

## Partition Pruning 与 File Pruning

两者不是同一个层次：

```text
Partition Pruning
→ 基于 Partition Spec 排除范围

File Pruning
→ 基于 Manifest 中列级统计排除 Data File
```

即使表没有传统高粒度分区，File Metrics 仍可能让 Query 跳过大量文件。

## 查询慢排查树

```text
Query total slow
├─ Planning slow
│  ├─ metadata load
│  ├─ too many manifests
│  ├─ too many files
│  └─ weak pruning
│
└─ Execution slow
   ├─ too much scan
   ├─ bad file size
   ├─ join/shuffle
   ├─ memory/spill
   └─ object storage latency
```

这比一句“Trino 慢了加 Worker”更接近生产排障。

## Serving 边界

Trino + Iceberg 很适合交互式分析和统一查询，但不意味着所有毫秒级 Serving 都应该直接打湖仓。

如果消费要求：

```text
very high QPS
strict low latency
hot-key access
fixed query shape
```

可能需要 Serving Table、Doris/ClickHouse 或 Cache。

这是查询引擎与 Serving Layer 的职责边界。

## Scale Lab

十亿/百亿级 Backfill 同时在线查询时，需要做：

```text
Backfill resource isolation
Writer commit control
File size control
Query resource group
Metadata maintenance
P95 / P99 monitoring
```

否则离线写入不仅抢 CPU，还会通过 File/Manifest Explosion 影响 Trino Planning。


## 关联知识

最后一节把前面的知识收成 Production Troubleshooting Checklist（生产排障清单）。
