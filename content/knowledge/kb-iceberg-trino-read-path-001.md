---
id: kb-iceberg-trino-read-path-001
type: knowledge
title: Trino Read Path on Iceberg
title_cn: Trino 读取 Iceberg 的路径
stage_id: '04'
domain: lakehouse
topic: iceberg
order: 7
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: iceberg_l5_v1
project_relevance:
- north-america
project_fact_status: needs_fact_check
summary: Trino 先固定 Iceberg 表状态，再按 Manifest、Partition 与 File Metrics 缩小候选文件，规划适用 Delete，最后生成
  Split 给 Worker 扫描。
prerequisites:
- kb-iceberg-schema-evolution-001
related:
- kb-iceberg-write-distribution-ordering-001
- kb-iceberg-production-troubleshooting-001
---
# Trino Read Path on Iceberg

## 30 秒理解

前面 6 节可以在这里第一次完整串起来：

**Catalog → Table Metadata → Snapshot → Manifest List → Manifest → 候选 Data Files + 适用 Delete → Splits → Worker Scan**

所以 Trino 查询 Iceberg 时要区分两个阶段：

**Planning（规划）**：先决定“需要读哪些文件”。

**Execution（执行）**：Worker 再真正读取这些文件和需要的列。

## 第一步：固定表状态

Trino Iceberg Connector 先通过 Catalog 找到当前 Table Metadata，再确定这次查询使用哪个 Snapshot。

从这一刻开始，本次 Query Planning 针对的是一个明确的逻辑版本。

这就是前面 Table Metadata & Snapshot 那一节在真实查询里的作用。

## 第二步：Manifest 级裁剪

有了 Snapshot 后，Reader 找到 Manifest List。

Manifest List 中有 Manifest 级的 Partition Summary 和其他摘要信息。

如果 Query Predicate 能明确排除某个 Manifest 覆盖的范围，这个 Manifest 就不需要继续展开。

这是第一层 Metadata Pruning（元数据裁剪）。

## 第三步：File 级裁剪

对于不能在 Manifest 层排除的范围，Reader 再进入 Manifest。

Manifest Entry 中保存每个 Content File 的：

- Partition Data；
- Lower / Upper Bounds；
- Null Count；
- Record Count；
- 其他 Column Metrics。

因此 Query 即使已经进入某个 Manifest，也不代表这个 Manifest 中所有 Data File 都要读取。

Reader 还可以继续排除不可能命中 Predicate 的文件。

## Partition Pruning 和 File Pruning 的区别

**Partition Pruning（分区裁剪）**

利用 Partition Spec、Transform 和 Partition Value 排除不相关范围。

**File Pruning（文件裁剪）**

利用 Manifest 中的文件级 Column Metrics 排除具体 Data File。

两者不是同一个层次。

所以 Iceberg 的查询优化不能只理解成“有没有分区”。

## 第四步：把 Delete 应用关系规划进去

如果 Snapshot 中存在 Delete Manifest，Reader 还需要判断哪些 Delete File / Deletion Vector 适用于哪些候选 Data File。

到这里前面已经学过：

- Data / Delete Content；
- Partition Spec / Partition Value；
- Schema / Field ID。

还差一个概念：**Sequence Number（序列号）**。

这里把它先理解成“文件内容的相对新旧标记”；它在成功 Commit 时怎样获得，后面的 Commit 章节再解释。

最终 Scan Planning 要形成：

**候选 Data File + 对它真正生效的 Delete 信息**

## Delete Applicability 在这里一次讲完整

现在再看三种删除信息的精确 Scope（作用范围）。

### Deletion Vector

一份 Deletion Vector 适用于某个 Data File，需要同时满足：

- `referenced_data_file` 指向这个 Data File；
- Data File 的 Data Sequence Number ≤ Deletion Vector 的 Data Sequence Number；
- 两者的 Partition Spec 和 Partition Value 一致。

### Position Delete File

一份 Position Delete File 适用于某个 Data File，核心条件是：

- 如果它声明了 `referenced_data_file`，目标文件必须匹配；
- Data File 的 Data Sequence Number ≤ Delete File 的 Data Sequence Number；
- Partition Spec 和 Partition Value 一致；
- 如果同一个 Data File 已经存在应该应用的 Deletion Vector，Reader 不能再重复应用被 DV 覆盖的位置删除。

### Equality Delete File

Equality Delete 的新旧规则更严格：

- Data File 的 Data Sequence Number **必须小于** Equality Delete 的 Data Sequence Number；
- 通常要求相同 Partition Spec / Partition Value；
- 如果 Equality Delete 使用 Unpartitioned Spec，可以作为 Global Delete（全局删除）。

所以第 4 节那句话现在可以补完整：

**不是“有 Delete 就应用”，而是先按 Target、Partition、Sequence Number 判断 Scope，再把真正适用的 Delete 合并进 Scan。**

## 第五步：生成 Split，交给 Worker 扫描

Coordinator 完成文件规划后，生成可调度的 Split。

Worker 才真正读取 Parquet / ORC / Avro，并继续利用：

- Column Projection（列裁剪）；
- Parquet Statistics；
- Predicate Pushdown（谓词下推）；
- Dynamic Filtering（动态过滤）；
- Delete 应用。

所以“Planning 慢”和“Scan 慢”是两类问题。

## Planning 慢和 Execution 慢怎么区分

如果 **Planning 慢**，优先看：

- Manifest 是否太多；
- Data File 是否太多；
- Predicate 是否能有效推导到 Partition；
- Manifest / File Metrics 是否有选择性；
- Metadata Load 是否变重。

增加 Worker 通常不能直接解决这些问题。

如果 **Execution 慢**，再更多看：

- 实际 Scan Bytes；
- File Size；
- Column Projection；
- Join / Shuffle；
- Spill；
- Worker Memory；
- Object Storage Latency。

## Metadata Tables 怎么帮助排查

Trino Iceberg Connector 可以通过 Metadata Tables 查看文件、分区和表属性等信息。具体表名和字段以实际 Trino Connector 版本为准。

例如：

```sql
SELECT * FROM "orders$files";
SELECT * FROM "orders$partitions";
SELECT * FROM "orders$properties";
```

这些信息可以帮助回答：

- 到底有多少文件；
- 文件尺寸是否健康；
- 分区数据怎样分布；
- 当前表属性是什么。

## 前 7 节到这里形成什么模型

到这里，Read Model（读取心智模型）已经完整：

**表状态决定“哪个版本”**

**Manifest 决定“哪些文件可能相关”**

**Partition / Metrics 决定“哪些文件可以跳过”**

**Delete Scope 决定“哪些删除信息真正作用到候选 Data File”**

**Worker 最后才真正扫描数据**

下一节回到写入侧：

**这些 Data File、Manifest 和 Snapshot 是怎样被 Writer 一步步产生出来的？**
