---
id: kb-trino-concurrency-resource-groups-001
type: knowledge
title: Concurrency, Queue & Resource Groups
title_cn: Concurrency、Queue 与 Resource Group
stage_id: '04'
domain: lakehouse
topic: trino
order: 20
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: trino_l5_v1
summary: 单 Query 健康不代表 Cluster 健康。并发会叠加 CPU、Memory、Network 与 Scan 压力；Resource Group 用并发限制、Queue、Memory/CPU/Scan 配额与调度策略控制不同 Workload 的进入顺序和资源竞争。
prerequisites:
  - kb-trino-memory-exchange-pressure-001
related:
  - kb-trino-fault-tolerant-execution-001
---
# Concurrency、Queue 与 Resource Group

## 30 秒理解

上一节回答的是：

> 一个 Query 为什么可能把资源吃满？

这一节升级成：

> 很多 Query 同时进来以后，为什么 Cluster 会突然变得不稳定？

先记住：

**Single Query Cost**

× **Concurrency**

→ **Cluster Pressure**

→ **Queue / Contention / Tail Latency**

Resource Group（资源组）解决的是：

**谁可以进入、同时允许多少 Query 运行、超出的 Query 怎么排队、不同 Workload 怎么分配机会。**

它不是：

> 把一个坏 Query 自动优化好。

## 为什么每条 Query 单独都快，并发后却一起变慢

假设一条 Query 单独跑需要：

- 8GB Memory；
- 一部分 CPU；
- 2Gbps Network；
- 20 个 Worker Task。

单独跑完全正常。

但如果同时来了 20 条类似 Query：

```text
Memory Demand × 20
CPU Demand × 20
Network Demand × 20
Split / Task × 20
```

系统会出现：

- Worker Memory Pressure；
- CPU Run Queue；
- Network Saturation；
- Connector / Object Storage 请求放大；
- Coordinator Scheduling 压力；
- P95 / P99 延迟快速恶化。

所以：

> Query 性能问题和 Workload 性能问题是两层问题。

一个优秀的单 Query Plan，

也可能在无限并发下拖垮 Cluster。

## 为什么不能“来多少跑多少”

如果 Trino 接到 Query 就全部 Running：

高峰时会形成：

```text
Too many running queries
→ every query gets fewer effective resources
→ all queries slow down
→ resources remain occupied longer
→ more new queries overlap
→ pressure becomes worse
```

这是一个正反馈。

所以有时：

**少跑一些 Query**

反而可以：

**提高整个系统的 Throughput 和 P95。**

Queue 不是一定代表系统差。

合理 Queue 是：

> 用等待换取运行阶段的可控性。

## Resource Group 是什么

Resource Group 可以理解为：

**Query Admission + Queue + Workload Scheduling Policy**

每个 Query 属于一个 Resource Group。

这个 Group 可以限制：

- 同时 Running 的 Query 数；
- Queued Query 数；
- Distributed Memory；
- CPU 使用；
- Physical Data Scan；
- Scheduling Policy。

Group 还可以形成层级。

例如：

```text
global
├─ bi
│  ├─ tableau
│  └─ superset
├─ adhoc
└─ pipeline
```

这样可以同时控制：

- 全 Cluster；
- Workload Type；
- Tool；
- User。

## Query 怎样进入某个 Resource Group

靠 Selector Rule（选择规则）。

Selector 可以根据：

- User；
- User Group；
- Source；
- Client Tag；
- Query Type；
- SQL Text Pattern；

等信息匹配。

例如：

```text
source = pipeline
→ global.pipeline
```

或者：

```text
source = jdbc#bi
→ global.bi
```

所以 Resource Group 不是：

> Query 自己随便选一个池。

它通常是平台管理员定义 Workload Classification（负载分类）以后自动路由。

## hardConcurrencyLimit：最直接的并发闸门

最重要的配置之一是：

**hardConcurrencyLimit**

它限制：

> 这个 Group 最多同时运行多少 Query。

例如：

```text
BI:
hardConcurrencyLimit = 20
```

当已经有 20 条 BI Query Running，

后面的 Query 不会继续无限增加并发，

而是进入 Queue。

这就是：

**Admission Control（准入控制）**

的核心思想。

## maxQueued：Queue 也不是无限的

如果 Queue 本身也无限增长：

- 用户看不到明确失败；
- 等待时间越来越长；
- Coordinator 持有大量 Pending Query；
- 高峰持续积压。

因此 Resource Group 还有：

**maxQueued**

当 Queue 已经满了，

新的 Query 会被拒绝，

而不是无限排队。

所以有两个完全不同的边界：

```text
hardConcurrencyLimit
= 最多同时跑多少

maxQueued
= 最多再等多少
```

## softMemoryLimit 为什么叫 Soft

Resource Group 还可以定义：

**softMemoryLimit**

当 Group 的 Distributed Memory 使用达到这个软限制以后，

系统通常不是立刻 Kill 正在运行的 Query，

而是：

**阻止更多新 Query 继续进入 Running。**

这点非常重要。

Resource Group 的主目标是：

**控制新 Query 的进入速度**

而不是把它理解成：

> 运行中超一点就马上杀 Query。

Query 自身还有独立的 Memory Limit。

因此：

**Query Memory Limit**

和：

**Resource Group Memory Policy**

不能混为一谈。

## Resource Group 还有哪些重要维度

除了 Memory 和 Concurrency，

当前 Trino 还支持对 Group 管理：

### CPU

通过 CPU Limit / Quota，

可以控制一类 Workload 长期消耗多少 CPU 时间。

### Physical Data Scan

可以限制某个 Group 在一个周期里扫描多少 Physical Data。

这对：

- Ad-hoc 用户；
- 高成本探索 Query；

非常有价值。

### Scheduling Policy

Queued Query 不一定只按 FIFO。

可以使用不同策略表达：

- Fairness；
- Weight；
- Query Priority。

所以 Resource Group 不只是：

> 一个并发数字。

它是 Workload Scheduling 的策略树。

## 为什么 BI 和 Pipeline 不应该简单混在一起

想象两个 Workload。

### BI / Interactive

特点：

- Query 相对短；
- 用户正在等待；
- 对 P95 Latency 敏感；
- Query 数量可能很多。

### Pipeline / Batch

特点：

- Query 可能长；
- 数据量大；
- Memory / Network 重；
- 用户通常不在页面上同步等待。

如果两者完全共享：

```text
same queue
same concurrency
same priority
```

可能发生：

**几个大型 Batch Query**

占住大量 Worker 资源，

导致：

**几十个本来只需要几秒的 BI Query**

全部拖成几十秒甚至几分钟。

所以 Production Design 往往要做：

**Workload Isolation（负载隔离）**

至少在 Admission / Scheduling 层隔开。

## Resource Group 是不是“真正的物理隔离”

不是。

这是一个重要边界。

同一个 Trino Cluster 里的不同 Resource Group，

最终仍可能共享：

- Worker CPU；
- JVM；
- Network；
- Connector；
- Object Storage；
- Coordinator。

所以 Resource Group 更准确是：

**逻辑资源治理 + Query Scheduling 隔离**

而不是：

**Dedicated Physical Cluster。**

当 Workload 的：

- Latency 模型；
- Failure 模型；
- Resource 模型；

差异非常大时，

可能最终仍需要：

**Separate Cluster（独立集群）**

而不是把所有问题都压给 Resource Group。

## 一个多租户例子

假设平台有：

```text
global
├─ bi
├─ adhoc
└─ pipeline
```

可以设计成：

**bi**

- 较高优先级；
- 控制单用户并发；
- 保护短查询延迟。

**adhoc**

- 更小的个人并发；
- 限制 Physical Data Scan；
- 防止一个用户误扫全表。

**pipeline**

- 允许较少但更重的 Query；
- 允许更长运行时间；
- 独立 Queue。

重点不是具体数字。

而是：

> 资源规则应该根据 Workload Characteristic 设计，而不是所有 Query 用同一套限制。

## 为什么并发越高不等于吞吐越高

在资源还充足时：

**Concurrency ↑**

可能让：

**Throughput ↑**

但超过某个点以后：

- Memory 竞争；
- Context Switching；
- Network Saturation；
- Cache Efficiency 下降；
- Remote Storage 限流；
- Queueing Delay；

开始急剧增加。

于是：

**Concurrency ↑**

反而导致：

**Average Latency ↑**

**P95 ↑**

**Throughput 不再增长甚至下降**

这就是 Capacity Planning 后面要找的：

**Saturation Point（饱和点）**

第 11 节会完整讲。

## 为什么 Queue Time 也是重要 SLO 指标

用户感觉到的总延迟不是只有：

**Execution Time**

而是：

```text
Queue Time
+
Planning Time
+
Execution Time
```

如果 Query 自己只跑 2 秒，

但 Queue 里等了 20 秒，

用户看到的仍然是：

**22 秒。**

因此 Production Observability 必须把：

**Queued**

和：

**Running**

区分开。

否则很容易误判：

> Trino Execution 变慢了。

实际可能是：

> Cluster Admission 已经饱和。

## Resource Group 和 FTE 的边界

Resource Group 回答：

> Query 开始前以及运行过程中，如何控制 Workload 竞争？

FTE 回答：

> Query 已经运行后，如果 Worker / Task 失败，如何恢复？

两者解决完全不同的问题。

Resource Group：

**Scheduling / Isolation**

FTE：

**Recovery / Retry**

所以不能把：

> Query 经常失败

简单回答成：

> 给它更高 Resource Group Priority。

如果失败来自 Node Loss，

Priority 并不能恢复已经丢失的计算。

## 关联知识

下一节进入 **Fault-Tolerant Execution 与失败恢复**。

现在已经知道：

**Queue 和 Resource Group**

可以避免太多 Query 同时进入 Running。

但即使资源控制得很好，

一个运行 40 分钟的大 Batch Query 仍可能遇到：

- Worker Crash；
- Node Replacement；
- Transient Failure。

下一节回答：

> Trino 怎样从“失败就整条 Query 重跑”，演进到 Query Retry 和更细粒度的 Task Retry？
