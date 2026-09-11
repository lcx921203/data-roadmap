---
id: kb-trino-cbo-join-dynamic-filtering-001
type: knowledge
title: Statistics, CBO, Join & Dynamic Filtering
title_cn: Statistics、CBO、Join 与 Dynamic Filtering
stage_id: '04'
domain: lakehouse
topic: trino
order: 18
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: trino_l5_v1
summary: Statistics 是 CBO 做决策的输入；CBO 决定 Join Order、Build / Probe 与 Broadcast / Partitioned，Dynamic Filtering 再利用 Build Side 的运行时结果反向减少 Probe Side Scan。
prerequisites:
  - kb-trino-scan-pushdown-001
related:
  - kb-trino-memory-exchange-pressure-001
---
# Statistics、CBO、Join 与 Dynamic Filtering

## 30 秒理解

这一节先记住完整因果链：

**Table / Column Statistics**

→ **Cost Estimation**

→ **CBO（Cost-Based Optimizer）**

→ **Join Order**

→ **Build / Probe**

→ **Broadcast / Partitioned Join**

→ **Dynamic Filtering**

→ **减少 Probe Side Scan**

Trino 不是简单地：

> SQL FROM 后面先写谁，就永远先 Join 谁。

现代 Trino 会在 Statistics 足够时，利用 CBO 比较不同计划的成本。

所以 Statistics 一旦严重缺失或失真，

问题不只是 EXPLAIN 里的数字不好看，

而可能直接变成：

**Join 顺序错、Build Side 选错、Broadcast 选错、网络和内存被放大。**

## Statistics 到底给 Optimizer 什么信息

Trino 的 Statistics 由 Connector 提供给 Query Planner。

高层包括：

### Table Level

- Row Count。

### Column Level

- Data Size；
- Null Fraction；
- Distinct Value Count；
- Low Value；
- High Value。

不同 Connector、不同 Table 能提供多少 Statistics，并不完全相同。

所以：

> Trino 支持 CBO

不等于：

> 任意 Connector 上所有 Query 都一定拥有完整 Statistics。

可以使用：

```sql
SHOW STATS FOR lakehouse.sales.orders;
```

观察当前 Connector 暴露给 Trino 的统计信息。

## 为什么 Statistics 能改变执行计划

假设要 Join：

```text
orders       10 亿行
customer     1000 万行
region       20 行
```

如果 Optimizer 知道这些规模，

它会倾向先把能够最大幅度减少数据的数据源和 Join 组合考虑进去，

避免过早产生巨大 Intermediate Result（中间结果）。

因为真正昂贵的不只是：

**做一次 Join**

而是：

> 一个很大的中间结果被后续多个 Stage 继续计算和跨网络传输。

所以 Join Order 的核心目标之一就是：

**尽量避免大数据过早膨胀。**

## CBO 是怎么思考的

CBO（Cost-Based Optimizer，基于成本的优化器）不会真的把每个候选计划都完整执行一次。

它根据 Statistics 估算不同 Plan Node 的：

- Row Count；
- Output Size；
- CPU；
- Memory；
- Network；

然后比较候选执行方案。

这些估算可以在：

```sql
EXPLAIN
SELECT ...
```

里看到。

如果某些成本无法计算，

你可能看到：

```text
?
```

这通常意味着 Optimizer 缺少足够信息。

所以 EXPLAIN 不只是“看 Plan 长什么样”。

它也是检查：

> CBO 到底有没有足够依据做判断。

## Hash Join：先理解 Build 和 Probe

Trino 的普通 Join 需要先建立一个很重要的模型。

对于 Hash Join：

**Build Side**

先建立 Hash Table。

**Probe Side**

再拿每一行的 Join Key 去 Hash Table 中查找匹配。

可以先想成：

```text
Build Side
→ Hash Table
        ↑
Probe Side → lookup
```

因此 Build Side 的大小非常关键。

因为 Hash Table 需要占用 Memory。

如果 Optimizer 把一个非常大的输入选成 Build Side，

后面很容易产生严重内存压力。

第 8 节会专门讲 Memory。

## Join Order 和 Build / Probe 是两层决策

这两个概念不要混。

### Join Order

回答：

> 多张表应该先 Join 哪两张，再和谁 Join？

例如：

```text
(A JOIN B) JOIN C
```

还是：

```text
A JOIN (B JOIN C)
```

### Build / Probe

回答：

> 对某一次具体 Hash Join，哪一侧先构建 Hash Table，哪一侧流式 Probe？

所以 CBO 的价值不是只有：

**把小表放右边。**

它要同时考虑：

- 多 Join 的整体顺序；
- 每个 Join 的输入规模；
- 数据移动成本；
- Memory；
- Network。

## Broadcast Join

Broadcast Join（广播 Join，也叫 Replicated Join）会把 Build Side 数据复制到参与查询的各个 Worker。

高层看：

```text
Small Build Side
 ├→ Worker A
 ├→ Worker B
 └→ Worker C

Large Probe Side
按原本并行分布继续处理
```

优势：

- Probe Side 不需要为了 Join Key 再全部重分布；
- 当 Build Side 很小时通常非常快。

代价：

- Build Side 要发送到多个 Worker；
- 每个 Worker 都需要为它建立完整 Hash Table；
- Build Side 过大时会放大 Network 和 Memory 压力。

所以 Broadcast 的关键条件不是：

> 小表这个名字听起来“小”。

而是：

> Filter 后真正进入 Build Side 的数据是否足够小。

## Partitioned Join

Partitioned Join（分区 Join）会按 Join Key 对两边数据重新分布。

高层看：

```text
Left Rows  --hash(join_key)--> Worker A/B/C
Right Rows --hash(join_key)--> Worker A/B/C
```

这样同一个 Join Key 会落到对应 Worker。

每个 Worker 只需要处理自己那一部分 Build Side。

优势：

- 可以支持更大的 Join；
- Memory 压力可以分散到整个 Cluster。

代价：

- 两边通常都需要发生 Network Exchange；
- 数据量大时 Network 成本明显；
- Join Key 倾斜时可能产生热点 Worker。

所以：

**Partitioned Join 更能承受大 Build Side，但通常需要更多网络重分布。**

## Trino 怎么选择 Broadcast 还是 Partitioned

当前 Trino 可以通过 CBO 自动选择 Join Distribution。

核心依据还是：

- Statistics；
- 估算的 Build Side 大小；
- Network Cost；
- Memory Cost。

因此：

**Statistics → Join Distribution**

是直接因果关系。

如果 Statistics 明显低估 Build Side，

就可能出现：

```text
实际很大
→ Optimizer 误以为很小
→ 选择 Broadcast
→ 每个 Worker 都复制大 Hash Table
→ Memory Pressure
```

所以后面遇到 Broadcast 导致 OOM，

不要只说：

> 把 Broadcast 关掉。

首先应该追问：

> 为什么 Optimizer 会觉得它适合 Broadcast？

## Statistics 缺失时会怎样

如果 CBO 无法得到足够的 Statistics，

Trino 不可能凭空知道真实 Row Count 和数据分布。

这时某些 Cost-Based Decision 会受限，并使用可用的 fallback 逻辑。

所以生产里一个常见问题是：

**SQL 本身没变，但数据规模变化后计划开始变差。**

可能不是 Optimizer “突然变笨”，

而是：

- Statistics 过旧；
- Connector 没提供关键 Statistics；
- Filter Selectivity 估算偏差；
- 新数据分布发生明显变化。

因此：

**Statistics 是 Query Plan 的数据输入。**

它本身也需要治理。

## Dynamic Filtering 为什么出现在 Join 之后

现在进入一个非常重要的优化。

看一个经典场景：

```sql
SELECT COUNT(*)
FROM fact_sales f
JOIN date_dim d
  ON f.date_key = d.date_key
WHERE d.year = 2026
  AND d.holiday = true;
```

Planning 时，

Fact Table 本身没有：

```sql
WHERE f.date_key IN (...)
```

所以如果只看静态 Predicate，

Fact Table 可能需要扫描非常大的范围。

但 Build Side `date_dim` 很小，而且经过：

```text
year = 2026
holiday = true
```

过滤以后，真正留下的 `date_key` 可能只有很少一批。

当 Build Side 开始运行后，

Trino 可以收集这些 Join Key，

例如：

```text
20260101
20260217
20260704
...
```

然后生成 Dynamic Filter（动态过滤条件）。

## Dynamic Filter 怎样反向减少 Scan

核心链路是：

**Build Side 执行**

→ **收集 Join Key / Range**

→ **形成 Dynamic Filter**

→ **传递到 Probe Side**

→ **限制 Table Scan**

这相当于运行时自动补出：

```text
Probe Side 只需要关心这些可能 Join 成功的 Key。
```

因此：

**Join 不再只是“扫描完以后再匹配”。**

它可以反过来影响前面的 Scan。

## Static Predicate 和 Dynamic Filter 的区别

这是必须一次分清的地方。

### Static Predicate

Query 提交时已经知道：

```sql
WHERE order_date = DATE '2026-09-01'
```

因此 Planning 时就可以利用。

### Dynamic Filter

只有 Build Side 真正跑起来以后才知道：

```text
实际有哪些 Join Key 能匹配
```

因此是 Runtime 信息。

所以：

**Predicate Pushdown**

是把已知条件尽量往数据源推。

**Dynamic Filtering**

是运行时先从 Join 一侧获得新的过滤信息，再反向限制另一侧 Scan。

## Dynamic Filtering 能推到多深

这同样取决于 Connector。

可能只到：

**Worker Table Scan**

也可能继续参与：

- Split Enumeration；
- Partition Pruning；
- ORC / Parquet Row Group Pruning；

具体能力由 Connector 和底层系统决定。

所以 Dynamic Filtering 也不是：

> Trino Core 一打开开关，所有数据源都同样受益。

## Dynamic Filtering 什么时候最有价值

它尤其适合：

**大 Fact Table**

Join：

**被高度过滤后很小的 Dimension Table**

因为最理想的因果链是：

```text
Small selective Build Side
→ collect small key set
→ create Dynamic Filter
→ skip lots of Probe Side data
```

如果 Build Side 很大、Join Key 非常分散，

Dynamic Filter 的收益可能下降，

同时收集 Filter 本身也有开销。

所以它不是“所有 Join 必然加速”。

## CBO 和 Dynamic Filtering 为什么必须一起理解

Dynamic Filtering 能不能高效工作，往往依赖前面 CBO 把更合适的一侧选为 Build Side。

也就是：

**Statistics**

→ **CBO**

→ **较小 / 更有选择性的输入成为 Build Side**

→ **更可控的 Dynamic Filter**

→ **减少 Probe Scan**

如果 Build Side 选错，

不仅 Hash Table 变大，

Dynamic Filter 也可能：

- 收集过多值；
- 生成成本变高；
- 过滤价值变低。

所以不能把 Dynamic Filtering 当成一个孤立“加速开关”。

## 一个典型坏计划怎么形成

把整个因果链串起来。

假设真实情况：

```text
Table A: 10 亿行
Table B: Filter 后 100 万行
```

但 Statistics 过期，Optimizer 误以为：

```text
Table A: 100 万行
Table B: 5000 万行
```

可能发生：

**Statistics 错**

→ **Join Order / Build Side 判断错**

→ **错误 Broadcast 或过大 Build Side**

→ **Memory / Network 放大**

→ **Dynamic Filter 质量差**

→ **Probe Side 仍然扫很多**

→ **Query 很慢甚至失败**

所以排查 Join 慢不能只盯：

> Join Operator CPU 高不高。

应该沿着因果链向前追：

**Statistics → CBO → Distribution → Runtime**

## 怎么观察这条链

### SHOW STATS

先看 Optimizer 能看到什么：

```sql
SHOW STATS FOR lakehouse.sales.orders;
```

### EXPLAIN

看 Plan 估算：

- Estimated Rows；
- Estimated Size；
- Join Distribution；
- Build / Probe；
- Dynamic Filter 是否出现在 Plan。

### EXPLAIN ANALYZE

真正执行后，再比较：

- Estimate；
- Actual Input / Output；
- CPU；
- Scheduled Time；
- Dynamic Filter Stats。

现在只建立这套观察方式。

完整生产排障会在第 11 节重新串起来。

## 这一节先不要深入什么

现在不要继续展开：

- Hash Table 具体内存结构；
- Memory Pool；
- Spill；
- Exchange Buffer；
- Network Saturation；
- Resource Group；
- Task Retry。

因为本节的核心因果链已经完整：

**Statistics → CBO → Join → Dynamic Filtering**

下一节才进入：

> 当 Join、Aggregation、Sort 真正跑起来以后，为什么会形成 Memory 和 Exchange 压力？

## 关联知识

下一节进入 **Memory、Exchange 与大查询压力**。

现在已经知道：

**计划为什么会决定数据怎么 Join。**

下一步自然进入：

**这个计划真正执行以后，数据移动和 Hash Table 到底怎样消耗资源？**
