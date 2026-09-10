# Interview Corpus Expansion V0.3.2

> 目标：把 Seed Corpus 从 8 个独立面经来源扩展到 30+，第一次验证跨公司重复度与 provisional frequency（暂定频率）。

## Corpus

- 独立来源：**32**
- 本轮新增：**24**
- 公司/组织：**9**
- 当前来源平台：仍以牛客为主，因此还不能把 provisional frequency 当成最终行业频率。

### 公司分布

| Company | Independent sources |
|---|---:|
| Kuaishou | 8 |
| Didi | 7 |
| Tencent | 4 |
| ByteDance | 3 |
| JD | 3 |
| Baidu | 3 |
| Meituan | 2 |
| Alibaba | 1 |
| Alibaba Cloud | 1 |

## 第一次候选频率校准

| Candidate question cluster | Evidence | Companies | Recent 12m | Weighted score | Provisional |
|---|---:|---:|---:|---:|---|
| 数仓为什么要分层，各层职责和数据流如何设计？ | 17 | 7 | 8 | 15.20 | high_frequency_provisional |
| Spark 任务慢、Shuffle 或数据倾斜时如何定位和优化？ | 12 | 6 | 6 | 11.25 | high_frequency_provisional |
| 窗口函数、分组聚合与连续行为类 SQL 怎么写？ | 12 | 6 | 6 | 11.10 | repeated_provisional |
| 数据治理应从哪些方面展开，如何衡量治理效果？ | 12 | 7 | 5 | 11.00 | repeated_provisional |
| 如何建立数据质量体系，并在指标异常时快速定位问题？ | 10 | 6 | 5 | 9.30 | repeated_provisional |
| 维度建模如何设计，粒度、事实表和维表如何确定？ | 9 | 6 | 5 | 8.55 | repeated_provisional |
| 数据任务延迟、失败或产出异常时如何排查和恢复？ | 7 | 5 | 1 | 6.19 | emerging_provisional |
| Flink 的 Exactly-once、Checkpoint、状态与故障恢复如何实现？ | 6 | 4 | 5 | 6.00 | emerging_provisional |
| 数据湖、湖仓一体与传统数仓有什么区别，为什么做湖仓选型？ | 6 | 3 | 4 | 6.00 | emerging_provisional |
| Kafka 如何保证可靠消费，出现丢失、重复或 Lag 时如何处理？ | 5 | 4 | 3 | 4.70 | emerging_provisional |
| 实时与离线指标不一致时如何定位，并保证最终一致性？ | 5 | 2 | 3 | 4.30 | emerging_provisional |
| HDFS 读写流程、数据一致性以及节点故障如何处理？ | 5 | 5 | 3 | 4.25 | emerging_provisional |
| 数据量从 GB/TB 增长到十亿级、百亿级时，模型和计算链路如何演进？ | 4 | 4 | 3 | 3.85 | emerging_provisional |
| 星型模型和雪花模型有什么区别，分别适合什么场景？ | 3 | 2 | 2 | 2.85 | emerging_provisional |
| OLAP 引擎如何选型，Trino / Doris / ClickHouse / StarRocks 类方案怎么比较？ | 3 | 2 | 2 | 2.65 | emerging_provisional |
| 数据岗位中的 RAG / Agent / Skill 如何设计与评估？ | 2 | 1 | 2 | 2.00 | emerging_provisional |

## 如何解释这份结果

这次可以第一次回答“哪些题在不同公司反复出现”，但还不能把标签直接展示为最终行业高频。

原因：

1. 样本虽然已经超过 30 个独立面经，但主要来自单一平台。
2. 校招、实习、社招、高级岗位仍然混合，需要继续 role/seniority 分层。
3. 一些 cluster 目前仍偏宽，例如 `Spark performance` 同时覆盖倾斜、Shuffle、内存与 Join；正式题库会继续拆成 canonical questions。
4. 同一面经中的多个问题只证明该来源出现过对应考点，不代表这些问题之间彼此独立。

## V0.3.2 结论

Evidence 模型经 32-source corpus 验证后仍然成立。下一步不再盲目扩数量，而是做两件事：

- **来源多样性**：增加非牛客的一手/可追溯来源，降低平台偏差。
- **题目标准化**：把宽泛 cluster 拆成真正可发布的 canonical questions，例如 Spark 倾斜、Shuffle、内存分别成题。

## 发布边界

本轮所有 candidate question：

```yaml
publishable: false
```

直到完成 question-level evidence review、去重和答案策划后才进入正式 Interview Bank。
