---
id: kb-spark-production-troubleshooting-001
type: knowledge
title: Failure, Observability, Backfill & Capacity
title_cn: Failure、Observability、Backfill 与 Capacity
stage_id: '02'
domain: compute
topic: spark
order: 12
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: spark_l5_v1
summary: 最后一节不再引入新的 Spark 核心机制，而是把 Job / Stage / Task、Shuffle、Skew、Memory、Streaming State、Retry 与资源竞争重新组织成一套生产排障、回填和容量模型。
prerequisites:
  - kb-spark-streaming-state-reliability-001
related:
  - kb-spark-job-stage-task-shuffle-001
  - kb-spark-skew-shuffle-pressure-001
  - kb-spark-memory-cache-spill-001
  - kb-spark-structured-streaming-execution-001
---
# Failure、Observability、Backfill 与 Capacity

## 30 秒理解

前 11 节已经把 Spark 的核心机制学完。

最后一节只做一件事：

**把这些机制重新组织成生产诊断模型。**

以后看到：

> Spark Job 慢了。

不要先猜：

- Executor 太少；
- 内存不够；
- Shuffle 太大；
- 数据倾斜；
- Cache 没开。

先问：

**问题发生在哪一层？**

可以先沿这条链定位：

```text
Application
→ Job
→ Stage
→ Task
→ Shuffle / Data Distribution
→ Memory / GC / Spill
→ Streaming Backlog / State
→ Failure / Retry
→ Cluster Resource / Capacity
```

只有先确定异常层级，

参数调整才有意义。

## 第一原则：先定位到 Job / Stage / Task

Spark UI 是排障第一入口。

不要只看：

```text
Application took 40 min
```

因为 Application 里可能有很多 Job，

真正慢的也许只是：

```text
Job 17
→ Stage 42
→ 3 slow tasks
```

生产排障首先要不断缩小范围：

**Application**

→ 哪个 **Job**

→ 哪个 **Stage**

→ 哪些 **Task**

直到找到第一个异常层。

## Spark UI 应该先看什么

当前 Spark Web UI 可以直接观察：

- Jobs；
- Stages；
- Tasks；
- Executors；
- Storage；
- SQL；
- Structured Streaming。

对普通 Batch Job，

最先问：

### 哪个 Stage 最慢？

不是所有 Stage 都值得看。

### 慢 Stage 的 Task 是“全部慢”还是“少数慢”？

这决定后面是：

**整体容量 / Shuffle**

还是：

**Skew / Straggler。**

### Executor 有没有异常？

例如：

- Lost Executor；
- GC Time 高；
- Memory / Disk Spill 高；
- Task Failure 多。

先定位现象，再回到前面章节的因果链。

## 第二层：所有 Task 都慢，还是少数 Task 慢

这是 Spark 排障里非常关键的一刀。

### 所有 Task 都差不多慢

例如：

```text
Task 1  120s
Task 2  118s
Task 3  125s
Task 4  121s
```

更像：

- 所有 Partition 都太大；
- 整体 Shuffle 很重；
- 外部 Storage 慢；
- CPU / Network / Disk 已饱和；
- Cluster Resource 不足。

### 少数 Task 极端慢

例如：

```text
Median 15s
Max    480s
```

优先看：

- Data Skew；
- Hot Key；
- 单 Executor 异常；
- GC；
- Disk / Network Straggler。

所以：

> **平均值不能替代 Task Distribution。**

## 第三层：先区分“大 Shuffle”和“Skew”

这两个问题经常被混成：

> Shuffle 太大。

### 大但均匀

```text
P0  8GB
P1  8GB
P2  7GB
P3  9GB
```

这是整体 Shuffle Volume 问题。

可能要回到：

- Filter 是否太晚；
- Join Strategy；
- Partition 数；
- 业务数据量。

### 极度不均

```text
P0  400MB
P1  450MB
P2   40GB
P3  380MB
```

这是典型 Skew。

应该回到：

- Hot Key；
- NULL / Default Value；
- AQE Skew Handling；
- 最后才考虑 Salting。

所以不要看到：

> 一个 Stage Shuffle Read 很大

就自动回答：

> 数据倾斜。

## 第四层：Memory 高到底是原因还是结果

看到 Executor OOM 时，

先问：

> 为什么这个 Task 需要这么大的 Working Set？

可能有多条路径。

### 路径 A：Partition 太大

```text
Partition too large
→ Task working set too large
→ spill / GC / OOM
```

### 路径 B：Skew

```text
Hot Key
→ one huge shuffle partition
→ one huge task
→ OOM
```

### 路径 C：Bad Join Plan

```text
bad statistics
→ wrong broadcast / join strategy
→ memory pressure
```

### 路径 D：Cache 过多

```text
large cached blocks
→ storage pressure
→ eviction / GC
→ execution slowdown
```

所以：

> OOM 是结果，不一定是根因。

生产排障应该继续向前追。

## 第五层：Spill 是不是正在救火

如果看到：

- Memory Spill；
- Disk Spill；

很高，

说明某些 Task 已经在：

**用磁盘换内存。**

这时不要只问：

> Spill 能不能再开大一点？

而要问：

**为什么 Task Working Set 放不下？**

如果根因是：

- Skew；
- Partition 太少；
- Bad Join；
- Aggregate Cardinality 太高；

那么 Spill 只是：

> 让任务不那么快失败。

它没有修复根因。

## 第六层：GC 高说明什么

高 GC Time 表示 JVM 花大量时间管理对象生命周期。

可能来自：

- 太多 Java Object；
- 大量中间对象；
- Cache；
- Memory Pressure；
- Serializer / Representation；
- Task Working Set 太大。

如果：

```text
CPU 90%
```

但大部分时间都在 GC，

那并不是：

> 业务计算效率很高。

而是：

> Executor 在反复清理 Heap。

所以生产上要把：

**Task Time**

和：

**GC Time**

分开看。

## 第七层：Task Failure 先分瞬时失败还是确定性失败

Spark 可以重试失败 Task。

但 Retry 只适合：

**Transient Failure（瞬时失败）**。

例如：

- Executor 临时丢失；
- 短暂网络异常；
- 某次 Fetch Failure。

如果同一个 Task：

```text
attempt 1 failed
attempt 2 failed
attempt 3 failed
attempt 4 failed
```

而且每次都是同样的：

- 数据解析错误；
- 用户代码 Bug；
- 确定性 OOM；
- 不可访问路径；

那继续重试没有意义。

正确做法是：

> 停止把确定性失败伪装成可靠性问题。

## Task Retry 和 Lineage 怎么接起来

前面第 3、4 节已经学过：

```text
Lineage
→ recomputation path
```

Task 失败后，

Spark 可以利用：

- 上游数据；
- Lineage；
- Shuffle Output；
- Cache；
- Checkpoint；

重新生成需要的数据。

所以 Spark 容错不是：

> 每次失败都整条 Application 从头跑。

而是尽量在：

**Task / Stage 依赖**

层面重新计算。

但实际重算半径取决于：

> 哪些中间数据还存在。

## Executor Loss 为什么可能扩大重算范围

Executor 不只运行当前 Task。

它还可能保存：

- Cache Block；
- Shuffle Data；
- Broadcast / Runtime Data。

Executor 丢失以后，

这些本地数据也可能一起消失。

于是：

```text
executor loss
→ local intermediate data lost
→ downstream task needs data
→ recomputation / refetch
```

所以：

> 一个 Executor 挂了

不一定只等于：

> 当前 Task 重试一次。

它可能造成更多依赖重算。

## Speculation 到底解决什么

Speculative Execution（推测执行）用于：

> 某个 Task 明显比同 Stage 其他 Task 慢时，再启动一个副本。

高层：

```text
Task A on Executor 1 is unusually slow
→ launch duplicate Task A on Executor 2
→ first successful attempt wins
```

它适合：

- 慢机器；
- 异常 Disk；
- Network 抖动；
- 某个 Executor 状态异常。

但如果真正原因是：

```text
one skew partition = 40 GB
```

副本还是要处理：

```text
40 GB
```

所以：

**Speculation ≠ Data Skew Solution。**

## Structured Streaming 排障第一刀：有没有 Backlog

Streaming Query 和 Batch 最大不同：

> 输入还在继续来。

所以一个 Streaming Query 慢，

不能只看：

```text
Batch Duration = 10s
```

还要比较：

**Input Rate**

和：

**Processing Rate。**

如果长期：

```text
Input Rate > Processing Rate
```

就会：

```text
Backlog ↑
→ End-to-end Latency ↑
→ State / Checkpoint pressure may rise
```

这意味着：

> Query 正在持续欠债。

## Streaming 的状态问题要单独看

Structured Streaming 当前可以观察：

- Input Rate；
- Processing Rate；
- Latency；
- Watermark；
- State Rows；
- State Used Bytes。

如果看到：

```text
state rows ↑
state bytes ↑
batch duration ↑
```

要回到第 11 节：

- Watermark 是否合理？
- State 是否能清理？
- Key 是否持续增长？
- TTL / Timer 是否适用？
- Late Data 策略是否过于宽松？

所以 Streaming 慢可能不是：

> Executor 少。

而是：

> State 生命周期设计不合理。

## Backfill 为什么很容易打爆在线资源

Backfill（历史回填）本质上会瞬间引入：

**远高于日常增量的数据量。**

例如日常：

```text
每天处理 200 GB
```

一次回填：

```text
30 TB
```

如果直接和正常 Pipeline 共用同一 Cluster：

```text
Backfill
→ many tasks
→ heavy shuffle
→ high object-store traffic
→ executor pressure
→ normal jobs delayed
```

所以生产 Backfill 不能只问：

> 这段 SQL 能不能跑？

还要问：

> 它和正常 Workload 同时跑时，会不会破坏正常 SLO？

## Backfill 的正确思路

### 先切分

例如按：

- Date；
- Partition；
- Business Range；

拆成多个可恢复单元。

不要一个 Application 一口气吞所有历史。

### 控制并发

不是：

```text
30 days
→ launch 30 huge jobs at once
```

而是逐级放量。

### 观察 Saturation

例如：

```text
1 backfill unit
→ 2
→ 4
→ 8
```

观察：

- Throughput；
- Runtime；
- Queue / Pending；
- Executor Utilization；
- Shuffle；
- Storage Throughput；
- Failure。

### 留 Headroom

生产 Cluster 不能为了回填：

> 把所有资源持续跑到 100%。

还要保护：

- 正常 ETL；
- Streaming；
- 失败重试；
- Executor Loss。

## 为什么“加 Executor”不是容量规划

Spark Capacity 至少要同时看：

- Input Data Volume；
- Partition Count；
- Shuffle Volume；
- CPU Time；
- Task Working Set；
- Spill；
- Network；
- External Storage Throughput；
- Concurrent Applications；
- Streaming Input Rate；
- State Size；
- Backfill Peak。

所以：

**Executor Count**

只是容量模型中的一个结果变量。

不是：

> 容量规划本身。

## Dynamic Allocation 怎么放进容量思维

Spark 支持 Dynamic Allocation：

```text
Pending Work ↑
→ request more executors

Idle Executors
→ release executors
```

它可以提升：

- Cluster Utilization；
- 多 Workload 资源弹性。

但不能把它理解成：

> 自动解决所有容量问题。

如果：

- Partition 太少；
- 单 Task OOM；
- Hot Key；
- Storage 被限流；
- Shuffle Network 饱和；

再多 Executor 也不一定有效。

所以：

**Dynamic Allocation 解决资源数量弹性**

不是：

**数据分布和执行计划修复。**

## Resource Isolation 应该怎么看

同一个 Cluster 里可能同时存在：

- Daily ETL；
- Ad-hoc；
- Backfill；
- Streaming；
- ML。

这些 Workload：

- 优先级；
- 时长；
- Resource Pattern；

都不同。

Spark 可以通过：

- Cluster Manager Queue / Namespace；
- Fair Scheduler；
- Application Resource Limit；

做资源隔离。

但最后仍要回到一个原则：

> 不要让一次低优先级 Backfill 把生产主链资源全部抢走。

如果两类 Workload 的：

- SLO；
- Failure Domain；
- Resource Pattern；

差异长期很大，

最终也可能需要：

**独立 Cluster / 独立资源池。**

## Spark 的观测面分三层

### 第一层：Application 现场

使用：

**Spark Web UI**

回答：

> 当前哪一个 Job / Stage / Task 出问题？

### 第二层：历史回放

使用：

**Event Log + Spark History Server**

回答：

> 昨天已经结束的 Application 为什么慢？

Spark UI 默认只跟当前 Application 生命周期共存。

Event Log 持久化后，

History Server 才能事后重建执行信息。

### 第三层：长期 Metrics / Alert

通过 Metrics System、外部监控平台，

跟踪：

- Executor；
- JVM；
- Shuffle；
- Streaming；
- Cluster；

趋势。

Production Observability 不能只依赖：

> 出问题以后人工打开 UI。

## Batch SLO 应该怎么定义

不要直接用：

> CPU < 70%

当业务 SLO。

更有意义的是：

- Job Completion Time；
- On-time Success Rate；
- Failure Rate；
- Backfill Completion Window；
- Cost / Data Volume。

然后用：

- CPU；
- Memory；
- GC；
- Shuffle；
- Spill；

解释为什么 SLO 没达到。

也就是：

**SLO 是结果**

**Runtime Metric 是因果证据。**

## Streaming SLO 应该怎么定义

Structured Streaming 更应该关注：

- End-to-end Latency；
- Processing Lag / Backlog；
- Input vs Processing Rate；
- Micro-batch Duration；
- State Growth；
- Query Restart / Failure；
- Late Data / Watermark Business Requirement。

例如：

```text
Input Rate stable
Processing Rate falling
State Bytes growing
```

这比单独看：

```text
Executor CPU = 85%
```

更接近业务风险。

## 一套 Spark Capacity Calibration 方法

### 第一步：选代表性 Workload

不要拿平均 Job。

至少分：

- Narrow ETL；
- Heavy Shuffle Join；
- Skew-prone Job；
- Backfill；
- Stateful Streaming。

### 第二步：建立单任务基线

记录：

- Input；
- Stage Duration；
- Task Distribution；
- Shuffle；
- Peak Working Set；
- Spill；
- GC；
- Executor Utilization。

### 第三步：逐级扩大数据或并发

例如：

```text
1x
→ 2x
→ 4x
→ 8x
```

或：

```text
1 concurrent job
→ 2
→ 4
→ 8
```

### 第四步：找 Saturation Point

当继续加资源 / 并发以后：

```text
Throughput no longer grows
Task duration rises
Spill / GC rises
Storage / Network saturates
Failure rises
```

就进入当前架构的饱和区。

### 第五步：保留 Failure Headroom

容量必须允许：

- Executor Loss；
- Retry；
- Backfill；
- 数据波动；
- Storage Latency 抖动。

不能把正常运行水位设计成：

**永久贴着极限。**

## 一套 Batch Job 排障顺序

以后可以按这条链走：

```text
1. 哪个 Job 慢？
2. 哪个 Stage 慢？
3. 所有 Task 慢还是少数慢？
4. Shuffle 是否异常？
5. 是否 Skew？
6. Physical Plan / Join 是否合理？
7. Task Working Set 是否过大？
8. Spill / GC 是否异常？
9. Executor 是否 Lost / OOM？
10. Retry 是否在重复确定性失败？
11. 外部 Storage / Network 是否饱和？
12. Cluster 是否存在并发资源竞争？
```

这不是参数 Checklist。

它本质上是：

> **从执行层级逐步缩小 Failure Domain。**

## 一套 Streaming 排障顺序

```text
1. Input Rate vs Processing Rate？
2. Backlog 是否增长？
3. Batch Duration 是否持续上升？
4. 哪个 Stage / Operator 变慢？
5. State Rows / Bytes 是否增长？
6. Watermark / TTL 是否合理？
7. Shuffle / Skew 是否出现？
8. Checkpoint / Sink 是否变慢？
9. Executor 是否存在 OOM / GC / Loss？
10. 恢复后能不能稳定追平积压？
```

Streaming 最终目标不是：

> Query 重新 Running。

而是：

> Query 能恢复到 Processing Rate > Input Rate，并重新追平 Backlog。

## Spark 12 节最终形成的完整模型

现在把整个 Spark Vertical Slice 压缩成一条主线：

**01｜Spark 是什么**

→ 分布式计算引擎

**02｜谁控制、谁执行**

→ Driver / Executor / Cluster Manager

**03｜为什么先不执行**

→ DataFrame / Dataset / Lazy Evaluation / DAG

**04｜计算怎样被拆开**

→ Job / Stage / Task / Shuffle

**05｜并行度从哪里来**

→ Partition / Repartition / Coalesce

**06｜SQL 怎么变成执行计划**

→ Catalyst / Logical / Physical Plan

**07｜Join 为什么这样选**

→ Statistics / Join Strategy / AQE

**08｜为什么只有少数 Task 特别慢**

→ Shuffle / Skew / Straggler

**09｜为什么会 Spill / OOM**

→ Working Set / Memory / Cache / GC

**10｜Streaming 怎样持续运行**

→ Incremental Query / Trigger / Progress

**11｜Streaming 怎样维护状态和恢复**

→ State / Watermark / Checkpoint / Exactly-once Boundary

**12｜线上怎么排障和规划容量**

→ Failure / Observability / Backfill / Capacity

这 12 节共同回答一个问题：

> **一份 Spark 计算怎样被表达、计划、拆分、并行执行、产生数据移动和状态、遇到资源与故障压力，并最终被生产系统观测和治理？**

## Spark Learn V1 到这里完成

Spark Learn 现在正式完成 **12 / 12**。

下一阶段不再增加新的 Learn 机制。

后面只把已经学完的知识接到：

**Scale**

和：

**Interview Evidence**

上。

所有 Scale 场景继续保持：

```text
hypothetical: true
```

所有 Interview Frequency 继续只来自真实 Evidence。
