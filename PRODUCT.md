# PRODUCT.md

# DataRoadmap

> From Data Engineering to AI

## 1. 产品定位

DataRoadmap 是一个围绕现代数据工程、数据平台、数据架构和 AI Data Agent 构建的生产导向学习与面试产品。

核心目标不是让用户“看完很多课程”或“刷完很多题”，而是形成下面的能力闭环：

```text
Understand
理解技术
   ↓
Connect
建立系统关联
   ↓
Build
理解生产实现
   ↓
Scale
解决复杂规模问题
   ↓
Explain
应对真实面试
```

## 2. 产品不是围绕单一项目构建

三个真实项目是 `Project Cases（项目案例）`，不是知识边界。

知识范围由三个因素共同决定：

```text
项目相关度
+
真实面试频率
+
目标岗位价值
        ↓
Learning Depth
学习深度
```

因此：

- 项目使用 Iceberg → Iceberg 深学。
- Hudi / Delta Lake / Paimon → 不重复深学，重点横向比较与选型。
- SQL / Spark / Flink / Kafka 等高频基础能力，即使某个项目没有突出展示，也必须深入。
- SLO、容量规划、多租户、可观测等生产能力，即使小规模项目没有完整经历，也需要系统学习。

## 3. 四类核心内容资产

### Knowledge Base

回答：

> 我应该懂什么？真实生产系统通常怎么做？

### Project Cases

回答：

> 我的三个项目实际上做过什么？这些知识在哪里落地？

项目案例必须保持事实边界，不把生产方案包装成真实项目经历。

### Scale Lab

回答：

> 当数据量、吞吐、并发、稳定性要求扩大后，系统会发生什么？应该如何设计、排障和演进？

这是弥补中小规模项目复杂度不足的正式训练层，不属于“虚构项目经历”。

### Interview Bank

回答：

> 企业真实面试到底在问什么？

题目优先来自真实企业面经、候选人复盘和高可信公开面试资料。

## 4. Learn 与 Interview

Learn Mode 和 Interview Mode 使用同一套知识体系，但不是互相生成。

```text
Knowledge Map
      │
 ┌────┴────┐
 │         │
Learn   Interview
 │         │
知识理解   真实题目
生产实现   预制题解
规模训练   高频排序
```

Interview Bank 通过标签映射到 Knowledge Base。

**禁止为了填满一个知识点而自动编造大量面试题。**

## 5. Production First

正文默认顺序：

```text
技术原理
   ↓
Production Pattern
真实生产实现
   ↓
Scale / Failure / Cost / Operations
   ↓
Project Case
真实项目映射
   ↓
Real Interview
真实面试验证
```

Demo / 项目实现不是标准答案。

## 6. 项目与大规模系统的边界

真实项目只回答：

- 真实业务背景
- 实际架构
- 实际解决的问题
- 已实现能力
- 当前边界

Scale Lab 独立回答：

- 如果数据量 ×10 / ×100 会怎样
- 如果吞吐突然上涨会怎样
- 如果出现严重积压会怎样
- 如果需要大范围 Backfill 会怎样
- 如果并发 Writer / Query 增加会怎样
- 如果需要多租户隔离会怎样
- 如果要求更严格 SLO 会怎样
- 如果故障、成本、可观测要求升级会怎样

## 7. V1 不接 AI 实时回答

V1 面试体验：

```text
Question
   ↓
Think
   ↓
Reveal Answer
   ↓
30 秒回答
   ↓
完整题解
   ↓
生产实现
   ↓
真实追问
   ↓
规模化场景
```

所有标准题解提前制作和审核。

未来 AI 可用于后台内容生产辅助，例如：

- 面经抽取
- 相似题聚类
- 标签建议
- 去重
- 来源整理

但不作为 V1 用户端答案来源。

## 8. V1 产品原则

- Production First
- Content as Code
- Git as CMS
- Static First
- Mobile First
- Quality over Quantity
- Real Interview over Generated Questions
- Project Evidence ≠ Production Claim
