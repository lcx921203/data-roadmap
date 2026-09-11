---
id: kb-iceberg-commit-concurrency-001
type: knowledge
title: Optimistic Commit, Conflict & Recovery
title_cn: 乐观提交、冲突与恢复
stage_id: '04'
domain: lakehouse
topic: iceberg
order: 9
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: iceberg_l5_v1
project_relevance:
- north-america
project_fact_status: needs_fact_check
summary: Writer 先准备不可变文件，再基于一个 Base Metadata 做 Validation，最后由 Catalog 原子切换 Current
  Metadata Pointer；冲突后能否 Retry 取决于操作语义。
prerequisites:
- kb-iceberg-write-distribution-ordering-001
related:
- kb-iceberg-maintenance-small-files-001
scale_scenarios:
- sc-iceberg-concurrent-commit-001
---
# Optimistic Commit, Conflict & Recovery

## 30 秒理解

Iceberg 不靠长期全局锁保护整张表。

Writer 先基于一个已读取的 Base Metadata 准备新文件和新元数据，然后：

**Validate 当前表状态 → 尝试原子更新 Current Metadata Pointer**

如果别的 Writer 已经先提交，当前 Writer 不能静默覆盖它。

它必须 Refresh，再判断自己的操作还能不能安全 Retry。

## Commit 前已经发生了什么

到进入 Commit 阶段时，Writer 往往已经写出了：

- Data / Delete File；
- 新 Manifest；
- 新 Manifest List；
- 新 Snapshot；
- 新 Table Metadata。

这些对象本身都是“候选新状态”。

真正决定它们是否成为当前表状态的是最后的 Catalog Commit。

所以：

**文件写成功 ≠ 表提交成功。**

## Atomic Commit 原子在哪里

Iceberg 的高层语义是：

**Current Table Metadata 从旧版本原子切换到新版本。**

具体原子能力由 Catalog 提供，例如 Compare-and-Swap、事务条件更新或等价的版本校验机制。

成功以后，新 Metadata 中的 Current Snapshot 才成为新的可见状态。

失败时，旧 Current State 仍然成立。

## 两个 Writer 同时提交会怎样

假设 A 和 B 都从同一个 Base Metadata 开始。

A 先成功更新 Current Metadata。

B 再提交时发现 Base 已经过期。

这里不是简单一句“冲突就重试”，而是分两步：

**Refresh 最新状态 → Validation 判断自己的操作是否仍然语义安全**

只有 Validation 通过，才可以把自己的变更重新应用到更新后的 Base 上。

## 为什么 Append 通常更容易 Retry

两个独立 Append 往往只是各自新增文件。

如果 A 先提交，B Refresh 后发现 A 只是增加了另一批文件，那么 B 的新增文件通常仍然可以安全挂到最新表状态上。

所以 Append 经常可以 Rebase / Retry，而不需要重写已经生成的 Data File。

但 Overwrite、Rewrite、DELETE、MERGE 等操作可能依赖“某些旧文件仍然存在”或“某个 Predicate 范围没有被别人改过”。

这类操作必须做更严格的 Conflict Validation。

## Conflict Detection 的核心

真正要判断的是：

**从 Base Snapshot 到 Current Snapshot 之间，是否发生了会破坏当前操作语义的变化。**

例如一个 Rewrite 计划要替换 File A。

如果别的 Writer 已经先把 File A 替换了，再盲目提交原 Rewrite 结果就可能覆盖合法变化。

因此：

- 可以证明仍然安全 → Retry；
- 无法证明安全 → Fail / Recompute；
- 不应该靠无限重试掩盖语义冲突。

## Commit Retry 和业务重跑不是一回事

Iceberg Commit Retry 主要处理 Metadata Commit 竞争。

它不等于“整个 Spark / Flink 业务任务随便从头再跑一次”。

如果业务重跑会再次产生相同业务数据，还必须另外考虑上游幂等键、CDC Offset、Batch ID 等业务语义。

所以：

**Metadata Commit Retry ≠ End-to-end Idempotency（端到端幂等）**

## Partial Failure 怎么判断

写入失败要先判断发生在哪一层。

**Data File 写入阶段就失败**

没有成功 Commit，新文件不会进入 Current Table State。

**文件已经写完，但 Catalog Commit 永久失败**

这些文件可能成为 Orphan File（孤儿文件）。

**Catalog Commit 已成功，但 Client 超时没收到响应**

结果可能是 Ambiguous Outcome（结果不确定）。

这时不能直接假设“提交没发生”再写一次，而应该先 Refresh 表状态，确认本次 Snapshot / Commit 是否已经生效。

## Forward Fix 为什么比盲目 Rollback 更安全

假设：

**S10 正常 → S11 坏数据 → S12 又有合法数据**

如果直接 Rollback 到 S10，会把 S12 的合法变化也一起丢掉。

Forward Fix（向前修复）是在当前最新状态上：

**识别坏影响 → 生成修复数据 / 删除 → 提交新的 S13**

它不是所有事故的唯一答案，但当坏 Snapshot 后面还有合法提交时，通常比“回到旧版本”更符合数据保全原则。

## 高并发为什么会出现 Retry Storm

Writer 越多，不代表吞吐一定线性增加。

当大量 Writer 同时提交同一张热表时，瓶颈可能转移到：

- Catalog Pointer Contention；
- Metadata Refresh；
- Conflict Validation；
- Commit Retry；
- Manifest Merge。

如果所有 Writer 失败后立刻同时重试，就会形成 Retry Storm（重试风暴）。

因此生产上需要：

- 有界重试；
- Exponential Backoff（指数退避）；
- Jitter（随机抖动）；
- Total Timeout；
- Conflict / Retry 指标。

## 关联知识

成功 Commit 会不断产生 Snapshot、Manifest 和文件历史。

下一节进入 Maintenance：

**哪些增长是正常历史，哪些已经变成小文件、Manifest 碎片、Snapshot 膨胀和 Orphan，需要怎样分别治理？**
