# Canonical Frequency Recalibration V0.3.4

> 本轮目标：停止使用“Spark 性能”“数据治理”这类宽泛主题频率，改成真正的 **Canonical Question（标准题）级 Evidence**。

## 1. 先修正一个覆盖缺口

V0.3.3 的 21 道 Canonical Candidate 拆细了 Spark、建模和 System Design，
但重新查看 32-source corpus 后发现遗漏了几类已经有强 Evidence 的题。

因此 V0.3.4 新增 8 个 Canonical Question：

- 数仓分层
- 数据质量与指标异常定位
- 数据治理
- Kafka 可靠性 / Lag
- Flink Exactly-once / Checkpoint / State
- 星型 vs 雪花
- 实时 vs 离线一致性
- OLAP 引擎选型

Canonical question 总数从 21 调整为 **29**。

---

## 2. 为什么这轮叫“保守重新校准”

现有 32 个牛客 Evidence 在 V0.3.2 只保存了：

```text
extracted_topic_candidates
```

例如：

```text
data_skew
spark_join
warehouse_layering
data_quality
```

这些标签能帮助定位候选题，但不能自动证明：

> “原始面试官一定以我们这道 Canonical Question 的方式问过。”

因此 V0.3.4 分成两层：

```text
Direct Verified
已经重新看到原始题目文本
→ 可以计频率
```

和：

```text
Structured Candidate Support
旧 Evidence 的 topic/tag 能对应到这道题
但还没有逐条重新审核原始问题
→ frequency contribution = 0
```

这比把 32 个旧标签全部自动算成“直接题频次”更可信。

---

## 3. 当前题级结果

| Canonical Question | Verified direct | Companies | Candidate support | Status | Answer-ready |
|---|---:|---:|---:|---|---|
| 数仓为什么要分层？ODS、DWD/DWM、DWS/ADS 等层分别解决什么问题？ | 6 | 3 | 11 | repeated_verified | ✅ |
| 如何建立数据质量体系？某个指标突然不准时如何快速定位到具体环节？ | 5 | 3 | 5 | repeated_verified | ✅ |
| 给定业务场景，如何确定事实表、维表和数据粒度？ | 4 | 4 | 6 | repeated_verified | ✅ |
| 数据治理应该从哪些方面展开？如何衡量治理效果？ | 4 | 4 | 4 | repeated_verified | ✅ |
| Data Lake 和 Data Warehouse 有什么区别？湖仓一体解决了什么问题？ | 4 | 3 | 2 | repeated_verified | ✅ |
| Spark 数据倾斜如何定位和解决？什么时候使用 Salting，salt 数量如何确定？ | 3 | 3 | 6 | repeated_verified | ✅ |
| Flink Exactly-once 如何实现？Checkpoint、State 与 Barrier 在其中分别做什么？ | 3 | 2 | 2 | repeated_verified | ✅ |
| Kafka 如何保证不丢、不重和可恢复？出现 Lag 或分区异常时如何排查？ | 3 | 2 | 1 | repeated_verified | ✅ |
| LEAD / LAG 适合解决哪些时序分析问题？如何写出正确的窗口 SQL？ | 2 | 2 | 4 | supported_verified | ✅ |
| Spark Broadcast Join 什么时候适用？如何结合表大小和 Executor 内存判断？ | 2 | 2 | 1 | supported_verified | ✅ |
| 星型模型和雪花模型有什么区别？分别适合什么场景？ | 2 | 1 | 1 | supported_verified | — |
| 面对大规模数据集，如何选择 Spark、流处理、仓库或湖仓方案？ | 1 | 1 | 4 | single_verified | — |
| 如何设计同时支持批处理和实时处理的数据平台？关键一致性与故障边界是什么？ | 1 | 1 | 3 | single_verified | — |
| OLAP 引擎如何选型？Doris、StarRocks、ClickHouse、Trino 等方案应该怎么比较？ | 1 | 1 | 2 | single_verified | — |
| Parquet 为什么适合分析型数据？列式存储相比行式/CSV 有什么优势和代价？ | 1 | 1 | 2 | single_verified | — |
| Spark Cache 和 Persist 有什么区别？什么时候缓存，什么时候释放？ | 1 | 1 | 2 | single_verified | — |
| 实时指标和离线指标不一致时如何判断谁对，并定位不一致原因？ | 1 | 1 | 1 | single_verified | — |
| SCD Type 1 和 Type 2 有什么区别？如何选择并实现？ | 1 | 1 | 1 | single_verified | — |
| CDC 和 SCD 分别解决什么问题？两者在数仓链路里是什么关系？ | 1 | 1 | 0 | single_verified | — |
| 对象存储 / Data Lake 缺少传统数据库约束时，如何保障数据完整性和一致性？ | 1 | 1 | 0 | single_verified | — |
| 从原始数据到可消费 Data Product，如何设计访问、处理、存储和数仓模型？ | 1 | 1 | 0 | single_verified | — |
| 事实数据部分到达或迟到时，数仓模型和下游指标如何处理？ | 1 | 1 | 0 | single_verified | — |
| 事实表和维表的主键、业务键应该怎么设计？ | 1 | 1 | 0 | single_verified | — |
| ETL 中某个 Join 突然变慢，如何从数据分布、执行计划和资源层定位？ | 1 | 1 | 0 | single_verified | — |
| Spark 的 Job、Stage、Task 如何划分？Shuffle 为什么形成 Stage 边界？ | 1 | 1 | 0 | single_verified | — |
| 数据量很大但 Spark 资源有限时，如何设计和优化处理链路？ | 1 | 1 | 0 | single_verified | — |
| Spark Repartition 和 Coalesce 有什么区别，生产中怎么选？ | 1 | 1 | 0 | single_verified | — |
| SQL 变慢时如何利用执行计划、索引和数据分布定位瓶颈？ | 1 | 1 | 0 | single_verified | — |
| 数据系统设计中如何处理高并发、容错、CAP 与存储选型？ | 1 | 1 | 0 | single_verified | — |

这里：

- `repeated_verified`：至少 3 条直接 Evidence，且跨至少 2 家公司；
- `supported_verified`：至少 2 条直接 Evidence；
- `single_verified`：目前只有 1 条直接 Evidence；
- `structured_candidate_support` **不参与频率计算**。

---

## 4. 第一批 Answer-ready

`Answer-ready` 不是“已经发布”，而是：

> Evidence 已经足够强，可以投入精力写一份高质量 Curated Answer（策划后的标准答案）。

当前筛出 **10 道**：

1. **数仓为什么要分层？ODS、DWD/DWM、DWS/ADS 等层分别解决什么问题？** — 6 条直接证据 / 3 家公司
2. **如何建立数据质量体系？某个指标突然不准时如何快速定位到具体环节？** — 5 条直接证据 / 3 家公司
3. **给定业务场景，如何确定事实表、维表和数据粒度？** — 4 条直接证据 / 4 家公司
4. **数据治理应该从哪些方面展开？如何衡量治理效果？** — 4 条直接证据 / 4 家公司
5. **Data Lake 和 Data Warehouse 有什么区别？湖仓一体解决了什么问题？** — 4 条直接证据 / 3 家公司
6. **Spark 数据倾斜如何定位和解决？什么时候使用 Salting，salt 数量如何确定？** — 3 条直接证据 / 3 家公司
7. **Flink Exactly-once 如何实现？Checkpoint、State 与 Barrier 在其中分别做什么？** — 3 条直接证据 / 2 家公司
8. **Kafka 如何保证不丢、不重和可恢复？出现 Lag 或分区异常时如何排查？** — 3 条直接证据 / 2 家公司
9. **LEAD / LAG 适合解决哪些时序分析问题？如何写出正确的窗口 SQL？** — 2 条直接证据 / 2 家公司
10. **Spark Broadcast Join 什么时候适用？如何结合表大小和 Executor 内存判断？** — 2 条直接证据 / 2 家公司

它们仍然全部：

```yaml
publishable: false
```

因为还没有写 Curated Answer。

---

## 5. 这次重新审核中看到的真实题型

### 数仓分层

多个来源不是只写“聊了数仓”，而是直接问：

```text
各层职责是什么？
完整数据流怎么走？
为什么要分层？
```

因此 `warehouse_layering` 可以独立成为 Canonical Question，而不能只作为“大数仓”标签。

### Flink Exactly-once

直接题已经覆盖：

```text
Exactly-once 如何实现
State 如何管理
Checkpoint Barrier 对齐 / 非对齐
实时任务如何保证精确一致性
```

所以应该形成独立 L5 主栈题。

### Kafka Reliability

直接题覆盖：

```text
如何不丢数据
如何避免重复
消费端怎么保证
Lag 严重怎么排查
Partition 数量变化影响什么
```

这与我们 DataRoadmap 的 Production First 学习方式高度吻合：
不是只背 `acks`，而是把 producer / broker / consumer / offset / lag / partition
放在一个端到端可靠性问题里。

### 数据质量与治理

面试并不只问“数据质量六要素”，而是经常给：

```text
DWS 指标突然不准
实时任务延迟
如何快速定位
血缘怎么追
质量监控怎么做
治理效果怎么衡量
```

这说明 Interview Bank 的答案应该偏 Production Troubleshooting，
而不是纯概念解释。

---

## 6. 频率现在能不能叫“行业高频”？

**还不能。**

V0.3.4 已经比 V0.3.2 严格很多，但仍有两个限制：

1. 原 32 个牛客 source 还没有 100% 全部重新打开做 question-level review；
2. 非牛客 corpus 仍然只有第一批来源。

所以本轮只输出：

```text
repeated_verified
supported_verified
single_verified
```

不输出最终 `high_frequency`。

---

## 7. 下一步 V0.3.5 — First Answer Slice

下一轮不继续大规模扩题。

先从 Answer-ready 中挑 **3–5 道最核心题**，真正写完整 Curated Answer，
用来验证我们的最终学习页面内容结构：

```text
这道题考什么
↓
30 秒回答
↓
完整原理
↓
Production 实现
↓
排查路径
↓
代码 / 配置
↓
常见错误回答
↓
项目真实关联
↓
Scale Lab
↓
真实追问
```

如果这一套内容密度合适，再批量推进第一批 30 道 Interview Bank。
