---
id: iq-lake-vs-warehouse-001
type: interview
question: "Data Lake 和 Data Warehouse 有什么区别？湖仓一体解决了什么问题？"
domain: lakehouse
learning_depth: L4
answer_format_version: "1.0"

evidence:
  direct_independent_count: 4
  direct_company_count: 3

frequency:
  status: repeated_verified
  final_industry_frequency: false

verification:
  question_intent_reviewed: true
  dedup_reviewed: true
  answer_curated: true
  content_review_status: v0_3_7
  publishable: false

project_connection:
  status: needs_project_fact_check

technical_references:
  - https://iceberg.apache.org/docs/latest/

status: answer_ready
---

# Data Lake、Data Warehouse 和 Lakehouse 有什么区别？

## 这道题在考什么

面试官通常不满足于：

> Lake 存原始数据，Warehouse 存结构化数据。

真正要看的是你是否理解：

- 存储和计算是否解耦；
- 数据格式是否开放；
- 是否支持事务和并发写；
- Schema 怎么演进；
- 历史版本怎么管理；
- BI 查询性能如何保证；
- 为什么现代平台会走向 Lakehouse（湖仓一体）。

## 30 秒回答

传统 Data Warehouse（数据仓库）强调结构化建模、稳定治理和高性能分析，但数据通常被管理在特定仓库体系里。Data Lake（数据湖）更强调低成本、开放格式和多类型数据，适合存大量原始与明细数据，但传统湖在事务、一致性、Schema 管理和小文件治理上能力不足。

Lakehouse（湖仓一体）是在开放对象存储和列式文件之上，通过 Iceberg、Delta、Hudi 等 Table Format（表格式）补上 Snapshot、事务提交、Schema Evolution、Partition Evolution 等表级能力，再由 Spark、Flink、Trino 等引擎共享访问。它不是“把湖和仓放一起”，而是让湖上的数据具备更多仓库级管理能力。

## 核心原理

可以从四层理解：

```text
Storage
Object Storage / HDFS
        ↓
File Format
Parquet / ORC
        ↓
Table Format
Iceberg / Delta / Hudi
        ↓
Compute / Query
Spark / Flink / Trino
```

### Data Lake 的优势

- 存储成本低；
- 文件格式开放；
- 计算与存储可以解耦；
- 多引擎共享；
- 适合大规模原始和明细数据。

### 传统 Lake 的痛点

如果只有：

```text
S3/HDFS + Parquet
```

很难优雅解决：

- 并发写入；
- 原子提交；
- Delete / Update；
- Schema Evolution；
- Partition Evolution；
- Time Travel；
- 文件清单与 Snapshot；
- 失败写入清理。

### Lakehouse 补了什么

以 Iceberg 为例，表不再只是一个目录，而有：

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

Reader 读取已提交 Snapshot，而不是随意扫描“目录里现在有哪些文件”。

因此可以提供更可靠的：

- Snapshot Isolation 类读语义；
- 原子提交；
- Time Travel；
- Schema Evolution；
- Hidden Partitioning；
- 多引擎共享。

## Production 实现

一个典型现代架构：

```text
CDC / Batch / Events
        ↓
Lakehouse Tables
        ↓
Spark / Flink
        ↓
dbt / Semantic Model
        ↓
Trino / OLAP / Serving
```

Lakehouse 不意味着所有查询都直接扫明细湖表。

高并发低延迟场景仍可能需要：

- Serving Table；
- 物化聚合；
- Doris / StarRocks；
- Cache。

## 故障排查

如果“湖表查不到最新数据”，不要只看对象存储有没有新 Parquet 文件。

应该确认：

```text
Writer 是否完成 Commit
↓
当前 Snapshot 是否更新
↓
Catalog 是否指向正确 Metadata
↓
Query Engine 是否读到新 Snapshot
↓
Cache / Metadata Cache 是否刷新
```

对象存储里“有文件”不等于这个文件已经成为表的有效数据。

## 常见错误回答

- “Lake 是 Schema-on-read，Warehouse 是 Schema-on-write”，然后结束。
- “用了 Iceberg 就不需要数仓建模。”
- “Lakehouse 可以替代所有 OLAP Serving。”
- “一个 S3 目录放 Parquet 就等于 Lakehouse。”

## 项目怎么结合

如果北美项目真实采用 Iceberg + Trino，可以把它作为 Lakehouse 项目锚点；但具体为什么选 Iceberg、实际写入方式、Catalog、Serving 和并发模型仍需按源码/事实核验后再写成项目经历。

## Scale Lab

假设湖表每天新增 100 TB：

```text
High-throughput writes
→ Small files
→ Manifest growth
→ Metadata pressure
→ Query planning cost
```

此时要讨论：

- File Size；
- Compaction；
- Manifest Rewrite；
- Snapshot Expiration；
- Commit 冲突；
- Backfill；
- Serving 隔离。

## 真实关联追问

1. Iceberg 和 Parquet 是什么关系？
2. Iceberg 为什么不依赖目录 Listing 作为表状态？
3. Lakehouse 是否还需要 DWD/DWS？
4. Iceberg vs Hudi vs Delta 怎么选？
5. 为什么还需要 Trino？
6. Lakehouse 为什么仍可能需要 Serving 层？
