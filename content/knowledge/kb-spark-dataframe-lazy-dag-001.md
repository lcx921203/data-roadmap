---
id: kb-spark-dataframe-lazy-dag-001
type: knowledge
title: DataFrame, Dataset, Lazy Evaluation & DAG
title_cn: DataFrame、Dataset、Lazy Evaluation 与 DAG
stage_id: '02'
domain: compute
topic: spark
order: 3
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: spark_l5_v1
summary: Spark Transformation 通常先记录“怎样计算”，而不是马上完成计算；Action 才触发执行。Lazy Evaluation 让 Spark 有机会看到更完整的依赖关系，再组织真正的分布式执行。
prerequisites:
  - kb-spark-application-runtime-001
related:
  - kb-spark-job-stage-task-shuffle-001
---
# DataFrame、Dataset、Lazy Evaluation 与 DAG

## 30 秒理解

Spark 最重要的执行特征之一是：

**Lazy Evaluation（惰性执行）**。

写下：

```python
orders = spark.read.parquet("/orders")
paid = orders.filter("status = 'PAID'")
daily = paid.groupBy("order_date").count()
```

通常并不意味着：

```text
第一行立刻完整读一遍
第二行再完整 Filter 一遍
第三行再完整 GroupBy 一遍
```

更接近：

```text
先记录计算关系
→ 建立依赖 / Plan
→ 等 Action
→ 再真正执行
```

所以主链是：

**Transformation**

→ **Dependency / Plan**

→ **Lazy**

→ **Action**

→ **Execution**

## 为什么现代 Spark 学习以 DataFrame 为主

Spark 底层有非常重要的 RDD（Resilient Distributed Dataset）抽象。

RDD 可以理解成：

> 分布在 Cluster 多个 Partition 上、可并行计算并具备容错能力的数据集合。

但现代结构化数据工程更多直接使用：

- DataFrame；
- SQL；
- Dataset（Scala / Java）。

原因是结构化 API 能把更多语义告诉 Spark。

例如：

```python
orders.select("customer_id", "amount")
```

Spark 能明确知道：

- 哪些 Column 被使用；
- 表达式是什么；
- Filter / Join / Aggregate 是什么逻辑。

这为后面的 Catalyst Optimizer 提供了更丰富的信息。

### DataFrame

DataFrame 可以理解成：

**有命名 Column 的分布式结构化数据集合。**

在 PySpark 中，主要就是使用 DataFrame。

### Dataset

Dataset 在 Scala / Java 中提供类型化的结构化 API。

在 Scala 里：

```text
DataFrame
≈ Dataset[Row]
```

Python 没有 JVM Dataset 那套静态类型 API。

所以后面讲 Spark 数据工程代码时，会以 DataFrame / SQL 为主。

## Transformation 和 Action

Spark 操作可以先分成两类。

### Transformation（转换）

产生新的逻辑数据集。

例如：

```python
df.select(...)
df.filter(...)
df.withColumn(...)
df.groupBy(...)
```

这些操作通常先建立新的计算关系。

### Action（动作）

需要真正拿到结果或产生输出。

例如：

```python
df.count()
df.collect()
df.show()
df.write.parquet(...)
```

一旦 Action 需要真实结果，

Spark 才必须把之前积累的依赖真正执行起来。

## 为什么 Spark 要故意“晚点执行”

如果每写一行 Transformation 就马上计算，

Spark 只能看到局部。

例如：

```python
df = (
    spark.read.parquet("/orders")
    .select("customer_id", "status", "amount")
    .filter("status = 'PAID'")
    .select("customer_id", "amount")
)
```

如果一步一步马上执行，

可能产生很多中间物化数据。

Lazy Evaluation 允许 Spark 先看到：

**完整的计算意图**

再决定后面怎样组织执行。

对结构化 API 来说，

这还给 Catalyst 后续的：

- Column Pruning；
- Predicate Pushdown；
- Expression Optimization；

留下空间。

所以 Lazy 不是：

> Spark 偷懒不执行。

而是：

> Spark 延迟执行，以便把一串操作作为整体组织。

## 一个最简单的 Lazy 例子

```python
orders = spark.read.parquet("/orders")

paid = orders.filter("status = 'PAID'")

result = paid.select("customer_id", "amount")
```

到这里，

如果没有 Action，

通常还没有完整计算最终结果。

当执行：

```python
result.count()
```

才真正需要：

```text
Read
→ Filter
→ Project
→ Count
```

这个执行链。

再执行：

```python
result.write.parquet("/paid_orders")
```

又会触发一次结果计算，

除非中间结果通过 Cache / Persist 等方式被复用。

Cache 放到第 9 节再完整讲。

## DAG 是什么

DAG 是：

**Directed Acyclic Graph（有向无环图）**。

可以把它理解成：

> Spark 计算中“谁依赖谁”的图。

例如：

```text
Read Orders
    ↓
Filter Paid
    ↓
Select Columns
    ↓
Group By Customer
    ↓
Write Result
```

复杂一点时可以出现分叉和 Join：

```text
Orders ── Filter ──┐
                   ├─ Join → Aggregate → Write
Customer ─ Select ─┘
```

这就是为什么 Spark 不只是执行：

> 一条一条代码。

它真正关心的是：

**计算依赖图。**

## Lineage 和 DAG 是什么关系

Lineage（血统 / 依赖链）表达：

> 当前数据集是由哪些上游 Transformation 推出来的。

例如：

```text
raw
→ filter
→ map
→ reduce
```

如果某个 Partition 丢失，

Spark 可以利用 Lineage 重新计算需要的数据。

这也是 RDD “Resilient（弹性）”的重要来源之一。

但这里先不要把它直接等同于：

**数据库事务日志**

或者：

**Iceberg Snapshot History**。

它们解决的问题不同。

Spark Lineage 是：

**计算依赖与重算路径。**

Iceberg Snapshot 是：

**表版本和文件状态。**

## Lazy Evaluation 和容错为什么能连起来

因为 Spark 保存的不只是最终数据，

还保存了：

> 这份数据是怎么计算出来的依赖关系。

如果某个 Executor 丢失了一份还可以重算的数据，

Spark 能沿着依赖重新执行需要的 Partition。

所以后面会看到：

**Lineage**

→ **Task Retry / Recomputation**

这条关系。

当然，

Shuffle Output、Cache、Checkpoint 等会影响实际恢复成本，

后面再逐步加入。

## DataFrame DAG 和 RDD DAG 完全一样吗

不要把它们简单画等号。

对 DataFrame / SQL：

用户先描述的是结构化 Logical Plan。

Spark SQL 后面还会经历：

**Analysis → Optimization → Physical Planning**

最终物理执行再落到 Spark 的 Stage / Task Runtime。

所以现在可以用 DAG 建立：

**依赖关系心智模型**

但不要提前说：

> 用户写下的 DataFrame 链就是最终物理 DAG。

中间还有 Catalyst。

这就是为什么第 6 节才正式进入 Physical Plan。

## Action 一定只产生一个 Job 吗

学习层面可以先记：

**Action 会触发 Job。**

官方也把 Job 定义成：

> 响应 Spark Action 而产生的一次并行计算。

但不要把：

```text
1 Action = 永远严格 1 Job
```

当成所有结构化执行场景的不可变铁律。

Spark SQL、Broadcast、Adaptive Execution 等内部机制可能让实际 UI 中出现额外 Job。

现在重要的是：

> 没有需要结果的触发点，Transformation 本身通常不会独立完成整条计算。

## 一个非常重要的错误理解

不要说：

> 因为 Lazy，所以 Spark 会自动把任何代码都优化得很好。

Lazy 只提供：

**晚执行 + 看完整依赖**

的机会。

真正能不能深度优化，

还取决于：

- 使用的是结构化 DataFrame / SQL 还是黑盒代码；
- Spark 能否理解表达式；
- Statistics；
- Data Source；
- Catalyst / AQE。

这些后面逐步展开。

## 这一节先不要学什么

现在先不展开：

- Catalyst Rule；
- Physical Plan；
- Shuffle Performance；
- Join Strategy；
- Cache Memory；
- Streaming State。

下一步先把 Lazy DAG 真正落到执行层：

> Action 触发以后，Spark 怎样从 DAG 变成 Job、Stage 和 Task？

## 关联知识

下一节进入 **Job、Stage、Task、Narrow / Wide Dependency 与 Shuffle**。

这是 Spark 执行模型里最核心的一层。
