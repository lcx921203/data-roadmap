---
id: iq-spark-data-skew-salting-001
type: interview
question: "Spark 数据倾斜如何定位和解决？什么时候使用 Salting，salt 数量如何确定？"
domain: spark
learning_depth: L5
evidence:
  direct_independent_count: 3
  direct_company_count: 3
  direct_ids:
    - ev-leetcode-tiktok-2024-09-21-de-spark-001
    - ev-reddit-epam-2025-10-28-senior-de-001
    - ev-kuaishou-2025-11-10-data-dev-004
frequency:
  status: repeated_verified
  final_industry_frequency: false
verification:
  question_intent_reviewed: true
  dedup_reviewed: true
  answer_curated: true
  content_review_status: first_slice
  publishable: false
project_connection:
  status: no_verified_project_anchor_yet
technical_references:
  - https://spark.apache.org/docs/latest/sql-performance-tuning.html
status: answer_ready
---

# Spark 数据倾斜如何定位和解决？

## 这道题在考什么

不是让你背“加盐”，而是看你能否先证明是 Skew（数据倾斜），定位到具体 Exchange/Join/Aggregate，再选择最小代价方案，并理解 Salting 的数据复制成本。

## 30 秒回答

Spark 数据倾斜通常表现为同一 Stage 内少数 Task 的 Duration、Shuffle Read/Write、Records 或 Spill 远高于其他 Task，整个 Stage 被长尾任务拖住。

我先看 Spark UI 和 Physical Plan，定位是哪次 Shuffle，再统计 Join/Aggregate Key 分布。解决顺序一般是先过滤和预聚合，再考虑 Broadcast Join、合理 Repartition、AQE Skew Join；明确是少数 Hot Key 且其他方法不够时才做 Salting。salt 数量可以先按 `hot_key_bytes / target_partition_bytes` 估算，再用真实 Task Size 和 P99 Duration 校准。

## 完整原理

例如 200 个 Shuffle Partition：

```text
199 个 ≈ 200 MB
1 个   ≈ 40 GB
```

集群可能大部分 Executor 已经空闲，但一个超大 Task 还没结束。

常见来源：

- Hot Key；
- Join Key 分布不均；
- Group By 超级大 Key；
- 分区数不合理；
- 大量 Null/默认 Key。

定位时看：

```text
Task Duration
Shuffle Read/Write
Input Size
Records
Memory Spill
Disk Spill
```

再看 Physical Plan 中的 Exchange、SortMergeJoin、HashAggregate。

## Production 解决顺序

### 1. 先减少 Shuffle 输入

Filter、Column Pruning、Predicate Pushdown、Pre-Aggregation 优先。

### 2. Broadcast 小表

如果一侧足够小，可避免大表按 Join Key 全量 Shuffle。但不要只背固定阈值，要结合统计信息、Executor 内存、并发和广播对象大小判断。

### 3. AQE Skew Join

确认：

```text
spark.sql.adaptive.enabled
spark.sql.adaptive.skewJoin.enabled
```

Spark AQE 会利用运行时统计识别并拆分倾斜 Shuffle Partition；这是现代 Spark SQL 中应优先评估的机制。

### 4. Repartition

```python
df.repartition(400, "join_key")
```

可以解决正常数据下的并行度问题，但 Hot Key 仍会 Hash 到同一 Partition，所以不能把它等价成“解决倾斜”。

### 5. Salting

原 Key：

```text
A A A A
```

拆成：

```text
A#0 A#1 A#2 A#3
```

大表拆散 Hot Key，小表对应 Key 复制多份后再 Join。它用额外复制和 Shuffle 换取更均匀并行。

## salt 数量怎么定

初始估算：

```text
salt_count ≈ ceil(hot_key_bytes / target_partition_bytes)
```

例如 Hot Key 20 GB，目标单 Task 512 MB，大约需要 40 份，可从 32/40 一类数量级开始实验。

真实调优还要看 P95/P99 Task Duration、Executor Memory、网络和另一侧复制成本。

## PySpark 示例

```python
from pyspark.sql import functions as F

salt_count = 16

hot = facts.filter(F.col("product_id") == "HOT")
normal = facts.filter(F.col("product_id") != "HOT")

hot = hot.withColumn(
    "salt",
    F.pmod(F.xxhash64("event_id"), F.lit(salt_count))
)

dim_hot = (
    dim.filter(F.col("product_id") == "HOT")
       .withColumn(
           "salt",
           F.explode(F.sequence(F.lit(0), F.lit(salt_count - 1)))
       )
)

hot_joined = hot.join(dim_hot, ["product_id", "salt"], "left")
normal_joined = normal.join(dim, ["product_id"], "left")

result = hot_joined.drop("salt").unionByName(normal_joined)
```

稳定哈希比完全随机更利于重跑和复现。

## 排查路径

```text
Stage 很慢
↓
少数 Task 长尾？
↓
Shuffle 是否不均？
↓
哪个 Exchange / Join / Aggregate？
↓
Key 分布？
↓
业务热点还是脏数据？
↓
Filter / Pre-Aggregate
↓
Broadcast / AQE
↓
必要时 Salting
```

## 常见错误回答

- “数据倾斜就加 Executor。”
- “repartition(1000) 一定能解决 Hot Key。”
- “全量数据都 Salting。”
- “salt_count 固定写 10。”

## 项目怎么结合

目前没有经过事实核验的 Spark Skew 项目案例，因此不把任何 Scale Lab 写成真实项目经历。

## Scale Lab

假设总数据 10 TB，其中一个 Key 3 TB。即便 repartition(2000)，这个 Hot Key 仍可能集中。需要做 Hot Key Isolation、Pre-Aggregation、AQE，再按实际 Task Size 选择 32/64/128 等 salt 数量级并校准。

## 真实关联追问

1. 数据倾斜和资源不足怎么区分？
2. AQE 如何识别 skewed partition？
3. Salting 为什么需要复制小表？
4. Broadcast Join 也会 OOM 吗？
5. Group By 倾斜怎么处理？
6. Null Key 倾斜怎么处理？
