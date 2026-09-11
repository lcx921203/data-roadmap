---
id: kb-iceberg-production-troubleshooting-001
type: knowledge
title: Iceberg Production Troubleshooting
title_cn: Iceberg 生产排障与容量思维
stage_id: "04"
domain: lakehouse
topic: iceberg
order: 11
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: v0.6.1_write_model
project_relevance:
  - north-america
project_fact_status: needs_fact_check
summary: "把线上问题按 Write、Commit、Metadata、Planning、Scan、Maintenance 六层定位，再用 SLI/SLO 与容量指标判断根因和治理优先级。"
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

线上 Iceberg 出问题时，不要先说“湖仓慢”。

先把问题放进六层之一：

**Write → Commit → Metadata → Planning → Scan → Maintenance**

然后只看这一层最相关的指标。

排障的目标不是背参数，而是先判断：

**问题发生在哪一层，上一层是什么原因，下一层受了什么影响。**

## 1. Write：文件是怎么被写坏的

先看：

- Input Rows / Bytes；
- Task Count；
- Active Partition Count；
- Files Created；
- Avg / P50 / P95 File Size；
- Distribution Mode；
- Writer Memory / Open File Count。

典型现象：

- 微批过小；
- Partition 过细；
- Spark Task 太碎；
- Fanout 同时触碰过多 Partition；
- Target File Size 和 Task Size 不匹配。

如果根因在这里，单纯做 Compaction 只能暂时缓解结果。

## 2. Commit：为什么提交慢或冲突多

先看：

- Commit Latency；
- Conflict Rate；
- Retry Count；
- Retry Total Time；
- Catalog Latency；
- Concurrent Writers；
- Snapshot Creation Rate。

典型问题是热表高并发 Writer 把瓶颈从 Storage 推到了 Catalog / Metadata Commit。

如果 Conflict Rate 长期升高，不能只继续加 Retry 次数。

还要考虑：

- 微批窗口；
- Writer 聚合；
- 调度隔离；
- Branch / WAP；
- 是否需要拆分写入热点。

## 3. Metadata：为什么“数据不大，规划却越来越重”

先看：

- Snapshot Count；
- Manifest Count；
- Manifest Entries；
- Metadata JSON 数量和大小；
- File Count Growth。

典型根因：

- 高频 Commit；
- 小 Data File 长期增长；
- Manifest 碎片；
- Snapshot 历史长期不清理。

Metadata 问题经常先于“总存储容量不足”暴露。

## 4. Planning：为什么 Query 还没开始扫数据就慢

先看：

- Planning Latency；
- Manifests Scanned；
- Files Planned；
- Files Pruned；
- Partition Selectivity；
- Predicate Pushdown 是否成立。

如果 Planning 慢，增加 Worker 通常帮助有限。

因为瓶颈发生在“决定读哪些文件”的阶段，而不是 Worker 扫描阶段。

优先回到：

**Partition → Manifest Layout → File Metrics → Predicate**

这条链检查。

## 5. Scan：为什么已经选好文件，执行还是慢

先看：

- Bytes Scanned；
- Split Count；
- Scan Throughput；
- Object Storage Latency；
- Row Groups Skipped；
- Worker Memory / Spill；
- Join / Shuffle。

典型问题包括：

- File Size 不健康；
- Column Projection 差；
- Query 本身 Join / Shuffle 很重；
- Object Storage 延迟；
- Worker 资源不足。

这时才更适合讨论 Worker、Memory、Spill 和计算资源。

## 6. Maintenance：为什么问题不断复发

先看：

- Rewrite Backlog；
- Snapshot Age；
- Manifest Count Growth；
- Small-file Ratio；
- Orphan Retention；
- Maintenance Duration / IO；
- 在线 Query 受影响程度。

Maintenance 长期欠账时，经常会出现：

**Write 能成功 → Query 也能跑 → 但 Planning / File Count / Metadata 持续恶化**

所以 Maintenance SLO 也是生产稳定性的一部分。

## SLI / SLO 怎么设计

只看最终 Query P95 不够。

应该同时维护内部 SLI，例如：

- Planning P95；
- Commit P95；
- Conflict Rate；
- Small-file Ratio；
- Manifest Count Growth；
- Freshness；
- Maintenance Backlog。

这样在用户 Query SLO 真正恶化之前，就能看到系统内部趋势。

## Capacity Planning 不只是每天多少 TB

至少还要估算：

- Daily / Peak Ingest；
- Commit Frequency；
- Active Partitions；
- Concurrent Writers；
- Files / Day；
- Snapshots / Day；
- Manifests / Day；
- Query Concurrency；
- Scan Bytes / Query；
- Retention Window。

一张 500 TB 的表不一定比一张数据量小、但每天制造几十万个小文件的表更难维护。

Iceberg 的容量规划必须同时算：

**Data Volume + Object Count + Metadata Growth + Commit Rate + Query Planning Cost**

## 事故恢复怎么选 Rollback 还是 Forward Fix

事故发生后先确认：

1. Current Snapshot 是谁；
2. 坏数据是否已经成功 Commit；
3. 坏 Snapshot 以后有没有合法 Snapshot；
4. 回退旧 Snapshot 会不会丢合法变化；
5. 是否应该在最新状态上做 Forward Fix；
6. 是否留下 Orphan File 需要后续清理。

原则仍然是：

**先以 Metadata 引用关系确认事实，再做恢复动作。**

不要先去对象存储目录手工删文件。

## 最终心智模型

学完 Iceberg L5，可以把它收成四句话：

**Correctness = Snapshot + Validation + Atomic Commit**

**Performance = Partition + File Metrics + File Layout + Metadata Layout**

**Reliability = Retry + Recovery + Maintenance**

**Production = SLO + Capacity + Observability + Cost**

这四层不是新的知识点，而是前面 10 节内容在生产环境里的最终归纳。
