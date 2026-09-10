---
id: iq-dimensional-fact-dimension-design-001
type: interview
question: "给定业务场景，如何确定事实表、维表和数据粒度？"
domain: warehouse
learning_depth: L5
evidence:
  direct_independent_count: 4
  direct_company_count: 4
  direct_ids:
    - ev-leetcode-amazon-de2-2020-04-001
    - ev-bytedance-2025-summer-data-ecommerce-002
    - ev-meituan-2025-10-31-bigdata-001
    - ev-didi-2025-11-04-data-dev-001
frequency:
  status: repeated_verified
  final_industry_frequency: false
verification:
  question_intent_reviewed: true
  dedup_reviewed: true
  answer_curated: true
  content_review_status: first_slice
  publishable: false
project_connection:
  status: needs_project_fact_check
status: answer_ready
---

# 如何确定事实表、维表和 Grain？

## 这道题在考什么

成熟的建模顺序是：

```text
Business Process
↓
Grain
↓
Facts
↓
Dimensions
```

如果 Grain（一行代表什么）没有先定清楚，后面容易出现 Join 放大、指标重复和多粒度混表。

## 30 秒回答

我做维度建模时第一步不是挑字段，而是确定业务过程和 Grain。比如电商订单，如果要支持商品级分析，可以定义“一行一个 order item”；如果关心订单生命周期，可以建“一行一个 order”的事实表。

确定粒度后，再选择可加事实，例如数量和金额，并挂用户、商品、渠道、日期等维度。最危险的是混合粒度，例如在 order-item 粒度重复保存 order header 金额，后面 `sum(order_amount)` 就会重复。因此我会先讲 Grain，再讲 Fact、Dimension、SCD 和主键。

## 完整原理

先问业务事件是什么：

- 下单；
- 支付；
- 发货；
- 退款；
- 曝光；
- 点击；
- 登录。

Grain 应能写成一句：

```text
One row per ...
```

事实可分：

- 可加：quantity、revenue；
- 半可加：balance、inventory snapshot；
- 不可加：ratio、average。

转化率等不可加指标，更适合保留组成它的原子量，而不是直接存一个可被错误平均的 ratio。

Dimension 描述从什么角度分析事实，如 user、product、channel、region、date、campaign。

## Production 实现

模型契约中明确 Grain：

```yaml
model: fct_order_items
grain:
  - order_item_id
primary_key:
  - order_item_id
```

Join 前确认：

```text
Left Grain
Right Grain
Join Cardinality
```

例如：

```text
order 1:N order_items 1:N promotions
```

未经控制直接 Join 可能导致乘法放大。

维度历史变化需要明确 SCD 语义。如果业务要求“按事件发生当时属性分析”，就不能永远 Join 当前最新维度值。

## 代码 / 配置示例

```sql
select
    oi.order_item_id,
    oi.order_id,
    o.user_id,
    oi.product_id,
    o.order_date,
    oi.quantity,
    oi.unit_price,
    oi.quantity * oi.unit_price as gross_amount
from {{ ref('stg_order_items') }} oi
join {{ ref('stg_orders') }} o
  on oi.order_id = o.order_id
```

```yaml
version: 2

models:
  - name: fct_order_items
    description: "Grain: one row per order_item_id"
    columns:
      - name: order_item_id
        tests:
          - not_null
          - unique
```

这里 `unique` 同时在验证我们声明的 Grain 是否成立。

## 故障排查

如果 GMV 比财务高，优先检查：

```text
fct_order_items 是否一行一个 item
↓
维度/促销 Join 是否 1:N
↓
Join 后行数是否膨胀
↓
order header amount 是否被复制
↓
退款粒度是否不同
↓
CDC update 是否重复处理
```

## 常见错误回答

- “事实表是数字，维度表是字符串。”
- “一张大宽表最方便。”
- “直接存 conversion_rate 再平均。”

## 项目怎么结合

这题适合挂接真实指标分析项目，但发布前仍需核对实际 Grain、Fact、Dimension 和 SCD。答题时先讲真实业务过程和真实模型，再讲规模化演进，不虚构更复杂的生产实践。

## Scale Lab

当事实表达到 100 亿行、用户维度 2 亿行时，需要继续讨论：

- Join 策略；
- Partition / Clustering；
- SCD 历史；
- Incremental Merge；
- 数据倾斜；
- Serving 预聚合；
- Semantic Layer 动态 Join。

但模型语义正确优先于性能优化。

## 真实关联追问

1. 为什么 Grain 必须先确定？
2. 事实表能不能没有度量？
3. 事务事实、周期快照、累积快照区别？
4. 退化维度是什么？
5. SCD2 如何按事件时间关联？
6. Join Fan-out 怎么发现？
