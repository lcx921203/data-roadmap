---
id: kb-iceberg-partition-evolution-001
type: knowledge
title: Hidden Partitioning & Partition Evolution
title_cn: 隐藏分区与分区演进
stage_id: '04'
domain: lakehouse
topic: iceberg
order: 5
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: v0.6.1_spine
project_relevance:
- north-america
project_fact_status: needs_fact_check
summary: Iceberg 用 Partition Spec 和 Transform 描述逻辑分区；查询不必手写物理分区列，分区策略也能随表演进。
prerequisites:
- kb-iceberg-row-level-changes-001
related:
- kb-iceberg-schema-evolution-001
- kb-iceberg-trino-read-path-001
---
# Hidden Partitioning & Partition Evolution

## 30 秒理解

Hive 常见思路是让用户显式维护：

```text
dt=2026-09-10/hour=13/
```

Iceberg 把分区规则放在 Partition Spec（分区规范）中，例如：

```text
days(event_time)
bucket(64, user_id)
truncate(8, category_code)
```

Query 写业务字段，Engine 根据 Spec 推导可裁剪的分区，这就是 Hidden Partitioning（隐藏分区）的核心体验。

## 为什么需要 Partition Evolution

一张表刚上线时每天 5 GB，按天分区没问题；两年后每天 5 TB，单日分区可能过大。

传统做法常要“重建整张表”。

Iceberg 允许新增新的 Partition Spec，让**新数据使用新规则，历史数据继续保留旧 Spec**。

```text
Old files → Spec 0
New files → Spec 1
```

Reader 读取时按每个文件对应的 Spec 正确解释。

## Partition Spec 不是目录

分区字段是逻辑 Metadata。

对象存储路径可以带分区可读信息，也可以使用其他布局策略。正确性不应依赖“路径字符串能不能看懂”。

这和 Manifest 也一样：不要把逻辑分区设计退化成目录命名规范。

再补一个和上一节直接相关的约束：**一个 Manifest 可以覆盖多个 Partition Value，但一个 Manifest 中的 Content Files 使用同一个 Partition Spec。** 当 Spec 演进时，新旧 Spec 会由不同 Manifest 正确记录。

## Production 选型

分区字段的目标不是“字段基数越大越好”，而是平衡：

```text
Pruning selectivity
File count
Write distribution
Partition count
Maintenance cost
Query patterns
```

典型错误：

- 用高基数 ID 做 Identity Partition；
- 每小时只有少量数据却再拆 minute；
- 为单个临时报表修改全表分区；
- 只看写入方便，不看主查询过滤条件。

## 代码 / 配置

Spark SQL 概念示例：

```sql
CREATE TABLE prod.analytics.events (
  event_id BIGINT,
  user_id BIGINT,
  event_time TIMESTAMP,
  event_type STRING
)
USING iceberg
PARTITIONED BY (days(event_time), bucket(64, user_id));
```

演进时应通过 Iceberg 的 Partition Evolution 命令修改 Spec，而不是直接移动历史文件目录。

## 性能与故障

如果查询有时间过滤却仍扫描大量文件，检查：

```text
Predicate 是否可推导到 Transform
↓
Manifest Partition Summary 是否有选择性
↓
Data File partition data 是否正确
↓
Query Engine 是否完成 Connector pushdown
```

不要只看 SQL 里“写了 WHERE”就认为一定发生了有效 Pruning。

## Scale Lab

当日增量 ×100 时，重新评估：

- 单 Partition 数据量；
- 每 Partition 的文件数量；
- Writer 数；
- 热分区；
- Manifest 组织；
- Trino 主要 Filter。

演进目标是改变**未来布局**，不是为了漂亮把所有历史文件强制重写。

## 项目案例

项目是否实际做过 Partition Evolution、采用什么 Transform，目前没有经过事实核验，不写进 Actual。

## 关联知识

下一节看 Schema Evolution，理解 Iceberg 为什么依赖 Field ID 而不是只靠列名和列位置。
