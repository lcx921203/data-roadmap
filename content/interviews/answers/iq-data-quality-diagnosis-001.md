---
id: iq-data-quality-diagnosis-001
type: interview
question: "如何建立数据质量体系？某个指标突然不准时如何快速定位到具体环节？"
domain: data_quality
learning_depth: L5
evidence:
  direct_independent_count: 5
  direct_company_count: 3
  direct_ids:
    - ev-bytedance-2025-09-21-data-dev-001
    - ev-bytedance-2025-09-06-offline-warehouse-003
    - ev-jd-2025-09-06-warehouse-003
    - ev-kuaishou-2025-09-05-social-data-dev-005
    - ev-kuaishou-2025-10-12-data-dev-001
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
technical_references:
  - https://docs.getdbt.com/
status: answer_ready
---

# 如何建立数据质量体系？指标不准时怎么定位？

## 这道题在考什么

高级岗位的数据质量题不是让你背几个质量维度，而是考你能否建立：

```text
Quality Gate
+ Observability
+ Lineage
+ Reconciliation
+ Incident Response
```

并在事故发生时快速缩小范围、修复、回放和验证。

## 30 秒回答

我会把数据质量覆盖到 Source、Ingestion、Model、Metric、Serving 五层，每层定义 Freshness（新鲜度）、Completeness（完整性）、Uniqueness（唯一性）、引用完整性、分布异常和业务对账等规则。

如果指标突然不准，我先判断是真实业务变化还是数据事故，再从最终指标沿血缘向上游反查：先核对指标定义和时间口径，再看 Serving/DWS 输入量，再看 DWD 的 Join、去重、Delete、迟到数据，最后看 ODS/CDC Offset 和源系统。修复后必须回放受影响窗口并重新对账，而不是只把任务重跑成功。

## 完整原理

数据质量不是单个测试工具，而是一条控制链：

```text
Source
↓
Ingestion
↓
Model
↓
Metric
↓
Serving
```

### Source

关注源 Schema、写入中断、主键、字段语义、异常 Null。

### Ingestion

关注 CDC Lag、丢/重事件、Offset、分区完整性、Delete、Schema 兼容。

### Model

关注 Join Fan-out、Grain、去重、过滤、SCD、增量边界和 Backfill。

### Metric

关注分子/分母、去重实体、时间窗口、Join Path、指标版本。

### Serving

关注缓存、物化刷新、旧 Snapshot、权限过滤。

质量规则分为：

```text
Schema Quality
Data Quality
Business Quality
```

业务规则例如：

```text
支付金额 >= 0
退款金额 <= 支付金额
完成时间 >= 下单时间
核心财务指标与对账源差异 < 阈值
```

## Production 实现

建议形成：

```text
Rule Definition
↓
Execution
↓
Result Store
↓
Alert
↓
Lineage Impact
↓
Incident / Backfill
```

每次检查记录 asset、partition、rule、expected、actual、run_id、upstream snapshot，才能支持趋势、审计和事故复盘。

质量失败后先利用血缘判断影响面：

```text
受影响 Model
↓
Metrics
↓
Dashboard / API
```

告警应按业务影响分级，而不是所有异常同一优先级。

## 代码 / 配置示例

dbt 基础测试：

```yaml
version: 2

models:
  - name: fct_orders
    columns:
      - name: order_id
        tests:
          - not_null
          - unique

      - name: user_id
        tests:
          - not_null
          - relationships:
              to: ref('dim_users')
              field: user_id
```

业务一致性测试：

```sql
select order_id
from {{ ref('fct_orders') }}
where refund_amount > paid_amount
   or paid_amount < 0
```

日级异常检测示意：

```sql
with daily as (
    select order_date, count(*) as cnt
    from {{ ref('fct_orders') }}
    group by 1
),
stats as (
    select *,
           avg(cnt) over (
             order by order_date
             rows between 7 preceding and 1 preceding
           ) as prev_7d_avg
    from daily
)
select *
from stats
where prev_7d_avg is not null
  and cnt < prev_7d_avg * 0.7
```

30% 只是示例，真实阈值需要根据业务波动和误报率校准。

## 指标突然不准：标准排查路径

```text
1. 业务是否真的变化
2. 指标定义/时区/去重实体
3. Serving / Cache / Snapshot
4. DWS 输入量、Join、过滤
5. DWD 去重、Delete、迟到、SCD
6. ODS / Kafka Lag / CDC Offset
7. 圈定受影响时间窗口
8. Root Cause Fix
9. Backfill
10. Reconciliation + Postmortem
```

不要一开始就“重跑”。

## 常见错误回答

- “数据质量就是 not null + unique。”
- “指标不准先重跑。”
- “所有异常都告警。”——最终会造成 Alert Fatigue（告警疲劳）。

## 项目怎么结合

项目关联仍待核验。发布真实项目案例前，只挂接能够从源码或项目事实验证的内容，例如 dbt tests、指标对账、Dagster Asset Check、DataHub Lineage、CDC 完整性、Serving Freshness；不能把 Production Pattern 写成已落地事实。

## Scale Lab

假设：

```text
10,000 张表
3,000 个指标
500 条 Pipeline
```

不能对所有字段每分钟全表扫描。需要资产分级：

```text
P0 核心指标 → 强对账 + 低延迟报警
P1 关键模型 → Freshness + Key Checks
P2 探索资产 → 轻量检查
```

并用血缘控制 Blast Radius（故障影响面）和检查成本。

## 真实关联追问

1. 数据质量和数据可观测性有什么区别？
2. Freshness 如何定义 SLO？
3. dbt test 失败是否一定阻断发布？
4. 如何降低误报？
5. CDC Delete 漏掉怎么发现？
6. 实时和离线指标不一致怎么对账？
