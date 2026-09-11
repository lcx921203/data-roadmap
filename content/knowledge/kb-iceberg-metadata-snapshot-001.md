---
id: kb-iceberg-metadata-snapshot-001
type: knowledge
title: Table Metadata & Snapshot
title_cn: 表元数据与快照
stage_id: '04'
domain: lakehouse
topic: iceberg
order: 2
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: v0.6.1_spine
project_relevance:
- north-america
project_fact_status: needs_fact_check
summary: Table Metadata 记录 Schema、Partition Spec、Properties 与 Snapshot；Snapshot 则定义某一时刻表中有效文件的逻辑状态。
prerequisites:
- kb-iceberg-overview-001
related:
- kb-iceberg-manifest-tree-001
- kb-iceberg-commit-concurrency-001
---
# Table Metadata & Snapshot

## 30 秒理解

Iceberg 的一致性入口不是数据目录，而是 **当前 Table Metadata 文件的位置**。一次成功 Commit 会产生新的表元数据，并把 Catalog 中指向旧 Metadata 的 Pointer 原子地切换到新 Metadata。

Reader 在加载表时先固定一个 Metadata / Snapshot，因此查询期间即使别的 Writer 提交了新版本，当前 Reader 仍能继续读取自己看到的稳定快照。

## 工作原理

Table Metadata 记录的核心信息包括：

```text
Current Schema
Partition Specs
Sort Orders
Table Properties
Snapshots
Current Snapshot ID
Snapshot References / History
```

Snapshot 不是把全表数据复制一份，而是通过 Manifest List → Manifest 间接定义“本版本有效的数据文件和删除文件”。

所以：

```text
Snapshot
≠ 全量数据副本
Snapshot
= 一个不可变的逻辑表版本
```

## Snapshot 生命周期

一次典型 Append：

```text
Writer 生成 Data Files
        ↓
生成/复用 Manifest
        ↓
生成新 Manifest List
        ↓
生成新 Snapshot
        ↓
写新 Table Metadata
        ↓
原子更新 Metadata Pointer
```

只有最后 Pointer 成功切换，新 Snapshot 才成为 Current。

这也是“数据文件已经写出来”与“数据已经对 Reader 可见”之间最重要的区别。

## Time Travel 与 Rollback

历史 Snapshot 仍在 Metadata 中且引用的文件尚未被过期清理时，可以做 Time Travel（时间旅行）或 Rollback（回滚）。

但历史版本不是无限保留。Snapshot Expiration（快照过期）会缩短可回溯窗口，并让不再被任何保留 Snapshot 引用的旧文件具备删除条件。

## Production 实现

需要明确 Retention Policy（保留策略）：

```text
业务审计需求
+ 回滚窗口
+ Backfill/重算周期
+ 存储成本
+ Metadata 规模
```

不能一边要求“可回滚 90 天”，一边每天无脑清掉 7 天前 Snapshot。

## 故障判断

如果 Writer 已经上传了 Parquet，但 Commit 失败：

```text
Data File exists
        ↓
Current Metadata pointer unchanged
        ↓
Reader does NOT see that file
```

这时文件可能成为 Orphan File（孤儿文件），应由安全的孤儿文件清理流程处理，而不是人工随手删目录。

## 源码理解抓手

读源码时优先顺着概念找：

```text
TableOperations
→ refresh current metadata
→ commit(base, newMetadata)
→ catalog-specific pointer swap
```

不同 Catalog 的“原子切换”实现不同，但 Iceberg 的高层语义一致：**基于旧版本提交新版本，旧版本已变化时不能静默覆盖。**

## 项目案例

项目事实目前保持 `needs_fact_check`。后续若确认实际 Catalog、Snapshot 保留周期、回滚或重放策略，再放进 Project Case。

## 大规模下会发生什么

高频写入会快速制造 Snapshot 和 Metadata JSON。若长期不维护，加载表、历史管理和对象数量都会变重。

因此 Snapshot 是一致性的基础，同时也是需要治理的 Metadata 生命周期对象。

## 关联知识

下一节进入 Manifest Tree，回答“一个 Snapshot 到底怎样找到成千上万个 Data File”。
