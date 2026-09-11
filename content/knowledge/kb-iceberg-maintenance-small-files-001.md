---
id: kb-iceberg-maintenance-small-files-001
type: knowledge
title: Maintenance & Metadata Growth
title_cn: 维护与元数据增长
stage_id: "04"
domain: lakehouse
topic: iceberg
order: 10
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: v0.6.1_write_model
project_relevance:
  - north-america
project_fact_status: needs_fact_check
summary: "Maintenance 不是一种 Compaction：Data File、Manifest、Snapshot/Metadata 与 Orphan 分别有不同增长机制和治理动作。"
prerequisites:
  - kb-iceberg-commit-concurrency-001
related:
  - kb-iceberg-production-troubleshooting-001
scale_scenarios:
  - sc-iceberg-streaming-small-files-001
---

# Maintenance & Metadata Growth

## 30 秒理解

Iceberg Maintenance 先按对象分开：

- **Rewrite Data Files**：治理小 Data File 和物理布局；
- **Rewrite Manifests**：治理 Manifest 数量和元数据布局；
- **Expire Snapshots / Metadata Lifecycle**：治理历史版本；
- **Remove Orphan Files**：清理从未进入有效引用链的孤儿文件。

它们解决的是不同问题，不能统一理解成“定时合并”。

## 为什么小 Data File 会一路放大成本

大量小文件不只是 Storage 问题。

它会一路向上放大：

**更多 Data File → 更多 Manifest Entry → 更多 Planning 对象 → 更多 Split / File Open → 更高查询与调度开销**

所以小文件的根因通常先在 Write Distribution、Partition 粒度和 Micro-batch 大小里找。

Rewrite Data Files 是后续治理，不应该替代 Writer Layout 设计。

## Rewrite Data Files

Rewrite Data Files 会读取旧 Data File，重新生成更合理的新文件，再通过新 Snapshot 替换旧文件。

适合解决：

- 小文件过多；
- 文件大小分布失衡；
- 需要重新聚集 / 排序的 Data Layout。

它本身会消耗大量 IO 和 Compute。

因此生产上通常要限制 Rewrite 范围，例如按时间或 Partition 分批进行，并与在线查询做资源隔离。

## Rewrite Manifests

即使 Data File Size 很健康，高频 Commit 仍然可能让 Manifest 越来越碎。

Rewrite Manifests 不重写业务数据，而是重新组织 Metadata Index。

它主要改善：

- Manifest Count；
- Partition Clustering；
- Planning Selectivity。

Apache Iceberg 会按 Manifest / File 被加入的顺序自动进行 Manifest Compact；当写入顺序与常用查询过滤模式一致时，这种自然聚集就比较有效。

如果写入模式与查询模式长期不一致，可以显式执行 `rewriteManifests`，重新把 Data File 分组到更适合查询裁剪的 Manifest。

## 8 MB 和 100 到底控制什么

Apache Iceberg 当前默认配置中：

- `commit.manifest-merge.enabled = true`
- `commit.manifest.min-count-to-merge = 100`
- `commit.manifest.target-size-bytes = 8 MB`

其中：

**8 MB 是 Merge Target，不是“Manifest 写到 8 MB 才新建下一个”的切分阈值。**

`100` 也不是“一个 Snapshot 最多 100 个 Manifest”。

它表示在自动合并策略中，需要积累到足够数量的 Manifest 后才值得尝试 Merge。

Manifest 已经写出以后不可变，所以 Merge 的本质是：

**读取 / 重新组织旧 Manifest Entry → 生成新的 Manifest → 新 Snapshot 引用新 Manifest**

不是在旧 Manifest 上原地追加。

## 为什么 Manifest 会越来越多

Manifest 数量主要受这些因素共同影响：

- Data / Delete File 数量；
- Commit 频率；
- Writer 并发；
- Partition / Sort 布局；
- 写入顺序；
- 自动 Manifest Merge；
- 显式 `rewriteManifests`。

所以没有一个固定公式规定“一个 Manifest List 应该有几个 Manifest”。

规模治理看的是增长趋势和 Planning Cost，而不是追求一个统一数量。

## Snapshot 与 Metadata 生命周期

每次成功 Commit 通常都会产生新 Snapshot。

长期不做 Snapshot Expiration，会增加历史 Metadata 规模，也会让已经不再需要的历史文件持续被旧 Snapshot 引用。

Expire Snapshot 前必须先明确：

- Time Travel 窗口；
- Rollback / Recovery 窗口；
- Audit / Compliance；
- Branch / Tag Retention；
- Backfill 依赖。

另外，旧 Table Metadata JSON 本身也有生命周期配置。

所以“保留多少历史版本”既是恢复能力问题，也是 Metadata / Storage 成本问题。

## Remove Orphan Files 为什么必须保守

Orphan File 常见来源是：

**Writer 已上传文件 → Commit 最终失败 → 文件从未进入任何有效 Metadata 引用链**

这类文件最终可以清理。

但不能简单：

**List 数据目录 → 看到不认识的文件 → 立刻删除**

因为并发 Writer 可能刚刚把文件写完，还没有完成 Commit。

因此 Orphan Cleanup 必须设置足够安全的 Retention Window，并以 Iceberg Metadata 引用关系为事实源。

## Maintenance 什么时候运行

不要把所有表都套一个统一 Cron。

更合理的是根据指标触发或分层调度：

- 持续监控 File Count / File Size / Manifest Count / Snapshot Growth；
- 小文件比例恶化时选择性 Rewrite Data Files；
- Planning Cost 上升、Manifest 碎片明显时 Rewrite Manifests；
- 按业务历史窗口 Expire Snapshots；
- 用更保守窗口清理 Orphan Files。

Maintenance 本质上是生命周期治理，不是一条固定脚本。

## 关联知识

到这里，Iceberg 的 Read、Write、Commit、Maintenance 主链已经完整。

最后一节不再重新讲这些机制，而是做一次综合：

**线上出现慢、冲突、文件爆炸或 Metadata 膨胀时，怎样快速判断问题到底发生在哪一层。**
