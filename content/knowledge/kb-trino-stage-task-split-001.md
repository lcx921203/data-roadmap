---
id: kb-trino-stage-task-split-001
type: knowledge
title: Stage, Task, Split, Driver & Operator
title_cn: Stage、Task、Split、Driver 与 Operator
stage_id: '04'
domain: lakehouse
topic: trino
order: 16
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: trino_l5_v1
summary: Distributed Plan 会被切成 Stage；Stage 在多个 Worker 上实例化为 Task，Source Task 再消费 Split，并通过 Driver / Operator Pipeline 真正处理数据。
prerequisites:
  - kb-trino-query-planning-001
related:
  - kb-trino-scan-pushdown-001
---
# Stage、Task、Split、Driver 与 Operator

## 30 秒理解

这是 Trino 执行模型里最容易混淆、也最值得一次理清的一节。

先记住层级：

**Query**

→ **Stage**

→ **Task**

→ **Driver / Pipeline**

→ **Operator**

对于读取外部数据的 Source Stage，还会消费：

**Split**

最关键的一句话：

> Stage 是 Plan 的分布式边界；Task 是某个 Stage 在某个 Worker 上的执行实例；Split 是 Source Task 要处理的一份外部数据工作。

## 为什么有了 Distributed Plan 还需要 Stage

上一节已经有 Distributed Plan。

但一个 Query 不可能简单地：

> 把完整 Plan 复制给每个 Worker。

因为有些 Operator 之间可以在一个节点内连续处理，

有些地方必须跨节点重新分布数据。

这些跨节点数据边界通常和 Exchange 有关。

所以 Distributed Plan 会被切成多个 Stage。

可以先把 Stage 理解成：

**一段可以按照相同分布方式执行的 Plan Fragment（计划片段）。**

例如：

```text
Stage A: Scan + Partial Aggregation
        ↓ Exchange
Stage B: Final Aggregation
```

## Stage 为什么形成 DAG

多个 Stage 之间有数据依赖。

例如：

```text
Stage 1 ─┐
         ├→ Stage 3
Stage 2 ─┘
```

Stage 3 需要等待或消费上游 Stage 产生的数据。

因此整个 Query 的 Stage 关系可以形成 DAG（有向无环图）。

这和 Spark 的 Stage 名字看起来相似，但不要直接把两个引擎里的 Stage 当成完全相同的内部实现。

现在只抓 Trino 自己的执行层级。

## Task 是什么

Stage 只是逻辑上的分布式执行片段。

真正到 Worker 上跑时，会实例化成 Task。

可以理解为：

**同一个 Stage**

在：

**Worker A**

有一个 Task，

在：

**Worker B**

也可能有一个 Task，

在：

**Worker C**

也可能有一个 Task。

所以：

**Stage ≠ 一个机器上的线程。**

Stage 是 Plan Fragment。

Task 才是它在具体 Worker 上的执行实例。

## Split 是什么

Split 是 Trino 中非常关键的并行单位。

它可以先理解成：

> Connector 提供的一份“可独立处理的数据工作描述”。

注意：

**Split 不一定等于一个文件。**

不同 Connector 可以有完全不同的 Split 语义。

例如：

- 某个文件范围；
- 某个 Partition；
- 某个远端数据块；
- 某个 Connector 自己定义的 Work Unit。

对 Iceberg 来说，Connector 会根据表 Metadata 和 File 信息产生 Trino 可调度的读取工作。

但具体：

**Manifest 怎样得到候选 Data File**

仍然属于 Iceberg。

Trino 关心的是：

> 最终有哪些 Split 可以调度给 Worker？

## Source Stage 为什么和 Split 关系最强

Leaf / Source Stage 需要从外部数据源读取数据。

因此 Source Task 会不断获得 Split，然后处理这些 Split。

比如：

```text
Split 1 ─┐
Split 2 ─┼→ Worker A / Task
Split 3 ─┘

Split 4 ─┐
Split 5 ─┼→ Worker B / Task
Split 6 ─┘
```

如果只有极少 Split，

即使有很多 Worker，也可能没有足够并行工作。

如果 Split 极多、每个极小，

又可能带来：

- Scheduling Overhead；
- Metadata 压力；
- 文件打开成本。

所以以后看到：

> Worker 很多但 Query 还是不快

要开始想到：

**并行度是否真的有足够 Split 支撑。**

## Driver 是什么

Task 内部还会继续并行。

Driver 可以先理解为：

**一条 Operator Pipeline 的执行实例。**

例如一条简单路径：

```text
TableScan
→ Filter
→ Project
→ PartialAggregation
```

这几个 Operator 可以形成 Pipeline。

一个 Task 内可以运行多个 Driver，从而利用 Worker 内部多个执行线程做并行处理。

所以 Trino 的并行不是只有：

**多个 Worker**

这一层。

还包括：

**Worker 内 Task / Driver 的本地并行。**

## Operator 是什么

Operator 是执行数据处理逻辑的最小核心角色之一。

例如：

- Scan；
- Filter；
- Project；
- Aggregation；
- Join；
- Sort；
- Window。

SQL 最终真正执行时，已经不再是：

```sql
SELECT ...
```

而是落成一串 Operator。

比如：

```text
Scan
→ Filter
→ Project
→ Aggregation
```

这也是为什么理解 Operator 后，后面看 Memory 和 Performance 会更容易。

不同 Operator 的资源特征不同：

**Filter**

通常更偏 CPU。

**Hash Join / Aggregation**

可能大量占用 Memory。

**Exchange**

会带来 Network 和 Buffer。

这些后面再展开。

## 五个概念怎么一次区分

可以用这张文字表记忆：

| 概念 | 解决的问题 |
| --- | --- |
| Stage | Query Plan 在分布式执行中的一个 Plan Fragment |
| Task | 一个 Stage 在某个 Worker 上的执行实例 |
| Split | Connector 提供给 Source Task 的一份数据工作 |
| Driver | Task 内一条 Operator Pipeline 的执行实例 |
| Operator | 真正执行 Scan / Filter / Join 等计算逻辑 |

如果还容易混，可以记成：

**Stage 决定“这一段计划是什么”**

**Task 决定“这一段计划在哪个 Worker 跑”**

**Split 决定“Source Task 具体读哪份数据”**

**Driver 决定“Task 内怎样并行跑 Pipeline”**

**Operator 决定“数据具体做什么计算”**

## 为什么这一节对后面很重要

后面几乎所有 Trino 性能问题都会落回这些层级。

例如：

**Scan 慢**

可能要看 Split 和 Source Operator。

**某个 Stage 特别慢**

可能存在：

- 数据倾斜；
- Exchange 不均；
- Task Straggler。

**Memory 爆**

要进一步看是哪类 Operator 占内存。

**并发高**

要看多少 Query 同时创建 Stage / Task，以及 Resource Group 怎样限制。

因此这一节是从“架构”真正进入“执行”的分水岭。

## 这一节还不讲什么

现在不要提前展开：

- Split Pruning；
- Predicate Pushdown；
- CBO Join；
- Broadcast / Partitioned Join；
- Memory Pool；
- Spill；
- Resource Group；
- Task Retry。

因为 Stage / Task / Split 模型先独立稳定，后面这些机制才能挂上去。

## 前 5 节现在形成什么模型

到这里，已经可以完整说出：

**Client 提交 SQL**

→ **Coordinator Parse / Analyze / Plan**

→ **Catalog / Connector 提供外部 Metadata**

→ **Logical Plan / Distributed Plan**

→ **Stage**

→ **Task**

→ **Split**

→ **Driver / Operator**

→ **Worker 真正处理数据**

这就是 Trino Core Execution Model（核心执行模型）。

下一节开始进入：

**Scan、Pushdown 与 Iceberg Read Boundary**

也就是第一次真正深入：

> Worker 到底怎样把外部数据读进执行 Pipeline？
