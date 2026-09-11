---
id: kb-metricflow-saved-queries-serving-001
type: knowledge
title: Saved Queries, Exports, Cache & Consumption
title_cn: Saved Queries、Exports、Cache 与消费接口
stage_id: '06'
domain: semantic
topic: metricflow
order: 11
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: metricflow_l5_v1
summary: Saved Query 把常用 Metric、Group By 与 Filter 固化成可复用 Semantic Query，并可作为 dbt DAG Resource 管理。Exports 可把结果写回数据平台，Semantic Layer API 可供 BI、应用和 Agent 消费；Result Cache 与 Declarative Cache 用于降低重复查询成本，但物理 Serving 架构仍属于 Stage 09。
prerequisites:
  - kb-metricflow-query-validation-001
related:
  - kb-metricflow-production-closure-001
---
# Saved Queries、Exports、Cache 与消费接口

## 30 秒理解

第 10 节我们已经能发起：

```text
Metric
+
Dimension
+
Filter
→ Semantic Query
```

但真实生产里有大量查询会重复出现。

例如：

```text
Revenue
+
Orders
+
Customer Count
by
Country / Day
where
Last 30 Days
```

如果 BI、App、Agent 每次都重新描述一次，

还是会出现：

- Query 配置重复；
- Consumer 约定分散；
- 性能策略难统一。

Saved Query（保存查询）解决：

> **把一组常用 Semantic Query 参数固化成受治理资源。**

## Saved Query 是什么

Current Saved Query 可以包含：

```text
Metrics
Group By
Where
Order By
Limit
```

例如：

```yaml
saved_queries:
  - name: executive_revenue_daily
    description: Daily revenue KPI set
    label: Executive revenue daily

    query_params:
      metrics:
        - revenue
        - orders

      group_by:
        - "TimeDimension('metric_time', 'day')"
        - "Dimension('customer__country')"

      where:
        - "{{ Dimension('order__status') }} = 'paid'"
```

它不是：

> 存了一段最终 SQL 字符串。

它存的是：

**Semantic Query Contract。**

## 为什么 Saved Query 不是普通 BI Saved View

因为它仍然引用：

```text
Metric
Dimension
Filter
```

这些 Semantic Object。

当底层 Metric Definition 合法演进时，

Saved Query 仍然走统一 Semantic Layer。

所以：

```text
Saved Query
≠ copy-pasted SQL snapshot
```

## Saved Query 本身还是 dbt Resource

Current docs 把 Saved Query 定义成：

> dbt DAG 中可见的 Node。

这意味着它可以进入：

- Documentation；
- Selection；
- Build / Deployment；
- Metadata / Lineage；

这些工程化流程。

这也是它与：

> “Dashboard 里保存了一条查询”

的差异。

## 多 Metric Saved Query 的 Common Dimension 规则

假设 Saved Query 同时包含：

```text
Revenue
Support Tickets
```

它们并不是所有 Dimension 都共同可用。

Current 规则要求：

> `group_by` / `where` 只能使用这些 Metric 共同支持的 Dimension。

也就是：

```text
Dimensions(Revenue)
∩
Dimensions(Support Tickets)
```

如果交集只有：

```text
customer__country
metric_time
```

就不能硬塞：

```text
product__category
```

进去。

这直接延续第 10 节的：

**Semantic Reachability。**

## Saved Query 解决什么，不能解决什么

它解决：

```text
Query Reuse
Query Contract
Consumer Consistency
Deployment Unit
```

它不天然解决：

```text
Low Latency
High Concurrency
Large Scan Cost
Physical Precomputation
```

这些需要继续看：

**Export / Cache / Serving。**

## Export 是什么

Export（导出）把 Saved Query：

```text
Semantic Query
```

真正写回 Data Platform。

Current 高层支持：

```text
table
view
```

例如：

```yaml
exports:
  - name: executive_revenue_table
    config:
      export_as: table
      schema: semantic_exports
      alias: executive_revenue_daily
```

于是：

```text
Saved Query
→ MetricFlow Generated SQL
→ write Table / View
```

Consumer 可以直接查询这个 Relation。

## Export 为什么有价值

有些系统不方便实时调用 Semantic Layer API。

例如：

- 外部报表；
- 下游批任务；
- 需要普通 SQL Table 的系统；
- 某些 Legacy Tool。

Export 提供：

```text
Semantic Definition
→ Physical Relation
```

的桥梁。

## Export 和 Serving Table 是不是一回事

**不完全是。**

Export 确实会产生：

```text
Table / View
```

但 Stage 06 主要关注：

> 怎样把一个受治理 Semantic Query 物化出去。

Stage 09 还要继续回答：

- SLA 是多少？
- QPS 多大？
- 数据多久更新？
- 是否需要 OLAP Engine？
- 分区 / 索引怎么设计？
- Cache 怎么失效？
- Hot Key 怎么处理？
- 多租户怎么隔离？

所以：

```text
Export
→ semantic materialization mechanism

Serving Layer
→ production serving architecture
```

两者有交集，但职责层次不同。

## Saved Query 可以被调度吗

Current dbt Platform 支持：

```text
Saved Query
+
Export
+
dbt Job Scheduler
```

定期执行。

所以不能说：

> Saved Query 只是一个静态 YAML。

它可以进入生产 Job。

但跨系统：

```text
CDC
→ Spark
→ dbt
→ Metric Export
→ Serving
→ DataHub
```

的整体编排，

在我们的架构分类里仍然由：

**Dagster / Cross-system Orchestrator**

负责。

## Cache 为什么要拆成两类

当前 dbt Semantic Layer 明确区分：

```text
Result Caching
Declarative Caching
```

两者虽然都叫 Cache，

机制完全不同。

## Result Cache

Result Cache 主要利用：

**目标 Data Platform 自己的缓存。**

原因是：

MetricFlow 对相同 Semantic Query 通常会生成稳定 SQL。

于是相同请求：

```text
Semantic Query
→ same generated SQL
→ target platform cache hit
```

可以直接利用：

- Snowflake；
- BigQuery；
- Databricks；
- 其他平台自身 Cache。

所以：

```text
Result Cache ownership
主要在 Data Platform
```

MetricFlow 只是产生稳定 SQL 让它更容易命中。

## Declarative Cache

Declarative Cache（声明式缓存）则是：

> 明确告诉 Semantic Layer 哪些 Saved Query 应该提前缓存。

高层：

```text
Saved Query
+
cache enabled
+
Export
→ pre-built cached relation
```

它更像：

**Managed Semantic Precompute。**

Current dbt Platform 可以使用 Saved Query 配置去预热常用查询。

## 为什么 Declarative Cache 需要 Export

因为系统需要实际创建一份：

```text
cached table
```

所以当前能力要求 Saved Query 有：

```text
Export Definition
```

高层：

```text
Saved Query
→ Export
→ Cached Table
→ matching semantic requests reuse cache
```

这不是浏览器内存 Cache。

## Current Declarative Cache 怎样处理新数据

当前 dbt Platform 会根据：

```text
upstream model run metadata
```

判断 Cache 是否已经过期。

如果上游 Model 有更新数据：

```text
Cache becomes stale
→ invalidate
→ queries bypass stale cache
→ next scheduled saved query rebuilds cache
```

这是当前产品实现，

不是所有 Semantic Layer 的通用理论。

因此必须标成：

**Platform-specific / Version-sensitive。**

## Cache 为什么仍然不能吞掉 Stage 09

Stage 09 要解决的 Cache 问题更广：

```text
Redis
OLAP cache
application cache
query cache
TTL
hot key
multi-tenant isolation
cache consistency
serving SLO
```

MetricFlow 这一节只负责：

> Semantic Query 这一层有哪些 Cache 机制。

所以：

```text
Semantic Cache
⊂
Serving Cache Universe
```

## Semantic Layer API 是什么

Current dbt Semantic Layer 对下游提供的主要 API 入口包括：

```text
GraphQL
JDBC
Python SDK
```

它们的共同目的：

> 让下游系统直接用受治理 Metric / Dimension，而不是自己复制 SQL 口径。

## BI 怎么消费

BI 可以通过：

- 官方 / Partner Integration；
- JDBC；
- Semantic API；

请求：

```text
revenue
by country
```

而不是每个 Dashboard 自己实现：

```text
fact join dimension
+ filter
+ aggregation
```

所以 BI Layer 从：

**Metric Definition Owner**

退回到：

**Visualization / Analysis Consumer。**

## 应用怎么消费

Application 可以通过：

```text
API / SDK
```

获得统一指标。

例如：

```text
Admin Portal
→ query monthly_active_accounts
```

业务 App 不需要内置：

```text
warehouse table names
join graph
metric formulas
```

这减少：

**Business Logic Duplication。**

## Agent 怎么消费

Agent 是特别适合 Semantic Layer 的 Consumer。

理想接口不是：

```text
Agent Tool:
execute_any_sql(sql)
```

而更像：

```text
semantic_query(
  metrics,
  group_by,
  filters,
  time_range
)
```

例如用户问：

> 过去 30 天各区域转化率？

Agent 可以构造：

```text
metric = purchase_conversion_rate
group_by = customer__region
time_range = last_30_days
```

MetricFlow 再处理：

- Metric Formula；
- Entity Join；
- Conversion Matching；
- Time Semantics；
- SQL Generation。

这就是：

**Governed Agent Query Surface。**

## 为什么这比 Text-to-SQL 更可控

Text-to-SQL：

```text
LLM
→ choose tables
→ choose join
→ choose formula
→ write SQL
```

Agent 自由度很大。

Semantic Query：

```text
LLM
→ choose governed metric / dimension
→ MetricFlow resolves semantics
```

因此：

```text
Hallucinated Join ↓
Metric Drift ↓
Business Definition Drift ↓
```

但它仍然不是：

> 100% 自动正确。

Agent 仍然可能选错 Metric，

所以 Stage 10 还需要：

- Intent；
- Clarification；
- Tool Guardrail；
- Evaluation。

## API 权限为什么不能忽略

统一 Semantic Layer 不意味着：

> 所有人能查所有 Metric / Dimension。

Current dbt Semantic Layer 提供 Access Control 相关能力。

生产架构仍然要考虑：

```text
Who is calling?
Which metric?
Which dimension?
Which data scope?
```

尤其 Agent 场景，

Tool Token 不应该默认拥有：

**全仓库超级权限。**

## Saved Query / Export / Cache 三者怎么串

最简单记法：

```text
Saved Query
→ 保存“查什么”

Export
→ 把结果写成 Relation

Cache
→ 让重复 Semantic Query 更快
```

它们不是同义词。

## 在线 Query 与 Export 怎么选

### Dynamic Semantic Query

适合：

- Ad-hoc BI；
- Flexible Slice；
- Agent Question；
- 维度组合变化大。

优点：

```text
flexible
always uses current semantics
```

代价：

```text
runtime query cost
latency
```

### Export

适合：

- 固定 Query Pattern；
- 外部 Consumer；
- 需要 Table / View；
- 周期性离线消费。

优点：

```text
simple downstream access
can precompute
```

代价：

```text
freshness lag
storage
schedule management
```

## Cache 怎么选

先问：

```text
Query 是否重复？
Generated SQL 是否稳定？
Target Platform Result Cache 是否够用？
是否值得预热 Saved Query？
Data Freshness 要求多高？
```

不要默认：

> 有 Semantic Layer 就应该开 Declarative Cache。

缓存是：

**Cost / Freshness / Latency Trade-off。**

## 这一节最终把消费链闭上

现在完整链路变成：

```text
dbt Model
→ Semantic Model
→ Entity / Dimension
→ Metric
→ Semantic Graph
→ Query Generation
→ Validation
→ Saved Query
→ API / BI / App / Agent

optional:
→ Export
→ Cache
```

但还剩最后一个生产问题：

> 指标上线以后结果不一致、查询变慢、定义变化、Cache 失效、消费者受影响，到底怎么系统排查？

下一节进入最终：

**Production Quality / Reconciliation / Semantic Operations。**
