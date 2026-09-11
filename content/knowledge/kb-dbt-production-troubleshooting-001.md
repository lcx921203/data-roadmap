---
id: kb-dbt-production-troubleshooting-001
type: knowledge
title: Production Troubleshooting, Cost & Orchestration Boundary
title_cn: 生产排障、成本与 Orchestration Boundary
stage_id: '05'
domain: modeling
topic: dbt
order: 12
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: dbt_l5_v1
summary: dbt 生产排障应该先定位 Parse、Compile、Database Execute、Materialization、Incremental State、Quality 或 Environment 哪一层失败，再处理重跑、Full Refresh、并发、Warehouse Cost 和调度边界。dbt Core 管 Transformation Build，跨系统编排仍由 Orchestrator 负责。
prerequisites:
  - kb-dbt-state-defer-ci-001
related:
  - kb-dbt-overview-001
  - kb-dbt-incremental-models-001
  - kb-dbt-tests-freshness-reconciliation-001
---
# 生产排障、成本与 Orchestration Boundary

## 30 秒理解

dbt 线上问题最容易出现一个错误动作：

> “dbt Job 失败了，重新跑一次看看。”

成熟排障第一步不是重跑，

而是先判断：

**失败发生在哪一层？**

主链：

```text
Project Parse
→ Compile
→ Adapter / Connection
→ Database Execute
→ Materialization
→ Incremental State
→ Tests / Freshness
→ Artifacts / CI
→ Scheduling / Environment
```

只要先定位层级，

很多问题会立即缩小。

## 第一层：Parse Failure

Parse 阶段主要理解：

```text
Project Resources
Configs
Dependencies
YAML
Macros
```

典型问题：

- YAML 格式错；
- Resource 重名；
- Config 无效；
- `ref()` 指向不存在 Node；
- Package / Macro 解析问题；
- Project Config 错误。

这类问题通常：

> SQL 根本还没有真正交给数据库执行。

所以不要去查：

- Warehouse CPU；
- Query Plan；
- Table Scan。

根本还没到那一层。

## 第二层：Compile Failure

Compile 阶段的问题是：

```text
dbt source code
→ failed to generate valid executable SQL
```

典型：

- Jinja Syntax；
- Macro 参数；
- Undefined Variable；
- Adapter Dispatch；
- Generated SQL 不完整；
- Conditional Branch 生成错误。

最重要的排查面：

```text
Source Model
vs
Compiled SQL
```

如果数据库报：

```text
syntax error near ...
```

先看最终 Compiled SQL，

而不是只盯着原始 `.sql` 文件。

## 第三层：Connection / Permission

dbt 可能已经：

```text
parse OK
compile OK
```

但连接数据库失败。

典型：

- Credential；
- Network；
- Warehouse / Cluster 不可用；
- Database / Schema Permission；
- Create Table / View 权限不足；
- Source Read Permission 不足。

这时应该问：

```text
Can dbt connect?
Can target user read sources?
Can target user create / replace objects?
```

而不是修改 Model SQL。

## 第四层：Database Execute

这是最常见的“dbt Model 很慢”真正来源。

最终：

```text
Compiled SQL
→ Target Data Platform
```

数据库自己决定：

- Scan；
- Join；
- Shuffle；
- Sort；
- Memory；
- Spill；
- Transaction；
- File Read。

所以 Model 慢时：

```text
dbt layer
→ which SQL did we submit?

engine layer
→ why is this SQL physically expensive?
```

必须分开。

例如：

```text
dbt generated correct SQL
but Trino join spills / Spark job skews
```

这就是底层 Engine 问题。

## 第五层：Materialization Failure

同一 SELECT：

```text
can execute successfully
```

不代表整个 Materialization 一定成功。

因为 Materialization 还可能做：

- Create；
- Replace；
- Rename；
- Merge；
- Delete + Insert；
- Drop；
- DDL；
- Metadata Operation。

所以要区分：

```text
SELECT logic failed?
or
materialization lifecycle failed?
```

例如：

```text
SELECT works manually
but incremental merge fails
```

重点就不再是 Query Logic 本身。

## 第六层：Incremental State Drift

最危险的一类问题：

> Job 每天都 Success，但数据越来越错。

原因可能：

- Incremental Filter 漏 Late Data；
- `unique_key` 与 Grain 不一致；
- Source Replay；
- Update 没被捕捉；
- Schema Change；
- Historical Bug；
- Backfill 缺失。

这类问题不会一定产生：

```text
red job
```

而可能表现成：

```text
green pipeline
+
wrong data
```

所以生产 Incremental 必须有：

**Reconciliation。**

## 什么时候 Full Refresh

不要把 Full Refresh 当：

> dbt Incremental 的 Reset Button。

先问：

```text
Problem scope?
Historical impact?
Table size?
Rebuild time?
Warehouse cost?
Downstream SLA?
```

如果只是：

```text
Sep 1–Sep 3
```

三天数据漏了，

优先考虑：

**Targeted Backfill。**

如果是：

```text
Grain changed
Unique Key changed
core business logic changed historically
```

才更可能需要：

**Full Refresh。**

## Full Refresh 的风险

对大表：

```text
full refresh
→ full source scan
→ full transform
→ full target rewrite
```

可能造成：

- Warehouse Cost Spike；
- 长 SLA；
- Locks / DDL Risk；
- Downstream Delay；
- Storage / File Explosion；
- 资源竞争。

所以应该：

> 把 Full Refresh 当生产变更操作，而不是普通 Retry。

## Test Failure 怎么排

Test 红了先分：

```text
test logic wrong?
or
data actually wrong?
```

例如：

```text
unique test failed
```

继续问：

```text
Model Grain 正确吗？
Source 本来就重复吗？
Incremental rerun 产生重复吗？
unique_key 写错吗？
Join 放大了吗？
```

不要只做：

```text
severity: warn
```

让 CI 变绿。

那只是掩盖问题。

## Freshness Failure 怎么排

Freshness Error 的第一问题不是 dbt Model。

而是：

> 上游最新数据有没有到？

链路可能是：

```text
Source System
→ CDC / Ingestion
→ Raw Table
→ Source Freshness
→ dbt Models
```

如果 Raw Source 已经晚了，

继续跑下游 Model：

```text
dbt build
```

只会生成：

> “准时计算的旧数据”。

所以 Freshness Incident 应先处理：

**Upstream Arrival。**

## dbt Cost 到底来自哪里

dbt 自己主要是 Framework。

真正大头通常来自：

**Target Data Platform Compute。**

典型成本放大器：

- Full Table Rebuild；
- Stacked Heavy Views；
- 大范围 Incremental Lookback；
- Inefficient Merge；
- Too Many CI Builds；
- High Concurrency；
- Over-testing Huge Tables；
- Full Refresh；
- Duplicate Backfill。

因此优化 dbt Cost 的本质是：

```text
which nodes?
how often?
how much data?
what materialization?
what warehouse / engine resources?
```

## `threads` 应该怎么看

dbt 可以并发执行 DAG 中：

> 当前已经满足依赖、可以同时运行的 Node。

`threads` 高层控制：

**dbt 同时可发起多少并行工作。**

但：

```text
threads = 32
```

不等于：

> Warehouse 一定跑得更快。

如果目标平台已经：

- Concurrency Saturated；
- Queueing；
- Memory Pressure；
- I/O Saturated；

继续增加 dbt 并发只会：

```text
more queries at once
→ more contention
→ higher cost / longer tail
```

所以 `threads` 应该按：

**Target Platform Concurrency Capacity**

校准。

## DAG 为什么限制并发

假设：

```text
A → B → C
```

即使：

```text
threads = 100
```

也不能：

```text
A / B / C all run together
```

因为 B 依赖 A，C 依赖 B。

真正能并行的是：

```text
ready nodes in DAG frontier
```

所以：

```text
configured concurrency
≠ actual parallelism
```

这一点和 Spark Task 并行度的思路类似：

> 上限参数不等于实际可执行并发。

## 怎么做 dbt Runtime Observability

可以分三层。

### 第一层：当前 Invocation

看：

- Console / Structured Logs；
- Compiled SQL；
- Node Status；
- Error；
- Timing；
- Adapter Response。

回答：

> 这次哪个 Node 在哪一层失败？

### 第二层：Artifacts

看：

```text
manifest
run_results
sources
```

回答：

- 哪些 Node 执行？
- 每个多久？
- 哪些 Failed？
- Source 是否 Fresh？
- Project Graph 是什么？

### 第三层：Warehouse / Engine

看：

- Query History；
- Execution Plan；
- Scan Bytes；
- Compute Time；
- Queue；
- Spill；
- Resource Utilization。

回答：

> 为什么数据库执行这个 Model 很贵？

只有三层合起来，

才叫真正的 dbt Production Observability。

## 重跑到底应该重跑什么

不要默认：

```text
rerun entire project
```

应该先确定 Failure Domain。

例如：

### 单 Model Database Error

```text
fix issue
→ rerun model + impacted downstream
```

### Failed Test

可能：

```text
fix data/model
→ rerun relevant model/test
```

### Upstream Freshness

先：

```text
restore source
→ then rebuild affected downstream
```

### Incremental Historical Bug

可能：

```text
targeted backfill
```

而不是：

```text
full project rebuild
```

这就是 DAG + Selection 的生产价值。

## Idempotent Rerun 为什么重要

成熟 Pipeline 要尽量做到：

> 同样输入重复运行，不不断制造新的错误结果。

例如：

```text
table materialization
→ replace
```

天然比较容易重复执行。

Incremental：

```text
append
```

如果相同 Input 重跑，

可能重复写。

所以 Rerun Safety 取决于：

```text
materialization
+
grain
+
unique key
+
write strategy
+
source replay semantics
```

不是：

> dbt command 本身自动保证。

## dbt Core 和 Scheduler 的边界

以前常见一句话：

> dbt 不负责调度。

现在已经不够准确。

当前应该拆成：

### dbt Core

核心职责：

```text
parse
compile
select
build
test
snapshot
artifact
```

也就是：

**Transformation Build Semantics。**

### dbt Platform

当前已经提供：

- Job Scheduler；
- CI；
- Deployment Jobs；
- State-aware Orchestration 等产品能力。

所以不能说：

> dbt 整个产品没有 Orchestration。

## 那为什么我们还要学 Dagster

因为架构层级不同。

dbt 的天然 Graph 主要是：

```text
dbt transformation resources
```

而真实数据平台可能有：

```text
CDC ingestion
→ Spark Normalize
→ Iceberg Maintenance
→ dbt Build
→ MetricFlow Validation
→ Serving Refresh
→ DataHub Metadata Ingestion
```

这需要：

**Cross-system Asset Orchestration（跨系统资产编排）。**

在我们的体系里由：

**Dagster**

负责。

所以正确边界：

```text
dbt Core
→ transformation graph execution

dbt Platform
→ can schedule / orchestrate dbt workloads

Dagster
→ cross-system asset orchestration in this architecture
```

三句话同时成立。

## Production Environment 要分开

至少要明确：

```text
Dev
CI
Prod
```

职责不同。

### Dev

用于：

- Local changes；
- Small validation；
- Personal schema。

### CI

用于：

- PR Isolation；
- Unit Tests；
- State-aware Build；
- Defer；
- Impacted Data Tests。

### Prod

用于：

- Stable Target；
- Production Credentials；
- Full scheduled workload；
- Freshness；
- Alerts；
- Artifacts / Observability。

如果三者共用：

```text
same schema
same credentials
same relations
```

环境事故迟早会发生。

## 一套 dbt 生产排障顺序

以后看到：

> dbt Job 失败 / 变慢 / 数据错。

按这条链走：

```text
1. Parse 成功吗？
2. Compile 成功吗？
3. 最终 Compiled SQL 是什么？
4. Connection / Permission 正常吗？
5. Database Query 是慢还是失败？
6. Materialization Lifecycle 正常吗？
7. Incremental Boundary / unique_key 正确吗？
8. Test / Reconciliation 发现什么？
9. Source Freshness 正常吗？
10. State / Defer / Target Environment 正确吗？
11. Warehouse Concurrency / Cost 是否饱和？
12. 应该局部重跑、Backfill 还是 Full Refresh？
```

它不是一张参数清单。

它是在：

> **逐层缩小 Failure Domain。**

## dbt 12 节最终形成的完整模型

现在把整个 dbt Vertical Slice 压缩成一条链：

**01｜dbt 是什么**

→ Transformation Engineering Framework

**02｜Project 怎么执行**

→ Project / Target / Adapter / Compile / Execute

**03｜依赖怎么表达**

→ Source / Model / ref / source / DAG

**04｜SQL 怎么生成**

→ Jinja / Macro / Package / Adapter Abstraction

**05｜结果怎么持久化**

→ Materialization

**06｜大表怎么增量维护**

→ Incremental / Unique Key / Strategy / Backfill

**07｜Source 历史怎么保留**

→ Snapshot / SCD2 Implementation

**08｜怎么验证正确性**

→ Data Test / Unit Test / Freshness / Reconciliation

**09｜怎么保护下游接口**

→ Contract / Version / Change Safety

**10｜系统状态怎么机器化输出**

→ Docs / Artifacts / Lineage / Metadata

**11｜CI 怎么只跑必要部分**

→ Selection / State / Defer

**12｜线上怎么排障和控成本**

→ Troubleshooting / Cost / Orchestration Boundary

这 12 节共同回答：

> **一段数据建模逻辑，怎样从 SQL 代码变成有依赖、有物理形态、有状态、有质量保证、有接口、有元数据、能在 CI 和生产中安全演进的数据资产？**

## dbt Learn V1 到这里完成

dbt Learn 正式：

**12 / 12**

下一步不再继续增加 dbt 核心机制。

后面只进入：

**Scale**

与：

**Interview Evidence Integration。**
