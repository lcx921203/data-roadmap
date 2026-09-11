---
id: kb-metricflow-query-validation-001
type: knowledge
title: Metric Query Generation, Commands & Validation
title_cn: Metric Query Generation、Commands 与 Validation
stage_id: '06'
domain: semantic
topic: metricflow
order: 10
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: metricflow_l5_v1
summary: MetricFlow 查询从 Metric、Group By、Filter 和时间条件出发，沿 Semantic Graph 验证可达维度与 Join Path，再生成 SQL 交给目标数据平台执行。Parsing、Semantic 和 Data Platform Validation 分别负责 Schema、语义图约束与物理表/SQL 可执行性。
prerequisites:
  - kb-metricflow-ratio-derived-001
  - kb-metricflow-conversion-metrics-001
related:
  - kb-metricflow-saved-queries-serving-001
---
# Metric Query Generation、Commands 与 Validation

## 30 秒理解

前九节解决的是：

> **指标怎么定义？**

这一节开始解决：

> **真正有人查询这个指标时，MetricFlow 做了什么？**

主链可以压成：

```text
Metric Request
+
Group By
+
Filter
+
Time Range
↓
Semantic Graph Resolution
↓
Valid Dimensions / Join Path
↓
Metric Dataflow Plan
↓
Generated SQL
↓
Target Data Platform
↓
Result
```

所以 MetricFlow Query 不是：

> “把指标名替换成一段 SQL”。

它需要先完成一轮：

**Semantic Planning（语义规划）**。

## 一个最小 Query

假设已经定义：

```text
Metric
→ revenue

Dimension
→ customer__country
```

查询意图：

```text
Revenue by Customer Country
```

当前命令高层可以写成：

```bash
dbt sl query \
  --metrics revenue \
  --group-by customer__country
```

在本地 self-hosted MetricFlow 场景，命令入口通常是：

```bash
mf query \
  --metrics revenue \
  --group-by customer__country
```

两条命令表达的是同一个语义请求。

关键不是背前缀，

而是理解：

```text
dbt Platform
→ dbt sl

local self-hosted
→ mf
```

具体命令与可用 Flag 仍然是版本敏感的。

## Query 里到底有什么

一个 Metric Query 最核心是四类输入：

```text
Metrics
Group By
Filters
Time
```

例如：

```text
Metric
→ revenue

Group By
→ customer__country
→ metric_time

Filter
→ order__status = paid

Time
→ last 30 days
```

MetricFlow 要把这些语义对象解析成：

> 一条合法、不会破坏指标粒度和 Join 语义的 SQL。

## 第一步：找到 Metric Definition

Query：

```text
revenue
```

MetricFlow 先定位：

```text
revenue
→ type: simple
→ expr: order_total
→ agg: sum
→ source semantic model: orders
→ agg_time_dimension: ordered_at
```

如果是高级 Metric：

```text
profit_margin
```

可能继续解析：

```text
profit_margin
→ ratio / derived
→ revenue
→ cost
```

所以 Query Planning 的第一层是：

**Metric Dependency Resolution（指标依赖解析）**。

## 第二步：检查 Group By 是否可达

用户请求：

```text
revenue
by
customer__country
```

MetricFlow 要确认：

```text
orders
→ customer entity
→ customer semantic model
→ country dimension
```

路径必须：

- 存在；
- Entity Type 合法；
- 不产生被禁止的 Fan-out；
- 不存在无法消解的 Ambiguous Path。

所以：

```text
Dimension exists
```

不等于：

```text
Dimension is valid for this Metric
```

真正需要的是：

**Semantic Reachability（语义可达性）。**

## 多个 Metric 为什么只能用共同 Dimension

假设：

```text
revenue
```

能按：

```text
customer__country
product__category
```

查询。

而：

```text
support_tickets
```

只能按：

```text
customer__country
```

查询。

如果同时请求：

```text
revenue
support_tickets
```

那么可安全 Group By 的交集可能只有：

```text
customer__country
```

所以当前 `list dimensions` 对多个 Metric 本质上在回答：

> **这些 Metric 共同可达的 Dimension 是什么？**

这对 Saved Query 也非常重要。

## 第三步：解析 Filter

Filter 不是随便拼接字符串。

例如：

```text
country = 'US'
```

真正需要绑定到：

```text
customer__country
```

这个 Semantic Dimension。

Current Query 可以表达类似：

```bash
--where "{{ Dimension('customer__country') }} = 'US'"
```

时间则可能通过：

```text
TimeDimension(...)
```

表达。

高层原则：

```text
Filter
→ references governed semantic field
```

而不是：

```text
consumer invents arbitrary physical column
```

## 为什么这对 Agent 特别重要

如果 Agent 直接生成：

```sql
where country = 'US'
```

它可能不知道：

- 哪个 country；
- 哪个 Model；
- 是否需要 Join；
- 是否是受治理 Dimension。

通过 Semantic Query Tool，Agent 可以先表达：

```text
Metric = revenue
Dimension = customer__country
Filter = US
```

再由 Semantic Layer 负责 SQL。

这把：

```text
LLM free-form SQL guessing
```

缩小成：

```text
governed semantic request
```

但 Planner / Router / Tool Invocation 仍属于 Stage 10。

## `list metrics` 是干什么的

Current MetricFlow 提供：

```text
list metrics
```

它不是简单打印名称。

真正用途是：

> 查询当前 Semantic Layer 能提供哪些 Metric，以及它们可以和哪些 Dimension 一起使用。

可以把它看成：

**Semantic Capability Discovery（语义能力发现）。**

这对：

- Developer；
- BI Integration；
- Agent Tool Schema；

都很重要。

## `list dimensions` 是干什么的

核心问题：

> 给定一个或多个 Metric，我到底能按什么 Group By？

例如：

```text
revenue
→ country
→ product category
→ metric_time

support_tickets
→ country
→ metric_time
```

两者一起：

```text
common dimensions
→ country
→ metric_time
```

这比让 Consumer 猜 Join Path 安全得多。

## `list dimension-values` 是干什么的

例如 Dimension：

```text
customer__country
```

Consumer 可能需要知道：

```text
US
CA
UK
...
```

Current MetricFlow 可以查询 Dimension Values。

这对：

- Dashboard Filter Dropdown；
- UI Selector；
- Agent Clarification；

都很实用。

但它会真正查询数据，

所以：

> 不是纯 Metadata 操作。

## `query` 与 `compile / explain` 的区别

### Query

真正：

```text
Generate SQL
→ Execute
→ Return Result
```

### Compile / Explain

重点是：

```text
Generate / inspect SQL or plan
```

而不把“最终业务结果”作为唯一观察面。

当前不同环境里名字存在差异：

```text
dbt Platform / newer path
→ --compile

some local v1 workflows
→ --explain
```

不要死记一套永久 Flag。

真正需要掌握的是：

> **先看 MetricFlow 最后准备执行什么 SQL。**

## Generated SQL 为什么是第一排障面

假设：

```text
Revenue by Country
```

结果翻倍。

你需要区分：

```text
Metric Definition 错？
Entity / Join Path 错？
Generated SQL 错？
Target Engine 执行错？
Source Data 本身重复？
```

Generated SQL 是中间最重要的一层。

如果 SQL 已经：

```text
wrong join
wrong group by
wrong time filter
```

就不要先去查 Warehouse CPU。

反过来：

如果 SQL 语义完全正确，

但执行 10 分钟，

才继续到：

**Target Engine Runtime。**

## Metric Dataflow Plan 是什么

MetricFlow 在真正 SQL 之前有自己的：

**Semantic / Dataflow Plan。**

它高层回答：

```text
哪些 Semantic Model？
哪些 Metric Input？
哪些 Join？
在哪个 Grain 聚合？
怎样组合多个 Metric？
```

Current 命令可以在某些环境中展示 Dataflow Plan。

它比直接看最终 SQL 更适合回答：

> MetricFlow 为什么选了这条语义路径？

## Validation 为什么要分三层

Current Semantic Layer 的稳定心智模型：

```text
Parsing
↓
Semantic
↓
Data Platform
```

三层解决完全不同的问题。

## Parsing Validation

回答：

> 配置文件能不能被系统正确解析？

例如：

- YAML / Schema 结构；
- Semantic Model 定义；
- Entity / Dimension / Metric 字段；
- 对象配置是否符合当前 Spec。

这层失败时：

```text
Semantic Graph
甚至还没有完整建立
```

所以不用查 Warehouse。

## Semantic Validation

Parsing 通过以后，

系统开始检查：

> Semantic Graph 本身有没有逻辑矛盾？

Current 规则会检查类似：

- Semantic Model 中 Metric 是否拥有有效时间语义；
- Primary Identifier 是否冲突；
- Dimension 是否一致；
- Simple Metric 名称与配置是否合法；
- Cumulative Metric 是否配置合理；
- 引用的 Semantic Object 是否存在。

它解决的是：

**Graph / Definition Correctness。**

## Data Platform Validation

最后一层回答：

> Semantic Definition 在真实物理数据平台上能不能成立？

例如：

```text
Column 真的存在吗？
Table 真的存在吗？
Generated SQL 能执行吗？
```

这一步会触碰实际 Data Platform。

所以：

```text
Semantic YAML 看起来合法
```

不代表：

```text
底层 Relation 一定存在
```

## Validation 三层关系

可以压成：

```text
Parsing
→ 我写得符合配置 Schema 吗？

Semantic
→ 这些语义对象彼此逻辑正确吗？

Data Platform
→ 映射到真实表以后能执行吗？
```

只有三层都合理，

才有资格继续讨论：

**Metric Result 是否业务正确。**

## Validation 不是业务 Reconciliation

即使：

```text
Parsing PASS
Semantic PASS
Data Platform PASS
```

仍然可能：

```text
Revenue = 1.2B
```

但财务正确值是：

```text
1.1B
```

因为 Validation 主要证明：

- 配置合法；
- Graph 合法；
- SQL 可执行。

它不自动证明：

> Business Metric 与可信业务基准一致。

Reconciliation 留到第 12 节。

## `dbt sl validate` 与 `mf validate-configs`

Current 环境大体分两条：

```text
dbt Platform
→ dbt sl validate

local self-hosted MetricFlow
→ mf validate-configs
```

但：

- 自动跑哪些 Validation；
- 是否包含 Data Platform Validation；
- 哪些 Flag 可用；

会随：

```text
dbt v1 / v2
Platform / Local
```

变化。

所以学习重点必须是：

**三层责任模型**

而不是：

> 背一个 CLI 命令。

## 为什么 Semantic CI 值得单独做

假设一个 PR 只改了：

```text
customer entity
```

dbt Model SQL 自己可能：

```text
build success
```

但 Semantic Graph 可能：

```text
Join Path invalid
```

所以成熟 CI 不只需要：

```text
dbt build
```

还需要：

```text
semantic validation
```

保护：

> Transformation Change 不会破坏 Metric Contract。

## `dbt parse` 为什么会出现

Semantic Definition 改完以后，

当前 dbt 文档明确要求至少通过：

```text
dbt parse
```

更新 Semantic Metadata Artifact。

高层：

```text
Semantic YAML changes
→ parse
→ updated semantic manifest
→ queries see new definition
```

不需要为了每次纯语义定义变化都全量重建所有物理 Model。

这和 Stage 05 学过的：

```text
Parse
≠ Execute
```

形成自然衔接。

## 一套 Metric Query 排障顺序

以后看到：

> Metric 查不到 / Dimension 不可用 / SQL 异常 / 结果不对

先按：

```text
1. Metric 是否存在？
2. Metric Definition 是否正确？
3. Requested Dimension 是否共同可达？
4. Entity / Join Path 是否合法？
5. Filter 是否引用正确 Semantic Field？
6. Metric Time 是否正确？
7. Parsing Validation 是否通过？
8. Semantic Validation 是否通过？
9. Data Platform Validation 是否通过？
10. Generated SQL / Dataflow Plan 是什么？
11. Target Engine 是否只是执行慢？
12. 最终 Result 是否和业务基准一致？
```

不要跳过前 9 步直接去调 Warehouse。

## 下一步

到这里 MetricFlow 已经可以：

```text
Define
→ Validate
→ Query
```

下一个问题是：

> 常用 Query 要不要每次都重新描述？BI / App / Agent 怎么稳定消费？性能不够时又怎么处理？

这就是：

**Saved Query / Export / Cache / Consumption。**
