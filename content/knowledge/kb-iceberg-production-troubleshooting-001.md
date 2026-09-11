---
id: kb-iceberg-production-troubleshooting-001
type: knowledge
title: Iceberg Production Troubleshooting
title_cn: Iceberg 生产排障与容量思维
stage_id: '04'
domain: lakehouse
topic: iceberg
order: 11
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: v0.6.1_spine
project_relevance:
- north-america
project_fact_status: needs_fact_check
summary: 把 Iceberg 故障按 Write、Commit、Metadata、Planning、Scan、Maintenance 六层定位，并把容量指标与
  Query SLO、Backfill 和成本连起来。
prerequisites:
- kb-iceberg-maintenance-small-files-001
related:
- kb-iceberg-overview-001
scale_scenarios:
- sc-iceberg-10b-backfill-001
- sc-iceberg-streaming-small-files-001
- sc-iceberg-concurrent-commit-001
interview_relevance:
- iq-lake-vs-warehouse-001
- iq-large-dataset-tech-selection-001
---
# Iceberg Production Troubleshooting

## 30 秒理解

线上 Iceberg 问题不要统一归类成“湖仓慢”。

先把链路切成六层：

```text
Write
↓
Commit
↓
Metadata
↓
Planning
↓
Scan
↓
Maintenance
```

每一层的现象、指标和修复手段都不同。

## 1. Write

看：

```text
input rows/bytes
task count
partition count
files created
avg/p50/p95 file size
writer memory
distribution mode
```

典型问题：微批太小、Partition 过细、Task 过碎、Fanout 同时打开太多文件。

## 2. Commit

看：

```text
commit latency
conflict rate
retry count
retry time
catalog latency
snapshot creation rate
```

典型问题：热表高并发提交、Catalog Pointer 争用、Retry Storm。

## 3. Metadata

看：

```text
snapshot count
manifest count
manifest entries
metadata json count
metadata bytes
```

典型问题：高频提交长期不维护、Manifest 碎片、历史 Snapshot 过多。

## 4. Planning

看：

```text
planning latency
manifests scanned
files planned
files pruned
partition selectivity
```

典型问题：Predicate 无法有效推导、Metadata Layout 差、文件/Manifest 太多。

## 5. Scan

看：

```text
bytes scanned
splits
scan throughput
object storage latency
Parquet row groups skipped
worker memory/spill
```

典型问题：文件过小/过大、列裁剪差、Join/Shuffle、网络或对象存储延迟。

## 6. Maintenance

看：

```text
rewrite backlog
snapshot age
orphan retention
maintenance duration
maintenance IO
online query impact
```

典型问题：Compaction 和在线查询互相打架，或者 Maintenance 长期欠账。

## SLO 思维

不要只定义：

```text
Query P95 < 5s
```

还要有内部 SLI：

```text
Planning P95
Commit P95
Conflict rate
Small-file ratio
Manifest count growth
Freshness
Maintenance backlog
```

这样 Query SLO 变坏之前就能看到趋势。

## Capacity Planning

容量不是只算“每天多少 TB”。

至少拆：

```text
Daily ingest
Peak ingest throughput
Commit frequency
Active partitions
Concurrent writers
Files/day
Snapshots/day
Manifests/day
Query concurrency
Scan bytes/query
Retention window
```

真正让 Metadata 先爆掉的，可能是“每天 50 万个小文件”，而不是“总共 500 TB”。

## 失败恢复

处理事故时先确认：

```text
Current snapshot 是谁
↓
坏数据是否已 commit
↓
之后是否还有合法 snapshot
↓
可以 rollback 还是应该 forward fix
↓
孤儿文件是否需要后续 cleanup
```

尤其不能在不知道 Snapshot 引用关系时直接手工删对象存储目录。

## 项目怎么结合

Project Case 只允许填写三类信息：

```text
ACTUAL
真实使用组件、真实数据链路、真实故障

BOUNDARY
没有做过或没有验证过的部分

SCALE EXTENSION
如果规模 ×10 / ×100，生产上如何演进
```

当前 V0.6.0 仍保持 `needs_fact_check`，不会把本章 Production Pattern 写成用户个人经历。

## Interview Mapping

当前 First 30 Interview Bank 中，与这一章直接相关的是湖仓/技术选型等更高层问题。

对于：

```text
Manifest List 有几个？
Write Ordering 源码在哪里？
Concurrent Commit 怎么做？
```

如果当前 Evidence Corpus 没有真实 Direct Evidence，DataRoadmap **不会为了覆盖知识点就伪造“高频面试题”**。

知识可以先完整，Interview Frequency 必须等真实面经证据。

## Scale Lab

本轮新增三个独立 Scale Scenario：

```text
sc-iceberg-10b-backfill-001
sc-iceberg-streaming-small-files-001
sc-iceberg-concurrent-commit-001
```

它们全部明确是 Hypothetical（假设训练），不是项目经历。

## 总结

Iceberg L5 的最终心智模型：

```text
Correctness
= Snapshot + Atomic Commit + Validation

Performance
= Partition + Metrics + File Layout + Metadata Layout

Reliability
= Retry + Recovery + Maintenance

Production
= SLO + Capacity + Observability + Cost
```

到这里，Iceberg 主干已经能支持后续 Project Case、Scale Lab 和 Interview 的真实挂接。
