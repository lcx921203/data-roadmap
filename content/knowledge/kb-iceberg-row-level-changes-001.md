---
id: kb-iceberg-row-level-changes-001
type: knowledge
title: Data Files, Delete Files & Row-level Changes
title_cn: Data File、Delete File 与行级变更
stage_id: "04"
domain: lakehouse
topic: iceberg
order: 4
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: v0.6.1_read_model
project_relevance:
  - north-america
project_fact_status: needs_fact_check
summary: "Data File 保存真实行数据；V2 可用 Position / Equality Delete 表达行级删除；V3 增加 Deletion Vector，Reader 将数据与适用删除信息合并成当前可见结果。"
prerequisites:
  - kb-iceberg-manifest-tree-001
related:
  - kb-iceberg-partition-evolution-001
  - kb-iceberg-trino-read-path-001
  - kb-iceberg-write-distribution-ordering-001
---

# Data Files, Delete Files & Row-level Changes

## 30 秒理解

**Data File 保存真实行数据；Delete 信息描述哪些行在当前表状态中不可见。**

Iceberg V2 支持两类行级删除：

- Position Delete：按文件路径 + 行位置删除；
- Equality Delete：按一个或多个字段值匹配删除。

Iceberg V3 又增加 **Deletion Vector（删除向量）** 来表达位置删除。

## 为什么 Data File 还在，行却可以“没了”

Parquet、ORC 这类 Data File 写完以后通常作为不可变文件使用。

如果只删除其中几行，Iceberg 不一定马上重写整个 Data File。

它可以保留原 Data File，再额外记录删除信息。

因此：

**对象存储里的 Data File 仍存在 ≠ 里面每一行在当前 Snapshot 中都可见。**

Reader 最终看到的是：

**当前 Data Files − 适用的删除信息**

## Position Delete

Position Delete 直接指定：

- 目标 Data File；
- 目标行在该文件中的 Position（位置）。

例如概念上可以理解为：

`file_path = .../data-001.parquet, position = 128`

在 V2 中，这类删除通常编码在 Position Delete File 中。

在 V3 中，新增删除位置应使用 Deletion Vector；升级自 V2 的表仍然可能包含旧 Position Delete File。

## Equality Delete

Equality Delete 不直接保存物理行位置，而是保存用于匹配的字段和值。

例如按 `id` 删除：

`id = 1001`

Reader 需要拿 Equality Field ID（等值删除字段 ID）对应的列和值，与 Data File 中的行做匹配。

因此它表达的是“符合这些字段值的旧数据行不可见”。

## Deletion Vector

Deletion Vector 是 V3 引入的位置删除表示。

它针对一个 Data File，用 Bitmap（位图）记录哪些行 Position 已删除。

和 Position Delete File 相比，它更适合执行阶段快速判断某个位置是否被删除。

一个 Snapshot 中，对同一个 Data File 最多有一个适用的 Deletion Vector。

## Data Manifest 与 Delete Manifest

在 Manifest 层，Data 和 Delete 也分开组织：

- **Data Manifest** 追踪 Data Files；
- **Delete Manifest** 追踪 Delete Files / Deletion Vector Metadata。

同一个 Manifest 不会同时混放 Data 与 Delete Content；但同一个 Snapshot 的 Manifest List 可以同时引用 Data Manifest 和 Delete Manifest。

这正好把上一节的 Manifest 结构和这一节的 Row-level Delete 串起来。

## Delete 为什么不会随便应用到所有 Data File

Reader 不能把所有 Delete 信息无条件套到所有 Data File。

它需要根据不同 Delete 类型检查适用范围，包括：

- Data Sequence Number；
- Partition Spec 与 Partition Value；
- Position Delete / DV 的目标 Data File；
- Equality Delete 的匹配字段和值。

所以 Sequence Number（序列号）的作用之一，就是帮助判断 Data 和 Delete 的相对新旧。

更精确地说，Equality Delete 通常应用到比它更旧的数据；Position Delete / Deletion Vector 可以精确定位目标 Data File。

## Copy-on-Write 与 Merge-on-Read

行级 Update / Delete 可以从两个方向理解。

**Copy-on-Write（写时重写）**

把受影响的旧 Data File 读出来，生成新的 Data File，再替换旧文件。

读取更简单，但小范围更新也可能产生较大的 Rewrite 成本。

**Merge-on-Read（读时合并）**

保留旧 Data File，额外记录 Delete File / Deletion Vector，读取时再合并。

写入更轻，但删除信息长期积累会增加 Planning 和 Scan 成本。

实际 Spark、Flink、Trino 支持哪些模式，要看对应 Connector 与 Iceberg Format Version。

## 关联知识

现在已经知道 Data / Delete Content 都会携带 Partition 信息。

下一节进入 **Hidden Partitioning 与 Partition Evolution**，解释 Partition Spec 是什么，以及为什么分区策略改变后历史文件仍然可以被正确解释。
