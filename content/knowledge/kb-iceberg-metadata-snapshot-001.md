---
id: kb-iceberg-metadata-snapshot-001
type: knowledge
title: Table Metadata, Snapshot & Time Travel
title_cn: 表元数据、Snapshot 与 Time Travel
stage_id: '04'
domain: lakehouse
topic: iceberg
order: 2
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: iceberg_l5_v1_1_refactor
project_relevance:
- north-america
project_fact_status: needs_fact_check
summary: Table Metadata 是表状态根节点；Snapshot 是不可变的数据版本节点，不是全表副本。历史 Snapshot、对应 Schema 和仍被保留的文件共同构成 Time Travel；Branch、Tag 与 Snapshot Expiration 决定历史版本怎样被引用和保留。
prerequisites:
- kb-iceberg-overview-001
related:
- kb-iceberg-manifest-tree-001
- kb-iceberg-commit-concurrency-001
---
# Table Metadata、Snapshot 与 Time Travel

## 30 秒理解

这一节只先抓住四句话：

**Table Metadata（表元数据） = 这张 Iceberg 表的状态根节点。**

**Snapshot（快照） = 某次已提交的数据状态，不是整张表的数据副本。**

**Time Travel（时间旅行） = 读取某个历史 Snapshot 对应的历史表状态，不改变当前表。**

**历史能保留多久 = Snapshot Retention（快照保留策略）的问题。**

它们是一条因果链，不是四个独立功能。

## Table Metadata 到底保存什么

Table Metadata 是 JSON 元数据文件。

不用背所有字段，但下面这些一定要建立概念：

```text
schemas[]
current-schema-id

partition-specs[]
default-spec-id

snapshots[]
current-snapshot-id

refs
```

可以把它理解成：

> 这张表有哪些 Schema、有哪些 Partition Spec、有哪些 Snapshot，现在默认使用谁，以及哪些 Branch / Tag 还在引用哪些 Snapshot。

这里有一个很重要的区别：

**Table Metadata Version（表元数据版本） ≠ Snapshot Version（数据快照版本）**

Schema Rename、Property Change 这类纯元数据变化，也会产生新的 Table Metadata；但它不一定意味着业务数据内容产生一个新的 Snapshot。

所以以后不要把：

> “Metadata 变了一次”

简单等同于：

> “一定多了一个数据 Snapshot”。

## Snapshot 到底是什么

Snapshot 可以理解成一次不可变的数据状态节点。

一个 Snapshot 典型会记录：

- Snapshot ID；
- Parent Snapshot ID（父快照）；
- Commit Timestamp（提交时间）；
- Manifest List；
- Sequence Number（序列号）；
- 创建这个 Snapshot 时关联的 Schema ID。

它并不会复制整张表。

假设：

```text
S10
→ 复用 80 个旧 Manifest
→ 新增 2 个 Manifest
```

新的 S10 仍然可以大量引用历史已经存在的元数据和 Data File。

所以：

**Snapshot = 对一组表内容的不可变逻辑引用**

而不是：

**Snapshot = 全量复制一份数据**

这就是 Iceberg 能维护历史版本而不需要每次复制数百 TB 数据的原因。

## Reader 为什么能看到稳定版本

假设 Query Q1 开始时固定到了：

```text
Snapshot S10
```

随后另一个 Writer 成功提交：

```text
S11
```

Q1 不需要突然切换到 S11。

它可以继续沿：

```text
S10
→ Manifest List
→ Manifest
→ Data / Delete Files
```

完成这次读取。

新的 Query 再进入时，才会看到新的 Current Snapshot。

所以 Iceberg 的读取一致性可以先记成：

> **一次读取先固定一个已经提交的表状态，再沿这个状态向下读取。**

这比：

> 查询过程中不断重新 List 对象存储目录

稳定得多。

## Time Travel 为什么成立

现在已经知道：

```text
S10
S11
S12
```

这些 Snapshot 都是不可变节点。

只要：

1. 历史 Snapshot 仍然被 Table Metadata / Snapshot Reference 保留；
2. 它引用的 Manifest 和 Data / Delete File 还没有被生命周期清理；

Reader 就可以重新选择：

```text
S10
```

而不是当前：

```text
S12
```

然后沿 S10 自己的引用链读取。

所以 Time Travel 的本质不是：

> “Iceberg 自动备份了三份表。”

而是：

> **旧 Snapshot 的引用关系还在，而且它需要的文件还在。**

## Time Travel 时到底使用哪个 Schema

这是 Time Travel 和 Schema Evolution 最重要的交点。

假设：

```text
S1 对应 Schema 1
id
status

S2 对应 Schema 2
id
status
total
```

如果你 Time Travel 到 S1，应该按：

```text
Schema 1
```

理解那个历史 Snapshot。

不是拿今天最新的 Schema 2 强行解释当时的表状态。

可以把它记成：

```text
选择历史 Snapshot
↓
找到该 Snapshot 对应的 Schema ID
↓
用那个历史 Schema 解释历史文件
```

这也是为什么后面 Schema Evolution 不能只讲 Field ID，还必须讲 Schema ID。

## 按 Snapshot ID 和按时间读取有什么区别

Time Travel 常见两种方式。

### 按 Snapshot ID

直接告诉引擎：

> 我要读哪个明确的 Snapshot。

Spark SQL 示例：

```sql
SELECT *
FROM prod.db.orders
VERSION AS OF 10963874102873;
```

Trino 示例：

```sql
SELECT *
FROM iceberg.prod.orders
FOR VERSION AS OF 10963874102873;
```

### 按 Timestamp（时间戳）

告诉引擎：

> 我要读这个时间点当时有效的 Snapshot。

Spark：

```sql
SELECT *
FROM prod.db.orders
TIMESTAMP AS OF '2026-09-10 10:00:00';
```

Trino：

```sql
SELECT *
FROM iceberg.prod.orders
FOR TIMESTAMP AS OF TIMESTAMP '2026-09-10 10:00:00';
```

具体 SQL 支持仍要以当前 Engine / Connector 版本为准。

学习时重点不是背语法，而是理解：

> **最终仍然会解析到某个历史 Snapshot。**

## Branch 和 Tag 是什么

Iceberg 把 Branch（分支）和 Tag（标签）都建模成 **Snapshot Reference（快照引用）**。

### Tag

Tag 更像：

> 给一个具体 Snapshot 起一个稳定名字。

例如：

```text
release_2026_09
→ S120
```

适合：

- Audit（审计）；
- 固定发布版本；
- 保留重要历史点。

### Branch

Branch 是可以继续提交的可变引用。

例如：

```text
main
→ S120

audit_branch
→ S115
```

后续向 `audit_branch` Commit，它的 Head 可以继续移动。

所以：

**Tag = 固定引用一个 Snapshot**

**Branch = 可继续演进的一条 Snapshot Lineage（快照谱系）**

这两个概念先掌握到这里就够了，不需要现在学习所有 Branch Write 语法。

## Time Travel、Rollback 和 Forward Fix 不是一回事

这是生产事故里最容易混的三件事。

### Time Travel

只是：

> 读取历史版本。

它不改变 Current Snapshot。

### Rollback（回滚）

是：

> 把当前表状态重新指向一个历史祖先 Snapshot。

它会改变后续默认读取的 Current State。

所以 Rollback 是状态变更，不是只读查询。

### Forward Fix（向前修复）

是在当前最新状态上：

> 识别坏影响，然后提交一个新的修复 Snapshot。

例如：

```text
S10 正常
↓
S11 坏数据
↓
S12 合法新数据
```

如果直接 Rollback 到 S10，S12 的合法变化也会一起失去。

这时通常更适合：

```text
S12
↓
生成修复
↓
S13
```

Commit 章节会继续讲为什么。

## 一个真实生产恢复思路

假设凌晨 02:00 的任务把一批价格写错了。

先不要直接 Rollback。

更合理的顺序是：

```text
1. 找到当前 Snapshot
2. 找到错误写入前的 Snapshot
3. 用 Time Travel 验证错误确实从哪个版本开始
4. 判断错误 Snapshot 后是否已有合法新提交
5. 没有后续合法变化 → Rollback 可能可行
6. 已有合法变化 → 优先评估 Forward Fix
7. 修复后再确认 Snapshot Retention / Orphan Cleanup
```

Time Travel 在这里首先是：

**Diagnosis Tool（诊断工具）**

然后才可能进入恢复决策。

## Snapshot Expiration 为什么会影响 Time Travel

历史 Snapshot 不应该无限保留。

因为旧 Snapshot 可能继续引用：

- 旧 Manifest；
- 旧 Data File；
- 已经被当前版本替换的文件。

如果永远不 Expire（过期清理），Metadata 和 Storage 都会持续增长。

但一旦 Snapshot 被合法 Expire，而且它独占引用的旧文件随后可以被清理：

> 那个历史版本就不再保证可以 Time Travel。

所以生产上真正要决定的是：

```text
Time Travel Window
+
Rollback / Recovery Window
+
Audit Requirement
+
Storage / Metadata Cost
```

而不是：

> “历史越多越安全。”

Branch / Tag 还可以通过自己的 Retention Policy（保留策略）保护重要历史点。

## 这一节真正要掌握什么

必须掌握：

- Table Metadata 和 Snapshot 不是同一个层次；
- Snapshot 是不可变逻辑版本，不是全量数据副本；
- Time Travel 是选择历史 Snapshot 读取；
- 历史 Snapshot 有自己的历史 Schema；
- Time Travel 不会改变 Current Snapshot；
- Snapshot Expiration 会限制历史读取和恢复窗口。

生产上要会判断：

- 坏数据应该先 Time Travel 验证，还是直接 Rollback；
- Rollback 会不会丢掉坏 Snapshot 之后的合法数据；
- Retention Window 是否满足恢复与审计要求。

了解即可：

- Branch / Tag 所有 DDL；
- `set_current_snapshot`、`cherrypick_snapshot` 等高级恢复操作的全部参数；
- 所有 Snapshot Retention 默认值。

下一节继续向下：

**一个 Snapshot 怎样在不直接保存几十万个文件路径的情况下，找到这批文件？**
