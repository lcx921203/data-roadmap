---
id: kb-iceberg-partition-evolution-001
type: knowledge
title: Hidden Partitioning & Partition Evolution
title_cn: 隐藏分区与分区演进
stage_id: "04"
domain: lakehouse
topic: iceberg
order: 5
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: v0.6.1_read_model
project_relevance:
  - north-america
project_fact_status: needs_fact_check
summary: "Iceberg 用 Partition Spec 和 Transform 描述逻辑分区；查询写业务字段，由引擎推导分区裁剪；新旧 Partition Spec 可以在同一张表中共存。"
prerequisites:
  - kb-iceberg-row-level-changes-001
related:
  - kb-iceberg-schema-evolution-001
  - kb-iceberg-trino-read-path-001
---

# Hidden Partitioning & Partition Evolution

## 30 秒理解

Iceberg 的 Partition（分区）首先是 **逻辑 Metadata**，不是目录命名规则。

Partition Spec 定义“业务字段怎样转换成分区值”，例如 `days(event_time)`、`bucket(64, user_id)`。

查询写业务字段，Engine 根据 Transform 推导可裁剪的 Partition，这就是 Hidden Partitioning（隐藏分区）。

Partition Spec 改变后，**旧文件继续使用旧 Spec，新文件使用新 Spec**，不要求为了改分区而重写全部历史数据。

## Partition Spec 与 Transform

Partition Spec 由一个或多个 Partition Field 组成。

每个 Partition Field 都会把 Source Column（源列）通过 Transform（转换）映射成 Partition Value。

常见 Transform 包括：

- `identity`：直接使用原值；
- `year / month / day / hour`：从时间字段得到时间粒度；
- `bucket(N, col)`：Hash 后映射到固定桶；
- `truncate(W, col)`：按宽度截断。

例如：

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

这里 Query 仍然可以写 `event_time` 和 `user_id`，不要求业务 SQL 手工维护物理分区列。

## Hidden Partitioning 隐藏的是什么

隐藏的不是“没有分区”。

而是：

**业务查询不需要把物理 Partition Value 当成业务字段来维护。**

Engine / Connector 根据表里的 Partition Spec 和查询 Predicate（谓词），判断 Predicate 能否转换到 Partition Transform，从而排除不相关分区。

完整 Pruning 链路到第 7 节统一讲。

## Partition Evolution 为什么不用重写历史文件

假设最开始使用：

**Spec 0：days(event_time)**

随着数据量增长，后面改成：

**Spec 1：hours(event_time)**

Iceberg 不要求把所有旧 Data File 重新写成小时分区。

而是：

- 旧文件继续带着 Spec 0 的语义；
- 新文件按照 Spec 1 产生 Partition Value；
- Reader 根据每个 Manifest / File 对应的 Spec 正确解释。

因此 Partition Evolution 改变的是**未来数据布局**，不是强制重写全部历史布局。

## 它和 Manifest 的关系

上一节已经讲过：

**一个 Manifest 只对应一个 Partition Spec。**

因此当 Partition Spec 从 Spec 0 演进到 Spec 1 后，不会把两种不同 Spec 的文件混进同一个 Manifest。

但在同一个 Spec 内，一个 Manifest 可以覆盖多个 Partition Value。

这就是：

**Partition Spec ≠ Partition Value ≠ Manifest**

三个概念必须分开。

## 分区设计真正要平衡什么

Partition 不是越细越好。

设计时至少同时考虑：

- 主查询过滤条件；
- 每个 Partition 的数据量；
- File Count；
- Writer Distribution；
- 热分区；
- Metadata 数量；
- Maintenance 成本。

例如高基数用户 ID 直接做 Identity Partition，通常会制造大量小 Partition 和小文件；过细的时间分区也可能让 Metadata 和 Writer 压力迅速增加。

## 关联知识

Partition Evolution 解决的是“数据怎么分组和裁剪”。

下一节进入 **Schema Evolution & Field ID**，解决另一个问题：

**字段改名、调整顺序、增加删除列以后，旧文件和新 Schema 怎样仍然保持字段语义一致。**
