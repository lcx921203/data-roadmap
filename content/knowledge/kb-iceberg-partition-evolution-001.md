---
id: kb-iceberg-partition-evolution-001
type: knowledge
title: Hidden Partitioning & Partition Evolution
title_cn: 隐藏分区与 Partition Evolution
stage_id: '04'
domain: lakehouse
topic: iceberg
order: 5
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: iceberg_l5_v1_1_refactor
project_relevance:
- north-america
project_fact_status: needs_fact_check
summary: Iceberg 用 Partition Spec 与 Transform 定义逻辑分区，Reader 通过 Source Field ID 和 Spec ID 正确解释新旧文件。Partition Evolution 主要改变未来写入布局，旧文件继续保持旧 Spec，不需要因为改分区而全量重写。
prerequisites:
- kb-iceberg-row-level-changes-001
related:
- kb-iceberg-schema-evolution-001
- kb-iceberg-trino-read-path-001
---
# Hidden Partitioning 与 Partition Evolution

## 30 秒理解

Iceberg 的 Partition（分区）不是目录命名规则，而是显式 Metadata（元数据）。

Partition Spec（分区规则）定义：

> 哪个业务字段，通过什么 Transform（转换），生成怎样的 Partition Value（分区值）。

例如：

```text
days(event_time)
bucket(64, user_id)
```

最重要的是：

**旧文件可以继续使用旧 Partition Spec，新文件使用新 Partition Spec。**

所以分区策略演进时，不要求为了“改分区”就重写整张历史表。

## Partition Spec 到底是什么

一个 Partition Spec 由多个 Partition Field（分区字段）组成。

每个 Partition Field 会记录：

- Source Field ID（源字段 ID）；
- Transform（转换规则）；
- Partition Field ID；
- Partition Field Name。

这里先抓最关键的一点：

> **Partition Spec 不是只记业务列名，而是通过稳定的 Source Field ID 关联源字段。**

这会和下一节 Schema Evolution 直接连接起来。

## Transform 是什么

常见 Transform 有：

- `identity`：直接使用原值；
- `year / month / day / hour`：按时间粒度转换；
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

这不意味着业务查询必须手工写物理分区列。

Query 仍然可以直接按：

```text
event_time
user_id
```

过滤。

Engine / Connector 根据 Partition Spec 推导哪些 Partition Value 不可能命中。

这就是 Hidden Partitioning（隐藏分区）。

## Hidden Partitioning 到底隐藏了什么

隐藏的不是：

> 表没有分区。

而是：

> **业务 SQL 不需要长期维护物理分区列和目录规则。**

Iceberg 更希望 Query 表达业务谓词，再由 Reader 根据 Transform 推导可裁剪范围。

所以业务逻辑和物理分区布局的耦合更低。

## Partition Evolution 为什么不用重写历史

假设一开始：

```text
Spec 0
= days(event_time)
```

后来单日数据量太大，改成：

```text
Spec 1
= hours(event_time)
```

Iceberg 不会要求：

> 把过去几年的所有 Daily File 重写成 Hourly File。

而是：

```text
旧 Data File
→ 继续由 Spec 0 解释

新 Data File
→ 按 Spec 1 写入
```

Reader 在规划时，根据每个 Manifest 对应的 Spec ID，知道应该怎样解释那些 Partition Data。

所以同一张 Iceberg 表可以同时存在：

```text
历史 Spec 0 文件
+
新 Spec 1 文件
```

## 为什么一个 Manifest 只对应一个 Partition Spec

上一节已经学过：

> 一个 Manifest 只对应一个 Partition Spec。

现在原因就更清楚了。

如果同一个 Manifest 里混入两套不同 Partition Struct（分区结构），Reader 很难用统一的 Partition Summary 做正确裁剪。

所以：

```text
Spec 演进
→ 新旧 Spec 可以共存
→ 但不会在同一个 Manifest 里混成一套分区语义
```

## Partition Evolution 和 Schema Rename 为什么可以一起工作

假设：

```text
Field ID 17
name = event_time
```

Partition Spec 通过 Source Field ID：

```text
17
```

引用这个字段。

后来把列 Rename（改名）为：

```text
occurred_at
```

只要它仍然是：

```text
Field ID 17
```

Partition Spec 的 Source 关系仍然指向同一个逻辑字段。

这就是稳定 ID 带来的价值：

**名字可以变，字段身份不变，Partition Source 关系不需要靠名字猜。**

更复杂的 Drop / Rebuild 需要同时协调 Schema 与 Partition Spec，生产变更时要按实际 Engine 能力验证。

## 一个生产问题：Daily 要不要改 Hourly

假设每天：

```text
5 TB
```

都进入：

```text
days(event_time)
```

单日 Partition 太大，查询和 Writer 压力明显。

把它改成 Hourly 可能带来：

```text
更细裁剪
+
更好的写入并行
```

但也可能带来：

```text
Partition 数量增加
+
每个 Partition 数据更少
+
小文件风险增加
+
Manifest / Metadata 对象更多
```

所以 Partition Evolution 不是：

> “越细越先进”。

真正要平衡：

- 查询最常见 Predicate；
- 每个 Partition 数据量；
- Active Partition Count（活跃分区数）；
- Writer 并发；
- File Size；
- Metadata Growth（元数据增长）；
- Maintenance Cost（维护成本）。

## Partition Evolution 改的是未来布局，不是自动优化历史

这句话非常重要。

从 Daily 改成 Hourly 后：

```text
新写入
→ Hourly

旧历史
→ 仍然 Daily
```

如果你还希望历史几年也重新变成 Hourly，那已经不是单纯 Metadata Evolution。

那是：

> **Data Rewrite（数据重写）**

属于另一种成本级别。

所以要能区分：

```text
Partition Evolution
≠
Historical Repartition Rewrite
```

## 这一节真正要掌握什么

必须掌握：

- Partition Spec / Transform / Partition Value 三者区别；
- Hidden Partitioning 为什么降低业务 SQL 与物理分区耦合；
- 新旧 Partition Spec 可以共存；
- 一个 Manifest 只对应一个 Spec；
- Partition Spec 通过 Source Field ID 绑定源字段；
- Partition Evolution 默认主要改变未来写入。

生产上要会判断：

- Daily → Hourly 是否值得；
- 分区过细为什么会制造小文件与 Metadata 压力；
- 为什么改 Partition 不等于历史数据自动重写。

了解即可：

- 所有 Transform 的哈希 / 截断实现细节；
- Partition Spec JSON 的所有字段。

下一节进入另一条 Evolution 主线：

**Schema 改名、加列、删列以后，历史 Data File 为什么仍然不会被读串？**
