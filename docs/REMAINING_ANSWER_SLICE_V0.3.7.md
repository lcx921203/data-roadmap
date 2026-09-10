# Remaining Answer Slice V0.3.7

> V0.3.6 已冻结 Interview Answer V1。V0.3.7 不再改模板，而是完成 V0.3.4 剩余 5 道 Answer-ready 内容。

## 本轮完成

新增完整 Curated Answer：

1. 数据治理应该怎么做、如何衡量效果
2. Data Lake vs Data Warehouse / Lakehouse
3. Kafka 端到端可靠性与 Lag 排查
4. SQL LEAD / LAG
5. Spark Broadcast Join

加上 V0.3.5 的 5 道，当前：

```text
Answer-ready questions = 10
Curated answers        = 10
```

## 内容校准结果

这五道继续遵守 Answer V1：

```text
30 秒回答
→ 核心原理
→ Production
→ Troubleshooting
→ Code / Config（必要时）
→ 常见错误
→ Project Truthfulness
→ Scale Lab
→ 真实追问
```

其中 SQL 题刻意比 Kafka / Spark / Governance 短。

这是设计目标：

> L4/L5 深度由问题决定，不为了模板把所有题写成一样长。

## Evidence 状态

V0.3.7 没有把旧的 `extracted_topic_candidates` 自动升级成 Direct Evidence。

当前规则继续是：

```text
重新核对到原始问题
→ direct_verified
→ 可计频率

只有旧 topic/tag
→ candidate_support
→ frequency contribution = 0
```

因此本轮完成的是：

```text
10 / 10 Answer-ready 已有 Curated Answer
```

而不是：

```text
所有历史 Evidence 已 100% 完成题目级复核
```

后者继续保留到下一轮处理。

## 下一步

V0.3.8：

```text
Historical Evidence Re-open
↓
Canonical-level Mapping
↓
Final Frequency Calibration
↓
First 30 Selection
```

完成后才第一次允许把足够证据的题标成正式发布候选。
