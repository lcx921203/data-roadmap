# Canonical Question Refinement V0.3.3

> 目标：把 V0.3.2 的宽泛 Candidate Cluster 拆成可以真正学习、去重、挂 Evidence、写标准答案的 Canonical Interview Question（标准面试题）。

## 1. 为什么必须拆

V0.3.2 有这样的宽题：

```text
Spark 任务慢、Shuffle 或数据倾斜时如何定位和优化？
```

这个问题实际上混合了多个不同考点：

```text
数据倾斜
Salting
Repartition / Coalesce
Broadcast Join
Job / Stage / Task
Cache / Persist
大规模有限资源处理
Join 突然变慢的故障定位
```

如果把它们放成一道题：

- Evidence 会被错误合并；
- “高频”会被夸大；
- 学习内容过长；
- 面试追问无法建立清晰关系。

所以 V0.3.3 引入 `canonical intent`。

---

## 2. Question Evidence 的四档映射

```text
direct_question
来源明确写出面试官问了这个核心问题
        ↓
direct_followup
来源明确写出这是实际追问
        ↓
round_topic
只知道该轮谈了这个主题
        ↓
editorial_inference
编辑推断
```

只有：

```text
direct_question
direct_followup
```

可以直接参与 Canonical Question 的频率计算。

`round_topic` 只能说明这个方向值得继续搜索，不能拿来证明“这道题被问过”。

---

## 3. 本轮新增来源多样性

V0.3.2 的 32 个 source 全部来自牛客。

V0.3.3 新增 **10 个非牛客第一人称/可追溯来源**：

- LeetCode Discuss
- Reddit r/dataengineering
- Reddit r/dataengineersindia
- Reddit r/dataengineeringjobs

覆盖：

- TikTok
- Amazon
- Meta
- Uber
- Salesforce
- EPAM
- 匿名 Senior Data Engineer 技术面

这些新增来源的目的不是立刻改写总频率榜，而是验证同一个 canonical intent 在不同平台、公司和地区是否仍然存在。

---

## 4. 第一批 Canonical Candidates

本轮生成 **21 道标准题候选**。

### Spark

1. Spark 数据倾斜如何定位？什么时候使用 Salting，如何决定 salt 数量？
2. Repartition 和 Coalesce 怎么选？
3. Broadcast Join 怎么判断是否适用？
4. Job / Stage / Task 如何划分？
5. Cache 与 Persist 怎么选？
6. 大数据量、有限资源时怎么优化 Spark？
7. Join 突然变慢怎么排查？

### 数仓 / 建模

8. 如何确定事实表、维表和粒度？
9. 主键 / 业务键怎么设计？
10. 部分到达 / 迟到数据怎么处理？
11. SCD Type 1 / Type 2 怎么选？
12. CDC 和 SCD 是什么关系？

### Lakehouse / Storage

13. Data Lake 与 Data Warehouse 有什么区别？
14. Data Lake 如何保障完整性和一致性？
15. Parquet 为什么适合分析型数据？

### SQL

16. LEAD / LAG 如何解决时序分析？
17. SQL 性能如何用执行计划、索引、数据分布排查？

### Data Platform / System Design

18. 如何设计 Batch + Realtime 数据平台？
19. 如何设计从原始数据到 Data Product 的完整系统？
20. 如何处理并发、容错、CAP 和存储选型？
21. 大规模数据集如何做技术选型？

---

## 5. Evidence 示例

### Spark Data Skew / Salting

TikTok 的第一轮 Data Engineer 面试给出了热门商品导致分区不均的实际场景，要求候选人说明如何通过 Salting 分散负载，并继续追问 salt 数量和性能影响。

EPAM Senior Data Engineer / Tech Lead 面试也直接问到：

- Spark Salting
- Data Skew
- Repartition vs Coalesce
- Broadcast Join
- Job / Stage / Task
- Cache vs Persist

因此 `Spark Performance` 不应该保留成一整个大题，而应该拆成多个 canonical intents。

### Data Modeling

Amazon DE2 的 onsite 明确包含：

- 大规模 ETL 技术选型
- SQL 性能调优
- Fact / Dimension 建模
- Primary Key
- Partial Data

Amazon Senior DE 也把 Data Modeling、Normalization / Denormalization、ETL Workflow 与 Big Data Performance 分成独立考察面。

### Data Platform Design

Uber 面经把 Spark / SQL / Scaling 和 System Design 分成独立轮次，并追问大规模有限资源、并发、容错和 CAP。

Salesforce 的 Big Data / Design 面试则出现 Flink、Spark、Iceberg、Kubernetes，以及 Batch + Realtime 数据平台设计。

---

## 6. 发布状态

虽然现在已经出现非常强的真实 Evidence，但本轮仍然：

```yaml
publishable: false
```

因为还缺最后两件事：

```text
现有 32-source corpus 的 question-level 重新映射
+
Curated Answer（预写标准答案）
```

所以 V0.3.3 是：

```text
Broad Cluster
      ↓
Canonical Intent
      ↓
Direct Evidence
      ↓
下一轮重新计算 Canonical Frequency
```

而不是直接发布题库。

---

## 7. 下一步 V0.3.4

下一轮做 **Canonical Frequency Recalibration**：

1. 把现有 32 个牛客 Evidence 从 topic-level 重新映射到 canonical-level；
2. direct / topic-only 分开；
3. 同一来源同一 canonical intent 只计一次；
4. 合并本轮 LeetCode / Reddit Evidence；
5. 重新计算每一道标准题真正的 independent count；
6. 选出第一批 `answer_ready` 题；
7. 暂时仍不写 30 道答案，先挑最高价值的一小批验证答案模板。

