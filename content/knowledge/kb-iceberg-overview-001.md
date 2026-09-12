---
id: kb-iceberg-overview-001
type: knowledge
title: Apache Iceberg
title_cn: Iceberg 总览
stage_id: '04'
domain: lakehouse
topic: iceberg
order: 1
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: iceberg_l5_v1_1_refactor
project_relevance:
- north-america
project_fact_status: needs_fact_check
summary: 先建立 Iceberg 的核心心智模型：它不是新的文件格式或计算引擎，而是用显式元数据定义一张表当前由哪些文件组成、当前版本是什么，以及 Schema、Partition、并发提交和历史版本怎样安全演进。
prerequisites:
- kb-storage-file-formats
related:
- kb-iceberg-metadata-snapshot-001
- kb-iceberg-manifest-tree-001
scale_scenarios:
- sc-iceberg-10b-backfill-001
- sc-iceberg-streaming-small-files-001
---
# Apache Iceberg

## 30 秒理解

Iceberg 是 **表格式（Table Format）**。

它不替代 Parquet，也不替代 Spark、Flink、Trino。

先记住这条主链：

**Catalog（目录服务） → Table Metadata（表元数据） → Snapshot（快照） → Manifest List（清单列表） → Manifest（清单文件） → Data / Delete Files（数据 / 删除文件）**

Parquet 解决：

> 一个文件里的列式数据怎么存。

Iceberg 解决：

> 一张表现在到底由哪些文件组成、哪个版本对外可见、旧版本还能不能读、Schema 和 Partition 改了以后历史文件怎么继续解释、多个 Writer 同时提交时怎样不互相覆盖。

这条区别是后面所有 Iceberg 机制的起点。

## Iceberg 到底解决什么问题

假设对象存储里有 10 万个 Parquet 文件。

如果系统只靠目录和文件名猜：

> 哪些文件属于当前表？

那么会马上遇到几个生产问题：

- Writer 已经上传文件，但 Commit（提交）还没成功；
- 某些旧文件已经被新版本替换，但物理文件还没有删除；
- 两个 Writer 同时写入；
- Schema 改过，旧文件还是旧列结构；
- Partition（分区）策略已经演进；
- 删除一部分行后，原 Parquet 文件可能仍然存在。

所以真正可靠的表不能只靠：

**目录里现在有什么文件。**

它需要一个明确的、已经提交成功的 **Table State（表状态）**。

Iceberg 的核心价值，就是把这个“表状态”变成规范化元数据。

## 先建立三个层次

### 第一层：表状态入口

Catalog 的核心职责可以先理解成：

**帮 Reader / Writer 找到这张表当前使用的 Table Metadata。**

Catalog 可以有不同实现，但这里不要先陷进实现细节。

你现在只需要知道：

> 查询一张 Iceberg 表，入口不是对象存储目录，而是当前表元数据。

### 第二层：版本与元数据索引

Table Metadata 继续记录：

- 当前 Schema；
- Partition Specs；
- Snapshot 历史；
- 当前 Snapshot；
- Branch / Tag 等 Snapshot Reference（快照引用）。

Snapshot 再向下引用 Manifest List 和 Manifest。

所以这一层回答：

> 当前版本是什么？这个版本包含哪些 Content File（内容文件）？

### 第三层：物理数据

最底层才是真正的：

- Data File（数据文件）；
- Delete File（删除文件）；
- Deletion Vector（删除向量，V3）。

Reader 最终读取的是：

> 当前 Snapshot 所定义的可见数据状态。

而不是：

> 存储目录里所有看起来像这张表的文件。

## 为什么“文件存在”不等于“表里可见”

这是 Iceberg 最重要的生产直觉之一。

Writer 可能已经成功写出：

```text
data-001.parquet
data-002.parquet
```

但 Catalog Commit 还没有成功。

这些文件虽然物理存在，但没有进入当前有效的 Metadata 引用链。

所以：

**Physical File Exists（物理文件存在） ≠ Visible Table State（当前表状态可见）**

反过来也一样。

某个旧 Data File 已经不属于当前 Snapshot，但为了 Time Travel（时间旅行）或恢复，它可能暂时仍然保留在存储中。

因此不能靠：

> List 目录，然后把所有文件都读出来。

## Iceberg 为什么适合对象存储

对象存储很适合保存不可变大文件，但不适合依赖复杂目录 Rename 和“扫目录发现当前状态”。

Iceberg 的思路更接近：

```text
先写不可变文件
→ 生成新的元数据
→ 最后原子切换当前 Table Metadata
```

所以真正的可见性发生在：

**Metadata Commit（元数据提交）**

而不是：

**Data File 上传完成。**

这也是后面 Optimistic Commit（乐观提交）的基础。

## Iceberg 在整个数据架构中的位置

把几个容易混的对象分开：

```text
S3 / OSS / HDFS
→ Storage（存储）

Parquet / ORC / Avro
→ File Format（文件格式）

Iceberg
→ Table Format（表格式）

Spark / Flink / Trino
→ Compute / Query Engine（计算 / 查询引擎）

Catalog
→ Table State Entry（表状态入口）
```

所以 Iceberg 本身不会替 Trino 做 Join，也不会替 Spark 做 Shuffle。

它负责的是：

> 这张表在逻辑上是什么状态，应该读哪些文件，如何安全提交新的状态。

## 为什么这一章先学读，再学写

如果一开始就讲 Writer、Commit、Compaction（压缩整理），会变成一堆互不相干的参数。

所以前半段先回答：

```text
Reader 如何找到正确版本
↓
Snapshot 如何引用文件
↓
Data / Delete 如何组成当前结果
↓
Partition / Schema 如何解释历史文件
↓
Trino 如何完成一次真实读取
```

等“表是怎么被读出来的”完整以后，再进入：

```text
Row 怎样进入 Writer
↓
怎样生成 Data File / Manifest
↓
怎样 Commit
↓
怎样 Maintenance（维护）
```

这样每一个写入动作都能挂回前面已经建立的表状态模型。

## 一个生产问题先感受一下

假设一个 Spark Job：

1. 成功写出了 500 个 Parquet 文件；
2. 最后 Catalog Commit 超时；
3. 你去 S3 看到文件都在。

这时候能不能直接说：

> 数据已经写进 Iceberg 表了？

不能。

正确判断必须回到：

**这些文件有没有进入当前 Table Metadata / Snapshot 引用链？**

后面 Commit 章节会继续把这个问题讲透。

## 这一节真正要掌握什么

必须掌握：

- Iceberg 是表格式，不是文件格式、计算引擎；
- Reader 从已提交的表状态进入，而不是扫目录；
- `Catalog → Metadata → Snapshot → Manifest → File` 是核心链；
- 文件物理存在和表逻辑可见是两回事。

生产上要会判断：

- 一个“文件写成功”的任务到底有没有真正 Commit；
- 查询慢是在 Metadata Planning（元数据规划）还是 Data Scan（数据扫描）。

了解即可：

- 各种 Catalog 的具体实现差异；
- Iceberg Spec（规范）所有 JSON 字段。

下一节进入最核心的表状态对象：

**Table Metadata、Snapshot，以及 Time Travel 为什么能够成立。**
