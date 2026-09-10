---
id: kb-iceberg-maintenance-small-files-001
type: knowledge
title: Maintenance & Small Files
title_cn: 维护与小文件治理
stage_id: "04"
domain: lakehouse
topic: iceberg
order: 8
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: v0.6.0_spine
project_relevance:
  - north-america
project_fact_status: needs_fact_check
summary: "Rewrite Data Files、Rewrite Manifests、Expire Snapshots、Remove Orphan Files 解决的是四类不同问题，不能把 Maintenance 简化成“定时合并小文件”。"
prerequisites:
  - kb-iceberg-commit-concurrency-001
related:
  - kb-iceberg-trino-read-path-001
scale_scenarios:
  - sc-iceberg-streaming-small-files-001
---

# Maintenance & Small Files

## 30 秒理解

Iceberg Maintenance 至少分四类：

```text
Rewrite Data Files
→ 治理小文件 / 文件布局

Rewrite Manifests
→ 治理元数据规划布局

Expire Snapshots
→ 缩短历史版本与释放不再引用的文件

Remove Orphan Files
→ 删除从未进入任何有效 Metadata 引用链的孤儿文件
```

它们不是一回事。

## Small Files 为什么贵

大量小文件会把成本分散到整个链路：

```text
Writer
→ more file creates

Metadata
→ more manifest entries

Planner
→ more splits / file planning

Object Storage
→ more GET / metadata operations

Worker
→ more open / scheduling overhead
```

所以小文件不是纯 Storage 问题。

## Rewrite Data Files

Compaction（文件压实）把多个小 Data File 重写成较大的文件。

但它是 **Rewrite**：

```text
old files
↓ read
new files
↓ write
new snapshot
```

会消耗计算、IO，并和在线写入/查询竞争资源。

生产上要做 Partition/Time 范围限制和资源隔离，而不是每天扫全表。

## Rewrite Manifests

即使 Data File 尺寸健康，Manifest 也可能因为高频 Commit 长期碎片化。

Manifest Rewrite 的目标是改善：

```text
Manifest count
Partition clustering
Planning selectivity
```

它不改变业务数据内容。

## Expire Snapshots

每次成功写入产生 Snapshot。长期不 Expire 会让 Metadata 历史不断膨胀。

但 Expire 前要先定义：

```text
Time Travel window
Rollback window
Audit / compliance
Backfill dependency
Branch / tag retention
```

过期后，相应历史版本将不能再被正常 Time Travel。

## Remove Orphan Files

典型孤儿来源：

```text
Writer uploaded files
↓
Commit failed permanently
↓
files never referenced by valid metadata
```

Orphan Cleanup 必须有安全 Retention Window。

绝对不要：

```text
list data directory
→ 找“不认识”的文件
→ 立刻删
```

因为并发 Writer 可能刚写完文件、尚未完成 Commit。

## Production Schedule

一个健康策略更像：

```text
Continuous:
  monitor file/manifest/commit metrics

Frequent:
  selective small-file rewrite

Periodic:
  manifest rewrite
  snapshot expiration

Conservative:
  orphan file cleanup
```

频率取决于写入模式，不使用统一 Cron 模板。

## Trino 运维视角

Trino Iceberg Connector 可以暴露 Metadata Tables，并提供部分表维护操作。运营上可以先用 `$files`、`$partitions`、`$manifests` 等信息判断问题，再决定是否 Optimize。

先观察，再 Rewrite。

## Scale Lab

低延迟 Streaming 场景：

```text
10 秒一个 micro-batch
× 100 partitions
× 24h
```

即使每批数据不大，也可能制造海量文件/Manifest。

系统设计题里要同时回答：

- 延迟 SLA；
- Commit Window；
- Target File Size；
- Compaction Trigger；
- Maintenance Resource Pool；
- Query SLO 保护。

## 项目案例

当前不宣称项目实际执行过哪种 Maintenance Procedure。该部分在 Project Fact Check 后再挂 Actual。

## 关联知识

下一节进入 Trino Read Path，观察前面的 Metadata 设计怎样直接影响查询规划。
