---
id: iq-warehouse-layering-001
type: interview
question: "数仓为什么要分层？ODS、DWD/DWM、DWS/ADS 等层分别解决什么问题？"
domain: warehouse
learning_depth: L5
evidence:
  direct_independent_count: 6
  direct_company_count: 3
  direct_ids:
    - ev-bytedance-2025-09-21-data-dev-001
    - ev-bytedance-2025-summer-data-ecommerce-002
    - ev-bytedance-2025-09-06-offline-warehouse-003
    - ev-meituan-2025-10-31-bigdata-001
    - ev-meituan-2025-04-02-data-dev-002
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

# 数仓为什么要分层？

## 这道题在考什么

这道题表面问 ODS、DWD、DWS、ADS，真正考的是：为什么不能从源表直接一路写到报表，以及如何通过职责分离解决复用、质量、血缘、回溯、Schema 变化和故障定位。

高级岗位回答时，重点不是背层名，而是讲清楚 **职责边界（Responsibility Boundary）和数据契约（Data Contract）**。

## 30 秒回答

数仓分层的核心是 **解耦、复用和治理**。ODS 尽量保留源系统事实；DWD 对数据清洗、去重、统一口径并形成原子明细；DWM 是可选的公共中间派生层；DWS 沉淀主题级复用模型和公共聚合；ADS 面向报表、接口和 Serving。

生产上我不会机械要求每个项目都有五层，而会保证 `Raw → Clean/Conformed → Reusable Model → Serving` 这些职责清楚。这样源系统变化、指标口径变化、Backfill（历史回填）和故障排查时，不会把所有逻辑耦合在最终表里。

## 完整原理

### ODS：可追溯原始事实

ODS 首要目标是可追溯，通常保留源主键、源时间、采集时间、CDC 操作类型、Offset/LSN 等技术元数据。ODS 不宜过早做大量业务聚合，否则下游出错时无法回答“源系统当时到底发生了什么”。

### DWD：标准化原子事实

DWD 强调 `clean + conformed + atomic`：

- 清洗与类型统一；
- 去重；
- 处理 CDC update/delete；
- 统一业务主键和时间语义；
- 明确 Grain（粒度）；
- 保留可复用的原子事实。

例如订单明细：

```text
Grain = 一行一个 order_item
```

之后 GMV、品类、用户、渠道等分析都可以从同一套标准明细复用。

### DWM：可选中间层

DWM 可承载中间宽表、公共衍生字段、轻度聚合等。但没有复用价值、没有清晰契约、只是为了“层数完整”的中间层应删除。

### DWS：主题复用能力

DWS 常用于用户、商品、订单等主题级公共聚合或宽表。现代架构里部分 DWS 能力也可能转移到 dbt 模型、Semantic Layer（语义层）、MetricFlow、物化视图或 Serving Table，因此 DWS 不是固定物理表名。

### ADS：消费侧输出

ADS 面向明确消费场景，例如报表、API、OLAP、Dashboard 或低延迟 Serving。业务逻辑可以更强，但不能把不可复用的逻辑反向污染公共层。

## Production 实现

生产环境重点控制：

```text
数据契约
+ 增量 / Backfill
+ CDC 语义
+ 血缘
+ Freshness / SLA
```

每层至少应明确输入/输出 Schema、主键、Grain、刷新方式、Owner、质量规则和新鲜度目标。

日常增量和历史 Backfill 最好复用同一套模型逻辑；CDC 的 INSERT/UPDATE/DELETE、重复、乱序、迟到语义必须在 ODS→DWD 边界明确。

血缘至少能回答：

```text
ADS / Metric
← DWS / Semantic Model
← DWD
← ODS
← Source
```

任务“成功”不代表数据正确，因此还要监控 ODS 到达延迟、DWD 完成时间、Serving 可查询时间等 SLI。

## 代码 / 配置示例

现代 dbt 项目可以按职责映射传统分层：

```text
models/
├── staging/        # 接近 ODS / 标准入口
├── intermediate/   # 公共中间逻辑
├── marts/          # 主题模型
└── serving/        # 面向消费
```

例如：

```sql
select
    order_item_id,
    order_id,
    user_id,
    product_id,
    quantity,
    unit_price,
    quantity * unit_price as gross_amount,
    order_created_at
from {{ ref('stg_order_items') }}
where is_deleted = false
```

关键不是目录名，而是这个模型能明确说：

```text
Grain = 一行一个 order_item
```

## 故障排查路径

如果 DWS 的 GMV 今天突然低 20%：

```text
指标定义/时间口径
↓
Serving / ADS 缓存与分区
↓
DWS 聚合输入、Join、过滤
↓
DWD 去重、Delete、迟到、维度关联
↓
ODS 行数、CDC Offset、分区完整性
↓
Source 真实业务变化
```

第一步先区分 **真实业务变化** 和 **数据链路事故**，而不是直接重跑。

## 常见错误回答

- 只背“ODS 原始、DWD 明细、DWS 汇总、ADS 应用”，没有解释为什么。
- 认为所有项目必须五层齐全。
- 认为分层越多越规范，忽略写放大、存储、调度依赖和延迟。

## 项目怎么结合

项目挂接暂时标记为待事实核验。

如果实际项目没有传统 ODS/DWD/DWS 五层，可以这样表达：

> 我们没有机械使用传统五层命名，但保留了 Raw/Normalize、标准模型、语义复用和 Serving 之间的职责隔离。

不要为了迎合题目，把现代架构硬说成传统五层真实存在。

## Scale Lab

假设每天新增 100 TB，如果每层都完整落盘会产生巨大写放大、Backfill 成本、小文件和元数据压力。此时可以演进为：

```text
Immutable Raw
↓
Conformed Atomic Tables
├── Semantic Query
├── Incremental Aggregate
└── Serving Materialization
```

减少“为了层而落盘”。

## 真实关联追问

1. DWM 一定有必要吗？
2. DWD 为什么强调原子粒度？
3. DWS 和 Semantic Layer 有什么区别？
4. ADS 和缓存是不是重复？
5. CDC Delete 在 ODS→DWD 怎么处理？
6. 分层太多导致延迟过高怎么办？
7. Lakehouse 时代传统分层还有没有意义？
