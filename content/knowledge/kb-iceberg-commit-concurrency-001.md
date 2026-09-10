---
id: kb-iceberg-commit-concurrency-001
type: knowledge
title: Optimistic Commit, Conflict & Recovery
title_cn: 乐观提交、冲突与恢复
stage_id: "04"
domain: lakehouse
topic: iceberg
order: 7
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: v0.6.0_spine
project_relevance:
  - north-america
project_fact_status: needs_fact_check
summary: "Iceberg 以 Metadata Pointer 的原子替换实现乐观并发；冲突后是否能安全重试，取决于操作类型和 Validation 条件。"
prerequisites:
  - kb-iceberg-write-distribution-ordering-001
related:
  - kb-iceberg-maintenance-small-files-001
scale_scenarios:
  - sc-iceberg-concurrent-commit-001
---

# Optimistic Commit, Conflict & Recovery

## 30 秒理解

Iceberg 不是给表加一个长期全局锁，而是使用 **Optimistic Concurrency（乐观并发）**：

```text
Writer A reads base metadata V10
Writer B reads base metadata V10

A prepares V11
B prepares V11'

A atomic swap: V10 → V11   ✅
B atomic swap: V10 → V11'  ❌ base is stale
```

B 不能把 A 静默覆盖。它必须 Refresh 最新状态，再根据自己的操作语义做 Validation（验证）和 Retry（重试）。

## Atomic Commit 到底原子在哪里

原子点通常是 Catalog 中“当前 Table Metadata Location”的切换。

Data File、Manifest、Metadata JSON 都可以先写到对象存储；只有 Pointer 成功切到新 Metadata，新的 Snapshot 才成为对 Reader 可见的 Current State。

所以 Iceberg 的 Commit 更像：

```text
Prepare immutable files
        ↓
Validate base/current
        ↓
Atomic pointer swap
```

## Append 为什么通常更容易重试

两个 Writer 都是 Append 时，只要新刷新后的表状态仍满足 Append 的条件，后提交者通常可以把自己的新文件重新挂到最新 Snapshot 上，而不需要重写 Data File。

但 Overwrite / Rewrite / Merge 等操作更敏感，因为它们可能依赖“我要替换的那些旧文件仍然存在”。

## Conflict Detection

关键不是“发生冲突就 Retry”，而是：

```text
发生冲突
↓
判断是否仍然语义安全
↓
安全 → rebase / retry
不安全 → fail fast / recompute / operator intervention
```

例如某个 Rewrite 计划要替换 File A，但别的 Writer 已先把 File A 替换掉，这时盲目重试会破坏正确性。

## Forward Fix

生产上不要把 Rollback 当成唯一恢复动作。

如果坏数据已经进入一个成功 Snapshot，而后续又有合法数据提交：

```text
S10 good
S11 bad
S12 good
```

直接 Rollback 到 S10 可能把 S12 的合法变化一起丢掉。

Forward Fix（向前修复）的思路是：

```text
识别 S11 引入的坏影响
↓
在当前最新状态 S12 上生成修复提交 S13
```

这样保留 S12 的合法变化。

## Retry Backoff

高并发 Commit 下要限制“所有 Writer 立刻同时重试”的惊群。

原则：

```text
bounded retry
+ exponential backoff
+ jitter
+ total timeout
+ conflict metrics
```

Retry 是可靠性机制，但如果冲突率长期很高，继续加重试次数只会把 Catalog 和 Metadata 压得更重。

## Partial Failure

区分三类：

```text
Data File write failed before commit
→ no table visibility

Files written, commit failed
→ possible orphan files

Commit success, client timed out
→ ambiguous client outcome
```

第三类最危险：Client 不应简单把“没收到成功响应”当成“提交一定没发生”。需要 Refresh 表状态或使用幂等业务标识确认结果。

## Production Observability

至少记录：

```text
commit latency
commit success/failure
conflict count
retry count
retry total time
files added/removed
snapshot id
writer/job id
```

## Scale Lab

100 个 Writer 同时往同一张热表提交时，瓶颈可能从 Storage 吞吐转移到：

```text
Catalog pointer contention
Metadata refresh
Conflict validation
Manifest merge
Retry storm
```

解决方案可能包括更合理的微批窗口、Writer 聚合、Branch/WAP、任务隔离或表拆分，而不是简单扩大 Spark Executor。


## 关联知识

下一节看 Maintenance：为什么小文件、Snapshot、Manifest、Orphan File 需要不同的治理动作。
