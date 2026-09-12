---
id: kb-iceberg-maintenance-small-files-001
type: knowledge
title: Maintenance, Snapshot Lifecycle & Metadata Growth
title_cn: Maintenance、Snapshot 生命周期与元数据增长
stage_id: '04'
domain: lakehouse
topic: iceberg
order: 10
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: iceberg_l5_v1_1_refactor
project_relevance:
- north-america
project_fact_status: needs_fact_check
summary: Iceberg Maintenance 不是单一 Compaction，而是分别治理 Data File、Manifest、Snapshot / Metadata 与 Orphan。核心不是定时执行所有 Action，而是根据文件布局、查询规划、Time Travel / Recovery 窗口和元数据增长选择治理动作。
prerequisites:
- kb-iceberg-commit-concurrency-001
related:
- kb-iceberg-production-troubleshooting-001
scale_scenarios:
- sc-iceberg-streaming-small-files-001
---
# Maintenance、Snapshot 生命周期与元数据增长

## 30 秒理解

Iceberg Maintenance（维护）至少要分成四类：

**Rewrite Data Files（重写数据文件）**  
→ 治小文件和数据物理布局。

**Rewrite Manifests（重写清单）**  
→ 治 Manifest 碎片和元数据索引布局。

**Expire Snapshots（快照过期）**  
→ 治历史版本、Time Travel / Recovery 窗口和旧文件生命周期。

**Remove Orphan Files（清理孤儿文件）**  
→ 清理由失败 / 未完成写入留下、从未进入有效引用链的文件。

它们解决的是完全不同的问题。

不能统一叫：

> “定时 Compaction”。

## 为什么小 Data File 会一路放大成本

小文件首先是写入布局问题，但影响会一路传导：

**更多 Data File → 更多 Manifest Entry → 更多 Planning 对象 → 更多 Split / File Open → 更高查询与调度开销**

所以小文件不只是：

> Storage 上文件太多。

它会同时伤害：

- Metadata 规模；
- Query Planning；
- Object Storage Open Cost；
- Worker Scheduling；
- Maintenance 本身。

这也是为什么第 8 节强调：

**先查 Writer Layout，再谈 Compaction。**

## Rewrite Data Files

Rewrite Data Files 会：

```text
读取一批旧 Data File
↓
按新的大小 / 排序 / 聚集策略生成新文件
↓
通过新 Snapshot 替换旧文件
```

适合：

- Small File（小文件）过多；
- 文件大小分布失衡；
- 需要重新聚集 / 排序；
- Delete 积累导致读放大，需要通过重写清理旧布局。

它会消耗：

- 大量 Read IO；
- Write IO；
- Compute；
- Commit / Metadata 资源。

所以生产上不应该默认：

> 每天全表 Compaction。

通常应该限制：

- 时间范围；
- Partition；
- Rewrite Bytes；
- 并发；
- 资源池；
- 在线 Query 影响。

## Rewrite Manifests

Data File 大小很健康，不代表 Manifest 一定健康。

高频 Commit 可能持续产生很多小 Manifest。

Rewrite Manifests 主要做：

> **重新组织 Metadata Index（元数据索引）**

而不是重写业务数据。

它可以改善：

- Manifest Count；
- Partition Clustering；
- Planning Selectivity（规划选择性）。

如果写入顺序和主要查询过滤模式长期不一致，可以显式使用：

```text
rewriteManifests
```

重新把文件分组到更适合查询规划的 Manifest。

## 8 MB 和 100 到底控制什么

当前 Apache Iceberg 默认配置中：

- `commit.manifest-merge.enabled = true`
- `commit.manifest.min-count-to-merge = 100`
- `commit.manifest.target-size-bytes = 8 MB`

重点解释：

**8 MB 是 Merge Target，不是“Manifest 写到 8 MB 才新建下一个”的切分阈值。**

`100` 也不是：

> 一个 Snapshot 最多 100 个 Manifest。

它表示自动 Manifest Merge 中：

> 至少积累到一定 Manifest 数量后，系统才值得尝试合并。

而且 Manifest 是不可变文件。

所以 Merge 本质是：

```text
读取 / 重新组织旧 Manifest Entry
↓
生成新的 Manifest
↓
新的表状态引用新 Manifest
```

不是：

> 打开旧 Manifest 原地继续写。

这些具体默认值属于 **当前配置事实**。

理解机制比背数字更重要。

## 为什么 Manifest 会越来越多

主要因素包括：

- Data / Delete File 数量；
- Commit Frequency（提交频率）；
- Writer 并发；
- Partition / Sort 布局；
- 写入顺序；
- 自动 Manifest Merge；
- 显式 `rewriteManifests`。

所以没有一个通用答案：

> “一张表应该有多少 Manifest 才正常？”

真正看的是：

```text
Manifest Count Growth
+
Planning Latency
+
Files Planned / Pruned
```

是否持续恶化。

## Snapshot 生命周期和 Time Travel 是同一个问题的两面

第 2 节已经知道：

> Time Travel 依赖历史 Snapshot 及其引用的文件仍然存在。

所以 Expire Snapshots 不是单纯：

> “清理 Metadata”。

它会直接改变：

**历史读取和恢复能力。**

当前官方 Maintenance 语义中：

> 被 Expire 的 Snapshot 不再可用于 Time Travel；只有当 Data File 不再被任何需要保留的 Snapshot 引用时，才可以物理删除。

所以你必须先定义：

```text
Time Travel Window
Rollback / Recovery Window
Audit / Compliance
Branch / Tag Retention
Backfill Dependency
```

再设计 Snapshot Retention。

## 当前默认 Retention 要不要背

当前 Iceberg 配置里常见默认值包括：

```text
history.expire.max-snapshot-age-ms
→ 5 days

history.expire.min-snapshots-to-keep
→ 1
```

非 main Snapshot Reference 还有自己的保留策略。

但这类默认值只适合作为：

**当前基线参考**

不应该拿来当生产设计答案。

生产上：

> 财务审计表、CDC 临时表、实时日志表

可能需要完全不同的历史窗口。

## Branch / Tag 为什么会影响 Snapshot Expiration

Branch / Tag 都是 Snapshot Reference（快照引用）。

Expire Snapshot 时不能只看：

> Snapshot 年龄到了没有。

还要看：

> 有没有 Branch / Tag 的 Retention Policy 仍然要求保留它？

特别是 Branch 可能还需要保留一定数量 / 年龄的祖先 Snapshot。

所以：

**Snapshot Retention 是引用图上的生命周期管理，不只是按日期批量删除。**

## Table Metadata JSON 和 Snapshot 也不是同一回事

每次表元数据变化都会产生新的 Metadata JSON。

即使频繁 Commit 以外，Schema / Property 等变化也可能增加 Metadata 版本。

Iceberg 还提供：

```text
write.metadata.previous-versions-max
write.metadata.delete-after-commit.enabled
```

等属性控制旧 Metadata JSON 的跟踪 / 删除行为。

所以生产上要区分：

```text
Snapshot Growth
≠
Metadata JSON Growth
```

它们相关，但不是一个计数。

## Remove Orphan Files 为什么必须保守

Orphan File（孤儿文件）常见来源：

```text
Writer 上传文件
↓
Commit 最终没有成功
↓
文件从未进入任何有效 Metadata 引用链
```

这类文件最终可以清理。

但危险在于：

> 一个正在写入、尚未 Commit 的合法文件，看起来也暂时“没有被当前 Metadata 引用”。

所以不能：

```text
列目录
→ 发现没引用
→ 马上删
```

当前 Spark Procedure 的默认 Orphan Retention 约为 3 天。

官方也明确警告：

> Retention 比最长写入时间还短，可能误删 In-flight File（正在写入的文件）并损坏表。

因此生产上宁可保守。

## 一个生产问题：Time Travel 突然查不到上周版本

不要只查 Trino / Spark SQL 语法。

沿生命周期看：

```text
目标 Snapshot 还在吗？
↓
是否被 Expire？
↓
Tag / Branch 是否保护了它？
↓
它需要的 Data / Manifest 是否仍然存在？
↓
Retention Policy 最近有没有改？
```

很多“Time Travel 失败”并不是查询引擎坏了。

而是：

**历史生命周期已经被 Maintenance 改变。**

## Maintenance 什么时候运行

不要给所有表统一一个：

```text
每天凌晨 2 点全部 Compaction
```

更合理的是按信号治理：

- Small-file Ratio 恶化 → 选择性 Rewrite Data Files；
- Planning Cost / Manifest Count 恶化 → Rewrite Manifests；
- 到达业务历史窗口 → Expire Snapshots；
- Orphan 超过安全窗口 → Remove Orphan Files；
- Metadata JSON 持续膨胀 → 治理 Metadata Lifecycle。

流式表还要额外注意：

> Commit 太频繁会同时制造 Snapshot、Manifest 和 Metadata 压力。

所以调大 Micro-batch / Commit Interval 本身也是 Maintenance Strategy 的上游治理。

## 这一节真正要掌握什么

必须掌握：

- Data File、Manifest、Snapshot、Metadata JSON、Orphan 是不同生命周期对象；
- Rewrite Data Files 和 Rewrite Manifests 不是同一种 Compaction；
- Expire Snapshot 会影响 Time Travel / Recovery；
- Orphan Cleanup 不能用过短安全窗口；
- Maintenance 应由问题类型驱动。

生产上要会判断：

- 小文件问题什么时候该改 Writer，什么时候该 Rewrite；
- Time Travel Window 应如何影响 Snapshot Retention；
- 为什么 Orphan Cleanup 有数据损坏风险；
- 为什么流式高频 Commit 会把 Metadata 越写越重。

了解即可：

- 所有 Action 参数；
- 当前默认 Retention 数字的逐项背诵。

下一节不再继续增加机制。

而是把前 10 节压成一张生产排障地图：

**看到慢、错、冲突、历史版本丢失或小文件爆炸时，第一步应该先定位哪一层？**
