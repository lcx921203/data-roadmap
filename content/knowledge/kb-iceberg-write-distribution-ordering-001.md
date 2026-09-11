---
id: kb-iceberg-write-distribution-ordering-001
type: knowledge
title: Write Distribution & Write Ordering
title_cn: 写入分布与写入排序
stage_id: '04'
domain: lakehouse
topic: iceberg
order: 8
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: iceberg_l5_v1
project_relevance:
- north-america
project_fact_status: needs_fact_check
summary: Distribution 决定 Row 进入哪个 Writer Task，Ordering 决定 Row 怎样聚集与排序；它们先决定 Data File
  布局，再间接影响 Manifest 数量、查询裁剪和后续 Maintenance。
prerequisites:
- kb-iceberg-trino-read-path-001
related:
- kb-iceberg-commit-concurrency-001
- kb-iceberg-maintenance-small-files-001
---
# Write Distribution & Write Ordering

## 30 秒理解

读取链路学完以后，写入链路从这里开始。

先把两个概念分开：

**Distribution（写入分布）决定哪些 Row 进入哪个 Writer Task。**

**Ordering（写入排序）决定这些 Row 在 Task / 全局范围内按什么顺序聚集。**

它们先影响 Data File 的数量、大小和局部性，再继续影响 Manifest、查询裁剪和 Maintenance。

## 写入先经过什么

以 Spark + Iceberg 为例，逻辑上可以拆成：

**Input Rows → Distribution / Ordering → Writer Tasks → Data Files → Manifest → Commit**

这一节只讲前半段：怎样让 Row 以合理方式进入 Writer，并形成健康的 Data File。

“这些文件什么时候真正进入表状态”放到下一节 Commit。

## Distribution Mode

Spark 写 Iceberg 常见三种 Distribution Mode：

- **none**：Iceberg 不主动请求 Shuffle；
- **hash**：按 Partition Key 做 Hash Exchange；
- **range**：按 Partition / Sort Key 做 Range Exchange。

在 Spark 写 Iceberg 时，从 Iceberg 1.2.0 起通常默认请求 `hash` Distribution；如果表定义了 Sort Order，Spark 写入会默认使用 `range` 来满足排序分布需求。

### none

`none` 不自动帮你把同一 Partition 的数据聚到合适的 Writer。

如果上游数据本来就没有良好聚集，一个 Task 可能同时触碰很多 Partition，容易造成：

- 同时打开很多文件；
- 每个文件得到的数据很少；
- 小文件数量增加。

Fanout Writer 可以缓解“必须预排序”的限制，但代价是一个 Task 可能长期保持更多 File Handle。

### hash

`hash` 根据 Partition Value 把 Row 分发到 Writer Task。

它的目标不是让数据“全局有序”，而是让同一 Partition 的数据更集中，降低 Writer 同时跨大量 Partition 写文件的压力。

因此它通常是通用 Partitioned Table 的基线策略。

### range

`range` 先对 Partition / Sort Key 做采样，再按 Range 重新分发。

它比 `hash` 更贵，但可以获得更强的数据聚集与全局排序效果。

如果表定义了 Sort Order，并且主要查询能够从排序后的 File Metrics 和局部性中获益，Range Distribution 会更有价值。

## Write Ordering 解决什么

Iceberg 表可以定义 Write Order。

Spark SQL 示例：

```sql
ALTER TABLE prod.db.orders
WRITE ORDERED BY order_date, customer_id;
```

也可以只在每个 Task 内局部排序：

```sql
ALTER TABLE prod.db.orders
WRITE DISTRIBUTED BY PARTITION
LOCALLY ORDERED BY order_date, customer_id;
```

这里最重要的边界是：

**Write Order 影响物理写入布局，不保证 SELECT 的返回顺序。**

查询没有显式 `ORDER BY` 时，不能因为底层文件有 Sort Order 就承诺结果顺序。

## 为什么 Ordering 会影响查询

假设查询经常按 `order_date` 和 `customer_id` 过滤。

如果相近值在文件里更集中，文件级 Lower / Upper Bounds 往往更有选择性。

于是读取时：

**更好的 Ordering → 更紧凑的 File Metrics → 更强的 File Pruning**

所以 Ordering 的价值不是“让文件看起来整齐”，而是帮助后面的 Read Path 少扫文件。

## 文件大小为什么不只由 512 MB 决定

Iceberg 当前默认 `write.target-file-size-bytes` 是 512 MB。

但它是 Target（目标），不是“每个文件必然 512 MB”。

实际文件大小还受：

- Spark Task 输入大小；
- Partition 边界；
- 压缩比；
- AQE 合并 / 拆分 Task；
- Distribution；
- Fanout Writer；
- 单个 Partition 实际数据量。

一个 Data File 不能跨 Iceberg Partition Boundary；同时 Spark Task 如果只有很少输入，也不可能凭空写出 512 MB 文件。

所以调文件尺寸时，不能只改 Iceberg Target，而要同时看 Spark Task Size。

## Data File 生成以后发生什么

Writer Task 写出新的 Data File 后，这些文件需要进入 Manifest。

Manifest 已经学过两个重要性质：

- 写出后不可变；
- 新 Snapshot 可以复用旧 Manifest。

因此新写入并不是“找到一个旧 Manifest，没写满就继续追加”。

更接近：

**New Data Files → New Manifest(s) → New Manifest List / Snapshot → Commit**

至于 Commit 时是否触发 Manifest Merge，放到 Maintenance 统一讲。

## 小文件问题应该先从哪里治

遇到大量小文件，优先按因果顺序检查：

1. 微批是不是太小；
2. Partition 是否过细；
3. Distribution 是否合适；
4. Spark Task 是否太碎；
5. 一个 Task 是否同时写太多 Partition；
6. Target File Size 是否和 Task Size 匹配；
7. 最后才考虑 Rewrite Data Files。

因为：

**Writer Layout 治根因，Compaction 治结果。**

## 关联知识

现在 Data File 已经产生。

下一节回答最关键的问题：

**两个 Writer 都准备好了新文件时，谁能把自己的新 Snapshot 变成 Current？发生冲突为什么不会互相覆盖？**
