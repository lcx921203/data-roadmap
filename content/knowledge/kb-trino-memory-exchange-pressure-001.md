---
id: kb-trino-memory-exchange-pressure-001
type: knowledge
title: Memory, Exchange & Large Query Pressure
title_cn: Memory、Exchange 与大查询压力
stage_id: '04'
domain: lakehouse
topic: trino
order: 19
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: trino_l5_v1
summary: Join、Aggregation、Sort、Window 等 Operator 会形成不同的内存压力；Exchange 又把数据移动放大成网络与缓冲压力。现代 Trino 中，Spill 是遗留的内存降压机制，不应被当成大查询的默认解决方案。
prerequisites:
  - kb-trino-cbo-join-dynamic-filtering-001
related:
  - kb-trino-concurrency-resource-groups-001
---
# Memory、Exchange 与大查询压力

## 30 秒理解

上一节已经知道：

**Statistics → CBO → Join Order → Build / Probe → Join Distribution**

现在继续问：

> 这个 Plan 真正跑起来以后，为什么有的 Query 会把 Worker 内存、网络甚至磁盘都打满？

先记住这条链：

**Operator State**

→ **Memory Pressure**

→ **Exchange / Network Pressure**

→ **Skew / Hot Task**

→ **Blocked / Slow / OOM**

传统 Spill 可以把一部分中间状态从内存转到磁盘，但当前 Trino 已经把 Spill to Disk 定义为 **Legacy Functionality（遗留机制）**。

所以现代心智模型不是：

**内存不够 → 开 Spill**

而是：

**先理解为什么这个 Plan 需要这么多内存 → 再决定是改 Plan、减少数据、隔离 Workload、扩大资源，还是对长 Batch Query 使用 Fault-Tolerant Execution。**

## 为什么不是所有 Operator 都一样吃内存

Trino 是 Pipeline Execution（流水线执行）。

很多 Operator 可以一边收到数据一边继续往下游输出。

例如：

```text
Scan
→ Filter
→ Project
```

通常不需要先把整个输入全部攒在内存里。

但有些 Operator 必须维护较大的中间状态。

典型包括：

- Hash Join 的 Build Side Hash Table；
- 高基数 Aggregation 的 Group State；
- Sort 的待排序数据；
- Window 的窗口状态；
- 部分 Exchange Buffer。

所以：

> Query 扫描数据很多，不代表一定最吃内存。

真正要看：

**哪一个 Operator 必须把多少中间状态留在内存里。**

## Hash Join 为什么特别容易形成内存压力

上一节已经建立：

```text
Build Side
→ Hash Table
        ↑
Probe Side
```

Build Side 要先构建 Hash Table。

因此 Build Side 越大：

**Hash Table 越大**

→ **Worker Memory 越高**

如果是 Broadcast Join，

同一份 Build Side 还需要复制到多个 Worker。

所以一个坏计划可能形成：

**Statistics 低估 Build Side**

→ **CBO 选择 Broadcast**

→ **每个 Worker 都建立大 Hash Table**

→ **集群总内存被倍增消耗**

→ **Query 被 Kill 或节点进入严重 Memory Pressure**

这就是为什么第 08 节必须紧跟第 07 节。

Memory 问题往往不是突然发生，

它可能是前面 Optimizer 决策的后果。

## Aggregation、Sort、Window 为什么也危险

### Aggregation

如果：

```sql
GROUP BY user_id
```

而 `user_id` 有非常高的 Cardinality（基数），

Aggregation 需要维护大量 Group State。

因此：

**Input Row 多**

不一定是最危险的。

真正危险的可能是：

**Distinct Group 数非常多。**

### Sort

Sort 需要对大量输入形成可排序状态。

如果排序数据很大，

Memory 压力会明显上升。

### Window

Window Function 需要根据 Partition / Order 处理一组相关行。

特别大的 Window Partition 也可能需要大量状态。

所以排查 Memory 时不要只问：

> 哪张表最大？

还要问：

> 哪个 Operator 的状态随数据规模怎么增长？

## 当前 Trino Memory 要先分清哪些边界

学习阶段不需要先背所有配置值，

但要建立三个边界。

### Query User Memory

这是 Query 可以明确归因的执行内存。

例如：

- Hash Table；
- Sorting；
- Operator State。

常见限制包括：

```properties
query.max-memory-per-node
query.max-memory
```

超过限制时 Query 可以被终止。

### Total Query Memory

Query 除普通 User Memory 外，还可能使用可回收的 Revocable Memory（可撤销内存）。

Trino 还提供：

```properties
query.max-total-memory
```

限制 Query 在整个 Cluster 上的总 Memory 使用。

### JVM Heap Headroom

不是所有 JVM Allocation 都由 Trino Query Memory Tracker 完整追踪。

因此还需要给 JVM 留出：

```properties
memory.heap-headroom-per-node
```

这部分是节点级安全余量。

所以不能简单认为：

**JVM Heap = 全部都可以给 Query 用。**

## Exchange 到底是什么压力

前面 Stage 已经知道：

不同 Stage 之间通过 Exchange 传递数据。

例如 Partitioned Join：

```text
Worker A ─┐
Worker B ─┼─ hash(key) → Exchange → Worker X/Y/Z
Worker C ─┘
```

这里的成本不是只有 CPU。

还包括：

- Network Transfer；
- Serialization / Deserialization；
- Buffer；
- Backpressure；
- Remote Task Coordination。

所以一个 Query：

**Scan 不大**

也可能因为：

**Exchange 数据巨大**

而变慢。

这就是为什么真正的“大 Query”常常不是：

> 扫描文件特别大

而是：

> 中间结果特别大，并且被反复跨节点移动。

## 为什么 Partitioned Join 会把 Network 放大

Broadcast 和 Partitioned 的代价不同。

Broadcast：

**复制 Build Side**

Partitioned：

**Join 两边按照 Join Key 重新分布**

因此如果两边都很大：

```text
Large Left
+
Large Right
→ Repartition
→ Huge Network Exchange
```

这时即使每个 Worker 内存都还没 OOM，

Network 就可能先成为瓶颈。

所以 Performance Analysis 要同时看：

**Memory**

和：

**Exchange / Network**

不能只看 Heap。

## Skew 为什么会让平均值骗人

假设数据按：

```text
customer_id
```

Hash Partition。

正常情况下：

```text
Worker A  100GB
Worker B   95GB
Worker C  102GB
Worker D   98GB
```

比较均匀。

但如果某一个 Key 占据大量数据：

```text
Worker A   50GB
Worker B   55GB
Worker C  300GB
Worker D   52GB
```

那整个 Stage 的完成时间会被 Worker C 决定。

因此：

**平均 Input Size 正常**

不代表：

**每个 Task 都正常。**

Skew 会同时放大：

- Memory；
- Network；
- CPU；
- Task Duration。

最终形成 Straggler（拖尾 Task）。

## 为什么单纯加 Worker 不一定解决 Skew

如果问题是均匀的大数据量，

增加 Worker 可能提高并行能力。

但如果问题来自：

**一个极端 Hot Key**

那么 Hash Distribution 仍然可能把大量同 Key 数据送到同一个 Partition。

这时：

**更多 Worker**

并不会自动把：

**同一个 Join Key**

拆开。

所以要先区分：

**Capacity 不够**

还是：

**Distribution 不均。**

这两个问题的解决方向完全不同。

## Spill 是怎么工作的

Spill to Disk（落盘）允许某些 Memory-intensive Operator 把中间状态从内存移到本地磁盘。

当前支持的典型场景包括：

- Join；
- Aggregation；
- Order By；
- Window。

例如 Hash Join：

原来 Build Side Partition 全在 Memory。

内存紧张时，可以把部分 Partition 写到 Disk，

后面再逐个读回来完成 Join。

目标是：

**降低 Peak Memory。**

## Spill 为什么不是“免费内存”

因为数据路径从：

```text
Memory
→ CPU
```

变成：

```text
Memory
→ Disk Write
→ Disk Read
→ Memory
→ CPU
```

所以会增加：

- Disk I/O；
- Serialization；
- CPU；
- Query Latency。

当前 Trino 官方文档明确提醒：

**Spill Query 可能比纯内存执行慢几个数量级。**

而且：

**开启 Spill 也不能保证所有大 Query 都成功。**

如果某个 Partition / Window 本身仍然大到无法重新装入 Memory，

仍然可能 OOM。

## Spill 和 FTE 不是一回事

这是必须分清的边界。

### Spill

解决的是：

> Operator 中间状态太大，当前 Memory 放不下。

核心动作：

**内存状态 → 本地磁盘**

### FTE（Fault-Tolerant Execution）

解决的是：

> Query / Task 因 Worker Failure 或资源问题失败后，怎样避免从头重跑全部工作。

核心动作：

**把 Stage Exchange 的中间结果 Spool 到可恢复的 Exchange Storage。**

因此：

```text
Spill
≠
Fault Tolerance
```

即使两者都可能“把中间数据写到存储”，

目标和恢复语义完全不同。

## 为什么现代 Trino 更推荐 FTE 处理大型 Batch Query

当前 Trino 官方已经把 Spill 标成 Legacy Functionality，

并建议考虑：

```text
retry-policy=TASK
+
Exchange Manager
```

原因不是：

> FTE 永远比 Spill 快。

而是 FTE 改变了大型 Query 的执行和恢复模型：

- Task 可以更细粒度重试；
- Exchange 中间结果可以持久化复用；
- 长 Query 遇到节点故障时不必整条从零开始；
- Resource-aware Scheduling 可以更适合重型 Batch Workload。

但它也有额外：

- Storage I/O；
- Coordination；
- Latency；
- Exchange Storage 成本。

所以它适合什么 Workload，要到第 10 节完整讲。

## 一个大 Query 变慢的完整因果链

现在可以把第 07、08 节串起来。

### 路径 A：坏 Join 计划

```text
Statistics 错
→ CBO 估算错
→ Build Side 过大
→ Broadcast / Join Strategy 不合适
→ Hash Table 过大
→ Memory Pressure
→ OOM / Spill / Slow
```

### 路径 B：中间数据移动过大

```text
Filter 不够早
→ Join 前数据仍然很多
→ Partitioned Exchange
→ Huge Network Transfer
→ Buffer / CPU / Network Pressure
→ Stage 变慢
```

### 路径 C：数据倾斜

```text
Hot Key
→ Uneven Partition
→ One Task much larger
→ Memory + CPU + Network hotspot
→ Straggler
→ Entire Stage waits
```

所以大查询排障不能只看：

> 内存够不够？

而要回到：

**Plan → Data Volume → Distribution → Operator State → Resource Pressure**

## 这一节先不要讲什么

现在先不进入：

- 多 Query Queue；
- Resource Group Tree；
- 租户隔离；
- Query Priority；
- Task Retry；
- Exchange Manager 配置细节。

因为这一节回答的是：

> 单个 Query 为什么会把资源吃满？

下一节才从：

**一个 Query**

扩展到：

**很多 Query 同时抢同一个 Cluster。**

## 关联知识

下一节进入 **Concurrency、Queue 与 Resource Group**。

现在已经知道一个大 Query 会消耗：

**CPU + Memory + Network + I/O**

下一步自然要问：

> 如果 50 个 Query 同时进来，为什么“每条单独跑都没问题”的 Query 放在一起就可能把整个 Trino Cluster 拖垮？
