---
id: kb-dbt-state-defer-ci-001
type: knowledge
title: Selection, State, Defer & CI
title_cn: Selection、State、Defer 与 CI
stage_id: '05'
domain: modeling
topic: dbt
order: 11
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: dbt_l5_v1
summary: dbt 可以利用 DAG 与前一次 Manifest 做 Change-aware Build。Selection 决定要处理哪些节点，state:modified 比较项目状态，defer 让未构建上游解析到另一环境已有 Relation，从而形成 Slim CI。
prerequisites:
  - kb-dbt-artifacts-lineage-metadata-001
related:
  - kb-dbt-production-troubleshooting-001
---
# Selection、State、Defer 与 CI

## 30 秒理解

前面已经有了两个关键基础：

```text
DAG
+
Artifacts
```

现在才能真正理解：

> 为什么 dbt 可以只 Build 改过的部分，而不是每个 PR 都把整个项目从头跑一遍？

主链：

```text
Current Project
+
Previous Manifest
→ State Comparison
→ Modified Nodes
→ Graph Expansion
→ Targeted Build / Test
```

再加：

```text
Unselected Upstream
+
Defer
→ resolve ref() to another environment
```

最终形成：

**Slim CI / Change-aware CI（变更感知 CI）。**

## Selection 是什么

Selection（节点选择）回答：

> 这次 Invocation 到底要处理 DAG 里的哪些 Resource？

最简单：

```bash
dbt build --select fct_orders
```

只选择：

```text
fct_orders
```

但 DAG 的价值在于还可以表达：

```text
parents
children
tags
paths
resource types
state
results
```

所以 Selection 本质上是：

> **在 Project Graph 上定义一个执行子图。**

## 为什么不能把 Selection 学成 CLI 语法大全

真正需要建立的是：

```text
Selector
→ choose nodes by property

Graph Operator
→ expand through dependency edges

Set Operator
→ union / intersection / exclusion
```

例如概念上：

```text
fct_orders+
```

可以理解成：

> 选择 `fct_orders` 以及它的下游。

而：

```text
+fct_orders
```

表示向上游扩展。

具体所有语法以后查 Reference 即可。

生产能力的重点是：

> 你知道为什么要选这批 Node。

## 传统 CI 为什么昂贵

假设 Project 有：

```text
800 models
```

PR 只改：

```text
stg_customers
```

如果每个 PR 都：

```text
dbt build
→ rebuild all 800 models
```

会造成：

- CI 时间很长；
- Warehouse Cost 很高；
- Developer Feedback 慢；
- 并发 PR 互相抢资源。

但简单只跑：

```text
stg_customers
```

也不够，

因为下游可能受影响。

所以真正目标是：

```text
changed nodes
+
relevant impacted graph
```

## State 是什么

这里说的是经典 dbt Core 的：

**Artifact-based State（基于 Artifact 的状态比较）**。

不是新的托管产品能力。

高层：

```text
previous invocation
→ manifest_old

current project
→ parsed current state

compare
→ what changed?
```

通过：

```text
--state path/to/artifacts
```

告诉 dbt：

> 用哪个旧 Manifest 做比较基线。

## `state:modified` 是什么

例如：

```bash
dbt build \
  --select "state:modified+" \
  --state path/to/prod-artifacts
```

含义可以高层理解成：

```text
find nodes changed since previous manifest
→ include relevant downstream
→ build only that affected subgraph
```

这就是经典 Slim CI 的核心之一。

## “Modified” 不只是 SQL 文件改了

dbt 比较的不是纯 Git Diff。

它可能把多种变化视为 Modified，例如：

- Model Body；
- Config；
- Relation Name；
- Contract；
- Upstream Macro；
- 部分 Source / Exposure 属性。

所以：

```text
state comparison
≠
git diff sql files
```

这是 Artifact-based State 更有价值的地方。

## Macro 改了为什么会让 Model Modified

假设 Model 自己 SQL 没动：

```sql
select {{ normalize_email('email') }}
```

但 Macro：

```text
normalize_email
```

改变了。

最终 Compiled SQL 可能已经不同。

所以 State 可以识别：

```text
upstream macro change
→ dependent resource semantically changed
```

这比只看：

```text
which .sql file changed?
```

更准确。

## State Comparison 不是完美 Truth

它依赖：

```text
previous manifest
```

如果这个 Manifest：

- 太旧；
- 来自错误 Branch；
- 与实际 Production Relation 不一致；
- Artifact 丢失；

State 判断就可能失真。

所以必须知道：

> **State Artifact 本身也是 CI 输入，需要治理。**

它不是无条件可信的 Oracle。

## Idempotence 为什么是 State / Defer 的前提

dbt 当前文档仍然强调：

> 给定相同输入，Model 应尽量产生相同结果。

这就是：

**Idempotence（幂等性）。**

如果 Model 逻辑依赖：

```text
random()
current_time
external mutable side effect
```

导致同样输入每次输出都不同，

那么：

```text
reuse old state
defer to old relation
compare changed nodes
```

都会变得更难推理。

所以：

**State-aware Workflow 建立在可重复 Transformation 上。**

## Defer 是什么

Defer（延迟解析 / 引用回退）解决一个典型 CI 问题：

> 我只想 Build 改过的 Model，但它的上游在我的 PR Schema 里根本没有。

例如：

```text
prod.model_a
→ model_b changed in PR
```

开发 Schema：

```text
dev_alice.model_a
does not exist
```

如果直接：

```bash
dbt build --select model_b
```

`ref('model_a')` 可能解析到：

```text
dev_alice.model_a
```

然后失败。

加上：

```text
--defer
--state prod-artifacts
```

后，

未被选中、且当前 Target 中不存在的上游，

可以解析到 State Manifest 对应的：

```text
prod.model_a
```

于是：

```text
prod.model_a
→ dev_PR.model_b
```

形成一个混合环境依赖图。

## Defer 的本质是什么

Defer 并不是：

> 把 Production Data Copy 到 Dev。

它主要改变的是：

**ref() Resolution（引用解析）。**

也就是：

```text
upstream relation pointer
```

从：

```text
current target
```

回退到：

```text
state manifest environment
```

所以成本很低，

因为不需要先重建全部上游。

## 哪些 Node 会被 Defer

高层规则是：

```text
not selected
+
not existing in current target
→ can resolve to state relation
```

如果 Node 本次已经被选中，

就应该在当前 Target 构建，

不会简单拿 State 里的版本代替。

另外：

**Ephemeral Model 不会被 Defer。**

因为它本质上会被内联进下游 Compiled SQL。

## Defer 的一个重要风险：跨环境 Test

假设：

```text
model_b
→ dev

parent model_a
→ prod
```

此时 Relationships Test 可能变成：

```text
dev.model_b
JOIN
prod.model_a
```

也就是：

> 一个 Test 同时跨 Dev / Prod 两个环境。

这可能是你想要的，

也可能完全不是。

所以 Defer 的核心风险不是：

> 技术能不能跑。

而是：

> **混合环境 Data Semantics 是否合理。**

## `--defer-state` 为什么存在

State Comparison 和 Defer 可以使用不同的 Manifest。

例如：

```text
compare code
→ yesterday production logical state

defer refs
→ current stable production applied state
```

这时可以分别指定：

```text
--state
--defer-state
```

大多数场景可以用同一个 State，

但这个能力说明：

> “比较基线”和“引用回退环境”在概念上不是一回事。

## Slim CI 的完整链

现在可以串起来：

```text
1. Production run produces manifest
2. PR changes project code
3. Parse current project
4. Compare current vs production manifest
5. Select state:modified
6. Expand impacted downstream graph
7. Build changed nodes in isolated PR schema
8. Defer unchanged upstream refs to production
9. Run relevant unit / data tests
10. Fail or pass CI
```

这就是：

**Change-aware CI。**

## 为什么 CI Schema 要隔离

如果两个 Developer 同时：

```text
build same model name
```

却都写：

```text
analytics_dev.fct_orders
```

会互相覆盖。

所以成熟 CI 通常使用：

```text
PR-specific / developer-specific schema
```

例如：

```text
dbt_pr_123
dbt_pr_124
```

这样：

```text
parallel PR
→ isolated relations
```

避免环境污染。

## CI 只跑 Modified 就一定安全吗

不一定。

如果：

```text
upstream source data changed
but code unchanged
```

经典 `state:modified` 只看 Project State，

不会自动证明：

> 旧模型的数据内容一定仍然安全。

另外：

```text
external table semantics changed
database behavior changed
```

也可能不体现在 Manifest Diff。

所以：

> **State-aware CI 是 Cost / Coverage Trade-off，不是完整正确性证明。**

关键模型是：

```text
full rebuild
→ high coverage / high cost

state-aware build
→ lower cost / targeted coverage
```

真正项目需要根据 Criticality 决定补充：

- Scheduled Full Build；
- Reconciliation；
- Production Data Tests；
- Integration Test。

## 经典 State 和新的 dbt State 不要混

当前 dbt 产品已经有新的：

**dbt State（Preview）**

用于更自动地判断：

> 哪些节点真的需要重建。

它不是本节经典：

```text
--state
state:modified
defer
```

的同义词。

所以当前稳定学习基线仍然是：

```text
Artifact-based local/core state
```

新的托管 dbt State 作为：

**Next-generation Product Capability**

单独看待。

不要把 Preview 产品当前实现写成永恒 Core 语义。

## 到这里 CI 因果链完整了

```text
DAG
→ Artifact
→ Previous State
→ Change Detection
→ Graph Selection
→ Deferred Upstream
→ Isolated CI
→ Targeted Validation
```

最后只剩一个问题：

> 线上 dbt 真失败了、变慢了、成本上涨了，怎么从这些机制一步一步定位？

下一节进入 Production Closure。
