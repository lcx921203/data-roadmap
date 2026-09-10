---
id: kb-iceberg-write-distribution-ordering-001
type: knowledge
title: Write Distribution & Write Ordering
title_cn: 写入分布与写入排序
stage_id: "04"
domain: lakehouse
topic: iceberg
order: 6
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: v0.6.0_spine
project_relevance:
  - north-america
project_fact_status: needs_fact_check
summary: "Distribution 决定数据先怎样分发到 Writer Task；Ordering 决定 Task 内或全局数据顺序。二者共同影响文件数、局部性、压缩与查询裁剪。"
prerequisites:
  - kb-iceberg-schema-evolution-001
related:
  - kb-iceberg-commit-concurrency-001
  - kb-iceberg-maintenance-small-files-001
---

# Write Distribution & Write Ordering

## 30 秒理解

这两个概念必须拆开：

```text
Distribution
= 哪些 Row 进入哪个 Writer Task

Ordering
= 进入 Writer 后 Row 按什么顺序排列
```

Distribution 主要影响 Writer 并发、Partition 聚集、文件数量；Ordering 主要影响数据局部性、文件级统计、压缩和后续 Query Pruning。

## Distribution Mode

Spark + Iceberg 常见概念：

```text
none
hash
range
```

### none

Iceberg 不主动要求 Spark 重新分布。调用方需要自己保证数据适合 Writer，否则一个 Task 同时触碰大量 Partition 时容易产生大量打开文件或小文件。

### hash

按 Partition Key 做 Hash Exchange，使同一分区的数据更集中到对应 Task。它通常是通用写入的首选基线。

### range

先根据 Partition / Sort Key 做 Range Distribution。代价比 Hash 更高，但可以获得更强的全局聚集/排序效果；当表配置 Sort Order，或者主要查询能从数据局部性获益时更有价值。

## Write Ordering

Iceberg 表可以定义 Sort Order。

概念示例：

```sql
ALTER TABLE prod.db.orders
WRITE ORDERED BY order_date, customer_id;
```

也可以表达“按 Partition 分布，再在 Task 内局部排序”的思路：

```text
DISTRIBUTED BY PARTITION
+
LOCALLY ORDERED BY ...
```

重要：**Write Order 不等于 Query Result Order**。SELECT 如果没有 `ORDER BY`，不能因为底层文件有 Sort Order 就承诺返回顺序。

## 文件大小为什么不只看 target-file-size

一个 Data File 不能跨 Iceberg Partition Boundary，而且单个 Spark Task 不可能写出比自己输入更大的文件。

因此：

```text
write.target-file-size-bytes = 512MB
```

不代表最终所有文件都会接近 512MB。

实际大小还受：

```text
Spark Task size
Compression ratio
Rows per partition
AQE coalescing
Distribution
Fanout writer
```

影响。

## Production 调优顺序

不要一遇到小文件就先 Compaction。

先问：

```text
1. 输入微批是不是太小
2. Partition 是否过细
3. Distribution 是否合适
4. Task 是否被切得太碎
5. Writer 是否同时写太多 Partition
6. 最后才看 Rewrite Data Files
```

Maintenance 只能治结果，Writer Layout 才能治根因。

## Writer 源码学习路径

不建议一开始钻所有实现类。先按职责找：

```text
Spark Write Planning
→ Distribution / Ordering requirement
→ Task Writer
→ Partitioned / Clustered / Fanout writer
→ Data File creation
→ Commit message
```

你真正要理解的是：

```text
Planner 决定数据怎么到 Task
Writer 决定 Task 怎么滚动文件
Commit 决定这些文件什么时候进入表状态
```

而不是背某个版本里所有 Java 类名。

## 故障与性能

典型信号：

```text
同一微批产生异常多文件
→ 看 Distribution / Partition / Task Size

文件数正常但查询裁剪差
→ 看 Sort Order / Metrics / Query Predicate

Writer 内存高、打开文件多
→ 看 Fanout / 同 Task 多 Partition
```

## Scale Lab

高吞吐 Streaming 下，把“低延迟”从 5 分钟降到 10 秒，会让每个 Commit 的数据量变小。

如果 Writer Layout 不变：

```text
Lower latency
→ more commits
→ more tiny files
→ more manifests
→ higher planning cost
```

所以低延迟目标必须和文件治理一起设计。


## 关联知识

下一节进入最关键的并发 Commit：两个 Writer 同时提交时，为什么不会静默覆盖彼此。
