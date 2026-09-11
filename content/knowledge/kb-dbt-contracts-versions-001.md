---
id: kb-dbt-contracts-versions-001
type: knowledge
title: Model Contracts, Versions & Change Safety
title_cn: Model Contracts、Versions 与变更安全
stage_id: '05'
domain: modeling
topic: dbt
order: 9
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: dbt_l5_v1
summary: Data Test 主要验证当前数据，Model Contract 则定义下游可以依赖的结构接口。Contract 用 Column Name/Data Type 等保证模型形态，Model Version 用于在 Breaking Change 时给消费者迁移窗口。
prerequisites:
  - kb-dbt-tests-freshness-reconciliation-001
related:
  - kb-dbt-artifacts-lineage-metadata-001
---
# Model Contracts、Versions 与变更安全

## 30 秒理解

上一节的 Test 主要回答：

> 当前数据对不对？

这一节回答：

> **下游到底可以稳定依赖什么？**

核心链：

```text
Model
→ Contract
→ Stable Interface
→ Downstream Consumers

when breaking change is required

V1
→ V2
→ migration window
→ deprecate V1
```

所以：

**Contract**

解决：

> 接口保证。

**Version**

解决：

> Breaking Change 怎样演进。

## 为什么 Model 可以看成 Data API

假设：

```text
dim_customer
```

被：

- BI Dashboard；
- MetricFlow；
- Agent；
- Reverse ETL；
- Data Science；

共同使用。

那它本质上已经像一个：

**Data API（数据接口）。**

消费者关心的不是：

> 你内部用了几层 CTE。

而是：

```text
customer_id exists?
customer_name exists?
data type stable?
nullability / constraint expectations?
```

这就是 Contract 思维。

## 没有 Contract 时什么会发生

Producer 改代码：

```sql
customer_id
→ cast(customer_id as string)
```

或者：

```text
rename customer_name → full_name
```

dbt Model 本身也许仍然成功 Build。

但是下游可能：

```text
BI query broken
Metric definition broken
API consumer broken
```

也就是：

> Producer Build Success ≠ Consumer Safety。

Contract 就是在 Build 阶段更早发现这种接口漂移。

## Contract 怎么定义

概念上：

```yaml
models:
  - name: dim_customers

    config:
      contract:
        enforced: true

    columns:
      - name: customer_id
        data_type: bigint

      - name: customer_name
        data_type: string
```

这个 Contract 表达：

```text
dim_customers must expose:
customer_id bigint
customer_name string
```

## Contract Enforcement 做什么

当前 dbt 对 Enforced Contract 会做两个核心动作。

### 第一：Preflight Check

在构建前检查：

```text
Model Query Output
vs
Declared Contract
```

例如：

```text
contract expects customer_id BIGINT

model SQL produces customer_id STRING
→ fail
```

这样可以在 Relation 真正替换以前阻断 Breaking Shape。

### 第二：生成 DDL 时使用 Contract 信息

dbt 可以把：

- Column Name；
- Data Type；
- Constraint；

加入发送给平台的 DDL。

但 Constraint 到底是不是：

**数据库真正强制执行**

取决于 Data Platform。

## Contract 和 Data Test 的区别

假设：

```yaml
customer_id:
  data_type: bigint
```

这是：

**Contract。**

它回答：

> Column 类型是不是接口声明的 BIGINT？

而：

```yaml
data_tests:
  - not_null
  - unique
```

回答：

> 当前数据里有没有 NULL / Duplicate？

所以：

```text
Contract
→ shape / interface

Data Test
→ row-level / data property
```

不能互相替代。

## Contract 不等于 Database Constraint

这是非常重要的边界。

例如 YAML 声明：

```yaml
constraints:
  - type: primary_key
```

在某些 Warehouse：

```text
primary key
→ metadata only
→ not enforced
```

在另一些平台：

```text
→ may be truly enforced
```

所以：

> dbt Contract 可以声明 Constraint，但数据库是否强制拒绝违规 Row 是 Platform Capability。

不能统一说：

```text
contract = database constraint
```

## 哪些 Materialization 当前支持 Contract

当前稳定语义主要围绕 SQL Model：

```text
table
view
incremental
```

其中：

- View 可保证 Column Name / Type，但通常不支持 Constraint；
- Incremental 还要求兼容的 `on_schema_change` 行为；
- Materialized View / Ephemeral 等并不是通用 Contract 支持面；
- Python Model 也不在当前统一支持范围内。

所以：

> Contract Support 不是所有 dbt Resource / Materialization 都相同。

## 为什么 Contract 不应该给所有中间 Model 都加

Contract 会增加：

- Metadata；
- Maintenance；
- Change Friction；
- Migration Cost。

如果一个内部 Staging Model 每天都在快速变化，

消费者只有一个同团队下游，

强 Contract 可能带来：

```text
more ceremony
than actual stability value
```

Contract 更适合：

- Public Model；
- 跨团队 Model；
- 语义层上游；
- 核心 Data Product；
- 下游很多的稳定接口。

所以治理强度要和：

**Consumer Criticality**

匹配。

## 什么是 Breaking Change

最直接的 Breaking Change：

```text
remove column
rename column
change data type
```

例如：

```text
country_name
→ removed
```

如果 20 个下游正在：

```sql
select country_name
```

直接上线就会破坏消费者。

还有更隐蔽的 Breaking Change：

```text
column name/type unchanged
but business meaning radically changed
```

例如：

```text
revenue
原来含税
→ 改成未税
```

Contract 可能检测不到。

所以 Breaking Change 判断还需要：

**Semantic Meaning（业务语义）**。

## 非 Breaking Change 呢

典型：

```text
add optional new column
fix calculation bug
improve internal implementation
```

这些通常没必要：

> 每改一次就创建新 Model Version。

Model Version 是一个重型治理工具，

应该用在：

> 真正需要消费者迁移的接口变化。

## Model Version 怎么工作

概念上：

```yaml
models:
  - name: dim_customers

    latest_version: 2

    versions:
      - v: 1
      - v: 2
```

消费者可以：

```text
default ref
→ latest version

explicit ref
→ specific version
```

于是可以形成：

```text
dim_customers_v1
→ old consumers

dim_customers_v2
→ new consumers
```

## Version 真正解决的是迁移窗口

没有 Version：

```text
deploy breaking change
→ all consumers must migrate immediately
```

有 Version：

```text
publish V2
→ keep V1 alive
→ consumers migrate
→ V2 becomes latest
→ deprecate V1
→ remove V1 later
```

这就是：

**Graceful Migration（平滑迁移）。**

它没有消除 Breaking Change。

它只是：

> 把“一次性爆炸”变成“有边界的迁移过程”。

## latest_version 是什么

`latest_version` 表示：

> 没有明确指定版本时，默认应该引用哪个版本。

例如：

```text
latest_version: 1
```

即使 V2 已经存在，

仍然可以让：

```text
normal ref()
```

继续落到 V1。

这样 V2 可以先：

- 测试；
- 灰度；
- 让部分消费者提前迁移。

准备完成后：

```text
latest_version → 2
```

## Deprecation Date 为什么有价值

如果只是说：

> V1 以后会删。

下游可能永远不迁。

有明确：

```text
deprecation date
```

就把迁移变成：

```text
known deadline
```

生产者可以：

- 通知；
- 追踪依赖；
- 迁移消费者；
- 最终删除旧版。

Version + Deprecation 一起才是完整的 Change Management。

## Version 也有成本

同时维护：

```text
V1
V2
V3
```

意味着：

- Warehouse Storage；
- Build Compute；
- Tests；
- Documentation；
- Support；
- Consumer Coordination。

所以不能：

> 每次小改都新建 Version。

官方当前也强调：

> 优先使用 Non-breaking Change，真正需要 Breaking Change 时再 Version。

## Schema Evolution 和 Interface Evolution 不完全一样

底层 Table 新增一个 Column：

```text
schema evolution
```

从数据库角度可能非常简单。

但对消费者接口来说：

```text
rename / remove / meaning change
```

才是真正关键。

所以：

```text
database schema changed
≠
automatically breaking

database schema did not change
≠
automatically safe
```

Contract / Version 管理的是：

**Consumer Contract。**

## Contract 和 MetricFlow 的边界

Stage 06 Semantic Layer 会定义：

- Entity；
- Dimension；
- Measure；
- Metric。

这些资源依赖 dbt Model 的稳定 Column Interface。

因此：

```text
dbt Contract
→ stable physical/model interface

MetricFlow
→ semantic meaning / metric interface
```

这是两层不同的契约。

## 一套 Change Safety 判断顺序

修改一个核心 Model 前，依次问：

```text
1. Column 名字变了吗？
2. Data Type 变了吗？
3. Nullability / Constraint 语义变了吗？
4. Business Meaning 变了吗？
5. 下游有多少消费者？
6. 这是 Bug Fix 还是 Breaking Change？
7. 能不能做 Non-breaking Additive Change？
8. 如果不能，需要 Model Version 吗？
9. Migration Window 多久？
10. 旧 Version 什么时候 Deprecate？
```

这比：

> 改完 SQL，dbt build 绿了就上线

成熟得多。

## 下一步为什么是 Artifacts

现在我们已经有：

```text
DAG
Tests
Contracts
Versions
```

但外部系统怎么知道这些信息？

CI 怎么做：

```text
state comparison
```

DataHub 怎么拿到：

```text
dbt lineage / metadata
```

这些能力都依赖：

**Artifact。**

下一节进入：

**Docs、Artifacts、Lineage 与 Metadata Integration。**
