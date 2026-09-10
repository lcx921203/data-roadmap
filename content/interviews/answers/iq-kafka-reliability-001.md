---
id: iq-kafka-reliability-001
type: interview
question: "Kafka 如何保证不丢、不重和可恢复？出现 Lag 或分区异常时如何排查？"
domain: kafka
learning_depth: L5
answer_format_version: "1.0"

evidence:
  direct_independent_count: 3
  direct_company_count: 2

frequency:
  status: repeated_verified
  final_industry_frequency: false

verification:
  question_intent_reviewed: true
  dedup_reviewed: true
  answer_curated: true
  content_review_status: v0_3_7
  publishable: false

project_connection:
  status: needs_project_fact_check

technical_references:
  - https://kafka.apache.org/40/design/design/
  - https://kafka.apache.org/40/configuration/producer-configs/

status: answer_ready
---

# Kafka 如何保证不丢、不重和可恢复？

## 这道题在考什么

这题要避免一句：

> `acks=all` 就不会丢。

端到端可靠性至少分成：

```text
Producer
↓
Broker
↓
Consumer
↓
Downstream Sink
```

“不丢”“不重”“可恢复”在每一段的含义不同。

## 30 秒回答

Kafka 的可靠性要端到端看。Producer 侧通过 `acks=all`、重试和 Idempotent Producer（幂等生产者）降低丢失与重复；Broker 侧依赖副本、ISR 和提交语义保证已确认记录的持久性；Consumer 侧关键是处理结果与 Offset 提交顺序，通常先确保业务处理成功，再提交消费位点。

如果 Consumer 在处理成功后、提交 Offset 前故障，会重放，因此下游还需要幂等键、事务或去重。Kafka 的 Transaction 可以为 Kafka 内部读写链路提供更强的原子语义，但写外部数据库时不能自动获得端到端 Exactly-once。Lag 排查则要区分生产速率上升、Consumer 处理变慢、Rebalance、Hot Partition、下游慢或资源瓶颈。

## 核心原理

### Producer

风险：

```text
send
↓
网络超时
↓
Producer 不知道 Broker 到底收没收到
↓
retry
```

这可能制造重复。

Idempotent Producer 通过 Producer ID 和 Sequence Number 让 Broker 对重试进行去重。

Kafka 也支持 Transaction，将多个 Partition 的写入作为一个事务提交。

### Broker

核心是副本和已提交记录。

生产环境关注：

```text
replication.factor
acks
min.insync.replicas
ISR
unclean leader election policy
```

不要孤立调一个参数。

例如 `acks=all` 只有在副本和 ISR 策略合理时才有意义。

### Consumer

最重要的边界：

```text
Poll Record
↓
Business Processing
↓
Downstream Write
↓
Commit Offset
```

如果：

```text
先 Commit Offset
再写下游
```

中间故障可能造成数据丢失。

如果：

```text
先写下游
再 Commit Offset
```

中间故障可能重放，因此下游必须能处理重复。

## Production 实现

常见策略：

```text
At-least-once consumption
+
Business Idempotency
```

例如订单事件：

```text
event_id = globally stable id
```

下游：

```sql
insert into processed_event(event_id, ...)
```

以唯一键 / Upsert 保证重复事件不会重复产生业务效果。

如果 Kafka → Kafka，可以结合 Transaction 和 `read_committed` 语义构建更强的一致处理。

如果 Kafka → MySQL / 外部 API，则需要：

- 幂等业务键；
- Transactional Outbox / Inbox；
- 去重表；
- Sink 自身事务能力。

## Lag 排查路径

```text
Lag 上升
↓
Producer Rate 是否突然升高？
↓
所有 Partition 都涨还是少数 Partition？
↓
Consumer 是否发生 Rebalance？
↓
Processing Time / Poll Loop 是否变慢？
↓
GC / CPU / Network 是否异常？
↓
下游 DB / API / Sink 是否变慢？
↓
是否 Hot Partition？
```

### 所有 Partition 同时上涨

更像：

- Consumer 总吞吐不足；
- 下游慢；
- 集群资源不足。

### 少数 Partition 上涨

更像：

- Key 分布不均；
- Hot Partition；
- 某些 Partition Leader / Broker 异常。

### Lag 周期性尖峰

可能：

- Batch Sink 周期阻塞；
- GC；
- Checkpoint；
- Rebalance；
- 流量周期。

## 配置示例

示意而不是固定生产标准：

```properties
acks=all
enable.idempotence=true
```

Kafka 当前版本文档中，事务生产还通过 `transactional.id` 配置事务身份。具体超时、批量、压缩、副本等参数要结合版本和业务 SLO。

## 分区数量变化的风险

增加 Partition 能提高并行度，但要注意：

```text
同一个 Key
在 Partition 数改变后
未来消息可能映射到新的 Partition
```

如果业务强依赖跨扩容前后的 Key 顺序，需要提前设计迁移策略，而不能把“加 Partition”当成无成本扩容。

## 常见错误回答

- “acks=all 就绝对不丢。”
- “Kafka Exactly-once 会让外部数据库天然不重复。”
- “Lag 大就加 Consumer。”
- “Partition 越多越好。”
- “Offset 提交成功就说明业务处理成功。”

## 项目怎么结合

如果北美项目真实存在 MySQL CDC → Kafka 链路，这题非常适合挂接。但项目发布前要确认：

- Producer / CDC Connector 的保证；
- Consumer 是 Spark、Flink 还是其他；
- Offset 在哪里管理；
- Delete / Update 怎么处理；
- 下游如何幂等；
- 是否真实遇到 Lag / 重放。

## Scale Lab

假设：

```text
1M events/s
200 partitions
某一个用户 Key 占 20%
```

即使总 Consumer 数量足够，也可能被单 Partition 吞吐上限卡住。

此时要讨论：

- Key 设计；
- Partition 数；
- 热点拆分；
- Consumer Parallelism；
- Broker 磁盘/网络；
- Lag SLO；
- Rebalance 风险。

## 真实关联追问

1. `acks=all` 和 `min.insync.replicas` 什么关系？
2. Idempotent Producer 如何去重重试？
3. Consumer Offset 为什么会造成重复或丢失？
4. Kafka Transaction 能保证 MySQL Exactly-once 吗？
5. Lag 突然上升怎么判断是 Broker 还是 Consumer？
6. 增加 Partition 为什么可能影响顺序？
