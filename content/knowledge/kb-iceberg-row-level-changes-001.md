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
content_status: v0.6.1_spine
project_relevance:
  - north-america
project_fact_status: needs_fact_check
summary: "Iceberg V2 引入 Row-level Deletes；V3+ 可用 Deletion Vector 表达位置删除。Data Manifest 与 Delete Manifest 分开追踪，Reader 再把数据与删除信息合并成当前可见结果。"
prerequisites:
  - kb-iceberg-manifest-tree-001
related:
  - kb-iceberg-partition-evolution-001
  - kb-iceberg-trino-read-path-001
  - kb-iceberg-write-distribution-ordering-001
---

# Data Files, Delete Files & Row-level Changes

## 30 秒理解

Data File 保存真实表数据，通常是 Parquet、ORC 或 Avro。

但列式 Data File 写完以后是不可变的。为了删除或更新少量行，Iceberg 不一定要立刻重写整个 Data File。

从 Format V2 开始，Iceberg 可以把“哪些行已经被删除”单独记录下来：

- **Position Delete**：按 Data File 路径 + 行位置删除；
- **Equality Delete**：按一个或多个字段值匹配删除。

从 Format V3 开始，Position Delete 可以使用 **Deletion Vector（删除向量）** 表达；V3 Writer 不再新增 Position Delete File，但升级表中已有的 V2 Position Delete File 仍然可以读取。

## Data File 与 Delete 信息不是一回事

可以先建立这个心智模型：

**Data File = 原始行数据**

**Delete File / Deletion Vector = 哪些行在当前表状态中不可见**

所以“对象存储里某个 Data File 还存在”不等于“里面每一行当前都可见”。

Reader 必须同时考虑：

- 当前 Snapshot 引用哪些 Data Files；
- 哪些 Delete Files / Deletion Vectors 对这些 Data Files 生效。

最终才得到当前 Snapshot 的可见行集合。

## Position Delete

Position Delete 直接指出：

- 哪一个 Data File；
- 第几行需要被删除。

概念上类似：

`file_path = s3://.../data-001.parquet, position = 128`

它非常精确，不需要再次通过业务字段匹配目标行。

在 Format V2 中通常编码为 Position Delete File。

在 Format V3+ 中，位置删除优先使用 Deletion Vector：用 Bitmap（位图）记录某个 Data File 哪些行位置已删除。

## Equality Delete

Equality Delete 不保存目标行的物理位置，而是保存用于匹配的字段值。

例如按 `id` 删除：

`id = 1001`

Reader 读取 Data File 时，用 Equality Field ID（等值删除字段 ID）和值判断某行是否应该被过滤掉。

它更接近“按业务键声明删除”，但读取时需要做额外匹配。

## Data Manifest 与 Delete Manifest

上一节的关键限制在这里就能解释清楚：

- Data Manifest 追踪 Data Files；
- Delete Manifest 追踪 Delete Files / Deletion Vector Metadata；
- **一个 Manifest 不会同时混放 Data 与 Delete Content。**

同一个 Snapshot 的 Manifest List 可以同时引用这两类 Manifest。

因此读取时不是只找到 Data Manifest 就结束，还要把适用的删除信息一起纳入 Scan Planning（扫描规划）。

## Delete 为什么不会误删新数据

Iceberg 使用 Sequence Number（序列号）表达数据和删除信息的相对新旧。

Reader 不能把所有 Delete File 无条件应用到所有 Data File。

它需要结合：

- Data / Delete 的 Sequence Number；
- Partition Spec 与 Partition Value；
- Position Delete 的目标 File Path；
- Equality Delete 的匹配字段；

判断删除信息到底应该应用到哪些 Data File。

这一层保证了并发写入和 Row-level Change 下的正确性。

## Copy-on-Write 与 Merge-on-Read 怎么理解

从系统设计角度可以把行级更新理解成两类思路：

**Copy-on-Write（写时重写）**

找到受影响的 Data File，读取后生成新的 Data File，再用新 Snapshot 替换旧文件。

优点是读取路径干净；代价是少量更新也可能产生较大的 Rewrite 成本。

**Merge-on-Read（读时合并）**

保留原 Data File，额外写 Delete File / Deletion Vector，并在读取时合并数据和删除信息。

写入更轻，但如果 Delete File 长期积累，读取规划和执行会变重。

具体 Spark / Flink / Trino 能使用哪些写入模式和格式版本能力，要以实际引擎 Connector 版本为准。

## Production 关注点

高 Update / Delete 表不能只看 Data File Size，还要看：

- Delete File / DV 数量；
- Delete 与 Data File 的匹配成本；
- Row-level Rewrite 频率；
- Compaction 是否能把大量逻辑删除物化进新 Data File；
- Reader 是否完整支持当前 Format Version。

如果 Delete File 持续增加而不治理，即使 Data File 大小很健康，读取成本也可能逐渐升高。

## 故障排查

出现“明明删除了却还能读到”或“错误少行”时，按顺序检查：

- Table Format Version；
- 当前 Snapshot；
- Data Manifest / Delete Manifest；
- Data 与 Delete Sequence Number；
- Partition Spec / Partition Value；
- Position Delete 的 File Path + Position；
- Equality Delete 的 Field IDs；
- 当前 Query Engine 对该格式版本和 Delete 类型的支持。

不要先去对象存储里手工删 Data File。

## 关联知识

下一节进入 Hidden Partitioning 与 Partition Evolution。

现在你已经知道：Data File 和 Delete File 都带 Partition 信息，而 Manifest 又绑定一个 Partition Spec。下一步就可以理解为什么 Partition Spec 能演进，同时旧文件仍然可以被正确解释。
