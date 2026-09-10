# Interview Corpus Seed V0.3.1

> 目的：用真实面经验证 Evidence → Normalize → Cluster → Frequency 数据模型。  
> 这不是最终高频榜，也不是正式发布题库。

## Seed 范围

首批纳入 8 个可追溯的牛客面经来源，覆盖：

- ByteDance / 字节跳动
- Meituan / 美团
- Tencent / 腾讯
- Alibaba / 阿里
- Alibaba Cloud / 阿里云

岗位以数据开发、大数据开发、数仓开发、大数据平台为主。

## 初步观察

在这 8 个独立来源里，已经出现明显重复的知识族：

| Candidate cluster | 独立 Evidence | 公司覆盖 |
|---|---:|---:|
| 数仓为什么要分层，各层职责和数据流如何设计？ | 6 | 3 |
| HDFS 读写流程以及 DataNode 故障时如何处理？ | 3 | 3 |
| 如何保证数仓数据质量，指标异常时如何定位？ | 3 | 2 |
| Spark 任务慢、Shuffle 或数据倾斜时如何定位和优化？ | 3 | 2 |
| Kafka 如何保证可靠消费，出现丢失、重复或 Lag 时如何处理？ | 3 | 2 |
| 数据治理应从哪些方面展开，如何衡量治理效果？ | 2 | 2 |
| Flink 的 Exactly-once、状态与故障恢复如何实现？ | 2 | 1 |
| 星型模型和雪花模型有什么区别，分别适合什么场景？ | 2 | 1 |

## 重要限制

这些数字只能说明“在当前 8 个 seed source 中重复出现”，不能直接宣称为行业高频。

原因：

1. Corpus 很小。
2. 公司分布不均。
3. 目前主要来自牛客。
4. 校招 / 实习 / 社招混合。
5. 一些相近问题还需要人工判断是否应拆分，例如：
   - Flink Exactly-once
   - Flink Checkpoint
   - Flink 状态管理
   - Flink 实时数据准确性

## 下一轮采集目标

扩大到至少 30 个独立面经来源，并改善来源多样性：

- 字节
- 阿里 / 阿里云
- 美团
- 腾讯
- 快手
- 京东
- 滴滴
- 百度
- 其他高相关数据平台团队

同时按 role 分层：

- Data Engineer
- Big Data Engineer
- Data Warehouse Engineer
- Data Platform Engineer
- Data Architect

达到 30+ 独立来源后，再第一次校准 frequency percentile。

## 当前结论

V0.3 Evidence 模型可以工作：

```text
Source
↓
Evidence
↓
Topic extraction
↓
Candidate cluster
↓
Independent count
↓
Company coverage
↓
Frequency calibration later
```

因此可以继续扩大 corpus，而不是回头重做数据模型。
