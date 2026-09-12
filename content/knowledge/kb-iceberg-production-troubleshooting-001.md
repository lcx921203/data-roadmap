---
id: kb-iceberg-production-troubleshooting-001
type: knowledge
title: Iceberg Production Troubleshooting
title_cn: Iceberg 生产排障、恢复与容量思维
stage_id: '04'
domain: lakehouse
topic: iceberg
order: 11
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: iceberg_l5_v1_1_refactor
project_relevance:
- north-america
project_fact_status: needs_fact_check
summary: Iceberg 生产排障先按 Write、Commit、Metadata、Planning、Scan、Maintenance 六层定位，再回到 Schema / Snapshot / Time Travel 等正确性链判断事故。目标不是背参数，而是先确定故障层、直接证据和下一步动作。
prerequisites:
- kb-iceberg-maintenance-small-files-001
related:
- kb-iceberg-overview-001
scale_scenarios:
- sc-iceberg-10b-backfill-001
- sc-iceberg-streaming-small-files-001
- sc-iceberg-concurrent-commit-001
interview_relevance:
- iq-lake-vs-warehouse-001
- iq-large-dataset-tech-selection-001
---
# Iceberg 生产排障、恢复与容量思维

## 30 秒理解

线上 Iceberg 出问题时，不要先说：

> “湖仓慢”“Iceberg 有问题”“做个 Compaction”。

先把问题放进六层之一：

**Write（写入） → Commit（提交） → Metadata（元数据） → Planning（规划） → Scan（扫描） → Maintenance（维护）**

如果是“数据结果不对 / 历史版本异常”，再沿正确性链检查：

**Snapshot → Schema → Partition → Data / Delete → Commit History（提交历史）**

生产排障最重要的能力不是知道最多参数。

而是：

> **第一步就把故障放到正确层。**

## 先用现象判断大方向

### 写入成功但文件爆炸

优先：

```text
Write
→ Partition
→ Distribution
→ Task Size
```

而不是先调 Query Worker。

### Query 提交后很久才真正开始 Scan

优先：

```text
Metadata / Planning
→ Manifest Count
→ File Count
→ Pruning
```

### Worker 已经开始扫，但 Scan Bytes 巨大

优先：

```text
Partition / File Metrics
→ Ordering
→ Predicate
→ Scan Runtime
```

### Writer 大量 Commit Conflict

优先：

```text
Commit
→ Concurrent Writers
→ Commit Frequency
→ Validation / Retry
```

### 历史 Snapshot 突然查不到

优先：

```text
Maintenance
→ Snapshot Expiration
→ Branch / Tag Retention
```

### Rename 后 Iceberg 能读，但 dbt / BI 挂了

优先：

```text
Schema Evolution
→ Consumer Compatibility
```

不是：

```text
重写全部 Parquet
```

## 1. Write：文件为什么从源头就不健康

先看：

- Input Rows / Bytes（输入行数 / 字节）；
- Task Count（任务数）；
- Active Partition Count（活跃分区数）；
- Files Created（生成文件数）；
- Avg / P50 / P95 File Size；
- Distribution Mode；
- Writer Memory / Open File Count。

典型问题：

- Micro-batch 太小；
- Partition 太细；
- Spark Task 太碎；
- Fanout 同时触碰太多 Partition；
- Target File Size 与 Task Size / 压缩比不匹配。

如果根因在这里：

> Rewrite Data Files 只能缓解结果，不能消除源头。

## 2. Commit：为什么提交慢或冲突多

先看：

- Commit Latency；
- Conflict Rate；
- Retry Count；
- Retry Total Time；
- Catalog Latency；
- Concurrent Writers；
- Snapshot Creation Rate。

高并发热表可能把瓶颈从：

```text
Object Storage
```

推到：

```text
Catalog / Metadata Commit
```

如果 Conflict Rate 持续升高，不要只增加 Retry。

还要看：

- Commit Frequency；
- Writer 聚合；
- 热点是否可拆；
- Backoff / Jitter；
- 是否需要 Branch / WAP 隔离工作流。

## 3. Metadata：为什么“数据不大，规划却越来越重”

先看：

- Snapshot Count；
- Manifest Count；
- Manifest Entries；
- Metadata JSON 数量和大小；
- Data / Delete File Count Growth。

典型根因：

- 高频 Commit；
- 小文件持续增长；
- Manifest 碎片；
- Snapshot 历史长期不清理；
- Delete Metadata 积累。

一个非常重要的生产直觉：

> **Metadata Object Count 可能比总 TB 数更早成为瓶颈。**

## 4. Planning：为什么 Query 还没扫数据就慢

先看：

- Planning Latency；
- Manifests Scanned；
- Files Planned；
- Files Pruned；
- Partition Selectivity；
- Predicate 是否可推导；
- Delete Planning 成本。

优先回到：

**Partition → Manifest Layout → File Metrics → Predicate → Delete Scope**

增加 Worker 通常帮助有限。

因为瓶颈还在：

> “决定读什么”。

不是：

> “真正读数据”。

## 5. Scan：为什么文件已经选好了，执行仍然慢

先看：

- Bytes Scanned；
- Split Count；
- Scan Throughput；
- Object Storage Latency；
- Row Groups Skipped；
- Worker Memory / Spill；
- Join / Shuffle。

这时候才更多进入：

- Trino Worker；
- Join Strategy；
- Memory；
- Spill；
- Runtime Concurrency

这些 Compute Engine（计算引擎）问题。

不要把所有 Scan 慢都归给 Iceberg Table Format。

## 6. Maintenance：为什么问题不断复发

先看：

- Rewrite Backlog；
- Snapshot Age；
- Manifest Count Growth；
- Small-file Ratio；
- Orphan Retention；
- Maintenance Duration / IO；
- 在线 Query 受影响程度。

典型现象：

```text
Write 能成功
Query 也能跑
但每天 Planning 更慢
File Count 更高
Metadata 更重
```

这通常表示：

> **系统没有立即故障，但生命周期治理正在欠债。**

## 正确性事故要另外走一条链

性能六层不够覆盖所有事故。

如果问题是：

> “数据突然不对了。”

优先问：

```text
1. Current Snapshot 是谁？
2. 错误从哪个 Snapshot 开始？
3. Time Travel 到前一个 Snapshot 是否正确？
4. Schema / Field ID 最近是否变化？
5. Partition Spec 是否变化？
6. Data / Delete Scope 是否符合预期？
7. Commit 是否出现 Ambiguous Outcome？
8. Consumer 是否因为 Rename / Schema Change 发生兼容问题？
```

这条链比：

> “先重跑任务”

安全得多。

## 一个生产例子：Schema Rename 后报表全挂

现象：

```text
Iceberg 查询新列名正常
历史数据也正常
dbt / BI 大量失败
```

判断：

```text
Field ID 没变
→ Iceberg Storage Compatibility 正常

下游 SQL 仍引用旧 Column Name
→ Consumer Compatibility 失败
```

所以修复方向是：

- Data Contract；
- Lineage；
- Consumer Migration；
- Compatibility Window。

不是：

> 回滚 Parquet 文件。

## 一个生产例子：坏数据已经写入 Current

先不要立刻 Rollback。

顺序：

```text
Time Travel 对比历史 Snapshot
↓
确认坏数据起点
↓
检查坏 Snapshot 之后有没有合法 Commit
↓
没有 → Rollback 可评估
有 → Forward Fix 往往更安全
```

如果目标历史 Snapshot 已被 Expire：

> 那已经是 Maintenance / Retention 设计影响了 Recovery 能力。

这就是第 2、9、10 节真正连接起来的地方。

## SLI / SLO 怎么设计

只看最终 Query P95 不够。

更有价值的是同时维护内部 SLI（服务指标），例如：

- Planning P95；
- Commit P95；
- Conflict Rate；
- Small-file Ratio；
- Manifest Count Growth；
- Freshness；
- Maintenance Backlog；
- Snapshot Retention / Expiration Health。

这样在用户 Query 真正恶化前，就能先看到内部趋势。

SLO（服务目标）具体阈值必须来自业务和实际容量。

不要凭空给所有 Iceberg 表统一数字。

## Capacity Planning 不只是每天多少 TB

Iceberg 容量至少同时考虑：

```text
Data Volume
+
Object Count
+
Metadata Growth
+
Commit Rate
+
Query Planning Cost
```

所以还要估算：

- Daily / Peak Ingest；
- Commit Frequency；
- Active Partitions；
- Concurrent Writers；
- Files / Day；
- Snapshots / Day；
- Manifests / Day；
- Delete Files / Day；
- Query Concurrency；
- Scan Bytes / Query；
- Retention Window。

一张 500 TB、每天新增少量大文件的表，

可能比：

> 一张小很多、但每分钟生成大量小文件和 Snapshot 的表

更容易维护。

## 事故恢复怎么选 Rollback 还是 Forward Fix

事故发生后至少确认：

1. Current Snapshot 是谁；
2. 坏数据是否已经成功 Commit；
3. 坏 Snapshot 以后有没有合法 Snapshot；
4. Time Travel 能否重现事故前正确状态；
5. Rollback 会不会丢掉合法变化；
6. 是否应该从最新状态做 Forward Fix；
7. 是否有 Orphan File 需要后续清理；
8. Retention Policy 是否影响可恢复窗口。

原则：

**先以 Metadata 引用关系确认事实，再做恢复。**

不要先去对象存储目录手工删文件。

## 最终心智模型

学完 Iceberg L5，把它收成四句话：

**正确性（Correctness） = Snapshot + Schema / Field ID + Validation + Atomic Commit**

**性能（Performance） = Partition + File Metrics + File Layout + Metadata Layout**

**可靠性（Reliability） = Retry + Time Travel / Recovery + Maintenance**

**生产化（Production） = SLO + Capacity + Observability + Cost**

这不是四个新知识点。

而是前 10 节已经学过的机制，在生产环境中的最终组合。

## 这一节真正要掌握什么

必须掌握：

- 先分 Write / Commit / Metadata / Planning / Scan / Maintenance；
- 正确性事故要另外查 Snapshot / Schema / Delete / History；
- Planning 慢和 Scan 慢不能混；
- Rollback 不是所有坏数据事故的默认答案；
- Retention 会直接影响恢复能力。

生产上要会判断：

- 一个现象首先属于哪一层；
- 下一步最值得看的 3–5 个指标是什么；
- 什么时候应该调 Writer、Rewrite、加 Worker、降 Commit 频率或做 Forward Fix。

了解即可：

- 所有引擎的每个具体监控字段名；
- 没有业务上下文时硬背统一 SLO 数字。
