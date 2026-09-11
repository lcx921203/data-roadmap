---
id: kb-dbt-tests-freshness-reconciliation-001
type: knowledge
title: Data Tests, Unit Tests, Freshness & Reconciliation
title_cn: Data Tests、Unit Tests、Freshness 与 Reconciliation
stage_id: '05'
domain: modeling
topic: dbt
order: 8
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: dbt_l5_v1
summary: dbt 的质量能力不是一个统一的“test”。Data Test 检查已存在数据是否违反断言，Unit Test 用静态输入验证 SQL 逻辑，Source Freshness 检查上游时效，Reconciliation 则把业务结果与可信基准对账。
prerequisites:
  - kb-dbt-snapshots-history-001
related:
  - kb-dbt-contracts-versions-001
---
# Data Tests、Unit Tests、Freshness 与 Reconciliation

## 30 秒理解

“给 dbt 加测试”这句话太模糊。

至少要先区分四类问题：

```text
Data Test
→ 当前数据有没有违反规则？

Unit Test
→ SQL 逻辑对给定输入有没有产生预期输出？

Source Freshness
→ 上游数据有没有按 SLA 按时到？

Reconciliation
→ 业务结果和可信基准能不能对上？
```

这四类验证解决的问题完全不同。

所以：

> **质量工程不是把所有东西都塞进 `dbt test`。**

## Data Test 是什么

Data Test（数据测试）本质上是一条：

> **返回失败记录的 SQL Query。**

例如你断言：

```text
order_id must not be null
```

测试真正查询的是：

```sql
select *
from {{ ref('fct_orders') }}
where order_id is null
```

如果返回：

```text
0 rows
```

测试通过。

如果返回：

```text
N rows
```

这些 Row 就是违反断言的数据。

所以 Data Test 的心智模型是：

```text
Assertion
→ Query violating rows
→ zero failures = pass
```

## Generic Data Test

Generic Data Test（通用数据测试）是：

> 可以带参数、重复使用的测试模板。

dbt 当前内置四个最经典的 Generic Test：

```text
unique
not_null
accepted_values
relationships
```

例如：

```yaml
models:
  - name: fct_orders

    columns:
      - name: order_id
        data_tests:
          - unique
          - not_null

      - name: status
        data_tests:
          - accepted_values:
              arguments:
                values:
                  - placed
                  - paid
                  - shipped
                  - cancelled
```

它们分别回答：

```text
unique
→ 有没有重复？

not_null
→ 有没有空值？

accepted_values
→ 是否只出现允许的枚举？

relationships
→ 外键值是否在父资源中存在？
```

## Generic Test 为什么比复制 SQL 更好

假设 50 个 Model 都要验证：

```text
id not null
```

如果每个都单独写 SQL：

```text
same test logic
→ duplicated 50 times
```

Generic Test 把逻辑抽成一次：

```text
test definition
→ parameterized reuse
```

这和 Macro 的复用思想类似。

只是 Generic Test 的输出语义固定为：

> 返回违反规则的记录。

## Singular Data Test

Singular Data Test（单用途数据测试）适合：

> 一次性的、业务特定的断言。

例如：

```sql
-- tests/assert_order_total_not_negative.sql

select
    order_id
from {{ ref('fct_orders') }}
where total_amount < 0
```

这个规则可能只属于：

```text
fct_orders
```

不值得抽象成通用 Test。

所以：

```text
Generic
→ reusable pattern

Singular
→ one-off business assertion
```

## Data Test 在验证什么

Data Test 通常发生在：

```text
Model already built
→ query actual data
→ assert properties
```

所以它很适合验证：

- Grain；
- Null；
- Duplicate；
- Referential Integrity；
- Business Rule；
- Data Distribution。

但它有一个天然边界：

> Model 往往已经构建出来了，才有真实数据可检查。

这就是为什么 Unit Test 解决的是另一类问题。

## Unit Test 是什么

Unit Test（单元测试）主要验证：

> **Model SQL Logic 本身。**

它使用：

- Static Input（静态输入）；
- Expected Output（预期输出）。

例如模型：

```sql
select
    order_id,
    case
        when amount >= 1000 then 'high'
        else 'normal'
    end as order_segment
from {{ ref('stg_orders') }}
```

Unit Test 可以写概念上：

```yaml
unit_tests:
  - name: test_order_segment
    model: fct_orders

    given:
      - input: ref('stg_orders')
        rows:
          - {order_id: 1, amount: 500}
          - {order_id: 2, amount: 1200}

    expect:
      rows:
        - {order_id: 1, order_segment: normal}
        - {order_id: 2, order_segment: high}
```

这里并不依赖：

> 生产里刚好存在这些 Edge Case。

你自己构造输入。

## Unit Test 和 Data Test 的区别

### Data Test

输入：

**真实已构建数据。**

回答：

> 真实数据有没有违反断言？

### Unit Test

输入：

**人工构造的 Fixture（测试输入）。**

回答：

> SQL 逻辑对这个输入是否产生预期结果？

所以：

```text
Data Test
→ data correctness assertion

Unit Test
→ transformation logic correctness
```

不能互相替代。

## 哪些逻辑值得 Unit Test

特别适合：

- 复杂 `CASE WHEN`；
- Regex；
- Date Math；
- Window Function；
- Edge Case；
- 历史上发生过 Bug 的逻辑；
- 高关键性 Model；
- 重构前后行为验证。

例如：

> 直接测试 `sum()` 会不会正确求和

意义不大，

因为你并不是在测试数据库的 `sum()` 实现。

真正应该测的是：

> 你的业务 SQL 怎么组合这些 Operator。

## Unit Test 为什么主要放 Dev / CI

Unit Test 的 Input 是固定 Fixture。

所以同一份逻辑：

```text
今天跑
明天跑
后天跑
```

测试输入并不会因为生产数据更新而变化。

因此更合适的生命周期是：

```text
Developer change
→ run unit tests
→ CI
→ merge
```

而不是：

```text
every production build
→ repeat static fixtures forever
```

这就是 Unit Test 与生产 Data Test 的使用差异。

## Incremental Model 也能 Unit Test 吗

可以，但要理解它测的是什么。

Incremental Model 有：

```text
full-refresh branch
incremental branch
```

Unit Test 可以通过 Override：

```text
is_incremental = true / false
```

分别验证两条 SQL 逻辑。

但它测试的是：

> Incremental Model 本次准备产生哪些 Row。

它并不能自动证明：

> Adapter 最终把这些 Row 正确 Merge 进已有 Target 以后，整张最终表一定正确。

所以：

```text
unit test incremental SQL
≠
end-to-end incremental materialization verification
```

生产仍然需要 Reconciliation / Data Test。

## Source Freshness 是什么

Source Freshness（数据源新鲜度）回答：

> 上游最新数据离现在有多久？

例如业务要求：

```text
orders source
must arrive within 1 hour
```

Freshness 可以定义：

```text
warn after 30 min
error after 1 hour
```

高层上：

```text
latest loaded time
vs
current time
→ age
→ compare SLA
```

这和：

```text
order_id not null
```

完全不是一种质量问题。

前者是：

**Timeliness（时效）**

后者是：

**Data Validity（数据有效性）。**

## 一个当前很容易记错的点：dbt build 不自动跑 Freshness

`dbt build` 会处理：

- Models；
- Tests；
- Seeds；
- Snapshots；
- Unit Tests 等 DAG Build Resource。

但是：

> **Source Freshness 不是 `dbt build` 自动包含的步骤。**

通常需要：

```bash
dbt source freshness
```

或者在部署 Job 中：

```text
Run source freshness
→ dbt build
```

这很重要。

否则团队可能以为：

> build 成功 = Source Freshness 一定检查过。

实际并不成立。

## Freshness 的 SLA 应该怎么理解

如果业务 SLA 是：

```text
1 hour
```

却每天只查一次：

```text
24-hour check interval
```

Freshness Check 本身就失去及时告警价值。

所以：

```text
SLA
→ determines check frequency
```

而不是：

```text
所有 Source
→ 每天凌晨统一 freshness
```

## Reconciliation 是什么

Reconciliation（对账）不是一个单独的 dbt Built-in Test Type。

它是一类业务验证模式：

> **把当前模型结果和一个可信基准做比对。**

例如：

```text
Source Orders Amount
vs
fct_orders Amount
```

或者：

```text
Payment Provider Settlement
vs
Warehouse Revenue
```

## 为什么 `unique/not_null` 全绿仍然可能算错

例如模型逻辑少 Join 了一类订单。

最终：

```text
order_id
→ still unique
→ still not null

status
→ still accepted
```

所有 Data Test 可能都通过。

但：

```text
revenue
→ missing 18%
```

所以：

> Schema / Constraint-style Test 不能证明业务数值完全正确。

这就是 Reconciliation 存在的原因。

## Reconciliation 常见维度

可以按：

### Row Count

```text
source rows
vs
target rows
```

### Amount

```text
source amount sum
vs
target amount sum
```

### Business Slice

```text
date
country
status
tenant
```

逐层对账。

### Tolerance

某些系统允许：

```text
difference <= 0.01%
```

而不是必须严格等于。

这取决于：

- Late Arrival；
- FX；
- Rounding；
- Source SLA。

## 测试不是越多越好

如果所有 Column 都机械加：

```text
not_null
unique
accepted_values
```

并不能等于：

> Data Quality 做得很好。

真正好的 Test Suite 应该围绕：

- Grain；
- Business Invariant；
- Source SLA；
- Critical Join；
- Financial Reconciliation；
- Regression Risk。

也就是说：

> **测试应该保护“最重要的失败模式”。**

不是追求 Test 数量。

## Severity 怎么理解

有些 Test 失败应该：

```text
ERROR
→ block pipeline
```

有些可能只是：

```text
WARN
→ notify / investigate
```

例如：

```text
primary key duplicate
```

通常很严重。

而：

```text
optional description coverage
```

可能不应阻断业务 Build。

所以测试策略还需要：

**Failure Severity。**

## 这一节形成的质量模型

现在可以把 dbt Quality 分成：

```text
Source Freshness
→ upstream arrived on time?

Unit Test
→ SQL logic correct on controlled inputs?

Data Test
→ actual built data satisfies assertions?

Reconciliation
→ business result matches trusted baseline?
```

四层结合，

才能真正构成数据模型质量保护。

## 下一步为什么是 Contract

就算数据现在：

```text
全部测试通过
```

仍然有另一个问题：

> 明天有人删掉一个下游依赖的 Column 怎么办？

这不是“当前数据正确性”，

而是：

**接口稳定性。**

下一节进入：

**Model Contracts、Versions 与 Change Safety。**
