---
id: kb-dbt-incremental-models-001
type: knowledge
title: Incremental Models, Unique Key, Strategies & Backfill
title_cn: Incremental Models、Unique Key、Strategies 与 Backfill
stage_id: '05'
domain: modeling
topic: dbt
order: 6
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: dbt_l5_v1
summary: Incremental Model 依赖已经存在的目标表状态，只处理被项目逻辑选中的新增或变化数据，再按 Adapter 支持的 Strategy 写回。真正难点不是 materialized='incremental'，而是如何定义增量边界、Unique Key、迟到数据、幂等重跑和 Full Refresh。
prerequisites:
  - kb-dbt-materializations-001
related:
  - kb-dbt-snapshots-history-001
---
# Incremental Models、Unique Key、Strategies 与 Backfill

## 30 秒理解

Incremental Model 的核心不是：

> 每次只跑一点数据。

而是：

> **本次结果依赖已经存在的 Target Table 状态。**

完整模型：

```text
Existing Target
+
New / Changed Source Rows
+
Incremental Filter
+
Write Strategy
→ Updated Target
```

因此它从普通无状态 SELECT 变成：

**Stateful Transformation（有状态转换）**。

## 第一次运行和后续运行有什么不同

假设：

```sql
{{ config(materialized='incremental') }}

select *
from {{ source('app', 'orders') }}
```

### 第一次运行

Target Table 还不存在。

dbt 会：

```text
all source rows
→ transform
→ build target table
```

### 后续运行

Target 已经存在。

此时：

```text
is_incremental() == true
```

项目逻辑才会进入增量分支。

所以 Incremental 必须始终考虑两种执行路径：

```text
full build path
incremental path
```

## is_incremental() 到底什么时候是 True

当前稳定语义要求同时满足：

```text
1. target relation already exists as a table
2. model is materialized='incremental'
3. current run is not --full-refresh
```

例如：

```sql
select *
from {{ source('app', 'orders') }}

{% if is_incremental() %}
where updated_at >= (
    select max(updated_at)
    from {{ this }}
)
{% endif %}
```

这里：

```text
{{ this }}
```

指向当前 Model 的目标 Relation。

## 为什么 Incremental Filter 才是真正核心

`materialized='incremental'` 不会自动知道：

> 哪些 Source Row 是新的。

你必须定义：

```text
what rows should be reconsidered this run?
```

例如：

```sql
where updated_at >= last_processed_time
```

所以增量模型的正确性首先取决于：

**Incremental Boundary（增量边界）**。

如果边界写错：

```text
new rows missed
→ data loss

too wide
→ unnecessary recompute

too narrow
→ late updates missed
```

## `unique_key` 是什么

`unique_key` 告诉某些 Incremental Strategy：

> Target 中怎样识别“同一条逻辑记录”。

例如：

```sql
{{ config(
    materialized='incremental',
    unique_key='order_id'
) }}
```

高层上：

```text
incoming order_id=100
+
target already has order_id=100
→ strategy may update / replace old row
```

如果不存在：

```text
→ insert
```

## `unique_key` 不是数据库唯一约束

这是非常重要的边界。

配置：

```yaml
unique_key: order_id
```

不等于：

```sql
UNIQUE(order_id)
```

数据库一定会强制约束。

它主要用于：

**dbt Incremental Matching Semantics。**

因此如果 Source 中：

```text
order_id=100
order_id=100
```

重复出现，

某些平台 / Strategy 可能：

- 报错；
- 产生重复；
- 产生非预期结果。

所以 `unique_key` 仍然需要：

**Data Test / Source Quality**

保护。

## 为什么 `unique_key` 要对应 Grain

如果 Model 的 Grain 是：

```text
一行一个 order_id + item_id
```

却配置：

```text
unique_key = order_id
```

那么一个订单多个 Item 会被误认为：

> 同一个逻辑 Row。

这不是 dbt 参数问题，

而是：

**Grain Design 错误。**

所以 Stage 03 的 Grain 理论会直接决定 Stage 05 的 `unique_key`。

## 常见 Incremental Strategy

当前 dbt 内置的主要 Strategy 概念包括：

```text
append
delete+insert
merge
insert_overwrite
microbatch
```

但：

> **Adapter 支持范围不同。**

不要把某个平台支持的 Strategy 当成 dbt 全平台共同能力。

## append

高层：

```text
new rows
→ INSERT
```

不尝试更新已有 Row。

适合：

- Append-only Event；
- Source Row 永不修改；
- 目标只需要新增。

风险：

```text
source update / replay
→ duplicate / stale data
```

如果业务会更新旧记录，

Append 通常不够。

## merge

高层：

```text
new rows
→ match target by unique_key
→ matched: update
→ unmatched: insert
```

它适合：

> 当前状态表 / 更新型 Fact。

但 Merge 可能需要扫描 Target 的相关部分。

Target 很大时：

```text
merge matching
→ destination scan
→ expensive
```

因此：

**Incremental Source 变小**

不代表：

**Target Matching 成本一定很小。**

## delete+insert

高层：

```text
find matching unique keys
→ delete old rows
→ insert new rows
```

目标和 Merge 类似：

> 替换已有逻辑记录。

但物理行为不同。

是否支持、性能如何，

取决于 Adapter / Database。

## insert_overwrite

它通常按：

**Partition / Data Slice**

覆盖。

而不是依赖逐 Row `unique_key`。

例如：

```text
recompute 2026-09-10 partition
→ replace that partition
```

适合：

- 分区型 Fact；
- 日级重算；
- 某一时间范围可整体覆盖。

这也是为什么：

```text
insert_overwrite
```

和：

```text
unique_key
```

不是强绑定关系。

## microbatch

当前 dbt 的 `microbatch` Incremental Strategy 主要面向：

**大型 Time-series Dataset。**

高层：

```text
event_time range
→ split into time batches
→ execute multiple incremental queries
```

例如：

```text
Day 1
Day 2
Day 3
...
```

它可以让单次超大增量工作：

- 更易恢复；
- 更易并行；
- 更易控制单批次数据量。

但必须明确：

> **dbt microbatch ≠ Spark Structured Streaming Micro-batch。**

dbt Microbatch 是：

**一组有边界的增量 SQL Build。**

它不是：

**一个长期运行、不断消费 Source Offset 的 Streaming Runtime。**

## Late-arriving Data 为什么是 Incremental 的核心问题

假设昨天数据：

```text
event_time = Sep 10
```

今天 Sep 11 才到。

如果你的增量条件是：

```sql
where event_time > max(event_time in target)
```

那这个迟到 Row 可能永远进不来。

所以生产 Incremental 常使用：

**Lookback Window（回看窗口）**。

例如：

```sql
{% if is_incremental() %}
where updated_at >= (
    select dateadd(day, -3, max(updated_at))
    from {{ this }}
)
{% endif %}
```

这样每次重新处理最近几天。

## Lookback Window 的 Trade-off

窗口越长：

```text
late data coverage ↑
reprocessing cost ↑
```

窗口越短：

```text
build cost ↓
late update miss risk ↑
```

所以：

```text
lookback = 3 days
```

不能成为万能模板。

应该根据：

**真实迟到分布**

决定。

## 为什么 Incremental 会产生 Drift

即使每次增量逻辑都基本正确，

长期仍可能有：

- 极晚数据；
- Source Correction；
- Bug 修复；
- 逻辑改动；
- 历史数据回补；

没有进入旧 Target。

于是：

```text
target
slowly diverges
from
full recomputation result
```

这叫：

**Incremental Drift（增量漂移）**。

所以 Production Incremental 通常要有：

- Reconciliation；
- 定期 Full Refresh / Backfill 策略；
- 历史修复能力。

## Full Refresh 是什么

执行：

```text
--full-refresh
```

高层意味着：

> 不再沿用现有 Incremental State，而是重新完整构建目标。

适合：

- 修复历史 Drift；
- 业务逻辑大改；
- Strategy / Grain 变化；
- 历史数据重算。

但如果 Table 是几十 TB：

```text
Full Refresh
→ huge scan
→ huge compute
→ long SLA / cost
```

所以不能把它当：

> Incremental 出问题就全刷。

它是一个需要计划的生产操作。

## Backfill 和 Full Refresh 不完全一样

### Full Refresh

```text
rebuild entire model
```

### Backfill

可以是：

```text
only recompute missing / affected historical range
```

例如：

```text
Sep 1–Sep 5
```

数据丢失，

可能只需要重算这个范围。

因此成熟的 Incremental 设计应该允许：

**Controlled Historical Reprocessing。**

而不是只有：

```text
today incremental
or
rebuild everything
```

两个极端。

## on_schema_change 解决什么

Incremental Target 已经存在，

Source Schema 可能变化。

例如：

```text
new column added
column removed
type changed
```

`on_schema_change` 定义 dbt 遇到这类变化时如何处理。

但必须明确：

> Schema Change Handling ≠ Historical Backfill。

例如新增 Column：

```text
new future rows
→ may contain value

old target rows
→ will not automatically be backfilled
```

如果历史也需要值，

仍然需要：

- Manual Update；
- Backfill；
- Full Refresh。

## Incremental 的幂等性怎么理解

理想情况下：

> 同一批输入重复执行，不应该不断制造重复业务结果。

幂等性来自组合：

```text
correct incremental boundary
+
stable grain / unique key
+
safe write strategy
+
deterministic transformation
```

而不是：

```text
materialized='incremental'
```

自动保证。

如果使用 Append：

```text
same batch rerun
→ same rows append again
```

就可能重复。

所以：

**Incremental ≠ Automatically Idempotent。**

## 一个完整 Incremental 心智模型

以后看到一个 Incremental Model，按顺序问：

```text
1. Model Grain 是什么？
2. 什么是 New / Changed Row？
3. Late Data 怎么进来？
4. unique_key 是否匹配 Grain？
5. 当前 Strategy 怎么更新 Target？
6. Source / Target 是否存在重复？
7. Schema Change 怎么处理？
8. Backfill 怎么做？
9. Full Refresh 成本多大？
10. 如何做 Reconciliation？
```

如果这些问题回答不出来，

那只是：

> 写了一个 incremental config。

还不是成熟的增量模型。

## 下一步为什么是 Snapshot

Incremental Model 主要解决：

> 怎样高效维护当前目标结果。

但还有另一个不同问题：

> Source 自己会覆盖旧值，我怎么保留它过去的版本？

这就是 Snapshot。

## 关联知识

下一节进入 **Snapshots、Source History 与 SCD2 Implementation**。
