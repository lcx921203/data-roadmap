---
id: iq-spark-broadcast-join-001
type: interview
question: "Spark Broadcast Join 什么时候适用？如何结合表大小和 Executor 内存判断？"
domain: spark
learning_depth: L5
answer_format_version: "1.0"

evidence:
  direct_independent_count: 2
  direct_company_count: 2

frequency:
  status: supported_verified
  final_industry_frequency: false

verification:
  question_intent_reviewed: true
  dedup_reviewed: true
  answer_curated: true
  content_review_status: v0_3_7
  publishable: false

project_connection:
  status: no_verified_project_anchor_yet

technical_references:
  - https://spark.apache.org/docs/latest/sql-performance-tuning.html

status: answer_ready
---

# Spark Broadcast Join 什么时候适合用？

## 这道题在考什么

面试官不是只想听：

> 小表广播，大表不 Shuffle。

更重要的是你能否判断：

- “小”到底怎么判断；
- 为什么能减少 Shuffle；
- Executor / Driver 的内存风险；
- Statistics（统计信息）是否准确；
- Hint 为什么不能无脑加；
- AQE 是否可能在运行时调整 Join Strategy（连接策略）。

## 30 秒回答

Broadcast Join 适合一侧足够小、另一侧很大的等值 Join。Spark 会把小表构建成广播关系发送到各 Executor，大表可以本地 Probe，从而避免大表按 Join Key 做全量 Shuffle。

我不会只看源文件大小，而会看优化器 Statistics、过滤后的实际大小、广播后 Hash Relation 的内存膨胀、Executor 内存、并发任务以及是否同时广播多个表。默认广播阈值由 `spark.sql.autoBroadcastJoinThreshold` 控制，而且不同版本/配置可能不同；生产上应以执行计划和运行统计为准，而不是死背 10 MB。

## 核心原理

普通 Sort Merge Join 常见：

```text
Large A
   \ Shuffle
    \       Sort
     JOIN
    /       Sort
   / Shuffle
Large B
```

Broadcast Hash Join：

```text
Small B
↓ Broadcast
Executor 1: Large A partition + B
Executor 2: Large A partition + B
Executor 3: Large A partition + B
```

大表不需要因为这个 Join 全量重新分区。

## Production 判断

### 1. 看过滤后的大小

不是：

```text
dimension table on disk = 5 GB
```

就一定不能广播。

如果过滤后只有：

```text
30 MB
```

可能可以。

反过来，Parquet 压缩文件 30 MB，解压并构建 Hash Relation 后内存可能明显变大。

### 2. 看统计信息

Spark 优化器依赖 Statistics 做 Join 选择。

可检查：

```sql
EXPLAIN COST
```

或者 DataFrame：

```python
df.explain(mode="cost")
```

统计信息缺失或过期，可能导致优化器判断错误。

### 3. 看 Executor 内存

广播数据不是“全集群只有一份”。

它需要在多个 Executor 上可用。

因此要考虑：

```text
broadcast relation size
× executors
```

以及每个 Executor 上：

- Execution Memory；
- Storage / Cache；
- 多个并发 Query；
- 多张广播表；
- Python / JVM 开销。

### 4. 看 Driver 风险

广播关系的构建和分发也会给 Driver 带来压力。

把一个实际上很大的表强行 `broadcast()`，可能导致：

- Driver OOM；
- Executor OOM；
- Broadcast Timeout；
- 大量网络分发。

## 配置 / 代码

Spark 当前文档中：

```text
spark.sql.autoBroadcastJoinThreshold
```

控制自动广播阈值。

SQL Hint：

```sql
select /*+ BROADCAST(d) */
    ...
from fact f
join dim d
  on f.dim_id = d.dim_id
```

PySpark：

```python
from pyspark.sql.functions import broadcast

result = fact.join(
    broadcast(dim),
    "dim_id",
    "left"
)
```

Hint 是“告诉优化器优先考虑”，不是证明它一定安全。

## AQE

AQE（Adaptive Query Execution，自适应查询执行）可以利用运行时统计重新优化执行计划，并在合适情况下把原计划的 Sort Merge Join 转成 Broadcast Join。

因此排查时同时看：

```text
Initial Plan
Final Adaptive Plan
Runtime Statistics
```

## 故障排查

Join 很慢：

```text
Physical Plan 是什么 Join？
↓
两侧实际 Rows / Bytes？
↓
是否发生大 Shuffle？
↓
小表是否真的小？
↓
Statistics 是否过期？
↓
Broadcast 是否 Timeout / OOM？
↓
是否存在 Skew？
```

Broadcast 并不能解决所有倾斜。

如果大表本身有严重 Filter/Scan 问题，广播维表也不会自动让整个 Job 变快。

## 常见错误回答

- “小于 10 MB 就广播，大于就不广播。”
- “Broadcast Join 完全不耗内存。”
- “Hint 一加 Spark 就一定广播。”
- “广播越多越快。”
- “Broadcast 可以解决任何数据倾斜。”

## 项目怎么结合

目前不强行挂真实项目案例。后续如果真实 Spark 作业存在维表 Join，再核验实际表大小、Join Strategy 和资源配置后挂接。

## Scale Lab

假设：

```text
Fact = 20 TB
Dimension after filter = 2 GB
100 Executors
20 个并发 Query
```

“2 GB 比 20 TB 小很多”并不意味着应该广播。

必须估算：

```text
单 Executor 可用内存
广播结构膨胀
并发广播数量
网络分发时间
Driver 压力
```

可能更适合 Sort Merge Join、分区策略或预先物化。

## 真实关联追问

1. Broadcast Hash Join 为什么能减少 Shuffle？
2. `autoBroadcastJoinThreshold` 是什么？
3. 为什么磁盘文件大小不能直接等于广播内存大小？
4. Broadcast Hint 有什么风险？
5. AQE 如何把 Sort Merge Join 改成 Broadcast Join？
6. Broadcast Join 和数据倾斜是什么关系？
