---
id: kb-iceberg-maintenance-small-files-001
type: knowledge
title: Maintenance & Small Files
title_cn: 维护与小文件治理
stage_id: '04'
domain: lakehouse
topic: iceberg
order: 10
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: v0.6.1_spine
project_relevance:
- north-america
project_fact_status: needs_fact_check
summary: Rewrite Data Files、Rewrite Manifests、Expire Snapshots、Remove Orphan Files
  解决的是四类不同问题，不能把 Maintenance 简化成“定时合并小文件”。
prerequisites:
- kb-iceberg-commit-concurrency-001
related:
- kb-iceberg-production-troubleshooting-001
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

## Manifest Merge：8 MB 和 100 到底是什么

Manifest 写出后是不可变的，所以 Manifest Merge 不是“继续往旧 Manifest 里追加”，而是**重新生成新的 Manifest**。

Apache Iceberg 当前默认配置中：

- `commit.manifest-merge.enabled = true`：写入时允许自动合并 Manifest；
- `commit.manifest.min-count-to-merge = 100`：累积到足够多 Manifest 后才值得自动合并；
- `commit.manifest.target-size-bytes = 8 MB`：合并后的 Manifest 目标大小。

最重要的是：

> **8 MB 是 Merge Target，不是“Manifest 写到 8 MB 才新建下一个”的切分阈值。**

因此完全可能看到很多小于 8 MB 的 Manifest。

默认自动整理会按照文件被加入 Manifest 的顺序进行。如果写入顺序本身和常用过滤维度一致，例如按时间持续到达，那么 Manifest 的 Partition Summary 往往也更利于查询裁剪。

如果写入模式和查询模式长期不一致，可以使用 `rewriteManifests` 重新组织 Manifest，让文件在 Metadata 层重新聚类。

这也是为什么 Manifest 的“数量和布局”同时受以下因素影响：

- Data / Delete File 数量；
- Commit 频率；
- Writer 并发；
- 写入顺序；
- 自动 Manifest Merge；
- 显式 `rewriteManifests`。

旧 Snapshot 仍可能继续引用旧 Manifest，因此 Rewrite 不等于原地修改历史元数据。

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


## 关联知识

下一节进入 Production Troubleshooting，把 Write、Commit、Metadata、Planning、Scan 与 Maintenance 收成一套排障链路。
