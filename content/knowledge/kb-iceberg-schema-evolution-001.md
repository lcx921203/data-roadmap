---
id: kb-iceberg-schema-evolution-001
type: knowledge
title: Schema Evolution & Field ID
title_cn: Schema 演进与 Field ID
stage_id: '04'
domain: lakehouse
topic: iceberg
order: 6
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: v0.6.1_spine
project_relevance:
- north-america
project_fact_status: needs_fact_check
summary: Iceberg 用稳定 Field ID 标识字段，使 rename、reorder 和兼容类型演进不依赖物理列位置；破坏性变更仍需要数据契约治理。
prerequisites:
- kb-iceberg-partition-evolution-001
related:
- kb-iceberg-trino-read-path-001
- kb-iceberg-write-distribution-ordering-001
---
# Schema Evolution & Field ID

## 30 秒理解

Iceberg Schema 的关键不是“允许 ALTER TABLE”，而是每个字段有稳定的 **Field ID（字段 ID）**。

Reader 通过 Field ID 识别字段语义，因此 Rename（改名）和 Reorder（调整顺序）不会因为 Parquet 中旧文件列名/位置不同就把数据读错。

## 为什么列名不够

如果只依赖列位置：

```text
old: id, city, amount
new: id, amount, city
```

位置变化可能产生灾难性错读。

如果只依赖列名，Rename 会让系统误以为“旧列删除 + 新列新增”。

Field ID 提供稳定身份：

```text
field-id 17:
  old name = city
  new name = user_city
```

名字变了，身份没变。

## Compatible 与 Breaking Change

并不是所有 Schema Change 都天然安全。

通常要区分：

```text
Metadata-safe evolution
→ rename / reorder / compatible add

Potential breaking evolution
→ incompatible type narrowing
→ semantic meaning change
→ key/grain change
```

即使 Iceberg 元数据层允许某个变更，也不代表上游 Producer、dbt、Metric、BI、Agent 都能自动兼容。

所以真正的 Production Schema Evolution 必须带 Data Contract（数据契约）与 Impact Analysis（影响分析）。

## Production 实现

变更流程建议：

```text
Schema proposal
↓
Compatibility check
↓
Downstream lineage impact
↓
Dual-read / compatibility window if needed
↓
Apply metadata change
↓
Validate old + new files
↓
Observe consumers
```

尤其要关注：

- CDC Source 类型变化；
- decimal precision/scale；
- timestamp 语义；
- required / optional；
- nested struct；
- semantic metric 依赖。

## 代码 / 配置

示意：

```sql
ALTER TABLE prod.db.orders
RENAME COLUMN customer_city TO user_city;
```

生产上不要把“DDL 成功”当成变更完成。后续至少要验证：

```text
Spark read
Trino read
dbt model
Semantic Layer
Serving consumer
```

## 故障排查

Schema 演进后出现 NULL 或错值时，按链路查：

```text
Source schema
↓
CDC serialization
↓
Writer schema
↓
Iceberg Field ID mapping
↓
Data file schema
↓
Reader projection
↓
Downstream contract
```

## 项目案例

DataRoadmap 会把 Schema Evolution 作为北美项目的高相关能力，但具体是否处理过某个字段变更、采用何种兼容策略，需要 Project Fact Check 后才能写“我做过”。

## 大规模下会发生什么

规模越大，Schema 变更的最大风险越不在 DDL 本身，而在**影响面**。

当同一张表被几十个模型、指标、API 与 Agent Tool 消费时，Field ID 解决存储正确性，Lineage + Contract 才解决组织层面的安全演进。

## 关联知识

下一节先进入 Trino Read Path，把 Snapshot、Manifest、Data/Delete File、Partition 与 Schema 串成一次完整读取；再回到写入侧看新文件怎样产生。
