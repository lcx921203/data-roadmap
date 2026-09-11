---
id: kb-spark-skew-shuffle-pressure-001
type: knowledge
title: Data Skew, Shuffle Pressure & Stragglers
title_cn: Data Skew、Shuffle Pressure 与 Straggler
stage_id: '02'
domain: compute
topic: spark
order: 8
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: spark_l5_v1
summary: Shuffle 会把数据按新的 Partition Rule 重新分布；如果 Key 分布极不均，少数 Shuffle Partition 会变得异常巨大，形成 Straggler、Memory Hotspot 和 Stage 长尾。
prerequisites:
  - kb-spark-join-aqe-001
related:
  - kb-spark-memory-cache-spill-001
---
# Data Skew、Shuffle Pressure 与 Straggler

## 30 秒理解

Shuffle 本身已经比本地 Pipeline 贵。

Data Skew（数据倾斜）会进一步把：

**平均成本**

变成：

**少数 Task 的极端成本。**

核心链：

**Hot Key**

→ **Uneven Shuffle Partition**

→ **One / Few Huge Tasks**

→ **Memory / Disk / Network Pressure**

→ **Straggler（拖尾 Task）**

→ **整个 Stage 等最后几个 Task**

所以：

> Spark 性能不能只看平均 Task Duration。

## Shuffle Pressure 和 Data Skew 不是同一个问题

先分清两种情况。

### 情况 A：所有 Partition 都很大

例如：

```text
P0  8 GB
P1  7.5 GB
P2  8.2 GB
P3  7.8 GB
```

这是：

**整体 Shuffle Volume 很大。**

问题可能是：

- Join 两边都大；
- Filter 不够早；
- Partition 数太少；
- 数据量本来就大。

### 情况 B：只有少数 Partition 巨大

例如：

```text
P0   500 MB
P1   620 MB
P2    38 GB
P3   550 MB
```

这才是典型：

**Skew。**

所以：

**Capacity / Partition Size 问题**

和：

**Distribution / Hot Key 问题**

必须分开。

## Hot Key 为什么会产生 Skew

假设按：

```text
customer_id
```

做 Hash Partition。

如果大多数 Customer 各有几百条订单，

但：

```text
customer_id = 0
```

代表“未知用户”，占了全部数据的 30%。

那么 Hash 后：

```text
所有 customer_id=0
→ 同一个目标 Partition
```

于是某个 Task 会远远大于其他 Task。

这就是典型 Hot Key。

常见来源：

- `NULL` / 默认值；
- 超级大客户；
- 热门商品；
- 某个异常业务状态；
- Key 设计本身太粗。

## 为什么多加 Executor 不一定解决 Skew

因为同一个 Shuffle Partition 通常仍然由一个 Task 处理。

如果：

```text
P7 = 50 GB
```

即使再增加 50 个 Executor，

也不会自动把：

```text
P7
```

拆成 50 份。

其他 Executor 可能已经空闲，

但整个 Stage 仍在等这个巨大 Task。

所以典型现象是：

```text
Stage 1000 tasks
→ 995 tasks finished quickly
→ 5 tasks run forever
```

这不是单纯“资源不够”，

而是：

**Work Distribution 不均衡。**

## Straggler 是什么

Straggler 可以理解成：

> 明显比同一 Stage 绝大多数 Task 慢的拖尾 Task。

原因可能包括：

- Data Skew；
- 单机硬件 / Network 异常；
- GC；
- Disk；
- Executor Resource Contention；
- 外部 Storage 慢。

所以：

**Straggler ≠ 一定是 Skew。**

Skew 是 Straggler 的重要原因之一。

生产排查时要看：

> 慢 Task 是因为 Input 明显更大，还是因为同样 Input 却执行异常慢？

## 怎么确认是不是 Skew

在 Spark UI / SQL UI 中重点比较同一 Stage 的：

- Task Duration；
- Input Size；
- Shuffle Read；
- Shuffle Write；
- Records；
- Peak / Spill 指标；
- Max vs Median / Average。

如果看到：

```text
Median Shuffle Read = 300 MB
Max Shuffle Read = 25 GB
```

并且大 Task 的 Duration 同样极端，

就非常像 Data Skew。

这比：

> Job 很慢，所以肯定倾斜

可靠得多。

## AQE Skew Join Optimization 怎么处理

上一节已经知道 AQE 可以拿到 Runtime Shuffle Statistics。

对 Sort Merge Join 的 Skew Partition，

AQE 可以高层做：

```text
one huge skewed partition
→ split into smaller pieces
→ replicate matching data from other side if needed
→ multiple tasks
```

目标是：

> 不再让一个巨大 Partition 永远绑定一个巨大 Task。

当前 Spark 4.2.0 默认支持这类 AQE Skew Join Optimization。

但不要理解成：

> 开了 AQE，就再也没有数据倾斜。

## AQE 解决不了哪些 Skew

例如：

- 非 Join 场景的复杂业务 Hot Key；
- 自定义 UDF 内部工作量极不均；
- 单 Key 本身需要巨大状态；
- 数据源读取本身极度不均；
- AQE 不支持 / 无法安全拆分的算子路径。

这时仍然需要业务级处理。

## Salting 是什么

Salting（加盐）是人为把一个 Hot Key 拆成多个子 Key。

例如原来：

```text
customer_id = 0
```

全部进入同一个 Partition。

可以改成：

```text
(0, salt=0)
(0, salt=1)
(0, salt=2)
...
```

把数据打散到多个 Partition。

后面再：

- 去掉 Salt；
- 二次聚合；
- 或在 Join 另一侧复制对应 Key；

恢复原来的业务语义。

核心本质：

> **用额外数据 / 额外计算，换更均匀的 Partition Distribution。**

## 为什么 Salting 不是默认答案

因为它有真实成本：

- 逻辑复杂度增加；
- Join 小表可能需要复制多份 Key；
- 数据量增加；
- 多一轮 Aggregate；
- Salt 数量需要校准；
- 业务语义更容易写错。

所以合理顺序通常是：

**先确认真的 Skew**

→ **看 AQE 是否已经能解决**

→ **检查 Key / NULL / 默认值设计**

→ **再考虑 Salting**

而不是一看到慢 Join 就：

> 加盐。

## Salt 数量怎么理解

没有万能：

```text
salt = 10
```

更合理的思路是：

假设一个 Hot Key 有：

```text
100 GB
```

你希望单个目标 Task 只处理：

```text
约 5 GB
```

那至少需要把这个 Key 拆成：

```text
约 20 份
```

但实际还要考虑：

- Cluster 并发；
- Join 另一侧复制成本；
- 其他 Key 分布；
- Task Working Set。

所以 Salt 数不是拍脑袋常量，

而是：

**Hot Key Size / Target Partition Workload**

驱动的工程参数。

## Repartition 能不能解决 Skew

取决于你怎么 Repartition。

如果：

```python
df.repartition("customer_id")
```

但 `customer_id=0` 本来就是 Hot Key，

重新 Hash 以后它还是会进入同一个目标 Partition。

所以：

> **按同一个倾斜 Key Repartition，不会自动消灭这个 Key 的倾斜。**

Repartition 更适合解决：

- Partition 数量不合理；
- 随机分布不均；
- 需要改变 Partitioning Strategy；

而单 Hot Key 往往需要：

- AQE Split；
- Salting；
- 业务拆分。

## Shuffle Pressure 还会带来什么

即使没有明显 Skew，

巨大 Shuffle 也会产生：

```text
Shuffle Write
→ local disk / buffer
→ network fetch
→ Shuffle Read
→ downstream task
```

因此会消耗：

- Network；
- Disk I/O；
- Serialization CPU；
- Memory Buffer；
- Executor 时间。

所以优化 Skew 不能忘了：

> 可能整体 Shuffle 本身就不该这么大。

有时候更好的根因修复是：

**Filter 提前**

**Broadcast 合理**

**减少不必要 Join**

而不是只拆 Skew Partition。

## Speculation 能解决 Skew 吗

Speculative Execution（推测执行）会对异常慢的 Task 再启动一个副本，

谁先完成就采用谁的结果。

它适合：

> 同样工作量，但某台 Executor / Disk / Network 特别慢。

对于真正 Data Skew：

```text
原 Task = 30 GB
副本 Task = 30 GB
```

副本仍然要处理同样巨大的 Partition。

所以：

> Speculation 不是 Data Skew 的根治方案。

它解决的是 **慢机器 / 异常执行副本**，

不是 **数据本身分配不均**。

## 一个完整的 Skew 排障链

以后看到：

```text
Stage 99% finished
but hangs for long time
```

按这条链问：

**1. 还剩几个 Task？**

→ 少数 Task 拖尾？

**2. 慢 Task 的 Input / Shuffle Read 是否明显更大？**

→ 是：优先怀疑 Skew。

**3. Key 分布是否存在 Hot Key / NULL / Default Value？**

→ 找业务原因。

**4. AQE 是否已经识别 Skew？**

→ 看 Adaptive Plan。

**5. Repartition 是否只是重复按同一个 Hot Key Hash？**

→ 可能没意义。

**6. 是否需要 Salting / 业务拆分？**

→ 最后才进入自定义治理。

## 这一节先不深入什么

现在先不展开：

- Unified Memory；
- Execution / Storage Memory；
- Cache / Persist；
- Spill；
- GC；
- Executor OOM。

因为这一节先回答：

> 为什么 Task Workload 不均衡。

下一节才回答：

> 当某个 Task 真正拿到过大的 Working Set 后，Memory 到底发生什么？

## 关联知识

下一节进入 **Memory、Cache/Persist、Serialization、Spill 与 OOM**。

到这里我们已经从：

**Logical Plan**

一路走到了：

**Physical Join → Shuffle → Partition Distribution → Straggler**

下一步进入 Runtime Resource Pressure。
