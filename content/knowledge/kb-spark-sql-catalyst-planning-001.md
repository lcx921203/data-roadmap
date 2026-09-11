---
id: kb-spark-sql-catalyst-planning-001
type: knowledge
title: Spark SQL, Catalyst & Physical Planning
title_cn: Spark SQL、Catalyst 与 Physical Plan
stage_id: '02'
domain: compute
topic: spark
order: 6
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: spark_l5_v1
summary: SQL / DataFrame 先表达“要什么”，Spark SQL 再经过解析、分析、逻辑优化和物理计划选择，把结构化计算变成真正可执行的 Spark Plan。
prerequisites:
  - kb-spark-partition-parallelism-001
related:
  - kb-spark-join-aqe-001
---
# Spark SQL、Catalyst 与 Physical Plan

## 30 秒理解

前 5 节已经知道 Spark **怎么把工作分布式跑起来**。

现在开始回答另一个问题：

> 一段 SQL / DataFrame 到底为什么会变成这个执行计划？

先记住主链：

**SQL / DataFrame**

→ **Unresolved Logical Plan（未解析逻辑计划）**

→ **Analyzer（分析器）**

→ **Analyzed Logical Plan（已解析逻辑计划）**

→ **Catalyst Optimizer（逻辑优化）**

→ **Optimized Logical Plan（优化后的逻辑计划）**

→ **Physical Planning（物理计划选择）**

→ **Spark Plan**

→ **Stage / Task Runtime**

所以：

> DataFrame API 只是描述计算，不等于最终执行方式。

## 为什么 Spark 要区分 Logical Plan 和 Physical Plan

看一段 SQL：

```sql
SELECT customer_id, SUM(amount)
FROM orders
WHERE status = 'PAID'
GROUP BY customer_id;
```

逻辑上只表达：

- 读 `orders`；
- Filter；
- Group By；
- Sum。

这回答的是：

> **要算什么？**

但真正执行时还必须决定：

- 从哪里读取；
- 哪些列真的需要；
- Filter 能不能下推；
- Aggregate 前要不要 Shuffle；
- 用什么 Exchange；
- 每个 Stage 有多少 Partition。

这些回答的是：

> **怎么计算？**

所以要分成：

**Logical Plan = 计算语义**

**Physical Plan = 具体执行方式**

## Unresolved Logical Plan 是什么

当 Spark 刚拿到：

```sql
SELECT amount FROM orders
```

它一开始并不一定已经确认：

- `orders` 属于哪个 Catalog / Namespace；
- `amount` 到底是哪一列；
- Function 是否存在；
- Data Type 是否匹配。

因此最开始可以理解为：

```text
UnresolvedRelation: orders
UnresolvedAttribute: amount
```

也就是：

> 语法结构已经有了，但很多对象还没绑定到真实 Metadata。

## Analyzer 做什么

Analyzer 会利用：

- Catalog；
- Table / View Metadata；
- Schema；
- Function；
- Column Resolution；

把未解析对象绑定到真实对象。

例如：

```text
orders
→ catalog.schema.orders

amount
→ orders.amount: decimal(...)
```

如果 SQL 写了不存在的 Column：

```sql
SELECT not_exist FROM orders;
```

往往在这一层就会失败。

所以：

**Analyzer 主要解决“这段 SQL 到底指的是什么”。**

它不是 Join Tuning 模块。

## Catalyst Optimizer 做什么

Catalyst 是 Spark SQL 的核心优化框架。

在逻辑计划已经合法之后，

Optimizer 可以基于规则和已知信息重写 Logical Plan。

例如高层上可能做：

- Predicate Pushdown；
- Column Pruning；
- Constant Folding；
- 简化表达式；
- 删除无意义节点；
- 重新组织部分逻辑。

不要背几十上百条 Optimizer Rule。

真正需要建立的是：

> Catalyst 利用结构化语义，把“等价但更便宜”的逻辑表达尽量提前找出来。

## Column Pruning 为什么重要

例如：

```sql
SELECT customer_id
FROM orders
WHERE status = 'PAID';
```

即使 `orders` 有 100 列，

Query 只真正需要：

```text
customer_id
status
```

如果 Data Source 支持，

Spark 可以尽量只读取相关列。

于是：

```text
Required Columns ↓
→ File Read ↓
→ Serialization ↓
→ Memory / CPU ↓
```

这就是为什么 DataFrame / SQL 的结构化信息很重要。

## Predicate Pushdown 在哪一层发生

例如：

```sql
WHERE order_date = DATE '2026-09-11'
```

Spark Optimizer 会识别 Filter，

但最终能不能把 Predicate 真正交给 Data Source，

取决于 Data Source Connector 能力。

所以：

**Catalyst 能识别优化机会**

不等于：

**任何 Filter 都一定下推到底层。**

真实边界是：

```text
Spark SQL Optimizer
+
Data Source Capability
+
Storage Metadata / Format
```

共同决定。

这和我们学 Trino 时的 Connector Boundary 很像，

但这里讲的是 Spark SQL 自己的 Data Source 执行链。

## Partition Pruning 和 Predicate Pushdown 不完全一样

### Partition Pruning

根据 Partition Metadata，

直接排除不需要的 Table Partition / File Range。

### Predicate Pushdown

把 Filter 尽量交给更靠近数据源的 Reader 执行。

两者可能同时发生。

例如：

```sql
WHERE order_date = '2026-09-11'
  AND amount > 100
```

可能：

- `order_date` 用于 Partition Pruning；
- `amount > 100` 进一步用于 Parquet Filter / Statistics；
- 剩余条件再由 Spark 执行。

所以不要把所有“少读数据”都叫同一个 Pushdown。

## Physical Planning 在决定什么

Optimized Logical Plan 仍然只表达：

> 最终要完成什么逻辑。

Spark 还需要把它变成 Physical Operator。

例如 Join 逻辑：

```text
Orders JOIN Customers
```

物理上可能是：

- Broadcast Hash Join；
- Sort Merge Join；
- Shuffled Hash Join；
- 其他可用策略。

又例如 Aggregate：

可能包含：

```text
Partial Aggregate
→ Exchange
→ Final Aggregate
```

所以 Physical Plan 才真正开始决定：

**Shuffle、Network、Memory、Task Working Set。**

这就是为什么下一节才正式讲 Join Strategy。

## EXPLAIN 是观察计划的入口

PySpark：

```python
df.explain()
```

或：

```python
df.explain(mode="extended")
```

SQL：

```sql
EXPLAIN
SELECT ...
```

学习时重点不是背输出文本，

而是逐层问：

**Parsed / Analyzed**

→ Spark 是否正确理解对象？

**Optimized Logical Plan**

→ Filter / Projection 是否被合理简化？

**Physical Plan**

→ 真正选择了什么 Scan / Exchange / Join？

## EXPLAIN COST 为什么有价值

Spark 选择执行计划时会使用 Statistics。

可以通过：

```sql
EXPLAIN COST
SELECT ...
```

或者：

```python
df.explain(mode="cost")
```

观察 Optimizer 的 Size / Row Count Estimate。

真正要问的是：

> Spark 认为这一层有多少数据？

因为下一节会看到：

**Statistics 错**

→ **Join Strategy 可能错**

→ **Shuffle / Memory 被放大**

所以 Statistics 不是展示信息，

而是 Plan Decision 的输入。

## Statistics 从哪里来

当前 Spark SQL 的 Statistics 高层可以来自三类：

### Data Source Statistics

例如 Parquet Metadata 中可获得的：

- Count；
- Min / Max；
- Size 等信息。

### Catalog Statistics

例如通过：

```sql
ANALYZE TABLE ...
```

收集 / 更新的 Table / Column Statistics。

### Runtime Statistics

Query 真正运行以后，

Spark 自己得到更准确的 Runtime Data Size。

这一类正是下一节 AQE 的关键输入。

## Catalyst 为什么不能保证“自动最优”

Catalyst 很强，但它不是预言系统。

如果：

- Statistics 缺失；
- Statistics 已过期；
- UDF 是黑盒；
- Data Source 无法 Pushdown；
- 数据分布运行时发生变化；

Optimizer 就可能没有足够信息。

所以：

> 有 Catalyst ≠ 不需要理解 Execution Plan。

恰恰相反，

生产排障必须能把：

**SQL**

→ **Plan**

→ **Runtime**

连起来。

## 和前 5 节怎么接起来

现在完整链条变成：

```text
DataFrame / SQL
→ Lazy Logical Work
→ Analysis / Optimization
→ Physical Plan
→ Shuffle Boundary
→ Stage
→ Partition
→ Task
→ Executor
```

前 5 节讲：

> Spark Runtime 怎么执行。

这一节补上：

> Runtime 前面的 Plan 是怎么来的。

## 这一节先不深入什么

暂时不展开：

- Broadcast Hash Join；
- Sort Merge Join；
- Shuffled Hash Join；
- AQE Runtime Replanning；
- Skew Join；
- Memory Tuning。

因为这些都是：

> Physical Plan 选择之后的下一层问题。

## 关联知识

下一节进入 **Join Strategy、Statistics 与 AQE**。

现在我们已经知道 Statistics 会参与 Planning。

下一步要回答：

> Spark 为什么会选 Broadcast？为什么有时一开始选了 Sort Merge，运行到一半又改成 Broadcast？
