---
id: iq-sql-window-lead-lag-001
type: interview
question: "LEAD / LAG 适合解决哪些时序分析问题？如何写出正确的窗口 SQL？"
domain: sql
learning_depth: L4
answer_format_version: "1.0"

evidence:
  direct_independent_count: 2
  direct_company_count: 2

frequency:
  status: supported_verified
  final_industry_frequency: false

verification:
  question_intent_reviewed: true
  dedup_reviewed: true
  answer_curated: true
  content_review_status: v0_3_7
  publishable: false

project_connection:
  status: no_verified_project_anchor_yet

technical_references:
  - https://www.postgresql.org/docs/current/functions-window.html

status: answer_ready
---

# LEAD / LAG 怎么用？

## 这道题在考什么

不是考函数签名，而是考你是否理解：

```text
Partition
+
Order
+
Current Row
+
Previous / Next Row
```

以及能不能把业务问题转换成“同一实体内按时间排序后的相邻记录关系”。

## 30 秒回答

`LAG` 用来取当前行之前第 N 行的值，`LEAD` 取之后第 N 行的值，通常配合 `PARTITION BY` 划分业务实体，再用 `ORDER BY` 定义时间或序列。

它适合处理环比、前后状态变化、连续登录、会话间隔、事件耗时和生命周期分析。最重要的是保证排序键稳定；如果时间戳可能相同，需要增加业务序号或主键作为 Tie-breaker（并列排序补充键），否则相邻行结果可能不确定。

## 核心原理

例如用户事件：

```text
user_id | event_time | status
1       | 10:00      | created
1       | 10:05      | paid
1       | 10:20      | shipped
```

查询：

```sql
select
    user_id,
    event_time,
    status,
    lag(status) over (
        partition by user_id
        order by event_time
    ) as prev_status,
    lead(status) over (
        partition by user_id
        order by event_time
    ) as next_status
from events;
```

`PARTITION BY user_id` 保证不同用户不会串在一起；`ORDER BY event_time` 定义“前”和“后”。

PostgreSQL 当前文档定义：`lag(value, offset, default)` 取当前行之前 offset 行，`lead` 则取之后 offset 行；默认 offset 为 1，越界时默认返回 NULL。

## 常见场景

### 计算事件间隔

```sql
with x as (
    select
        user_id,
        event_time,
        lag(event_time) over (
            partition by user_id
            order by event_time, event_id
        ) as prev_time
    from events
)
select
    *,
    event_time - prev_time as gap
from x;
```

### 找状态变化

```sql
with x as (
    select
        order_id,
        status,
        event_time,
        lag(status) over (
            partition by order_id
            order by event_time, event_id
        ) as prev_status
    from order_events
)
select *
from x
where prev_status is distinct from status;
```

### 连续行为

连续登录、连续活跃往往需要：

```text
LAG(date)
↓
判断 date - previous_date
↓
构造 group
↓
再聚合
```

`LAG` 通常只是第一步，不等于整道连续区间题。

## Production 实现

大表 Window Function（窗口函数）的主要成本通常来自：

```text
Partition / Shuffle
+
Sort
```

所以生产中关注：

- `PARTITION BY` 基数；
- 单个超大 Partition；
- 排序字段；
- 数据是否提前裁剪；
- 是否可以先过滤；
- 是否存在数据倾斜。

如果所有数据都：

```sql
partition by tenant_id
```

但一个 tenant 占 70% 数据，窗口计算同样会形成长尾。

## 故障排查

窗口 SQL 结果错误时优先看：

```text
Partition Key 对吗？
↓
Order Key 对吗？
↓
时间戳是否重复？
↓
是否需要 event_id Tie-breaker？
↓
NULL / 首尾记录怎么处理？
↓
业务要求的是上一行还是上一有效事件？
```

## 常见错误回答

- 忘记 `PARTITION BY`，导致不同用户串行比较。
- 只按时间排序，但同一毫秒有多条事件。
- 把 `LAG` 当成所有“连续问题”的完整答案。
- 大表直接全量 Window，不先过滤和裁剪。

## 项目怎么结合

目前没有必要强行挂真实项目。SQL 基础题可以作为跨项目公共能力。

## Scale Lab

假设：

```text
100 亿事件
2 亿用户
```

直接全量窗口排序成本很高。

可以先考虑：

- 日期范围裁剪；
- 按业务分区读取；
- 增量状态；
- 预聚合；
- 对超大 Key 单独处理。

## 真实关联追问

1. `ROW_NUMBER`、`RANK`、`DENSE_RANK` 区别？
2. `LAG` 越界默认返回什么？
3. 连续登录 N 天怎么写？
4. Window Function 为什么可能很慢？
5. 时间戳相同时如何保证结果稳定？
6. 窗口计算和 `GROUP BY` 最大区别是什么？
