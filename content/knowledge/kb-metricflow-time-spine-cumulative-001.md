---
id: kb-metricflow-time-spine-cumulative-001
type: knowledge
title: Time Spine, Metric Time & Cumulative Metrics
title_cn: Time Spine、Metric Time 与 Cumulative Metrics
stage_id: '06'
domain: semantic
topic: metricflow
order: 8
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: metricflow_l5_v1
summary: Time Dimension 描述业务事件时间，Time Spine 则提供连续时间骨架。MetricFlow 用 Time Spine 支撑 Cumulative、Offset、Conversion、SCD 等时间语义。Cumulative Metric 可以表达 Sliding Window、Period-to-date 或全历史累计。
prerequisites:
  - kb-metricflow-dimensions-time-001
  - kb-metricflow-ratio-derived-001
related:
  - kb-metricflow-conversion-metrics-001
---
# Time Spine、Metric Time 与 Cumulative Metrics

## 30 秒理解

先把两个非常容易混的概念彻底分开。

### Time Dimension

来自真实业务数据：

```text
order.ordered_at
payment.paid_at
```

回答：

> 事件什么时候发生？

### Time Spine

是一张连续时间骨架：

```text
Sep 1
Sep 2
Sep 3
Sep 4
...
```

回答：

> 即使某天没有业务 Row，时间轴本身是否仍然存在？

所以：

```text
Event Data
可能稀疏

Time Spine
必须连续
```

## 为什么语义层需要连续时间骨架

假设实际订单：

```text
Sep 1 = 10
Sep 2 = no rows
Sep 3 = 20
```

如果直接 Query Fact：

```text
Sep 1
Sep 3
```

Sep 2 根本不会出现。

但业务可能要求：

```text
Sep 1 = 10
Sep 2 = 0
Sep 3 = 20
```

或者计算：

```text
7-day rolling revenue
```

如果日期缺失，

时间窗口就很难稳定定义。

所以 MetricFlow 需要：

**Time Spine。**

## 当前 Time Spine 是什么

当前规范里，

Time Spine 本身是：

> **一个正常 dbt Model + Time Spine Metadata。**

高层结构：

```yaml
models:
  - name: time_spine_daily

    time_spine:
      standard_granularity_column: date_day

    columns:
      - name: date_day
        granularity: day
```

这里：

```text
date_day
```

是连续时间 Key。

MetricFlow 可以用它和业务 Metric Time 对齐。

## 为什么至少需要 Daily Time Spine

当前文档要求：

> 至少定义一个 Daily Grain 的 Time Spine。

如果业务还有：

```text
hour-level metric
```

就需要有足够细的 Time Spine 支持。

基本原则：

```text
Time Spine 最细粒度
≤
你要查询的最细时间粒度
```

否则无法从：

```text
day
```

恢复真正：

```text
hour
```

级连续时间。

## 可以有多个 Time Spine 吗

可以。

例如：

```text
hourly
daily
monthly
```

当前规范允许不同 Granularity 的 Time Spine，

但它们不能形成冲突的重叠定义。

系统可以根据 Query 选择兼容的时间骨架。

这个具体选择策略属于当前实现，

不要当成永恒理论。

## Time Spine 当前被哪些语义使用

当前文档明确把 Time Spine 用于：

```text
Cumulative Metrics
Metric Offsets
Conversion Metrics
Slowly Changing Dimensions
join_to_timespine Metrics
```

所以第 7 节的：

```text
offset_window
```

不是一个孤立参数。

它背后需要：

**连续时间对齐能力。**

## Cumulative Metric 是什么

Cumulative Metric（累计指标）回答：

> 一个基础 Metric 在某段时间范围内怎样累计？

例如：

```text
Running Revenue
7-day Active Users
Month-to-date Revenue
Year-to-date Orders
```

Current YAML 高层：

```yaml
metrics:
  - name: revenue_l7d
    type: cumulative
    input_metric: revenue
    window: 7 days
```

## Cumulative 不是新的基础聚合

Cumulative 的 Input 是：

**已有 Metric。**

例如：

```text
Simple Revenue
→ Cumulative Revenue 7d
```

所以因果链是：

```text
Raw Data
→ Simple Metric
→ Time Spine Alignment
→ Cumulative Metric
```

不是直接：

```text
Raw Column
→ cumulative
```

## `window` 是什么

`window` 表达：

**Sliding Window（滑动窗口）**。

例如：

```text
7 days
```

假设查询 Sep 10：

```text
Sep 4 ～ Sep 10
```

一起进入当前值。

下一天 Sep 11：

```text
Sep 5 ～ Sep 11
```

窗口向前滑动。

所以：

```text
7-day Rolling Revenue
```

和：

```text
Revenue This Week
```

不是一回事。

## 不写 `window` 会怎样

Current Cumulative 语义：

```text
no window
→ accumulate over all available time
```

也就是：

**Running Total（累计总值）**。

例如：

```text
Sep 1 = 10
Sep 2 = 5
Sep 3 = 8
```

Running Revenue：

```text
Sep 1 = 10
Sep 2 = 15
Sep 3 = 23
```

## `grain_to_date` 是什么

`grain_to_date` 表达：

**Period-to-date（周期内累计）**。

例如：

```yaml
grain_to_date: month
```

就是：

**Month-to-date（MTD）**。

每个月开始：

```text
累计重新从 0 开始
```

所以：

```text
Running Total
≠
Month-to-date
```

## `window` 和 `grain_to_date` 为什么不能一起用

两者表达两个不同时间边界：

### Window

```text
rolling last N duration
```

### Grain-to-date

```text
from current calendar period start
to current point
```

例如 Sep 18：

```text
30-day window
→ Aug 20 ~ Sep 18

month-to-date
→ Sep 1 ~ Sep 18
```

含义完全不同。

Current Cumulative 配置因此把它们视为：

**互斥时间语义。**

## `period_agg` 为什么会出现

假设基础 Cumulative 最细按：

```text
day
```

定义。

但 Query 要：

```text
month
```

不能简单把一个月每天的：

```text
running total
```

全部再 Sum。

否则会重复累计。

所以 Current Cumulative 允许定义：

```text
period_agg
```

用于在非默认 Granularity 下重新聚合。

当前可见选择包括：

```text
first
last
average
```

这说明：

> Cumulative Metric 的跨 Grain 聚合需要明确语义。

不能自动把每日值再 Sum。

## 缺失日期为什么会影响 Rolling Window

假设：

```text
Sep 1 = 10
Sep 4 = 20
```

没有 Time Spine 时：

```text
previous 3 rows
```

根本不等于：

```text
previous 3 days
```

所以真正的时间 Window 需要：

```text
连续 Time Axis
```

这也是 Time Spine 的核心价值。

## Time Spine 和 `fill_nulls_with` 怎样配合

Time Spine：

```text
把缺失日期补出来
```

`fill_nulls_with: 0`：

```text
把补出来的空 Metric 变成 0
```

两者组合才能得到：

```text
Sep 1  10
Sep 2   0
Sep 3   0
Sep 4  20
```

但再次强调：

```text
NULL
→ 0
```

必须符合业务含义。

## Time Spine 不是 Date Dimension 理论重讲

Stage 03 已经负责：

- Date Dimension；
- Calendar；
- Fiscal Attributes。

Stage 06 只回答：

> MetricFlow 为什么需要一个连续时间模型参与语义查询？

如果公司已有：

```text
calendar dimension
```

它可以被配置成 Time Spine，

不需要为了 MetricFlow 再重复制造一张“神秘日期表”。

## Time Spine 也不是 Serving Cache

Time Spine 是：

**Semantic Query Support Data。**

它不是：

- Cache；
- Serving Table；
- Pre-aggregation Store。

即使 MetricFlow 有完整 Time Spine，

一个巨大的 Rolling Query 仍可能：

```text
Generated SQL 很重
→ Warehouse Compute 很高
```

性能问题仍需后面的 Serving / Engine 层处理。

## 一套时间型指标判断顺序

定义时间指标时问：

```text
1. Metric Time 是哪个业务时间？
2. 最细 Query Granularity 是什么？
3. Time Spine 是否覆盖该 Granularity？
4. 缺失日期应该 NULL 还是 0？
5. 我要 Rolling Window 还是 Period-to-date？
6. Cumulative 跨更粗 Grain 后怎样 Re-aggregate？
7. Offset 与 Time Zone 是否符合业务口径？
```

## 下一步

到这里已经具备：

```text
Entity
+
Metric Time
+
Time Spine
+
Window
```

这正是 Conversion 最需要的基础。

下一节进入：

**Conversion Metric 与 Entity-Time Matching。**
