# Curated Answer Standard V0.3.5

> 用首批 5 道答案验证 DataRoadmap 最终 Interview 页面内容深度。

## 标准结构

```text
Question
↓
这道题在考什么
↓
30 秒回答
↓
完整原理
↓
Production 实现
↓
代码 / 配置
↓
故障排查
↓
常见错误回答
↓
项目怎么结合
↓
Scale Lab
↓
真实关联追问
```

不是每一题都机械填满每一节，但 Production 型题必须给出可执行的排查或架构逻辑。

### 30 秒回答
3–6 个关键句，必须能直接口述，不先讲历史背景。

### 完整原理
回答“为什么”，必要时用数据流、状态流或结构图。

### Production 实现
根据题目覆盖数据量、增量、并发、一致性、容错、SLO、可观测、成本、Backfill 或 Schema Evolution。

### 代码 / 配置
只在帮助理解时出现，不为了显得技术而塞无关代码。

### 故障排查
优先使用：

```text
症状 → 验证 → 缩小范围 → 根因 → 修复 → 验证
```

### 项目怎么结合
状态分为：
- `verified_project_fact`
- `needs_project_fact_check`
- `no_verified_project_anchor_yet`

绝不能把 Scale Lab 写成真实项目经历。

### Scale Lab
明确是“假设生产规模化练习”，用于训练 10x 流量、亿/十亿/百亿级数据、高并发、多租户、故障、成本和架构演进。

## V0.3.5 评审点

1. 一题是否过长？
2. 30 秒回答能否口述？
3. Production 深度是否足够高级岗位？
4. 代码密度是否合适？
5. Troubleshooting 是否有明确顺序？
6. Project Truthfulness 是否严格？
7. Scale Lab 与真实经历是否边界清楚？

评审通过后，再扩展第一批 30 道 Interview Bank。
