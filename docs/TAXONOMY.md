# DataRoadmap Content Taxonomy V0.2

> 主栈深学，同类横向对比；Production First；Project Case 只做真实经验锚点；Scale Lab 独立训练大规模复杂度；Interview Bank 由真实面经校准。

## 学习深度

- L5 Core Stack：主栈深学。原理、生产实现、代码/配置、性能/故障、源码关键路径、Scale Lab、项目案例、真实高频面试题。
- L4 Deep Production：高级岗位生产重点。深入机制、容量、稳定性、成本、可观测、故障恢复。
- L3 Working Knowledge：能够使用、解释机制、处理典型问题。
- L2 Comparison：横向对比。核心思想、优缺点、适用场景、选型。
- L1 Awareness：了解定位和基本用途。

优先级由以下三类信号共同决定：

```text
Project Relevance
项目相关度
+
Interview Evidence
真实面试证据
+
Role Relevance
岗位价值
↓
Learning Depth
```

---

# 00｜Data Engineering Foundations
数据工程基础

## 00.01 SQL — L5 / foundation
- JOIN
- 聚合
- Window Function
- CTE / Subquery
- NULL 语义
- 去重
- TopN
- 留存 / 漏斗 / 同比环比
- Join 与聚合性能
- 执行计划
- 分区裁剪
- Predicate Pushdown
- 大表 Join
- SQL 工程规范

## 00.02 Python for Data Engineering — L4 / foundation
- 基础数据结构
- Iterator / Generator
- Decorator
- Context Manager
- Exception
- Type Hint
- Dataclass
- Serialization
- Logging
- Retry / Backoff
- Idempotency
- 测试
- 数据工程脚本工程化

## 00.03 Linux & Runtime Basics — L3
- 进程 / 线程
- CPU / Memory / Disk / Network
- 文件系统
- 日志
- 环境变量
- JVM 基础
- Container 基础

## 00.04 Distributed Systems Fundamentals — L4
- Partition
- Replication
- Consistency
- Availability
- Fault Tolerance
- Leader / Follower
- Quorum
- Retry
- At-least-once / At-most-once / Exactly-once
- Backpressure
- State
- Checkpoint
- Event Time / Processing Time

## 00.05 Storage & File Formats — L4
- Row vs Columnar
- Parquet — L4
- ORC — L2/L3
- Compression
- Encoding
- Statistics
- Predicate Pushdown
- Partitioning
- Small Files

## 00.06 HDFS / Hive Background — L3
- HDFS：NameNode / DataNode / Block / Replication / Read / Write / HA
- Hive：Metastore / Partition / Bucket / External / Managed Table
- 传统 Hive Table 的限制
- 为什么现代项目引入 Lakehouse Table Format

---

# 01｜Data Ingestion & Messaging
数据接入与消息系统

## 01.01 Data Source Patterns — L3
- OLTP
- SaaS
- Log / Event
- Batch File
- API
- Full Snapshot vs Incremental

## 01.02 CDC — L5 / core
- Snapshot + Incremental
- Insert / Update / Delete
- Offset / Position
- Out-of-order
- Late Arrival
- Duplicate / Deduplication
- Idempotency
- Schema Change
- Reprocessing
- Delete 语义
- End-to-end Consistency
- 失败恢复
- Observability
- Retry / DLQ
- Backfill 与实时链路并存

## 01.03 Kafka — L5 / core
- Broker / Topic / Partition
- Producer / Consumer / Consumer Group
- Offset
- Partition Ordering
- Key 设计
- ISR / Ack
- Delivery Semantics
- Rebalance
- Lag
- Throughput
- Retention
- Compaction
- Hot Partition
- Backlog
- Capacity
- 故障与恢复

## 01.04 Batch Ingestion — L3
- Full Load
- Incremental Load
- Partition-based ingestion
- Backfill
- Replay

## 01.05 Schema Management — L4
- Schema Compatibility
- Breaking Change
- Producer / Consumer 演进
- Data Contract

---

# 02｜Compute Engines
计算引擎

## 02.01 Spark — L5 / core

### Architecture
- Driver
- Executor
- Cluster Manager
- Application / Job / Stage / Task
- DAG

### Execution
- Narrow / Wide Dependency
- Shuffle
- Partition
- Serialization
- Cache / Persist
- Broadcast

### Spark SQL
- DataFrame / Dataset
- Catalyst Optimizer
- Physical Plan
- Join Strategy
- Broadcast Hash Join
- Sort Merge Join
- AQE
- Predicate Pushdown
- Partition Pruning

### Performance
- Data Skew
- Shuffle Pressure
- Memory / Spill
- Executor sizing
- Parallelism
- Small Files
- Large Task
- OOM
- Straggler

### Structured Streaming
- Micro-batch
- Checkpoint
- Watermark
- State
- Exactly-once 语义边界
- Late Data

### Production
- Backfill
- Resource Isolation
- Retry
- Observability
- Capacity Planning

## 02.02 Flink — L5 / core

### Architecture
- JobManager
- TaskManager
- JobGraph / ExecutionGraph
- Operator
- Operator Chain
- Parallelism

### Stream Semantics
- Event Time
- Processing Time
- Watermark
- Window
- Timer

### State
- Keyed State
- Operator State
- State Backend
- State TTL

### Fault Tolerance
- Checkpoint
- Savepoint
- Barrier
- Exactly-once
- Restart Strategy

### Performance
- Backpressure
- Hot Key
- Large State
- Checkpoint Slow
- Network / Serialization

### Production
- Kafka → Flink → Sink
- Data Accuracy
- State growth
- Recovery
- Scaling
- Backfill / Replay
- Observability

## 02.03 Spark vs Flink — L3 / comparison
- Batch / Stream 模型差异
- Latency
- State
- Fault tolerance
- 运维复杂度
- 适用场景

---

# 03｜Data Warehouse Modeling
数仓建模

## 03.01 Data Warehouse Architecture — L4
- ODS / DWD / DWS / ADS
- 分层目的
- 公共中间层
- Data Mart
- 传统数仓与现代建模工程的关系

## 03.02 Dimensional Modeling — L5 / core
- Grain
- Fact Table
- Dimension Table
- Transaction Fact
- Periodic Snapshot
- Accumulating Snapshot
- Star Schema
- Snowflake Schema
- Degenerate Dimension
- Conformed Dimension
- SCD Type 1 / 2
- Bridge Table
- Many-to-many
- Date Dimension

## 03.03 Metric Modeling Basics — L4
- Measure
- Metric
- Dimension
- Entity / Business Key
- 指标口径
- 指标重复定义
- 指标一致性
- Metric Ownership

## 03.04 Modeling Quality — L4
- Grain correctness
- Duplicate
- Null
- Referential Integrity
- Reconciliation
- Source-to-model consistency
- Model Contract

---

# 04｜Lakehouse & Query Engine
湖仓与查询引擎

## 04.01 Why Lakehouse — L4
- Data Lake vs Data Warehouse
- Hive Table 的局限
- Table Format
- ACID
- Snapshot
- Schema Evolution
- Time Travel

## 04.02 Apache Iceberg — L5 / core

### Metadata Tree
- Table Metadata
- Metadata JSON
- Snapshot
- Manifest List
- Manifest File
- Data File
- Delete File

### Snapshot & Commit
- Snapshot lifecycle
- Atomic Commit
- Optimistic Concurrency
- Conflict Detection
- Retry
- Forward Fix

### Partition
- Partition Spec
- Hidden Partitioning
- Partition Evolution
- Partition Pruning

### Schema
- Schema Evolution
- Field ID
- Compatible / Breaking Change

### Write
- Append
- Overwrite
- Merge / Row-level operations
- Write Ordering
- Distribution Mode
- Writer path

### Read
- Metadata pruning
- Partition pruning
- File pruning
- Statistics

### Maintenance
- Compaction
- Rewrite Data Files
- Manifest Rewrite
- Snapshot Expiration
- Orphan File Cleanup
- Small Files

### Reliability
- Concurrent Writers
- Failed Commit
- Partial Failure
- Recovery

### Production
- Metadata growth
- File sizing
- Commit contention
- High-throughput ingestion
- Observability
- Cost

### Source Code Learning
仅在真正帮助理解时深入：
- commit
- writer
- distribution
- ordering

## 04.03 Trino — L5 / core
- Coordinator / Worker
- Catalog / Connector
- Query Planning
- Split
- Stage / Task
- Predicate Pushdown
- Partition Pruning
- Iceberg Connector
- Join
- Memory / Spill
- Concurrency
- Query Queue
- Resource Group
- Failure
- Query Observability

## 04.04 Lakehouse Table Format Comparison — L2
### Hudi
- 核心设计
- Upsert / CDC
- MOR / COW
- 适用场景

### Delta Lake
- Transaction Log
- 生态特点
- 适用场景

### Paimon
- Streaming-first
- 主键 / 更新场景
- 适用场景

必须能回答：
- Iceberg vs Hudi
- Iceberg vs Delta Lake
- Iceberg vs Paimon
- 批为主 / 流为主 / 更新密集分别如何选

---

# 05｜dbt Modeling Engineering
dbt 建模工程

## 05.01 dbt Core Concepts — L5
- Project
- Profile
- Source
- Model
- ref()
- source()
- Dependency Graph
- Materialization

## 05.02 Materialization — L5
- View
- Table
- Incremental
- Ephemeral
- Incremental Strategy
- Unique Key
- Idempotency
- Late-arriving data
- Backfill

## 05.03 Tests & Contracts — L5
- not_null
- unique
- relationships
- accepted_values
- custom tests
- source freshness
- contracts
- reconciliation

## 05.04 Macros & Reuse — L4
- Jinja
- Macro
- DRY
- Environment
- Adapter abstraction

## 05.05 Documentation & Metadata — L4
- manifest
- catalog
- docs
- lineage metadata
- DataHub integration

## 05.06 dbt vs Traditional ETL Modeling — L3
- 工程化
- 依赖
- 测试
- 文档
- CI
- 为什么 dbt 不是调度器

---

# 06｜Semantic Layer
语义层

## 06.01 Why Semantic Layer — L5
- 指标口径重复
- SQL 复制
- BI / App / Agent 一致性
- Semantic Query
- Governance connection

## 06.02 Semantic Model — L5
- Entity
- Dimension
- Measure
- Time Dimension
- Primary / Foreign / Unique Entity

## 06.03 Metrics — L5
- Simple Metric
- Ratio Metric
- Derived Metric
- Cumulative Metric
- Conversion Metric
- Metric dependency

## 06.04 Join Graph — L5
- Entity-based Join
- n:1
- 1:n 风险
- Multiple Join Paths
- Ambiguous Path
- Fan-out
- Grain

## 06.05 Time Semantics — L4
- Metric Time
- Time Spine
- Granularity
- Window

## 06.06 Validation & Reconciliation — L5
- Metric validation
- Semantic tests
- Reconciliation
- Source vs semantic result
- Conversion metric validation

## 06.07 Semantic Serving — L4
- Semantic API
- BI consumption
- Agent consumption
- Serving table connection
- Caching

## 06.08 Other Semantic Layers — L2
- Looker semantic concepts
- Cube semantic concepts
- 差异与选型

---

# 07｜Orchestration & Data Quality
编排与数据质量

## 07.01 Dagster — L5 / core
- Asset
- Asset Key
- Dependency
- Materialization
- Asset Graph
- Definitions
- Resource
- IO Manager
- Config
- Schedule
- Sensor
- Automation Condition
- Partition
- Backfill
- Partition Mapping
- Retry
- Failure hook
- Partial rerun
- Idempotency
- Event Log
- Asset status
- Run status
- Production deployment
- concurrency
- queueing
- Postgres runtime metadata store

## 07.02 Data Quality — L5
- Schema tests
- Freshness
- Completeness
- Uniqueness
- Referential Integrity
- Business Rule
- Reconciliation
- Data Contract
- Quality as Asset
- Quality metadata

## 07.03 Airflow — L2/L3
- DAG
- Task
- Scheduler
- Operator
- Sensor
- 与 Dagster Asset 模型的差异
- 适用场景

---

# 08｜Data Governance
数据治理

## 08.01 Metadata Fundamentals — L4
- Technical Metadata
- Business Metadata
- Operational Metadata
- Ownership
- Domain
- Glossary

## 08.02 DataHub — L5 / core
- Metadata Model
- Dataset
- Schema
- Domain
- Ownership
- Tag
- Glossary
- Usage
- Quality
- Search

## 08.03 Metadata Ingestion — L5
- dbt manifest / catalog
- Warehouse metadata
- Query metadata
- Pipeline metadata
- Incremental ingestion
- Metadata freshness

## 08.04 Lineage — L5
- Table-level Lineage
- Field-level Lineage
- SQL Parsing
- dbt lineage
- Query log lineage
- Automatic lineage
- Manual lineage boundary

## 08.05 Governance Operations — L4
- Ownership lifecycle
- Domain management
- Certification
- Data quality integration
- Change impact
- Schema evolution impact

## 08.06 DataHub vs Alternatives — L2
- OpenMetadata
- Apache Atlas
- 定位、生态、场景与选型

---

# 09｜Serving & OLAP
数据服务与 OLAP

## 09.01 Serving Layer — L5
- Serving Table
- Precomputation
- Materialization
- Freshness
- Latency
- Query Cost
- Historical data
- Update strategy
- Serving Table vs Cache

## 09.02 Query Serving with Trino — L4
- Interactive Query
- Concurrency
- Resource Group
- Query SLA
- Semantic Query connection

## 09.03 Doris — L4/L5
- OLAP 表模型
- Duplicate / Unique / Aggregate Key
- 写入
- 更新 / Delete 语义
- 分区 / 分桶
- 查询加速
- Materialized View
- Serving 场景
- 与 Lakehouse Serving 的关系

## 09.04 Cache — L4
- Cache Aside
- TTL
- Invalidation
- Freshness
- Hot key
- Serving Table vs Cache

## 09.05 ClickHouse — L2
- 列式 OLAP 定位
- 核心优势
- 与 Doris / Trino 的适用场景差异

---

# 10｜AI Data Agent
AI 数据智能体

## 10.01 Agent Architecture — L5
- User Request
- Context
- Intent
- Planner
- Router
- Executor
- Tool Registry
- Response

## 10.02 Planning Modes — L4
- ReAct
- Plan-and-Execute
- Hybrid
- 适用场景

## 10.03 Tools — L5
- Semantic Query Tool
- Metadata Search Tool
- Lineage Tool
- Data Quality Tool
- SQL Tool
- RAG Tool
- MCP Tool

## 10.04 MCP — L5
- Host / Client / Server
- Tool
- Resource
- Prompt
- Capability discovery
- Permission boundary
- Tool invocation
- Failure

## 10.05 Skill — L5
- Skill vs Tool
- Skill composition
- Reusable workflow
- Domain capability

## 10.06 RAG & Governed RAG — L5
- Retrieval
- Chunk
- Embedding
- Rerank
- Citation / grounding
- Metadata filter
- Permission filter
- Governance
- Hallucination control

## 10.07 State & Memory — L5
- State
- State Machine
- State Store
- State Reader
- Short-term Memory
- Long-term Memory
- Cross-session Memory
- State vs Memory

## 10.08 Clarification & Multi-turn — L4
- Missing context
- Ambiguity
- Clarification
- Context compression
- Conversation state

## 10.09 Agent Governance — L5
- Tool permission
- Data permission
- Tenant boundary
- Audit
- Trace
- Policy
- Governed execution

---

# 11｜Production Architecture & Scale Lab
生产架构与规模化能力

## 11.01 SLO / SLI — L5
- Availability
- Latency
- Freshness
- Accuracy
- Error Rate
- Error Budget
- Data SLO
- Agent SLO

## 11.02 Capacity Planning — L5
- Workload model
- Throughput
- Concurrency
- CPU / Memory / Network / Storage
- Headroom
- Peak
- Growth
- Cost

## 11.03 Load & Stress Testing — L5
- Baseline
- Load Test
- Stress Test
- Soak Test
- Bottleneck
- Regression
- Capacity limit

## 11.04 Observability — L5
- Metric
- Log
- Trace
- Lineage
- Query Trace
- Pipeline Trace
- Agent Trace
- Correlation ID
- Dashboard
- Alert

## 11.05 Reliability — L5
- Retry
- Backoff
- Timeout
- Circuit Breaker
- Rate Limit
- Queue
- Graceful Degradation
- Partial Failure
- Recovery
- Runbook

## 11.06 Multi-tenancy — L5
- Identity
- Authorization
- Compute isolation
- Storage isolation
- Metadata isolation
- Cache isolation
- Rate limit
- Noisy Neighbor

## 11.07 Cost Engineering — L4/L5
- Storage cost
- Compute cost
- Query cost
- Streaming cost
- LLM / Agent cost
- Cost attribution
- Budget
- Trade-off

## 11.08 Security & Audit — L5
- Authentication
- Authorization
- Least Privilege
- Row / Column policy
- PII
- Audit Event
- Immutable audit
- Retention

## 11.09 Evolution & Change — L5
- Schema Evolution
- Metric Evolution
- Backfill
- Data Contract
- Compatibility
- Migration
- Rollback / Forward Fix

## 11.10 Incident Response — L5
- Detect
- Triage
- Mitigate
- Root Cause
- Recover
- Prevent
- Postmortem

---

# 12｜Scale Lab Scenario Families

## Streaming Scale
- Kafka Lag 持续增长
- Hot Partition
- Flink Backpressure
- Checkpoint 变慢
- State 过大
- Late Event 激增
- 数据准确性异常
- 流量突增 10×
- Consumer 扩容后顺序问题

## Batch / Spark Scale
- 百亿级 Backfill
- 大任务执行时间过长
- Data Skew
- Shuffle 爆炸
- OOM / Spill
- 小文件
- 多任务资源竞争
- Backfill 影响在线 Serving

## Lakehouse Scale
- Iceberg 小文件爆炸
- Manifest 过多
- Metadata 膨胀
- Concurrent Commit 冲突
- Snapshot 增长
- Compaction backlog
- 高吞吐流式写入
- 大范围历史回溯

## Semantic / Serving Scale
- 数千指标
- 指标口径冲突
- 多 Join Path
- 高并发语义查询
- Serving freshness
- Cache invalidation
- 预计算成本

## Governance Scale
- 海量资产 metadata ingestion
- 字段级血缘成本
- Schema Change Impact
- Ownership 缺失
- Metadata freshness
- 多业务域治理

## Agent Scale
- Tool timeout
- Tool cascade failure
- 多租户 Agent
- 长链路 Trace
- LLM 成本失控
- Permission leakage
- Memory growth
- Evaluation regression
- Audit pressure

---

# 13｜Project Mapping

## North America Project
高相关：
- CDC
- Kafka
- Iceberg
- Trino
- dbt
- MetricFlow
- Dagster
- DataHub
- Serving
- 数据质量
- 端到端一致性
- Schema Evolution
- 故障恢复
- Agent / Governed data access（以实际实现边界为准）

适合作为 Scale Lab 起点：
- CDC 乱序 / Delete / Replay
- 数据量增长
- Iceberg 小文件
- Backfill
- Query concurrency
- Semantic consistency
- Governance scale
- Serving latency

## Ahu Medical Exam Project
高相关：
- 数仓建模
- 指标体系
- 语义层
- 自助分析
- Serving
- 指标一致性
- 数据质量
- 稳定性 / 可观测

适合作为 Scale Lab 起点：
- 数千指标
- 指标版本
- 多业务口径
- 高并发分析
- 权限隔离
- Serving freshness

## Caishi Live Project
高相关：
- Kafka
- Flink
- 实时计算
- Event Time
- Watermark
- State
- Checkpoint
- 数据准确性
- 实时指标

适合作为 Scale Lab 起点：
- 流量突增
- Hot Key
- Backpressure
- Large State
- Checkpoint Slow
- Late Event
- Exactly-once
- 实时链路故障恢复

---

# 14｜Interview Bank Relationship

Interview Bank 不从 Taxonomy 自动生成题目。

正确流程：

```text
真实企业面经 / 高可信题库
↓
Question Extraction
↓
Normalize / Deduplicate
↓
Source Verification
↓
Knowledge Mapping
↓
Scenario Mapping
↓
Frequency from evidence
```

Taxonomy 用来：
- 给真实题目打知识标签
- 发现学习缺口
- 组织题解
- 规划学习顺序

不是用来：
- 为每个知识点强行制造面试题
