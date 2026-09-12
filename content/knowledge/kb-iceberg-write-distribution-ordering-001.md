---
id: kb-iceberg-write-distribution-ordering-001
type: knowledge
title: Write Distribution & Write Ordering
title_cn: 写入分布、写入排序与文件布局
stage_id: '04'
domain: lakehouse
topic: iceberg
order: 8
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: iceberg_l5_v1_1_refactor
project_relevance:
- north-america
project_fact_status: needs_fact_check
summary: Distribution 决定 Row 被送到哪些 Writer Task，Ordering 决定数据怎样聚集与排序。它们与 Spark Task Size、Partition 粒度和压缩比共同决定 Data File 数量和大小，并进一步影响 File Metrics、查询裁剪、Manifest 数量和后续维护成本。
prerequisites:
- kb-iceberg-trino-read-path-001
related:
- kb-iceberg-commit-concurrency-001
- kb-iceberg-maintenance-small-files-001
---
# 写入分布、写入排序与文件布局

## 30 秒理解

读取路径已经告诉我们：

> 文件布局会直接影响查询裁剪和扫描成本。

所以 Writer 的目标不只是：

> “把数据写成功”。

还要尽量写出健康的 Data File。

先分清两个概念：

**写入分布（Distribution）**：决定哪些 Row 被送到哪个 Writer Task。

**写入排序（Ordering）**：决定进入 Writer 后，数据按什么 Key 聚集 / 排序。

它们共同影响：

```text
Data File 数量
文件大小
同类数据聚集程度
File Metrics 选择性
Manifest 数量
后续 Maintenance 成本
```

## 写入链先怎么看

以 Spark 写 Iceberg 为例，可以先压成：

```text
Input Rows
↓
Distribution / Ordering
↓
Spark Writer Tasks
↓
Data Files
↓
Manifest
↓
Snapshot
↓
Commit
```

这一节只负责：

> **文件在 Commit 之前是怎样被写出来的。**

文件什么时候真正进入 Current Table State，下一节 Commit 再讲。

## Distribution Mode

Spark + Iceberg 当前常见三种 Distribution Mode（写入分布模式）：

```text
none
hash
range
```

### none

`none` 表示 Iceberg 不主动请求 Spark 做 Shuffle / Sort 来满足写入分布。

如果上游 Row 本身没有按 Partition Value 聚集，一个 Task 可能同时写很多 Partition：

```text
Task 1
├─ Partition A
├─ Partition B
├─ Partition C
└─ Partition D
```

容易出现：

- 同时打开很多文件；
- 每个文件分到的数据少；
- 小文件增多。

Fanout Writer（扇出写入器）可以避免“必须先按 Partition 排好”的要求，但会让一个 Task 同时保持更多 File Handle（文件句柄）和状态。

所以它是 Trade-off（权衡），不是免费优化。

### hash

`hash` 根据 Partition Value 做 Hash Exchange（哈希交换）。

目标是：

> 让相同 Partition 的 Row 尽量集中到有限 Writer Task。

它不会保证全局排序。

当前 Spark + Iceberg 中，自 Iceberg 1.2.0 起，普通写入默认会请求 `hash` 分布。

### range

`range` 会先采样，再按 Partition / Sort Key 做 Range Exchange（范围交换）。

它比 `hash` 更贵，因为需要更复杂的 Shuffle / Sampling。

但可以得到更强的数据聚集与全局排序。

当前 Spark 写入中，如果 Table 定义了 Sort Order（排序规则），`range` 会成为默认分布选择。

学习时不要背版本号本身。

真正要理解：

```text
hash
→ 主要解决“同一 Partition 怎么集中”

range
→ 在此基础上进一步强化排序和数据局部性
```

## Write Ordering 解决什么

Write Order（写入排序）描述：

> Writer 希望按哪些列组织物理数据。

Spark SQL 示例：

```sql
ALTER TABLE prod.db.orders
WRITE ORDERED BY order_date, customer_id;
```

也可以定义局部排序：

```sql
ALTER TABLE prod.db.orders
WRITE DISTRIBUTED BY PARTITION
LOCALLY ORDERED BY order_date, customer_id;
```

这里最容易误解的一点是：

**Write Order 不保证 SELECT 返回顺序。**

如果查询没有：

```sql
ORDER BY
```

就不能因为 Data File 物理上有排序而承诺结果有序。

它优化的是：

**物理布局**

不是：

**SQL 结果语义。**

## 为什么 Ordering 会影响 File Pruning

假设查询经常：

```sql
WHERE customer_id BETWEEN 1000 AND 2000
```

如果每个 Data File 里的 `customer_id` 都非常分散：

```text
File A: 1 ~ 9,000,000
File B: 10 ~ 8,500,000
```

Lower / Upper Bounds（上下界）几乎无法排除文件。

如果数据按 `customer_id` 聚集：

```text
File A: 1 ~ 50,000
File B: 50,001 ~ 100,000
```

很多文件可以直接根据 File Metrics 跳过。

所以：

**更好的 Ordering → 更紧的文件统计范围 → 更强的 File Pruning**

这就是 Write 和 Read Path 的直接连接。

## 文件大小为什么不只由 512 MB 决定

Iceberg 当前默认：

```text
write.target-file-size-bytes = 512 MB
```

但这个 512 MB 是 **Target（目标值）**，不是：

> “每个文件都会被自动填满到 512 MB”。

Spark 写入时还有两个硬事实：

**一个 Data File 不能跨 Iceberg Partition Boundary（分区边界）。**

**一个 Data File 不可能大于给它写数据的 Spark Task 所拥有的数据量。**

而且：

```text
Spark 内存里的 Row
→ Parquet 列式编码 + 压缩
→ 磁盘文件通常更小
```

所以文件大小实际受：

- Spark Task Size；
- AQE（Adaptive Query Execution，自适应查询执行）；
- Partition 粒度；
- 压缩比；
- Distribution；
- Fanout Writer；
- 单 Partition 数据量；
- Target File Size

共同决定。

## 一个生产问题：Target 已经 512 MB，为什么还是大量 20 MB 文件

不要第一反应继续把 Target 改成：

```text
1 GB
```

先沿因果链查：

```text
微批是不是本来就很小？
↓
Partition 是否过细？
↓
Spark Task 是否太碎？
↓
一个 Task 是否同时触碰很多 Partition？
↓
压缩比是多少？
↓
Distribution 是否合适？
```

如果一个 Task 每个 Partition 只拿到 20 MB 数据：

> 你把 Target 设成 1 GB，也不会凭空写出 1 GB 文件。

这就是为什么：

**Target File Size 是上限 / 目标之一，不是文件大小发生器。**

## Data File 写完以后发生什么

Writer Task 产生 Data File 以后，会继续生成新 Manifest 等候选元数据。

逻辑上：

```text
New Data Files
↓
New Manifest(s)
↓
New Manifest List / Snapshot
↓
Catalog Commit
```

这里不要误解成：

> 找一个没到 8 MB 的旧 Manifest，然后继续追加。

Manifest 仍然是不可变对象。

后续是否进行 Manifest Merge（清单合并），属于 Maintenance（维护）策略。

## 小文件问题应该先从哪里治

优先按因果顺序检查：

1. Micro-batch（微批）是不是太小；
2. Partition 是否过细；
3. Distribution 是否合适；
4. Spark Task 是否太碎；
5. 一个 Task 是否同时写太多 Partition；
6. Target File Size 是否和 Task Size / 压缩比匹配；
7. 最后再考虑 Rewrite Data Files。

因为：

**Writer Layout（写入布局）治根因，Compaction（文件合并）治结果。**

这条顺序比“看到小文件就定时 Compaction”更重要。

## 什么时候值得用 range

不是所有表都需要 Range Distribution。

更适合的情况是：

- Table 已定义有价值的 Sort Order；
- Query 经常按这些列过滤；
- 文件统计可以明显受益；
- 可以接受更贵的 Shuffle / Sampling。

如果只是普通 Partitioned Append，而且查询也不依赖额外排序局部性：

> `hash` 往往已经是合理基线。

所以生产配置不是：

**range 比 hash 高级。**

而是：

**为明确的读取收益支付更高写入成本。**

## 这一节真正要掌握什么

必须掌握：

- Distribution 与 Ordering 是两件事；
- `none / hash / range` 分别解决什么；
- Write Order 不保证 SELECT 顺序；
- Target File Size 不是实际文件大小保证；
- 文件布局会影响 File Metrics 和读取裁剪。

生产上要会判断：

- 为什么设置 512 MB 仍会产生小文件；
- 小文件应该先调 Writer 还是直接 Compaction；
- 什么时候 Range Distribution 的额外成本值得。

了解即可：

- Spark 每个 AQE 参数的完整调优矩阵；
- 每个引擎所有 Writer 实现细节。

下一节进入最关键的状态切换：

**文件都写好了以后，怎样保证多个 Writer 不会互相覆盖，并且最终只有一个合法表状态成为 Current？**
