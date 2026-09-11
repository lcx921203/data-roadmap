---
id: kb-spark-memory-cache-spill-001
type: knowledge
title: Memory, Cache/Persist, Serialization, Spill & OOM
title_cn: Memory、Cache/Persist、Serialization、Spill 与 OOM
stage_id: '02'
domain: compute
topic: spark
order: 9
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: spark_l5_v1
summary: Spark Memory 问题不能只看 Executor 总内存。真正需要区分 Execution Memory、Storage Memory、Task Working Set、Cache、Serialization、Spill 与 GC，才能解释为什么某些 Task 会 OOM。
prerequisites:
  - kb-spark-skew-shuffle-pressure-001
related:
  - kb-spark-structured-streaming-execution-001
---
# Memory、Cache/Persist、Serialization、Spill 与 OOM

## 30 秒理解

上一节已经知道：

**Skew / Partition Size**

→ **Task Working Set**

现在进入真正的 Memory 层。

先记住主链：

**Task Working Set**

→ **Execution Memory**

→ **Storage Memory / Cache 竞争**

→ **Serialization / Spill**

→ **GC Pressure**

→ **Executor OOM / Slow Task**

所以 Spark Memory 问题不是：

> Executor 内存小，加大就行。

很多时候真正的问题是：

> 某个 Task 一次需要处理的数据太大，或者数据分布太不均衡。

## Spark Memory 先分成哪两类

Spark 官方高层把 Managed Memory 主要分成：

### Execution Memory

用于真正计算。

例如：

- Shuffle；
- Join；
- Sort；
- Aggregation。

可以理解成：

> Task 当前为了完成计算，需要暂时放在内存里的 Working Data。

### Storage Memory

用于保存后续还要复用的数据。

例如：

- Cache；
- Persist；
- Broadcast / Internal Storage 的一部分。

可以理解成：

> Spark 希望保留一段时间、以后继续使用的数据。

这两类 Memory 共享一个 Unified Memory Region（统一内存区域）。

## Unified Memory 为什么重要

以前很容易产生一个错误理解：

> Execution 和 Cache 各自固定占一块，互不影响。

现代 Spark 的高层模型不是这样。

更接近：

```text
Unified Memory
├─ Execution
└─ Storage
```

当 Execution 压力上升时，

它可以在一定边界内驱逐 Storage 中可驱逐的 Cache Block。

所以：

```text
Execution needs memory
→ cached blocks may be evicted
→ later reuse may recompute / reload
```

这就是为什么：

> Cache 并不是“占住以后绝不会动”。

## 为什么 Cache 不能当成“多存一点总会更快”

假设一个 Dataset：

```text
500 GB
```

你把它全部 Cache，

但 Executor 还要做：

- Hash Join；
- Sort；
- Shuffle；
- Aggregation。

这时 Storage Memory 和 Execution Memory 会竞争。

如果 Cache 太重：

```text
Cache occupies memory
→ Execution needs working space
→ Cache eviction
→ recomputation / reread
→ more CPU / I/O
```

甚至还可能形成：

**GC Pressure**

所以正确问题不是：

> 这个 DataFrame 会不会被重复使用？

而是：

> 重用收益是否大于 Cache 占用、GC 和重算成本？

## cache() 和 persist() 的区别

高层先这么记：

### cache()

是：

> 使用默认 Storage Level 的便捷写法。

```python
df.cache()
```

适合：

> 我确实需要重复复用这个 Dataset，但不想自己指定 Storage Level。

### persist()

允许显式指定存储策略。

例如可以选择：

- Memory；
- Memory + Disk；
- Serialized；
- Replication；

等不同 Storage Level。

所以：

```text
cache
= convenience API

persist
= explicit storage policy
```

真正生产设计更应该关注：

**数据是否值得长期驻留**

而不是 API 名字本身。

## 为什么 Cache 被 Evict 以后不一定“数据丢了”

Spark 的 Cache 不是数据库持久化。

Cache Block 被清理以后，

Spark 通常仍然可以根据：

- 原始数据；
- Lineage；
- 上游 Transformation；

重新计算。

也就是：

```text
Cache hit
→ reuse quickly

Cache miss / evicted
→ recompute from lineage
```

所以 Cache 更像：

**计算结果复用优化**

而不是：

**业务数据持久化层。**

## unpersist 为什么重要

如果某份 Cache 已经不再使用，

应该：

```python
df.unpersist()
```

让 Storage Memory 尽早释放。

否则：

```text
old cached data
+
new computation
→ unnecessary memory pressure
```

生产 Spark Job 里：

> Cache 生命周期管理

和：

> Cache 本身

同样重要。

## Serialization 为什么会影响 Spark 性能

分布式计算里数据经常需要：

- Network Shuffle；
- 写磁盘；
- Cache；
- 在 JVM / Python 边界传递。

这些过程经常涉及 Serialization（序列化）。

如果对象：

- 很大；
- 很碎；
- 对象数量很多；

会产生：

- 更多字节；
- 更高 CPU；
- 更多 GC；
- 更大 Network / Disk 成本。

所以 Spark Performance 不能只看：

**Row Count。**

还要看：

**Object Representation / Serialized Size。**

## 为什么 Java Object 可能比原始数据大很多

JVM Object 会带：

- Object Header；
- Pointer；
- Wrapper Object；
- Collection Metadata。

例如：

```text
原始数字
```

本身很小，

但如果放进多层：

```text
Map
→ Entry
→ Object Wrapper
→ String
```

真实 Heap 占用会明显放大。

这也是为什么 Spark SQL 的 Internal Row / Columnar Representation 往往比任意 Java Object Tree 更容易优化。

## Kryo 应该怎么理解

Spark 可以使用 Kryo 等更紧凑的 Serialization 方案。

高层价值：

```text
smaller serialized data
→ lower network / disk bytes
→ lower memory footprint
```

但不要把：

> 开 Kryo

当作所有 Spark 慢任务的第一答案。

如果真正问题是：

```text
one skew partition = 80 GB
```

更好的 Serializer 也不能从根本上修复：

**数据分布错误。**

所以顺序应该是：

**先判断 Working Set 为什么这么大**

再谈：

**怎样更紧凑。**

## Spill 到底是什么

当某些需要大量 Execution Memory 的算子无法继续全部保存在内存时，

Spark 可以把部分中间数据写到磁盘。

典型场景包括：

- Sort；
- Shuffle；
- Aggregation；
- Join。

高层链：

```text
Execution memory pressure
→ write intermediate data to disk
→ free memory
→ later read / merge
```

这就是 Spill（落盘）。

## Spill 为什么不是免费的“扩展内存”

因为原本：

```text
Memory
→ CPU
```

变成：

```text
Memory
→ Disk Write
→ Disk Read
→ CPU
```

所以 Spill 会增加：

- Disk I/O；
- Serialization；
- CPU；
- Runtime。

因此：

> Spill 可以让 Query 继续执行，但通常意味着已经在用磁盘换内存。

如果一个 Stage 大量 Spill，

应该继续追问：

> 为什么这个 Task 的 Working Set 这么大？

## OOM 最常见的误判

很多人看到：

```text
OutOfMemoryError
```

马上：

> 加 Executor Memory。

但 OOM 可能来自完全不同的路径。

### 路径 A：Partition 太大

```text
Partition too large
→ Task working set too large
→ OOM
```

这时：

**增加 Parallelism / 修复 Skew**

可能比盲目加 Memory 更有效。

### 路径 B：Bad Broadcast

```text
bad statistics
→ broadcast too-large side
→ replicated build data
→ executor memory pressure
```

应该回到：

**Statistics / Join Strategy。**

### 路径 C：Cache 太多

```text
large cached datasets
→ storage pressure
→ GC / eviction
→ execution slowdown
```

需要重新评估：

**Cache Benefit。**

### 路径 D：Driver collect

```text
huge result
→ collect()
→ driver memory
→ Driver OOM
```

这甚至不是 Executor Memory 问题。

## Task Working Set 为什么是关键

官方 Spark Tuning Guide 也特别强调：

> Reduce Task OOM 可能不是整个 RDD 放不下，而是一个 Task 当前要处理的数据太大。

这和前面的 Skew 直接连上：

```text
Hot Key
→ huge shuffle partition
→ huge task working set
→ memory pressure
→ spill / OOM
```

所以第 8、9 节不是两个孤立知识点。

## GC Pressure 为什么会让 Task 看起来“莫名其妙很慢”

如果 Executor Heap 中：

- 大量短生命周期对象；
- Cache Object；
- Shuffle / Join 中间对象；

不断创建和释放，

JVM 会频繁 GC。

于是：

```text
CPU time
→ increasingly spent in GC
→ less time doing real work
```

UI 里可能看到：

- Task Duration 高；
- GC Time 比例高；
- Executor 偶发停顿。

所以：

> CPU 高

不一定等于：

> 业务计算很多。

也可能是：

> JVM 正在反复回收对象。

## Memory 问题的正确排查顺序

以后看到 OOM / Spill / GC：

**1. 是 Driver 还是 Executor？**

**2. 哪个 Stage / Task？**

**3. Task Input / Shuffle Read 是否异常大？**

**4. 是否存在 Skew？**

**5. Join Strategy 是否合理？**

**6. 是否有过度 Cache？**

**7. Spill 多不多？**

**8. GC 是否异常？**

最后才考虑：

> Executor Sizing 要不要调整。

## 这一节到这里先停

现在已经完成 Batch / Spark SQL Runtime 的资源层：

```text
Physical Plan
→ Partition Distribution
→ Task Working Set
→ Memory / Spill / GC
```

下一步进入 Structured Streaming。

但 Streaming 不会另起炉灶。

它仍然复用：

**Spark SQL + DataFrame + Distributed Execution**

只是加入：

- 持续输入；
- Trigger；
- Progress；
- State；
- Checkpoint。

## 关联知识

下一节进入 **Structured Streaming Execution Model**。
