---
id: kb-spark-join-aqe-001
type: knowledge
title: Join Strategy, Statistics & Adaptive Query Execution
title_cn: Join Strategy、Statistics 与 Adaptive Query Execution
stage_id: '02'
domain: compute
topic: spark
order: 7
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: spark_l5_v1
summary: Statistics 决定 Spark 对数据规模的判断，Physical Planner 据此选择 Join Strategy；AQE 再利用运行时统计调整 Join、Shuffle Partition 与部分 Skew 问题。
prerequisites:
  - kb-spark-sql-catalyst-planning-001
related:
  - kb-spark-skew-shuffle-pressure-001
---
# Join Strategy、Statistics 与 Adaptive Query Execution

## 30 秒理解

这一节的核心因果链是：

**Statistics**

→ **Estimated Data Size**

→ **Join Strategy**

→ **Shuffle / Broadcast / Sort / Hash**

→ **Runtime Statistics**

→ **AQE（Adaptive Query Execution，自适应查询执行）**

→ **调整 Plan**

所以 Spark SQL 不是：

> Planning 阶段选完 Plan，以后绝对不能变。

现代 Spark SQL 可以在运行过程中利用更准确的数据量信息重新优化部分 Physical Plan。

## Join 为什么是 Spark SQL 最重要的成本点之一

Join 经常同时影响：

- Shuffle；
- Network；
- Sort；
- Memory；
- Task Size；
- Skew。

例如两个大表：

```text
Orders  5 TB
Customers 500 GB
```

如果都需要按：

```text
customer_id
```

重新分区，

就可能产生巨大 Shuffle。

但如果一侧 Filter 后实际上只有：

```text
20 MB
```

那把它 Broadcast 到 Executor，

可能完全避免另一侧的大规模 Shuffle。

所以 Join Strategy 本质上是在权衡：

**Network**

**Memory**

**Sort**

**Shuffle**

## 先理解 Build Side 和 Stream Side

对于 Hash Join，

通常需要一侧先建立 Hash Structure。

可以高层理解：

```text
Build Side
→ Hash Table

Stream / Probe Side
→ lookup
```

因此：

> Build Side 越大，Memory 压力通常越高。

Spark 不同 Join Strategy 对：

- 哪一侧 Build；
- 是否 Shuffle；
- 是否 Sort；

处理方式不同。

## Broadcast Hash Join

高层模型：

```text
Small Relation
→ Broadcast
→ Executors

Large Relation
→ keep distributed

Each Task
→ probe small hash relation
```

最大价值：

> 避免把大表按 Join Key 全量 Shuffle。

特别适合：

**一侧足够小**

+

**另一侧明显更大**

的 Equi-Join。

## Broadcast 为什么不是“永远更快”

因为 Broadcast Side 需要：

- 收集 / 构建广播数据；
- 通过网络发送；
- 在执行端占用 Memory。

如果实际 Relation 很大：

```text
Bad Statistics
→ mistakenly broadcast
→ large broadcast data
→ memory / network pressure
→ timeout / OOM / slow
```

所以真正问题不是：

> 小表就 Broadcast。

而是：

> Filter 后真正参与 Join 的数据有多大？

## Sort Merge Join

Sort Merge Join（排序合并 Join）可以先理解为：

```text
Left
→ partition by join key
→ sort

Right
→ partition by join key
→ sort

then merge
```

它适合处理较大的 Equi-Join，

因为不要求把整张 Build Side 都作为一个小广播结构复制出去。

代价是：

- 两侧可能 Shuffle；
- 两侧需要 Sort；
- Network / Disk / CPU 成本更高。

所以它常见于：

> 两边都不够小，无法简单 Broadcast。

## Shuffled Hash Join

Shuffled Hash Join 也需要按 Join Key Shuffle，

但在每个目标 Partition 内：

```text
smaller side
→ local hash table

larger side
→ probe
```

和 Sort Merge 相比，

它可以避免完整 Sort，

但要求每个 Partition 的 Build Side 足够可控。

所以它的适用性非常依赖：

- Partition Size；
- Join Type；
- Runtime Data Distribution。

现代 AQE 也可能根据 Post-shuffle Partition Size 将原计划从 Sort Merge 转成 Shuffled Hash。

## Statistics 为什么直接影响 Join

假设真实数据：

```text
A = 2 TB
B after filter = 30 MB
```

但 Catalog Statistics 过旧：

```text
B estimated = 5 GB
```

Planning 时 Spark 可能不愿意选 Broadcast。

于是：

```text
Both sides shuffle
→ sort
→ sort merge join
```

Query 真正运行后，

Spark 才发现：

```text
B runtime = 30 MB
```

这就是 AQE 有价值的地方：

> Runtime Statistics 比 Planning Estimate 更接近真实数据。

## AQE 是什么

AQE = **Adaptive Query Execution（自适应查询执行）**。

当前 Spark 4.2.0 中它默认开启。

它不是重新执行整条 SQL，

而是：

> 在 Query 执行过程中，利用已经完成的 Shuffle Stage 等产生的 Runtime Statistics，重新优化后续 Physical Plan。

可以理解成：

```text
Initial Physical Plan
→ run part of query
→ get accurate runtime statistics
→ adaptive re-optimization
→ execute improved remaining plan
```

## AQE 能解决哪些典型问题

### 1. Coalesce Post-shuffle Partitions

Planning 时可能先设置较多 Shuffle Partition，

运行后发现：

```text
many partitions are tiny
```

AQE 可以根据 Map Output Statistics 合并相邻的小 Partition。

于是：

```text
many tiny tasks
→ fewer healthier tasks
```

这正好接回上一节的：

**Partition 太多也有 Scheduling Cost。**

### 2. Sort Merge → Broadcast Hash Join

初始 Statistics 认为：

```text
relation too large for broadcast
```

但 Runtime 发现 Filter 后其实很小。

AQE 可以把后续 Join 转成 Broadcast Hash Join，

避免继续执行原本更重的 Sort Merge 路径。

### 3. Sort Merge → Shuffled Hash Join

如果 Shuffle 后每个 Partition 都足够小，

AQE 也可以根据条件改成 Shuffled Hash Join，

避免不必要的 Sort Merge 成本。

### 4. Skew Join Optimization

如果某些 Shuffle Partition 特别大，

AQE 可以识别并拆分部分 Skewed Partition，

必要时复制另一侧对应数据，

让一个巨大 Task 变成多个较小 Task。

Skew 的完整诊断放下一节。

## AQE 为什么不是“自动调优万能按钮”

AQE 有三个明显边界。

### 第一，它只能基于已经看到的 Runtime 信息调整可调整部分

它不能把任意糟糕业务逻辑自动改正确。

### 第二，不是所有算子都能任意换

Join Type、Operator Support、Data Source Capability 都有边界。

### 第三，已经发生的成本不能全部倒退

例如：

> 为了得到 Runtime Statistics，某些 Shuffle 已经发生了。

即使后面 AQE 改成 Broadcast，

前面发生过的部分工作也不是“从未发生”。

所以官方文档也指出：

> Planning 阶段就选对 Broadcast 通常比运行后再转换更高效。

## Join Hint 应该怎么看

Spark 支持：

```sql
/*+ BROADCAST(t) */
/*+ MERGE(t) */
/*+ SHUFFLE_HASH(t) */
```

Hint 的意思是：

> 告诉 Planner 更优先考虑某种策略。

但它不是：

**绝对强制且永远可执行。**

某种 Join Strategy 可能不支持当前 Join Type。

所以生产中 Hint 更适合：

- 验证 Planner 是否选错；
- 临时绕过已确认的估算问题；
- 明确知道数据特征时做受控干预。

而不是：

> 所有 Join 都加 Hint。

长期根因仍然应该看：

**Statistics + Data Distribution + Plan。**

## 一个典型坏计划怎么形成

```text
Statistics stale
→ B estimated too large
→ no broadcast
→ both sides shuffle
→ sort merge join
→ huge exchange
→ long runtime
```

或者反过来：

```text
B estimated too small
→ broadcast chosen
→ actual B large
→ executor memory pressure
→ slow / OOM
```

所以：

**Join 问题的第一层常常不是“Join 算法”，而是“Optimizer 为什么会这样判断数据规模”。**

## EXPLAIN 和 Spark UI 怎么配合

Planning 阶段：

```python
df.explain(mode="cost")
```

看：

- Estimated Size；
- Estimated Rows；
- Physical Join。

运行阶段：

Spark SQL UI 可以看到 Runtime Statistics。

如果发现：

```text
Estimate 100 MB
Actual 20 GB
```

那就知道：

> Plan Decision 的输入本身已经明显偏离真实数据。

## 和上一节、下一节怎么连

上一节：

```text
Logical Plan
→ Physical Plan
```

这一节：

```text
Statistics
→ Join Physical Plan
→ AQE Runtime Adjustment
```

下一节：

```text
Shuffle Data Distribution
→ Skew
→ Straggler
```

也就是说：

> Join Strategy 决定数据怎么移动，而数据怎么移动又决定后面会不会出现 Shuffle Pressure 和长尾 Task。

## 关联知识

下一节进入 **Data Skew、Shuffle Pressure 与 Straggler**。

AQE 已经告诉我们：

> 有些 Partition 会在运行时大得异常。

下一步就正式回答：

> 为什么只有少数 Task 跑几分钟，而绝大多数 Task 几秒就结束？
