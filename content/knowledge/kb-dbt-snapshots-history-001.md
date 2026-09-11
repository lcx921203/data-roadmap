---
id: kb-dbt-snapshots-history-001
type: knowledge
title: Snapshots, Source History & SCD2 Implementation
title_cn: Snapshots、Source History 与 SCD2 实现
stage_id: '05'
domain: modeling
topic: dbt
order: 7
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: dbt_l5_v1
summary: Snapshot 用来记录可变 Source Relation 的历史版本。它不是普通 Incremental Model，也不是备份系统；它通过 Unique Key 和 timestamp/check Strategy 检测业务 Row 变化，并形成 SCD Type 2 风格的有效期历史。
prerequisites:
  - kb-dbt-incremental-models-001
related:
  - kb-dbt-tests-freshness-reconciliation-001
---
# Snapshots、Source History 与 SCD2 实现

## 30 秒理解

Incremental Model 回答：

> 怎样高效维护“当前结果”？

Snapshot 回答：

> 上游只保留“当前状态”，但我怎样知道它过去是什么样？

主链：

```text
Mutable Source
→ identify row by unique_key
→ detect change
→ invalidate previous version
→ insert new version
→ Historical Timeline
```

这就是：

**SCD Type 2（慢变维 Type 2）**

的一种 dbt 工程实现。

但：

> SCD2 的业务建模理论属于 Stage 03。

这里专门学：

> dbt Snapshot 怎样实现历史版本。

## 为什么普通 Source 会丢历史

假设 Source 当前只有：

```text
customer_id=100
tier=GOLD
updated_at=Sep 11
```

昨天实际上是：

```text
customer_id=100
tier=SILVER
updated_at=Sep 10
```

如果上游执行：

```sql
update customers
set tier='GOLD'
where customer_id=100
```

数据库当前表里可能已经没有：

```text
SILVER
```

版本。

如果分析需要：

> Sep 10 时客户是什么 Tier？

普通 Current-state Table 无法回答。

Snapshot 就是在周期执行时捕捉这些变化。

## Snapshot 是怎么识别“同一个业务对象”的

依赖：

```text
unique_key
```

例如：

```yaml
unique_key: customer_id
```

表示：

```text
customer_id=100 yesterday
and
customer_id=100 today
```

是同一个业务 Entity 的不同状态。

如果 `unique_key` 不稳定，

历史链就会断裂或错配。

所以和 Incremental 一样：

> `unique_key` 必须对应稳定业务 Grain。

## Snapshot 怎么知道 Row 变了

dbt 主要有两种 Strategy：

```text
timestamp
check
```

当前官方推荐：

**有可靠 updated_at 时优先 timestamp。**

## timestamp Strategy

假设 Source 有可靠字段：

```text
updated_at
```

配置概念上：

```yaml
snapshots:
  - name: customers_snapshot
    relation: source('app', 'customers')

    config:
      schema: snapshots
      unique_key: customer_id
      strategy: timestamp
      updated_at: updated_at
```

高层逻辑：

```text
same unique_key
+
new updated_at > previous updated_at
→ source row changed
```

于是：

```text
old version
→ valid_to set

new version
→ inserted as current
```

## 为什么 timestamp Strategy 更推荐

因为它只需要依赖：

```text
one reliable change timestamp
```

Source 新增 / 删除普通业务 Column 时，

通常不需要不断修改：

```text
which columns should I compare?
```

所以相比 Check Strategy：

- 对 Schema Evolution 更稳健；
- 配置维护更简单；
- 变化检测成本逻辑更清晰。

前提是：

> `updated_at` 真的可靠。

## 什么叫“可靠 updated_at”

理想情况下：

业务 Row 每次发生需要保留历史的变化时：

```text
updated_at
```

都必须变化。

如果上游：

```text
tier changed
but updated_at unchanged
```

Snapshot 就无法通过 Timestamp 判断这次变化。

所以：

> Timestamp Strategy 的正确性依赖 Source Change Timestamp 的正确性。

## check Strategy

如果 Source 没有可靠 `updated_at`，

可以使用：

```text
check
```

例如：

```yaml
snapshots:
  - name: customers_snapshot
    relation: source('app', 'customers')

    config:
      schema: snapshots
      unique_key: customer_id
      strategy: check
      check_cols:
        - tier
        - status
```

高层：

```text
current tier/status
vs
previous tier/status
→ values differ
→ changed
```

## check_cols='all' 为什么要谨慎

可以让 dbt 检查所有 Column，

但这意味着：

> 任何被包含的 Column 改变都可能制造一个新历史版本。

如果某个无业务意义的技术 Column 经常变化：

```text
load_ts
processing_id
```

Snapshot 就可能产生大量无意义版本。

所以更好的思路是：

> 明确哪些字段变化真正代表需要记录的业务状态变化。

## Snapshot 最终存什么

Snapshot 会维护额外的 Metadata Column。

高层至少可以理解：

```text
business columns
+
dbt_valid_from
+
dbt_valid_to
+
change metadata
```

于是同一个 Entity 可能有：

```text
customer=100 | SILVER | valid Sep 1 → Sep 10
customer=100 | GOLD   | valid Sep 10 → NULL
```

从而可以做：

**As-of Analysis（按历史时点分析）**。

## `dbt_valid_to = NULL` 怎么理解

当前版本：

```text
dbt_valid_to = NULL
```

通常表示：

> 这是当前有效版本。

也可以配置当前版本的结束值表达方式，

但这属于实现配置。

学习模型只需要记：

```text
valid_from
valid_to
→ version interval
```

## Hard Delete 是什么

假设 Source 昨天有：

```text
customer_id=100
```

今天 Source 里这条 Row 直接消失。

这叫：

**Hard Delete（硬删除）**。

Snapshot 必须决定：

> 消失意味着什么？

当前 dbt 提供的 `hard_deletes` 语义包括：

```text
ignore
invalidate
new_record
```

## ignore

高层：

> Source Row 消失时，不专门记录 Delete Event。

历史中的当前版本可能继续保留原有状态语义。

适不适合取决于业务。

## invalidate

高层：

> Source Row 消失时，把当前历史版本关闭。

例如：

```text
dbt_valid_to = deletion detection time
```

表示：

> 此对象在这个时点之后不再有效。

## new_record

高层：

> 把删除本身也记录成一个新的 Snapshot Version。

并可通过：

```text
dbt_is_deleted
```

表达 Delete 状态。

这适合需要：

> 删除也作为业务事件保留

的场景。

## Hard Delete 选择是业务语义，不是技术偏好

例如：

### 客户真的注销

```text
invalidate / deleted record
```

可能合理。

### 上游 CDC 临时漏数

如果 Source Row 暂时消失又回来，

直接把它解释成业务 Delete 可能错误。

所以 Snapshot 正确性依赖：

> Source Snapshot 本身的完整性。

## Snapshot 和 Incremental Model 到底什么区别

这是这一节最重要的区别。

### Incremental Model

目标：

> 高效维护 Model 当前结果。

例如：

```text
fct_orders current version
```

通常只关心：

**当前正确状态。**

### Snapshot

目标：

> 保留 Source 发生过的历史状态。

例如：

```text
customer SILVER
→ customer GOLD
```

两版都保留。

所以：

```text
Incremental
= efficient current-state transformation

Snapshot
= historical version capture
```

两者都“每次处理变化数据”，

但业务目的完全不同。

## Snapshot 和备份系统有什么区别

Backup 解决：

> 数据坏了，能不能整体恢复？

Snapshot 解决：

> 业务 Entity 在不同时间点是什么状态？

Snapshot 通常：

- 只捕获 Query Result；
- 按 Unique Key 建历史；
- 为分析服务。

它不是：

- Database PITR；
- Object Storage Backup；
- Disaster Recovery System。

所以：

**dbt Snapshot ≠ Database Backup。**

## Snapshot 的 State 也会增长

假设：

```text
100M customers
```

每个 Customer 平均一年变化 10 次，

理论历史版本数量会持续增长。

所以 Snapshot 会带来：

- Storage；
- Query Scan；
- Build Cost；
- Maintenance；
- Downstream Join Complexity。

不能因为：

> 历史有用

就给每张 Source Table 都做 Snapshot。

## 哪些 Source 值得 Snapshot

典型是：

- 业务状态会覆盖；
- 上游不保历史；
- 分析确实需要历史状态。

例如：

```text
customer tier
account status
subscription plan
sales assignment
```

而一个天然 Append-only Event：

```text
order_events
click_events
```

本身已经有历史，

通常没必要再用 Snapshot 重新制造历史。

## Snapshot 和 SCD2 的边界

Stage 03 负责回答：

> 为什么 Customer Dimension 需要 SCD2？

Stage 05 dbt Snapshot 负责回答：

> 如果选用 dbt Snapshot，怎样把可变 Source 变成有效期历史？

所以不要说：

> dbt Snapshot 就等于所有 SCD2 最佳实现。

Snapshot 是一种工程工具，

具体 Dimension Architecture 仍要看：

- Source；
- Grain；
- History Requirement；
- Serving Pattern。

## 前 7 节现在形成什么模型

到这里：

```text
dbt Project
→ DAG
→ compile SQL
→ choose persistence
→ maintain incremental current state
→ capture historical source state
```

已经从：

**代码组织**

进入了：

**状态管理。**

下一步自然就是：

> 这些 Model / Snapshot 建出来以后，怎么证明它们是对的？

## 关联知识

下一节进入 **Data Tests、Unit Tests、Freshness 与 Reconciliation**。
