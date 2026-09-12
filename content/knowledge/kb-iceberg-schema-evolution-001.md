---
id: kb-iceberg-schema-evolution-001
type: knowledge
title: Schema Evolution, Schema ID & Field ID
title_cn: Schema 演进、Schema ID 与 Field ID
stage_id: '04'
domain: lakehouse
topic: iceberg
order: 6
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: iceberg_l5_v1_1_refactor
project_relevance:
- north-america
project_fact_status: needs_fact_check
summary: Iceberg 通过 Schema ID 版本化整套 Schema，并用永不复用的 Field ID 标识字段身份。Reader 按 Field ID 做列投影，因此 Add、Drop、Rename、Reorder 和安全类型扩宽通常不需要重写历史文件；但表格式安全不等于下游消费者自动兼容。
prerequisites:
- kb-iceberg-partition-evolution-001
related:
- kb-iceberg-trino-read-path-001
- kb-iceberg-write-distribution-ordering-001
---
# Schema 演进、Schema ID 与 Field ID

## 30 秒理解

这一节只先抓两个 ID：

**Schema ID（模式 ID） = 一整套 Schema 版本的身份。**

**Field ID（字段 ID） = 某一个逻辑字段的稳定身份。**

Schema 可以从：

```text
Schema 1
↓
Schema 2
↓
Schema 3
```

不断演进。

但只要一个字段还是同一个逻辑字段，它的 Field ID 就不变。

最重要的规则是：

> **Field ID 在一张 Iceberg 表中不会被复用。**

这就是 Rename、Reorder、Add / Drop 能安全工作的核心。

## 先分清 Schema ID 和 Field ID

假设最初：

```text
Schema ID = 1

Field ID 1 = id
Field ID 2 = city
Field ID 3 = amount
```

现在 Rename：

```text
city
→ user_city
```

产生新的 Schema：

```text
Schema ID = 2

Field ID 1 = id
Field ID 2 = user_city
Field ID 3 = amount
```

变化的是：

```text
Schema ID
Column Name
```

不变的是：

```text
Field ID 2
```

所以 Reader 知道：

> `city` 和 `user_city` 是同一个逻辑字段的两个历史名字。

## 为什么不能只依赖列位置

假设旧文件：

```text
id, city, amount
```

后来 Schema Reorder（调整顺序）：

```text
id, amount, city
```

如果 Reader 只靠位置：

```text
第二列 = city
```

就会直接读串。

Iceberg 不这样做。

它按 Field ID 识别字段身份。

因此：

```text
Column Order（列顺序）
```

只是 Schema 展示 / 投影的一部分，不是字段身份。

## 为什么不能只依赖列名

假设：

```text
Field ID 2 = city
```

Rename 成：

```text
Field ID 2 = user_city
```

如果系统只认名字，就可能理解成：

```text
Drop city
+
Add user_city
```

然后把旧数据当成与新列无关。

Iceberg 通过稳定 Field ID 明确：

```text
名字变了
身份没变
```

所以 Rename 通常只需要更新 Metadata，不需要重写历史 Data File。

## Field ID 永不复用为什么非常重要

这是 Schema Evolution 最容易漏掉、但非常关键的规则。

假设：

```text
Field ID 2 = city
```

后来：

```text
DROP city
```

几年以后业务又说：

> 再加一个叫 `city` 的字段。

新的 `city` 会得到：

```text
新的 Field ID
```

例如：

```text
Field ID 9 = city
```

它不会重新使用：

```text
Field ID 2
```

这意味着：

**同名 ≠ 同一个历史字段。**

这样旧文件里 Field ID 2 的历史值，就不会被新字段错误“复活”。

## Schema Evolution 可以做什么

Iceberg 当前规范支持对 Struct（结构体）做这些安全演进：

- Add（增加字段）；
- Drop（删除字段）；
- Rename（重命名）；
- Reorder（调整顺序）；
- Primitive Type Promotion（基本类型安全扩宽）。

这些能力也适用于很多 Nested Field（嵌套字段）。

但学习重点不是背 API，而是：

> **这些变化为什么不会把旧字段值错配到新字段。**

答案还是：

**Field ID。**

## 类型扩宽为什么叫安全扩宽

最典型的当前 v1 / v2 安全扩宽包括：

```text
int → long
float → double
decimal(P,S) → decimal(P',S)
其中 P' > P，Scale 不变
```

它们的共同特征是：

> 新类型能够安全表示旧类型的值。

而类似：

```text
string → int
long → int
decimal scale 改变
```

就不是这种简单安全 Promotion。

Iceberg V3 又增加了部分新的类型演进能力，例如部分 `date → timestamp` Promotion。

这里不要背完整表。

生产上真正要问的是：

```text
Table Format Version 支不支持？
Reader / Writer Engine 支不支持？
历史值能不能安全表达？
```

## 旧 Data File 到底怎么被新 Schema 读取

这是这一节最重要的机制。

假设旧文件写入时：

```text
1: id
2: city
3: amount
```

当前 Schema 已经变成：

```text
3: order_amount
2: user_city
4: country
```

Reader 做 Column Projection（列投影）时，不是按：

```text
第 1 列
第 2 列
第 3 列
```

也不是只按名字。

而是按：

```text
Field ID
```

映射。

于是：

```text
Field ID 3
→ 旧文件里的 amount
→ 当前叫 order_amount

Field ID 2
→ 旧文件里的 city
→ 当前叫 user_city

Field ID 4
→ 旧文件里没有
→ 按 Default / Null 规则解析
```

所以真正的核心链是：

```text
Current / Historical Schema
↓
Field ID Projection
↓
Old Data File
↓
正确字段值
```

这才是“Schema Evolution 不需要重写旧文件”的底层原因。

## Add Column 后，旧行的新字段是什么

假设旧数据里根本没有：

```text
country
```

现在 Add：

```text
country
```

旧 Parquet 不会突然多一列。

Reader 需要根据 Schema Default（默认值）语义解释“旧文件里没有这个 Field ID”。

在当前 Spec 中，V3 对 Default Value（默认值）有更完整的定义：

- `initial-default`：给字段加入以前已经存在的历史记录使用；
- `write-default`：给字段加入以后、Writer 没显式提供值的新记录使用。

对于没有定义非空默认值的 Optional Field（可空字段），旧数据通常表现为 `NULL`。

这里需要知道机制，但不用现在背默认值所有序列化规则。

## Required / Optional 为什么是生产风险点

假设历史 10 年数据都没有新字段：

```text
risk_level
```

现在你想新增一个：

```text
NOT NULL
```

问题马上出现：

> 历史行的值从哪里来？

在支持 Default Value 的规范 / Engine 里，可以通过明确默认值表达历史和未来的默认语义。

但真实生产仍然要检查：

- Format Version；
- Spark / Flink / Trino 的支持程度；
- Writer 是否真的写入符合约束的值；
- 下游工具是否理解这些新 Schema 语义。

所以不要把：

> “Iceberg Spec 支持 Required Field”

直接理解成：

> “我现在可以在任何 Engine 上随便加 NOT NULL 列”。

## Nested Schema Evolution 要掌握到什么程度

Iceberg 的 Field ID 不只用于顶层列。

Nested Struct、List Element、Map Value 等内部字段也有稳定 ID。

所以可以支持类似：

```text
location.lat
→ rename

points.element.z
→ add
```

这类嵌套演进。

但并不是任意结构重组都允许。

例如把：

```text
struct<a, b, c>
```

直接重组为：

```text
struct<a, struct<b, c>>
```

这种“移动层级”的结构变化不是普通安全 Schema Evolution。

第一次学习只需要抓住：

> **可以在原结构里安全增加 / 删除 / Rename / Reorder Field，但不能把任意树结构重排成另一种层级。**

## Schema Evolution 和 Partition Evolution 怎样连接

上一节已经学过：

Partition Spec 通过：

```text
Source Field ID
```

引用业务字段。

假设：

```text
Field ID 17 = event_time
```

Partition Spec：

```text
days(Field ID 17)
```

后来 Rename：

```text
event_time
→ occurred_at
```

只要还是：

```text
Field ID 17
```

Partition Source 关系就不会因为列名变化自动断掉。

所以 Iceberg Evolution 的核心其实是一套稳定 ID 体系：

```text
Schema ID
Field ID
Partition Spec ID
Partition Field ID
Snapshot ID
```

不同对象都有明确身份，不靠“当前位置 / 当前名字”猜。

## Schema Evolution 和 Time Travel 怎样连接

第 2 节已经学过：

Snapshot 可以记录它对应的 Schema ID。

所以历史读取链是：

```text
Time Travel 到 Snapshot S10
↓
找到 S10 对应的 Schema ID
↓
按照那个历史 Schema
↓
再按 Field ID 读取历史 Data File
```

这解决一个非常关键的问题：

> 今天 Schema 已经 Rename / Add / Drop 了，为什么读 S10 还能看到当时正确的列语义？

因为 Time Travel 不是只切换 Data File。

它还需要回到：

**那个 Snapshot 对应的历史 Schema 语义。**

## 存储层安全不等于下游业务兼容

Iceberg 可以保证：

```text
Rename Column
```

在表格式层不把旧数据读串。

但下游可能还写着：

```sql
SELECT city FROM ...
```

于是：

- dbt Model 失败；
- BI Dashboard 报错；
- API Schema 不兼容；
- Agent Tool 字段定义过期。

所以 Production Schema Evolution 要分两层：

```text
Storage Compatibility（存储兼容）
+
Consumer Compatibility（消费者兼容）
```

Iceberg 只解决第一层的关键部分。

第二层仍然需要：

- Data Contract（数据契约）；
- Lineage Impact（血缘影响分析）；
- CI / Compatibility Check（兼容检查）；
- Consumer Migration（消费者迁移）。

## 一个生产变更应该怎么判断

假设要：

```text
customer_city
→ user_city
```

不要只做：

```sql
ALTER TABLE ... RENAME COLUMN
```

完整思路更接近：

```text
1. Iceberg 层确认这是 Rename，不是 Drop + Add
2. Field ID 必须保持
3. 检查 Partition / Sort / Identifier 等引用关系
4. 查 Lineage：哪些 dbt / BI / API / Agent 还引用旧名
5. 选择一次性切换还是兼容迁移
6. 发布后验证 Reader / Writer
7. 必要时保留历史 Snapshot 做回退 / 对比
```

这才是生产级 Schema Evolution。

## 这一节真正要掌握什么

必须掌握：

- Schema ID 和 Field ID 是两个层次；
- Field ID 是字段身份，而且永不复用；
- Rename / Reorder 为什么不会把旧值读串；
- Drop 后重新 Add 同名字段为什么是新字段；
- Reader 按 Field ID 做 Projection；
- Historical Snapshot 有对应的历史 Schema；
- Partition Spec 通过 Source Field ID 与 Schema 连接。

生产上要会判断：

- Rename 为什么 Iceberg 安全，但 Consumer 仍可能挂；
- Add Required Field / Type Promotion 是否真的被当前 Engine 支持；
- Schema Change 上线前为什么需要 Lineage / Contract / CI。

了解即可：

- 所有 Primitive Promotion 的完整版本矩阵；
- Default Value 的底层 JSON 序列化；
- 所有 Nested Type 边界条件。

下一节不再新增新的基础对象。

而是用 **Trino Read Path（Trino 读取路径）** 把：

**Snapshot → Manifest → Data/Delete → Partition → Schema**

第一次完整串成一次真实查询。
