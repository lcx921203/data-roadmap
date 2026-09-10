# Final Evidence Calibration V0.3.8

> V0.3.8 的目标不是宣布“行业绝对高频”，而是冻结 DataRoadmap 第一版可解释、可复算的题目级频率模型，并确定 Interview Bank V1 的首批 30 道题。

## 1. 本轮解决了什么

V0.3.4 仍有大量：

```text
structured_candidate_support
```

这些旧标签只能证明某个面经“涉及该主题”，不能证明某道 Canonical Question 确实被问过。

V0.3.8 继续重新打开可追溯原始面经，只把明确能看到原题/核心意图的记录提升为：

```text
direct_verified
```

未完成原题核验的旧 Topic：

```text
frequency contribution = 0
```

这个原则不再改变。

## 2. Corpus 状态

当前可追溯语料：

```text
32  个原 NowCoder corpus
10  个 V0.3.3 非 NowCoder 来源
4   个 V0.3.8 新增第一人称来源
-------------------------------
46  个 traceable sources
```

来源仍然不是完美行业抽样，因此 Frequency V1 的作用是：

> 在 DataRoadmap 当前真实可验证 corpus 内排序学习优先级。

不是：

> 宣称整个行业的绝对问法概率。

## 3. Frequency Band V1

### core_verified｜核心重复题

```text
Direct >= 5
AND
Company >= 3
```

当前语料里跨多个公司反复出现，第一优先级。

### repeated_verified｜多次重复题

```text
Direct >= 3
AND
Company >= 2
```

### supported_cross_company｜跨公司验证题

```text
Direct >= 2
AND
Company >= 2
```

### supported_single_company｜单公司重复题

```text
Direct >= 2
但 Company < 2
```

### single_verified｜真实单次题

```text
Direct = 1
```

仍然是真实面试题，只是不能叫“高频”。

## 4. 30 道 Interview Bank V1 Scope

| Rank | Canonical Question | Direct | Companies | Frequency | Answer |
|---:|---|---:|---:|---|---|
| 1 | 数仓为什么要分层？ODS、DWD/DWM、DWS/ADS 等层分别解决什么问题？ | 11 | 5 | core_verified | 已策划 |
| 2 | 如何建立数据质量体系？某个指标突然不准时如何快速定位到具体环节？ | 10 | 6 | core_verified | 已策划 |
| 3 | Spark 数据倾斜如何定位和解决？什么时候使用 Salting，salt 数量如何确定？ | 7 | 6 | core_verified | 已策划 |
| 4 | Data Lake 和 Data Warehouse 有什么区别？湖仓一体解决了什么问题？ | 6 | 4 | core_verified | 已策划 |
| 5 | 数据治理应该从哪些方面展开？如何衡量治理效果？ | 5 | 4 | core_verified | 已策划 |
| 6 | 给定业务场景，如何确定事实表、维表和数据粒度？ | 5 | 4 | core_verified | 已策划 |
| 7 | Flink Exactly-once 如何实现？Checkpoint、State 与 Barrier 在其中分别做什么？ | 4 | 2 | repeated_verified | 已策划 |
| 8 | 星型模型和雪花模型有什么区别？分别适合什么场景？ | 4 | 2 | repeated_verified | 待策划 |
| 9 | Spark Broadcast Join 什么时候适用？如何结合表大小和 Executor 内存判断？ | 3 | 3 | repeated_verified | 已策划 |
| 10 | Kafka 如何保证不丢、不重和可恢复？出现 Lag 或分区异常时如何排查？ | 3 | 2 | repeated_verified | 已策划 |
| 11 | OLAP 引擎如何选型？Doris、StarRocks、ClickHouse、Trino 等方案应该怎么比较？ | 3 | 2 | repeated_verified | 待策划 |
| 12 | LEAD / LAG 适合解决哪些时序分析问题？如何写出正确的窗口 SQL？ | 3 | 2 | repeated_verified | 已策划 |
| 13 | HDFS 读取一份文件时，Client、NameNode、DataNode 之间的完整流程是什么？ | 2 | 2 | supported_cross_company | 待策划 |
| 14 | Spark 的 Job、Stage、Task 如何划分？Shuffle 为什么形成 Stage 边界？ | 2 | 2 | supported_cross_company | 待策划 |
| 15 | SQL 变慢时如何利用执行计划、索引和数据分布定位瓶颈？ | 2 | 2 | supported_cross_company | 待策划 |
| 16 | 实时指标和离线指标不一致时如何判断谁对，并定位不一致原因？ | 2 | 1 | supported_single_company | 待策划 |
| 17 | CDC 和 SCD 分别解决什么问题？两者在数仓链路里是什么关系？ | 1 | 1 | single_verified | 待策划 |
| 18 | 对象存储 / Data Lake 缺少传统数据库约束时，如何保障数据完整性和一致性？ | 1 | 1 | single_verified | 待策划 |
| 19 | 如何设计同时支持批处理和实时处理的数据平台？关键一致性与故障边界是什么？ | 1 | 1 | single_verified | 待策划 |
| 20 | 从原始数据到可消费 Data Product，如何设计访问、处理、存储和数仓模型？ | 1 | 1 | single_verified | 待策划 |
| 21 | 事实数据部分到达或迟到时，数仓模型和下游指标如何处理？ | 1 | 1 | single_verified | 待策划 |
| 22 | 事实表和维表的主键、业务键应该怎么设计？ | 1 | 1 | single_verified | 待策划 |
| 23 | ETL 中某个 Join 突然变慢，如何从数据分布、执行计划和资源层定位？ | 1 | 1 | single_verified | 待策划 |
| 24 | 面对大规模数据集，如何选择 Spark、流处理、仓库或湖仓方案？ | 1 | 1 | single_verified | 待策划 |
| 25 | Parquet 为什么适合分析型数据？列式存储相比行式/CSV 有什么优势和代价？ | 1 | 1 | single_verified | 待策划 |
| 26 | SCD Type 1 和 Type 2 有什么区别？如何选择并实现？ | 1 | 1 | single_verified | 待策划 |
| 27 | Spark Cache 和 Persist 有什么区别？什么时候缓存，什么时候释放？ | 1 | 1 | single_verified | 待策划 |
| 28 | 数据量很大但 Spark 资源有限时，如何设计和优化处理链路？ | 1 | 1 | single_verified | 待策划 |
| 29 | Spark Repartition 和 Coalesce 有什么区别，生产中怎么选？ | 1 | 1 | single_verified | 待策划 |
| 30 | 数据系统设计中如何处理高并发、容错、CAP 与存储选型？ | 1 | 1 | single_verified | 待策划 |

## 5. 为什么新增 HDFS Read Path 作为第 30 道

V0.3.4 有 29 道 Canonical Question，但历史 Evidence 中 HDFS 明显被漏掉。

重新核验后至少有：

```text
Meituan
→ HDFS 读取流程

Alibaba Cloud
→ Client / NameNode / DataNode 完整读取链路
```

因此增加：

```text
iq-hdfs-read-path-001
HDFS 读取一份文件时，Client、NameNode、DataNode 的完整流程是什么？
```

它已经满足跨公司直接 Evidence，不是为了凑“30”人工造题。

DataNode 故障恢复暂时作为关联追问，不把两个独立机制再次混成一道人为大题。

## 6. 本轮几个重要提升

### 数仓分层

重新核验后继续出现于 ByteDance、Meituan、Tencent、Baidu、Didi 等来源，已经足够成为第一优先级主线。

### Spark 数据倾斜

除了 TikTok / EPAM / Kuaishou，本轮又确认了 Tencent、Meituan、ByteDance 的实际追问，且不只是“什么是倾斜”，还包括：

```text
Hot Key
Salting
几个热 Key 怎么处理
```

因此它继续作为 L5 Production 主栈题。

### 实时 / 离线一致性与 OLAP

Didi 2026 面经明确将：

```text
实时精确一致性
OLAP 选型
湖仓 vs 数仓
实时 / 离线指标不一致
```

作为独立问题，这说明这些不是我们为了项目栈自行添加的“高级话题”。

## 7. Publishable 的含义没有降低

V0.3.8 完成：

```text
Evidence Model
Canonical Question
Frequency Band
First 30 Selection
```

但“入选 First 30”不等于：

```yaml
publishable: true
```

当前 10 道已经有 Curated Answer，另外 20 道进入：

```text
selected_for_curation
```

发布仍然要求：

```text
Direct Evidence
+
Dedup
+
Curated Answer
+
Project Fact Check（仅在使用项目事实时）
```

## 8. V0.3 阶段结论

V0.3 Interview Evidence Model 可以关闭为产品模型里程碑。

后续新增面经只是在同一模型中持续：

```text
Capture
→ Normalize
→ Map
→ Recalculate
```

不需要继续修改 Evidence / Frequency 的底层设计。

接下来进入：

# V0.4 Design System

重点开始把已经稳定的 Content Model 变成真正的移动端产品界面。
