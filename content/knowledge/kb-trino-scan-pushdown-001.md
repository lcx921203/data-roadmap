---
id: kb-trino-scan-pushdown-001
type: knowledge
title: Scan, Pushdown & Iceberg Read Boundary
title_cn: Scan、Pushdown 与 Iceberg Read Boundary
stage_id: '04'
domain: lakehouse
topic: trino
order: 17
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: trino_l5_v1
summary: 从 Split 进入 Worker Scan 后，Trino 会尽量把过滤和列裁剪推到更靠近数据源的位置；但真正能下推到哪一层，取决于 Connector 与底层存储能力。
prerequisites:
  - kb-trino-stage-task-split-001
  - kb-iceberg-trino-read-path-001
related:
  - kb-trino-cbo-join-dynamic-filtering-001
---
# Scan、Pushdown 与 Iceberg Read Boundary

## 30 秒理解

上一节已经知道：

**Distributed Plan → Stage → Task → Split → Driver / Operator**

现在进入真正的数据读取。

先记住一条链：

**Query Predicate / Required Columns**

→ **Optimizer**

→ **Connector**

→ **Split Enumeration / Scan Planning**

→ **Worker TableScan**

→ **File Reader / Remote Data Source**

→ **后续 Operator**

Trino 的目标不是：

> 先把所有数据读进 Worker，再慢慢 Filter。

而是尽可能把：

- 不需要的行；
- 不需要的列；
- 不需要的数据范围；

在更靠近数据源的位置就排除掉。

这就是 Pushdown（下推）和 Pruning（裁剪）存在的意义。

## Split 到 Worker 以后发生什么

上一节讲过，Split 可以理解成 Connector 提供的一份可独立处理的数据工作。

但：

**Split ≠ 一定等于一个文件。**

它的具体语义由 Connector 决定。

当一个 Source Task 获得 Split 后，会由对应的 Scan Operator 读取数据。

高层可以理解成：

**Split**

→ **Page Source / Reader**

→ **Columnar Page**

→ **Filter / Project / Aggregate / Join...**

这里开始真正产生：

- I/O；
- CPU；
- Object Storage / Remote DB 请求；
- 数据解码；
- 后续 Operator 输入。

所以“扫描得少”通常比“扫描完再过滤”更有价值。

## Pruning 和 Pushdown 不是同一个概念

这两个词经常一起出现，但不要混。

### Pruning（裁剪）

Pruning 更强调：

> 根据 Metadata 或 Statistics，直接确定某一部分数据根本不用读。

例如在 Iceberg 场景里：

- Partition Pruning；
- Manifest / File Pruning；
- Parquet Row Group Skipping。

它们的共同目标是：

**减少候选读取范围。**

### Pushdown（下推）

Pushdown 更强调：

> 把原本可能由 Trino Engine 执行的操作，交给 Connector 或底层数据源更早执行。

例如：

- Predicate Pushdown；
- Projection Pushdown；
- Aggregation Pushdown；
- Join Pushdown；
- Limit / TopN Pushdown。

因此：

**Pruning 关注“哪些数据不用读”。**

**Pushdown 关注“哪一层来完成操作”。**

两者经常配合，但不是同义词。

## Predicate Pushdown：让过滤尽量靠近数据源

看一个简单 SQL：

```sql
SELECT order_id, amount
FROM lakehouse.sales.orders
WHERE order_date = DATE '2026-09-01';
```

如果 Filter 完全留在 Trino Worker：

```text
Data Source
→ Read many rows
→ Trino Worker
→ Filter
→ Result
```

那前面的大量 I/O 已经发生了。

如果 Connector 能把 Predicate 往下推：

```text
Predicate
→ Connector / Reader
→ only relevant data
→ Trino Worker
```

就能减少：

- 读取数据量；
- 网络传输；
- Worker CPU；
- 下游 Operator 压力。

但要注意：

> SQL 里有 WHERE，不代表 Predicate 一定全部成功下推。

能否下推取决于：

- Connector 是否支持；
- 表达式是否能被数据源理解；
- Data Type / Cast；
- Function；
- 底层存储格式和索引 / Statistics 能力。

## Projection Pushdown：不要读取没用的列

例如：

```sql
SELECT customer_id
FROM lakehouse.sales.orders;
```

如果表有 100 个 Column，但 Query 只需要一个：

最理想的情况不是：

**把 100 列全读出来，再只留下 customer_id。**

而是尽可能让底层 Reader 只读取需要的 Column。

这就是 Projection Pushdown（投影下推）。

对 Parquet / ORC 这种列式存储尤其重要，因为文件本身就按 Column 组织数据。

所以一个常见优化原则是：

> 尽量避免无意义的 `SELECT *`。

不是因为 `*` 语法本身慢，而是它表达了：

**所有列都可能需要。**

这会直接削弱 Column Pruning 的空间。

## Iceberg 场景下到底谁负责哪一层

这里必须严格接回 Iceberg Vertical Slice。

Iceberg 已经讲过：

**Catalog → Snapshot → Manifest List → Manifest → Candidate Data Files + Applicable Deletes**

那一层回答的是：

> 当前这个 Snapshot 下，哪些文件可能和 Query 有关？

Trino 这一节继续回答：

> 候选数据怎样转成 Split，并怎样在 Worker / Reader 层减少真正读取的数据？

所以不要再重新学习：

- Snapshot；
- Manifest；
- Delete Applicability；
- Partition Evolution。

这里只看 Query Engine 视角：

**Iceberg Connector**

→ **根据 Iceberg 表状态缩小候选范围**

→ **生成 / 枚举可调度的 Split**

→ **Worker Scan**

→ **Parquet / ORC Reader**

→ **Filter / Projection**

这就是两个 Vertical Slice 的交界。

## 一个 Predicate 可能经过多层裁剪

例如：

```sql
SELECT customer_id
FROM lakehouse.sales.orders
WHERE order_date = DATE '2026-09-01';
```

这个条件可能在多层发挥作用。

### 第一层：Iceberg Metadata

如果 `order_date` 能映射到 Partition 或 File Metrics，

Iceberg Metadata 可以先减少候选 File。

### 第二层：Split Enumeration

只有剩余候选范围才需要变成后续读取工作。

### 第三层：File Reader

Parquet / ORC 还可能利用内部 Statistics 跳过不相关的 Row Group / Stripe。

### 第四层：Trino Filter Operator

如果仍有不能下推的条件，

最后才由 Trino Operator 自己过滤。

因此一个 WHERE 条件不是：

**“下推了 / 没下推”**

这么简单。

更准确的是：

> 它最终被推到了多靠近数据的位置？前面有多少层已经把数据排除了？

## Connector 是 Pushdown 的能力边界

这是这一节最重要的工程判断。

Trino Core 可以识别：

> 这个 Filter / Projection 很适合提前做。

但真正能不能交给底层系统，取决于 Connector。

例如同样一个：

```sql
WHERE status = 'PAID'
```

在：

- PostgreSQL Connector；
- Iceberg Connector；
- Kafka Connector；

最终能够下推到的层次和方式都可能不同。

因此：

**Pushdown 是 Trino Optimizer + Connector + Data Source 共同完成的能力。**

不要只把它归功于 Optimizer。

## 怎么确认 Pushdown 真的发生了

不能只看 SQL 猜。

最直接的方法之一还是：

```sql
EXPLAIN
SELECT ...
```

当前 Trino 的通用判断思路是：

- 如果某个 Predicate 成功完全下推到底层，Plan 中可能不再需要 Trino 自己的对应 Filter；
- Projection Pushdown 成功时，TableScan 应只暴露真正需要的列；
- Aggregate / Join 等高级 Pushdown 成功时，对应 Trino Operator 甚至可能从 Plan 中消失。

所以 EXPLAIN 的核心不是背文本格式。

而是问：

> 这个操作最终由 Trino 做，还是已经被 Connector / Data Source 接走？

## Planning Pruning 和 Runtime Filtering

现在先把这两个时间点分开。

### Planning 阶段已经知道的条件

例如：

```sql
WHERE order_date = DATE '2026-09-01'
```

这个 Predicate 在 Query Planning 时已经存在。

因此可以提前用于：

- Metadata Pruning；
- Predicate Pushdown；
- Split Reduction。

### Runtime 才知道的条件

例如：

Fact Table 和过滤后的 Dimension Table 做 Join。

在 Planning 时并不知道 Dimension 最终产生哪些 Join Key。

这些值要等 Build Side 真正跑起来以后才知道。

这就是下一节要讲的：

**Dynamic Filtering（动态过滤）**

它不是普通静态 Pushdown，而是：

> 运行时从 Join Build Side 生成新的过滤条件，再反向影响 Probe Side Scan。

## Scan 慢的时候先问什么

以后看到 Scan 慢，可以按这条因果链问：

**Query 需要哪些列？**

→ Projection 是否有效？

**Predicate 能否缩小范围？**

→ Partition / File / Reader 是否真的裁剪？

**Connector 能否 Pushdown？**

→ 还是 Trino 扫进来以后才 Filter？

**Split 是否健康？**

→ 太少导致并行不足，还是太碎导致调度和文件打开开销？

**真正读取了多少数据？**

→ 不能只看最终返回多少行。

一个 Query 最终只返回 100 行，

不代表它只读了 100 行。

## 关联知识

下一节进入 **Statistics、CBO、Join 与 Dynamic Filtering**。

现在我们已经理解：

**Query 怎样尽量少扫描数据。**

下一步要解决：

> 当一个 Query 需要把多张表连接起来时，Trino 怎样决定先 Join 谁、谁做 Build Side、数据要不要 Broadcast，以及运行时怎样用 Join 结果反过来继续减少 Scan？
