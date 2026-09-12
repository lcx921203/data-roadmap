---
id: kb-iceberg-trino-read-path-001
type: knowledge
title: Trino Read Path on Iceberg
title_cn: Trino 读取 Iceberg 的完整路径
stage_id: '04'
domain: lakehouse
topic: iceberg
order: 7
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: iceberg_l5_v1_1_refactor
project_relevance:
- north-america
project_fact_status: needs_fact_check
summary: Trino 读取 Iceberg 时，先固定 Snapshot，再通过 Manifest 与 Partition / File Metrics 缩小候选文件，最后把适用 Delete 规划到 Scan 中并生成 Split。第一次学习先掌握“版本 → 元数据裁剪 → 文件裁剪 → Delete 适用性 → 扫描”的主链，精确 Delete 规则作为第二层深入。
prerequisites:
- kb-iceberg-schema-evolution-001
related:
- kb-iceberg-write-distribution-ordering-001
- kb-iceberg-production-troubleshooting-001
---
# Trino 读取 Iceberg 的完整路径

## 30 秒理解

前 6 节到这里第一次真正合起来：

**Catalog（目录服务） → Table Metadata（表元数据） → Snapshot（快照） → Manifest List（清单列表） → Manifest（清单文件） → 候选 Data File + 适用 Delete → Split（扫描分片） → Worker Scan（工作节点扫描）**

第一次阅读先只抓两阶段：

**查询规划（Planning）**：决定“这次到底要读哪些文件、应用哪些 Delete”。

**执行扫描（Execution）**：Worker 真正打开 Parquet / ORC 并读取需要的列和行。

很多 Iceberg 性能问题的关键，就是先分清：

> 慢在“找文件”，还是慢在“读文件”。

## 第一步：先固定一个表版本

Trino Iceberg Connector 首先通过 Catalog 找到当前 Table Metadata。

普通查询通常选择 Current Snapshot；Time Travel（时间旅行）查询则选择指定的历史 Snapshot。

一旦这次查询固定到：

```text
Snapshot S120
```

后面的 Manifest、Data File、Delete、Schema 都围绕这个逻辑版本进行规划。

所以第 2 节学的 Snapshot 并不是“历史管理附加功能”。

它首先决定：

> **这次查询到底在读哪一个稳定表状态。**

## 第二步：先在 Manifest 层缩小范围

Snapshot 指向 Manifest List。

Manifest List 里有 Manifest 级摘要，例如 Partition Summary（分区摘要）。

假设 Query：

```sql
WHERE event_time >= TIMESTAMP '2026-09-12 00:00:00'
```

如果某个 Manifest 的分区摘要可以证明：

> 它覆盖的数据一定不可能命中这个 Predicate（谓词），

那这个 Manifest 根本不需要打开。

这一步叫：

**元数据裁剪（Metadata Pruning）**

它发生在真正读取 Data File 之前。

## 第三步：进入 Manifest 后继续裁剪 Data File

剩余 Manifest 中的 Entry 会记录具体 Content File 的：

- Partition Data（分区值）；
- Lower / Upper Bounds（上下界）；
- Null Count（空值数）；
- Record Count（记录数）；
- File Size（文件大小）；
- 其他 Column Metrics（列统计）。

所以：

> 一个 Manifest 被保留下来，不代表其中所有 Data File 都必须扫描。

Reader 还可以继续根据文件级统计排除不可能命中的 Data File。

这一步可以理解为：

**文件裁剪（File Pruning）**

最终目标是：

```text
100 万个 Data File
↓
先裁 Manifest
↓
再裁 File
↓
只留下真正有可能命中的候选文件
```

## Partition Pruning 和 File Pruning 的区别

**分区裁剪（Partition Pruning）**

主要利用：

```text
Partition Spec
+
Transform
+
Partition Value
```

排除不相关分区范围。

**文件裁剪（File Pruning）**

主要利用 Manifest Entry 中的：

```text
Lower / Upper Bounds
Null Count
其他 File Metrics
```

进一步排除具体文件。

所以 Iceberg 查询优化绝不只是：

> “有没有 Partition？”

更准确的是：

**Partition + Metadata Index + File Metrics 一起决定能跳过多少文件。**

## 第四步：判断哪些 Delete 真正适用

如果 Snapshot 中包含 Delete Content，Reader 还不能简单地：

> 找到 Delete File → 对所有 Data File 应用。

第 4 节已经先建立了三个判断维度：

```text
Target（目标）
+
Partition（分区）
+
Sequence Number（序列号）
```

这里把它们放回真实读取流程。

Reader 要为每个候选 Data File 找出：

> **真正对它生效的 Delete 信息。**

最后形成类似：

```text
Data File A
+ Delete X
+ Delete Y

Data File B
+ no delete
```

再交给 Worker 执行。

## Sequence Number 为什么在读取时重要

Sequence Number 可以理解成：

> 一次成功 Commit 后，内容在表演进中的相对顺序。

它帮助 Reader 回答：

> 这份 Delete 是在这份 Data 之前产生，还是之后产生？

例如 Equality Delete（等值删除）不能去删除比它更新的数据。

否则一份历史删除条件可能误伤未来新插入、但值相同的记录。

所以 Sequence Number 解决的是：

**Delete 的时间作用范围。**

## 进阶：Delete Applicability 在这里一次讲完整

下面这一块属于 **第二层深入**。

第一次学习只要掌握上一节的 Target / Partition / Sequence Number 就够。

### Deletion Vector（删除向量）

一份 Deletion Vector 适用于某个 Data File，需要满足：

- `referenced_data_file` 指向这个 Data File；
- Data File 的 Data Sequence Number ≤ Deletion Vector 的 Data Sequence Number；
- Partition Spec 与 Partition Value 一致。

### Position Delete File（位置删除文件）

核心条件：

- 如果声明 `referenced_data_file`，目标文件必须匹配；
- Data File 的 Data Sequence Number ≤ Delete File 的 Data Sequence Number；
- Partition Spec 与 Partition Value 一致；
- 如果同一个 Data File 已经有必须应用的 Deletion Vector，就不能再重复应用被它覆盖的位置删除。

### Equality Delete File（等值删除文件）

它的新旧关系更严格：

- Data File 的 Data Sequence Number **必须小于** Equality Delete 的 Data Sequence Number；
- 通常要求相同 Partition Spec / Partition Value；
- Unpartitioned Spec（无分区规则）的 Equality Delete 可以作为 Global Delete（全局删除）。

这里真正要理解的是：

> **Position 类删除可以作用于同一次 Commit 中的数据；Equality Delete 必须只作用于更旧数据。**

不要只背 `<` 和 `≤`，要理解它在防止什么错误。

## 第五步：Coordinator 生成 Split

Coordinator（协调节点）完成文件规划后，会把需要读取的工作拆成 Split（扫描分片）。

然后 Worker 才真正：

- 打开 Parquet / ORC；
- 做列裁剪（Column Projection）；
- 做谓词下推（Predicate Pushdown）；
- 利用底层文件统计；
- 应用 Delete；
- 返回数据给后续算子。

到这一步，Iceberg 的主要 Metadata Planning 已经完成。

后面的 Join、Shuffle、Spill 等更多属于 Trino Runtime（运行时）。

## 一个生产问题：查询还没开始扫数据就卡很久

如果 UI / Query Profile 显示：

> 很长时间都在 Planning，Worker Scan 还没真正跑起来，

优先看：

- Manifest Count；
- Data File Count；
- Partition Predicate 是否可推导；
- File Metrics 是否有选择性；
- Metadata Load；
- Delete Planning 是否过重。

这时候“加 Worker”通常不是第一答案。

因为 Worker 是执行扫描的。

而瓶颈可能在：

> **Coordinator 决定到底要读哪些文件。**

## Planning 慢和 Execution 慢怎么区分

如果 **Planning（规划）慢**，优先看：

- Manifest 是否过多；
- Data File 是否过多；
- Predicate 是否能有效映射到 Partition；
- Manifest / File Metrics 是否有选择性；
- Delete Metadata 是否膨胀；
- Metadata 读取是否变重。

增加 Worker 通常不能直接解决这些问题。

如果 **Execution（执行）慢**，再更多看：

- Bytes Scanned（扫描字节数）；
- Split Count；
- File Size；
- Column Projection；
- Object Storage Latency（对象存储延迟）；
- Join / Shuffle；
- Spill（落盘）；
- Worker Memory。

一句话：

**Planning 慢先查 Iceberg Metadata；Execution 慢再更多查 Trino Runtime。**

## Metadata Table 怎么帮助排查

Trino Iceberg Connector 可以暴露 Metadata Table（元数据表）。

例如常见的：

```sql
SELECT * FROM "orders$files";
SELECT * FROM "orders$partitions";
SELECT * FROM "orders$properties";
```

它们适合回答：

- 文件到底有多少；
- 文件大小是否健康；
- Partition 怎么分布；
- 当前 Table Property 是什么。

具体 Metadata Table 名称和字段仍以实际 Trino Connector 版本为准。

## 这一节真正要掌握什么

必须掌握：

- 查询先固定 Snapshot，再规划文件；
- Manifest Pruning 和 File Pruning 是两层；
- Partition 只是裁剪能力的一部分；
- Delete 必须经过适用性判断；
- Planning 与 Execution 是两种不同性能问题。

生产上要会判断：

- Query 慢应该先加 Worker，还是先查 Manifest / File Count；
- Delete 积累为什么既可能拖慢 Planning，也可能拖慢 Scan；
- Time Travel 查询为什么仍然沿同一套 Read Path，只是起始 Snapshot 不同。

了解即可：

- 第一次阅读就背三种 Delete 的所有精确比较符；
- Trino 每种 Metadata Table 的完整字段列表。

到这里读取主链完整闭合。

下一节转到 Writer：

**这些被 Reader 读取的 Data File，最初应该怎样分布和排序，才能不从源头制造小文件和低效布局？**
