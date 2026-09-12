---
id: kb-iceberg-commit-concurrency-001
type: knowledge
title: Optimistic Commit, Conflict & Recovery
title_cn: 乐观提交、并发冲突与恢复
stage_id: '04'
domain: lakehouse
topic: iceberg
order: 9
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: iceberg_l5_v1_1_refactor
project_relevance:
- north-america
project_fact_status: needs_fact_check
summary: Iceberg Writer 先基于 Base Metadata 生成候选不可变文件和新元数据，最终由 Catalog 原子更新当前 Table Metadata。并发 Writer 失败后需要 Refresh + Validation，再决定能否安全 Retry；Commit Retry、业务幂等和事故恢复是三个不同层次。
prerequisites:
- kb-iceberg-write-distribution-ordering-001
related:
- kb-iceberg-maintenance-small-files-001
scale_scenarios:
- sc-iceberg-concurrent-commit-001
---
# 乐观提交、并发冲突与恢复

## 30 秒理解

Iceberg 不靠“长期锁住整张表”来防止并发 Writer。

更接近：

```text
读取 Base Metadata
↓
在表外准备新 Data / Manifest / Snapshot / Metadata
↓
提交前 Validation（校验）
↓
Catalog 原子更新当前 Table Metadata
```

如果另一个 Writer 已经先 Commit：

> 当前 Writer 不能静默把它覆盖掉。

必须：

**Refresh（刷新最新状态） → Validation（判断语义是否仍安全） → Retry / Fail**

这就是 Optimistic Concurrency（乐观并发）的核心。

## Commit 前其实已经写了很多东西

进入最终 Commit 之前，Writer 往往已经生成：

- Data File / Delete File；
- Manifest；
- Manifest List；
- Snapshot；
- 新 Table Metadata。

这些都是：

**Candidate State（候选状态）**

只有最后 Catalog Commit 成功以后，它们才成为：

**Visible Table State（可见表状态）**

所以再强调一次：

**文件写成功 ≠ 表提交成功。**

这条是处理生产故障时最重要的事实之一。

## Atomic Commit 原子在哪里

Iceberg 要求的高层语义是：

> **新的 Table Metadata 必须基于旧的 Table Metadata 做原子替换。**

Catalog 可以通过：

- Compare-and-Swap；
- 条件事务更新；
- 版本校验；
- 等价原子机制

实现。

重点不是记 Catalog 内部 API。

而是记：

```text
Base Metadata = M10
↓
尝试提交 M11
↓
只有在 Current 仍满足预期时才能成功
```

这样另一个 Writer 不能把已经提交的新状态“无声覆盖”。

## 两个 Writer 同时提交会怎样

假设：

```text
Writer A
Base = M10

Writer B
Base = M10
```

A 先 Commit 成功：

```text
Current
M10 → M11
```

B 再提交时发现：

```text
Current 已不是 M10
```

B 不能简单地：

> “再提交一次同样的新 Metadata”。

它需要：

```text
Refresh M11
↓
检查 A 的变化
↓
判断 B 的操作是否仍然成立
```

如果仍然安全：

```text
Rebase / Retry
```

如果已经破坏 B 的语义前提：

```text
Fail / Recompute
```

## 为什么 Append 通常更容易 Retry

假设 A：

```text
Append File A1
```

B：

```text
Append File B1
```

A 先提交以后，B Refresh 发现：

> A 只是新增了与自己不冲突的文件。

B 通常仍可以把自己的新文件挂到最新表状态上。

而且 Iceberg 的 Sequence Number（序列号）设计允许很多情况下复用已经写好的 Manifest，只需要重新生成与最新提交顺序相关的元数据。

所以 Append 经常比 Overwrite / Rewrite 更容易重试。

## 为什么 Overwrite / Rewrite / DELETE / MERGE 更敏感

这些操作通常带着更强的前提。

例如 Rewrite：

```text
我要替换 File A
```

如果另一个 Writer 已经先：

```text
把 File A 替换掉
```

那原 Rewrite 计划就可能已经失效。

再比如 Predicate Overwrite：

```text
我要覆盖 date = 2026-09-12
```

如果别人刚在这个范围插入了新数据，

是否允许继续提交，取决于：

- 操作语义；
- Isolation Level（隔离级别）；
- Validation 规则；
- Engine / API 实现。

所以并发冲突不是：

> “所有失败都多重试几次”。

真正问题是：

> **Base 到 Current 之间发生的变化，会不会让本次操作变得不再正确？**

## Serializable 和 Snapshot Isolation 要理解到什么程度

Iceberg 支持的写入隔离语义里，常见会看到：

- Serializable Isolation（可串行化隔离）；
- Snapshot Isolation（快照隔离）。

第一次学习不用背每个操作的所有 Validation API。

只需要理解：

**Serializable 更严格地防止并发变化破坏当前写入的逻辑范围。**

**Snapshot Isolation 对部分并发插入更宽松，但仍会保护关键删除 / 替换冲突。**

具体 DELETE / UPDATE / MERGE 在某个 Engine 的默认值，要以实际版本配置为准。

## Commit Retry 和业务重跑不是一回事

这是生产事故里非常重要的边界。

### Commit Retry

处理：

> Metadata Commit 竞争、短暂 Catalog Failure 等。

重点是重新确认：

```text
我的候选变化还能不能安全提交到最新状态？
```

### 业务重跑

处理：

> 整个 Spark / Flink Job 要不要重新执行。

这会涉及：

- CDC Offset；
- Batch ID；
- 业务幂等键；
- Source Replay；
- Downstream Side Effect。

所以：

**Metadata Commit Retry ≠ End-to-end Idempotency（端到端幂等）**

不能因为 Iceberg Commit 可重试，就认为整个业务任务可以随便重跑。

## Partial Failure 怎么判断

写入失败先判断发生在哪一层。

### Data File 还没写完就失败

没有成功 Commit。

这些部分文件不会自动成为 Current Table State。

后续可能需要 Orphan Cleanup（孤儿文件清理）。

### Data / Metadata 都写完，但 Catalog Commit 永久失败

候选文件已经存在，但没有进入有效表状态。

它们也可能成为 Orphan File（孤儿文件）。

### Catalog Commit 实际成功，但 Client 超时

这是最危险的一类：

**Ambiguous Outcome（结果不确定）**

Client 看到超时，不代表：

> Commit 一定失败。

正确动作首先是：

```text
Refresh Table Metadata
↓
确认目标 Snapshot / Commit 是否已经成为有效状态
```

如果直接重跑，可能产生重复业务数据。

## Time Travel 在恢复里先做什么

第 2 节已经学过 Time Travel。

事故发生时它首先是：

**Diagnosis（诊断）**

例如：

```text
S20 正常
S21 错误写入
S22 当前
```

可以先 Time Travel 到 S20 / S21：

- 验证错误从哪个 Snapshot 开始；
- 对比受影响范围；
- 判断 Current 以后有没有合法数据。

这一步只读历史，不改变 Current State。

## Forward Fix 为什么比盲目 Rollback 更安全

假设：

**S10 正常 → S11 坏数据 → S12 又有合法数据**

如果直接 Rollback 到 S10：

> S12 的合法变化也会一起失去。

Forward Fix（向前修复）则是：

```text
从 Current S12 出发
↓
识别 S11 的错误影响
↓
生成补偿 / 删除 / 修正
↓
Commit 新 S13
```

它不是所有事故唯一答案。

但一旦坏 Snapshot 后面已有合法 Commit：

> **Rollback 就不再是默认最安全动作。**

## 高并发为什么会出现 Retry Storm

Writer 越多，并不代表同一张热表 Commit 吞吐会线性提高。

大量 Writer 同时竞争，瓶颈可能转移到：

- Catalog Pointer Contention（目录指针竞争）；
- Metadata Refresh；
- Conflict Validation；
- Commit Retry；
- Manifest Merge。

如果所有 Writer 失败后：

```text
立即
同一时间
再次重试
```

就会形成 Retry Storm（重试风暴）。

生产上至少要有：

- Bounded Retry（有界重试）；
- Exponential Backoff（指数退避）；
- Jitter（随机抖动）；
- Total Timeout（总超时）；
- Conflict / Retry 指标。

## 一个生产问题：为什么“加 Retry 次数”可能更糟

假设一张热表每秒大量 Writer 提交。

Commit Conflict 已经达到很高比例。

如果只是把：

```text
max retries
5 → 50
```

可能得到：

```text
更多 Catalog 请求
更多 Metadata Refresh
更多冲突
更长尾延迟
```

反而形成自激式压力。

这时真正要考虑的可能是：

- 合并 Micro-batch；
- 降低 Commit Frequency（提交频率）；
- 减少同表并发 Writer；
- 拆热点；
- 调度隔离；
- 用 Branch / WAP（Write-Audit-Publish，写入-审计-发布）等模式隔离部分工作流。

## 这一节真正要掌握什么

必须掌握：

- 最终原子性发生在 Table Metadata Commit；
- Candidate File 存在不代表表状态可见；
- 并发失败后是 Refresh + Validation，不是盲 Retry；
- Append 和 Rewrite 的冲突敏感度不同；
- Commit Retry 和业务幂等是两个层次；
- Ambiguous Outcome 必须先确认真实提交状态；
- Rollback 前要确认后续合法 Snapshot。

生产上要会判断：

- Retry Storm 为什么发生；
- 为什么 Commit 超时不能直接重跑；
- 什么场景 Forward Fix 比 Rollback 更安全。

了解即可：

- 每个 Java Validation API；
- 各 Catalog 的内部 CAS / Transaction 实现细节。

下一节进入生命周期治理：

**Commit 成功以后，Data File、Manifest、Snapshot 和 Orphan 会持续增长，哪些该保留，哪些该重写，哪些才能安全删除？**
