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
content_status: iceberg_l5_v1
project_relevance:
- north-america
project_fact_status: needs_fact_check
summary: Iceberg 用稳定 Field ID 识别字段，使 Add、Drop、Rename、Reorder 与安全类型扩宽不依赖列名或物理位置；存储层兼容仍不等于下游语义自动兼容。
prerequisites:
- kb-iceberg-partition-evolution-001
related:
- kb-iceberg-trino-read-path-001
- kb-iceberg-write-distribution-ordering-001
---
# Schema Evolution & Field ID

## 30 秒理解

Iceberg Schema 的核心不是“支持 ALTER TABLE”，而是：

**每个字段都有稳定的 Field ID（字段 ID）。**

列名可以改，列顺序可以变，但只要 Field ID 还是同一个，Reader 就知道这是同一个逻辑字段。

所以 Iceberg 可以安全支持 Add、Drop、Rename、Reorder，以及规范允许的类型扩宽，而不需要依赖物理列位置。

## 为什么列名和列位置都不够

如果系统只依赖列位置：

`id, city, amount`

改成：

`id, amount, city`

就可能把不同字段错误对应。

如果系统只依赖列名，那么 `city → user_city` 的 Rename（改名）又容易被理解成“删掉旧列，再新增一个完全不同的新列”。

Field ID 提供稳定身份：

**Field ID 不变 → 字段身份不变**

名字和展示顺序只是这个身份的属性。

## Schema Evolution 可以做什么

Iceberg 规范允许对 Struct 中的字段做：

- Add；
- Drop；
- Rename；
- Reorder；
- 合法的 Primitive Type Promotion（基本类型扩宽）。

典型安全扩宽包括：

- `int → long`；
- `float → double`；
- `decimal(P,S) → decimal(P',S)`，其中 `P' > P`，Scale 不变。

V3 还增加了一些额外类型演进能力，但生产使用时必须同时确认 Reader / Writer 引擎版本是否支持。

## 为什么 Rename 不会把旧数据读错

假设字段原来是：

**Field ID 17 = city**

后来改名为：

**Field ID 17 = user_city**

旧 Data File 不需要因为改名全部重写。

Reader 根据当前 Schema 和稳定 Field ID，把旧文件中的字段身份映射到现在的字段名。

因此 Iceberg 的 Schema Evolution 是“按字段身份演进”，不是“按物理位置猜字段”。

## 存储层安全不等于业务层安全

这是生产上最容易忽略的边界。

Iceberg 能保证某个 Schema Change 在表格式层面安全，不代表下面这些消费者一定自动兼容：

- CDC Producer；
- Spark / Flink Job；
- dbt Model；
- Semantic Layer；
- BI Dashboard；
- API；
- Agent Tool。

例如字段虽然可以 Rename，但下游 SQL 仍可能写着旧列名。

所以 Production Schema Evolution 仍需要：

**Compatibility Check（兼容性检查） + Lineage Impact（血缘影响） + Data Contract（数据契约）**

## 代码示例

```sql
ALTER TABLE prod.db.orders
RENAME COLUMN customer_city TO user_city;
```

DDL 成功只代表表元数据更新成功。

后续仍要验证关键 Reader、Model 和 Serving Consumer 是否按预期工作。

## 关联知识

到这里，读取一张 Iceberg 表需要的核心对象已经齐了：

**Snapshot → Manifest → Data/Delete → Partition → Schema**

下一节用一次 **Trino Read Path** 把前面 6 节串成一条完整读取链路，并把 Pruning（裁剪）只在一个地方讲完整。
