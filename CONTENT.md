# CONTENT.md

# DataRoadmap 内容选型与学习深度规范

## 1. 内容总原则

> **主栈深学，同类横向对比；生产实现优先，项目案例落地；大规模能力由 Scale Lab 独立训练；面试题由真实面经校准。**

DataRoadmap 不建设“大数据百科全书”。

## 2. Learning Depth（学习深度）

### L1 — Awareness｜了解

知道是什么、历史定位和基本用途。

### L2 — Comparison｜对比与选型

掌握：

- 核心思想
- 主要优缺点
- 与主栈技术的差异
- 适用场景
- 选型依据

### L3 — Working Knowledge｜工作掌握

能够：

- 正确使用
- 解释主要机制
- 理解常用配置
- 处理典型问题

### L4 — Deep Dive｜深入生产

进一步掌握：

- 内部机制
- 性能
- 故障
- 并发
- 一致性
- 可观测
- 运维

### L5 — Core Stack｜核心主栈

除 L1–L4 外，还需要：

- 生产架构
- Production Code / Configuration
- 源码关键路径（真正有学习价值时）
- 项目案例
- Scale Lab
- 高频真实面试题
- 关键同类技术选型

## 3. Stack Role

每个知识节点必须有 `stack_role`：

- `core`：三个项目的主技术栈
- `comparison`：同类型替代技术，只做对比与选型
- `foundation`：基础能力
- `production`：高级岗位必须掌握的生产能力

示例：

| 技术 | Role | Depth |
|---|---|---:|
| Iceberg | core | L5 |
| Hudi | comparison | L2 |
| Delta Lake | comparison | L2 |
| Paimon | comparison | L2 |
| Dagster | core | L5 |
| Airflow | comparison | L2/L3 |
| DataHub | core | L5 |
| SQL | foundation | L5 |
| SLO | production | L4/L5 |

## 4. 内容优先级

推荐使用：

```text
Priority =
Project Relevance
× Interview Frequency
× Role Relevance
```

这里不是严格数学公式，而是内容规划方法。

## 5. Production First

主栈知识正文优先回答：

1. 它解决什么生产问题？
2. 架构位置在哪里？
3. 内部如何工作？
4. 生产代码 / 配置通常怎么实现？
5. 数据量、并发和故障扩大后会发生什么？
6. 如何观测、恢复和控制成本？
7. 三个项目中哪里存在对应案例？
8. 真实面试是否高频考察？

## 6. Comparison 技术怎么学

同类型非主栈技术不得机械复制主栈目录。

例如 Lakehouse：

```text
Iceberg          L5 深学

Hudi             L2
Delta Lake       L2
Paimon           L2
```

Hudi / Delta / Paimon 主要回答：

- 核心设计思想
- Metadata / Transaction 模型差异
- Streaming / Batch 偏好
- Upsert / CDC 能力
- 生态
- 运维复杂度
- 适合什么场景
- 为什么某个场景可能不选 Iceberg

## 7. 项目内容规范

项目案例不承担“生产标准答案”的职责。

每个项目案例必须区分：

- `Actual`：真实项目事实
- `Boundary`：没有做到哪里
- `Mapping`：映射哪些知识点
- `Scale Extension`：对应哪些 Scale Scenario

不得为了回答大厂面试而篡改真实项目规模。

## 8. Scale Lab 内容规范

Scale Lab 是正式内容类型。

场景至少覆盖以下一个维度：

- volume：数据规模
- throughput：吞吐
- concurrency：并发
- latency：时延
- reliability：可靠性
- consistency：一致性
- availability：可用性
- multi_tenancy：多租户
- cost：成本
- operations：运维
- evolution：演进

场景题优先从真实高频面试模式中抽取，而不是凭空追求复杂。

## 9. Interview Bank 内容规范

Interview Bank 与 Knowledge Base 解耦。

题目进入题库必须尽量保存：

- company
- role
- round
- source_type
- source_url
- source_date
- verified
- frequency
- difficulty
- knowledge mappings
- scenario mappings

一题可映射多个 Knowledge Node。

## 10. 预制题解

V1 不运行时生成答案。

重点题解推荐：

1. 这道题在考什么
2. 30 秒回答
3. 完整题解
4. 生产实现
5. 常见错误回答
6. 项目如何结合（有真实案例时）
7. 大规模场景
8. 真实关联追问
