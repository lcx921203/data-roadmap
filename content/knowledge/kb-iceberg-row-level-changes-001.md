---
id: kb-iceberg-row-level-changes-001
type: knowledge
title: Data Files, Delete Files & Row-level Changes
title_cn: Data File、Delete File 与行级变更
stage_id: '04'
domain: lakehouse
topic: iceberg
order: 4
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: iceberg_l5_v1_1_refactor
project_relevance:
- north-america
project_fact_status: needs_fact_check
summary: Data File 保存真实行数据；行级删除可以通过重写 Data File，或通过 Position Delete、Equality Delete、Deletion Vector 等删除信息表达。第一次学习先抓住 Target、Partition、Sequence Number 三个适用维度，再在 Read Path 中看精确规则。
prerequisites:
- kb-iceberg-manifest-tree-001
related:
- kb-iceberg-partition-evolution-001
- kb-iceberg-trino-read-path-001
- kb-iceberg-write-distribution-ordering-001
---
# Data File、Delete File 与行级变更

## 30 秒理解

先不要记三套删除规则。

这一节先建立一个主模型：

**Data File 保存原始行；Delete 信息决定其中哪些行在当前表状态里不可见。**

所以：

**文件还存在 ≠ 文件里的每一行都可见。**

Row-level Change（行级变更）大体可以有两条路：

```text
Copy-on-Write（写时重写）
→ 重写受影响 Data File

Merge-on-Read（读时合并）
→ 保留旧 Data File
→ 额外记录 Delete 信息
→ Reader 读取时合并
```

## 为什么删除一行不一定要立刻重写 Parquet

假设一个 512 MB Parquet 里有 300 万行。

现在只删除其中 3 行。

如果每次都立刻：

```text
读取整个旧文件
→ 去掉 3 行
→ 重写整个新文件
```

写放大会很高。

另一种思路是：

```text
旧 Data File 保留
+
额外写一份“哪些行已删除”的信息
```

Reader 最终看到：

**Data Rows − Applicable Deletes（适用删除）**

这就是 Merge-on-Read 的基本思路。

## Position Delete 是什么

Position Delete（位置删除）通过：

```text
Data File
+
Row Position（行位置）
```

直接指定某一行。

概念上类似：

```text
file = data-001.parquet
position = 128
```

它的优点是目标明确。

在 Iceberg V2 中，Position Delete File 是常见表达方式。

## Equality Delete 是什么

Equality Delete（等值删除）不是按物理行号，而是按字段值匹配。

例如：

```text
id = 1001
```

它会记录用于匹配的 Equality Field IDs（等值字段 ID）和值。

Reader 再把它和 Data File 中的行进行匹配。

所以它表达的是：

> 满足某些业务字段值的旧行，在这份 Delete 的有效范围内不可见。

这里 Field ID 很重要，因为删除语义同样不能只依赖列名。

## Deletion Vector 是什么

Deletion Vector（删除向量）是 Iceberg V3 的位置删除表示。

它针对一个 Data File，用 Bitmap（位图）记录哪些 Row Position 已经删除。

可以先理解成：

> 把大量 Position Delete 更紧凑地组织成针对某个 Data File 的位图。

第一次学习不需要记底层编码格式。

重点是：

**它仍然是“旧 Data File 保留，Reader 应用删除信息”的思想。**

## 三种 Delete 先不要背完整条件

第一次学习只记三个判断维度：

### 1. Target（目标）

这份 Delete 到底针对哪个 Data File / 哪类数据？

Position Delete 和 Deletion Vector 与具体 Data File 的联系更直接。

### 2. Partition（分区）

一份 Delete 通常不会无条件作用到全表所有文件。

Reader 需要判断 Data 与 Delete 是否处于兼容的 Partition Scope（分区作用范围）。

### 3. Sequence Number（序列号）

Sequence Number 可以先理解成：

> 文件内容在表状态演进里的相对新旧标记。

Reader 会用它判断：

> 这份 Delete 是不是应该作用到这份 Data？

所以核心不是：

```text
看到 Delete
→ 应用到所有文件
```

而是：

```text
候选 Data File
+
满足 Target / Partition / Sequence 条件的 Delete
→ 当前可见行
```

三种删除方式的精确 `≤` / `<` 规则统一放到第 7 节 Read Path，避免现在就把主模型打碎。

## Data Manifest 和 Delete Manifest 怎样连接

上一节已经学过：

```text
Data Manifest
→ Data Files

Delete Manifest
→ Delete Files / Deletion Vector Metadata
```

所以一个 Snapshot 的读取，不只是：

> 找 Data File。

还可能需要：

> 找出真正影响这些 Data File 的 Delete 信息。

这就是为什么 Row-level Delete 会增加 Read Planning（读取规划）复杂度。

## Copy-on-Write 和 Merge-on-Read 怎么选

### Copy-on-Write（写时重写）

思路：

```text
读旧 Data File
→ 应用 Update / Delete
→ 写新 Data File
→ 新 Snapshot 替换旧文件
```

优势：

- Reader 简单；
- 后续查询不需要长期合并大量 Delete。

代价：

- 小范围变更也可能重写大文件；
- 写放大明显。

### Merge-on-Read（读时合并）

思路：

```text
保留旧 Data File
+
写 Delete 信息
```

优势：

- Update / Delete 写入更轻；
- 避免频繁大文件重写。

代价：

- Reader 要做 Delete Planning / Apply；
- Delete 积累过多会形成 Read Amplification（读放大）。

所以它不是：

> “Merge-on-Read 一定更快。”

而是：

> **把一部分写成本移动到了读取侧。**

## 一个生产问题：更新很多，查询越来越慢

假设一个 CDC 表持续产生 Equality Delete。

一开始：

```text
Data File 数量正常
Delete File 很少
```

几周以后：

```text
Data File 没明显增加
Delete File / Delete Metadata 明显增多
Query Planning 和 Scan 都变慢
```

这时不能只看：

> Parquet 文件是不是太小。

还需要看：

- Delete File Count；
- Delete / Data Ratio；
- 读取时需要合并多少 Delete；
- 是否需要相应 Maintenance；
- 当前 Engine 对 Row-level Delete 的支持与性能表现。

## Format Version 为什么重要

Iceberg V1、V2、V3 支持的行级变更能力不同。

例如：

- V2 引入 Row-level Delete；
- V3 增加 Deletion Vector 等能力。

但生产设计不能只看 Spec 支持。

还要确认：

```text
Table Format Version
+
Spark / Flink / Trino Connector Version
+
Writer Mode
+
Reader Compatibility
```

所以以后看到：

> “Iceberg 支持某功能”

先问：

> **我的表版本和实际 Engine 版本真的支持吗？**

## 这一节真正要掌握什么

必须掌握：

- Data File 存在不等于其中每行都可见；
- Copy-on-Write 与 Merge-on-Read 是两种成本分配思路；
- Position Delete、Equality Delete、Deletion Vector 分别是什么；
- Delete Applicability 先抓 Target / Partition / Sequence Number。

生产上要会判断：

- 查询慢是不是 Delete 积累造成；
- Update / Delete 多的表为什么需要额外 Maintenance；
- “Format Spec 支持”为什么不等于“当前 Engine 一定支持”。

了解即可：

- 三种 Delete 的完整底层编码；
- 第一次阅读就背所有 Sequence Number 比较规则。

下一节先补齐：

**Partition Spec 到底怎样描述数据布局，以及它为什么可以在不重写历史数据的情况下演进。**
