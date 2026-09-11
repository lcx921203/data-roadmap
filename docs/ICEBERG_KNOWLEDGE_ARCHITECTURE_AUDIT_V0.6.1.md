# Iceberg Knowledge Architecture Audit V0.6.1

> Audit basis: current DataRoadmap main branch after V0.6.0.10, plus Apache Iceberg current specification/docs.
>
> Goal: **内容正确性 + 知识结构** 双审计。不是继续堆知识点，而是把 Iceberg L5 收成一条可以复述、递进、少重复的主线。

## 1. Audit conclusion

当前 10 节的技术方向总体正确，但有 5 个结构问题：

1. **Read Path 太靠后**：Metadata Pruning、Partition Pruning、File Metrics 在第 3/4/9 节重复出现，导致“读路径”被拆碎。
2. **Manifest 职责跨章节漂移**：结构、生成、增长、Merge/Rewrite 混在第 3/6/8 节，缺少明确 ownership。
3. **Table Metadata & Snapshot 过早进入 Commit / Retention / Orphan**：会抢掉第 7/8 节的主讲职责。
4. **Row-level Delete 是明显缺口**：正文已经多次出现 Delete File，但没有一个地方系统解释 Position Delete / Equality Delete / Data Manifest vs Delete Manifest。
5. **表现层仍有不少非代码 `text` fence**：普通关系、列表、排障树仍以 CodeBlock 形态出现，容易制造“这是不是代码”的认知噪音。

## 2. Correctness audit — highest priority fixes

### P0-1 Manifest 不能混放 Data File 与 Delete File

当前表述容易让人理解为一个 Manifest 同时记录 Data / Delete File。

Apache Iceberg Spec 的精确定义是：

- 一个 Manifest 是 immutable Avro file；
- 一个 Manifest **要么**跟踪 Data Files，**要么**跟踪 Delete Files；
- 一个 Manifest 不能同时混放两种 content；
- Snapshot 的 Manifest List 可以同时列出 data manifests 与 delete manifests。

### P0-2 Manifest 与 Partition 的精确定义

需要明确：

- Manifest 不对应某一个具体 Partition Value；
- 一个 Manifest 可以包含多个 Partition Value；
- 但一个 Manifest 中的文件属于 **同一个 Partition Spec**；
- Partition Evolution 后，旧文件留在旧 Spec 对应的 Manifest，新文件进入新 Spec 对应的 Manifest。

这正好解决“Manifest 是按相近分区还是写入顺序”的理解边界。

### P0-3 8 MB 不是 Manifest 写满阈值

必须固定到 Maintenance 主讲位置：

- `commit.manifest.target-size-bytes = 8 MB`：Manifest Merge 的目标大小；
- `commit.manifest.min-count-to-merge = 100`：自动合并前累积 Manifest 的最小数量；
- `commit.manifest-merge.enabled = true`：默认开启自动 Manifest Merge；
- 已提交 Manifest 是 immutable，新 Commit 不会重新打开旧 Manifest 继续追加。

### P0-4 Row-level Delete 缺失

L5 必须补：

- Data File；
- Delete File；
- Data Manifest vs Delete Manifest；
- Position Delete；
- Equality Delete；
- V3 Deletion Vector 作为版本扩展说明；
- Copy-on-Write vs Merge-on-Read 只讲到理解读写路径所需的深度。

## 3. Proposed learning spine

建议从 10 节升级为 11 节，不为了保持“10”而强行塞内容：

```text
01 Iceberg 总览
   └─ 为什么需要 Table Format + 一条总主链

02 Table Metadata & Snapshot
   └─ 表状态、可见性、稳定版本

03 Manifest List & Manifest
   └─ Snapshot 如何索引文件；Manifest 的结构与职责

04 Data Files, Delete Files & Row-level Changes   [NEW]
   └─ 真正的数据/删除如何表达

05 Hidden Partitioning & Partition Evolution
   └─ 分区值如何产生、为什么能演进

06 Schema Evolution & Field ID
   └─ 字段身份和安全演进

07 Trino Read Path & Pruning
   └─ 把 02–06 串成一次真实读取

08 Write Distribution & Ordering
   └─ Row 如何变成布局合理的新 Data Files / Manifest

09 Commit, Conflict & Recovery
   └─ 新状态如何原子发布、冲突如何处理

10 Maintenance & Metadata Growth
   └─ Small Files / Manifest Growth / Expire / Orphan

11 Production Troubleshooting & Capacity
   └─ 最终综合排障与容量思维
```

### 为什么把 Read Path 提前

先学：

```text
表状态
→ 文件索引
→ Data/Delete File
→ Partition/Schema
```

然后马上用一次 Trino Read Path 把这些概念“串起来”。

之后再进入：

```text
怎么写
→ 怎么 Commit
→ 怎么维护
→ 怎么排障
```

这样比当前“先写、Commit、维护，最后才讲怎么读”更容易形成完整心智模型。

## 4. Concept ownership — 一个概念只设一个主讲位置

### Snapshot
- 主讲：02
- 09 只讲它如何通过 Commit 成为 Current
- 10 只讲 Expire
- 11 只作为排障指标

### Manifest
- 03：结构、职责、Partition Spec 约束
- 08：新写入为什么产生新 Manifest、为什么旧 Manifest 可复用
- 10：为什么增长、8MB/100、Merge/Rewrite
- 11：只看指标和症状

### Pruning
- 03：只说“Manifest List / Manifest 提供统计信息”
- 05：只说 Partition Transform 可以被 Predicate 推导
- 07：**唯一完整主讲** Partition / Manifest / File / Parquet Pruning
- 11：作为排障结果，不再重新教学

### Small Files
- 08：根因来自写入布局
- 10：治理 Rewrite Data Files
- 11：指标与故障现象
- 不在多个章节重新解释“小文件为什么贵”

### Commit / Orphan / Rollback
- 02：只保留“Pointer 成功切换才可见”的最小概念
- 09：完整主讲 Commit / Retry / ambiguous outcome / Forward Fix
- 10：Orphan Cleanup 与 Snapshot Expiration
- 11：事故时的排查顺序

## 5. Current chapter audit

### 01 Overview
**Keep, simplify.**

问题：
- “完整链路”与后续章节顺序还没体现 Read Path 前移；
- `Too many tiny files + ...` 是普通概念，不应是 CodeBlock；
- Production checklist 过多，容易在第一节提前暴露所有后续答案。

目标：只建立 mental model 和学习地图。

### 02 Table Metadata & Snapshot
**Keep, narrow scope.**

保留：
- Table Metadata；
- Current Snapshot；
- Metadata Pointer；
- Snapshot 是逻辑版本；
- Reader 为什么获得稳定状态。

移动：
- Retry / Conflict → 09；
- Orphan Cleanup → 10；
- Retention 深讲 → 10；
- Source path 只保留最小抓手。

### 03 Manifest List & Manifest
**Major refine.**

必须补：
- one manifest = data OR deletes；
- one manifest = one partition spec；
- multiple partition values are allowed；
- Manifest immutable。

删除/移动：
- 深度 Metadata Pruning → 07；
- Manifest Merge / Rewrite 参数 → 10；
- 完整 troubleshooting → 11。

### 04 NEW Row-level Changes
**Add.**

这是当前最大内容缺口。

### 05 Partition Evolution
**Keep.**

保留：
- Hidden Partitioning；
- Transform；
- Spec ID；
- 新旧 Spec 共存；
- 未来布局改变 ≠ 重写全部历史数据。

移动：
- 完整 Pruning 链 → 07；
- 大规模案例只保留一小段映射。

### 06 Schema Evolution
**Keep.**

加强：
- safe add/drop/rename/reorder；
- valid type promotion；
- Field ID；
- Iceberg 存储正确性 vs Data Contract 组织治理。

### 07 Trino Read Path
**Move from current 09 to 07.**

作为前半段知识的第一次综合：

```text
Catalog
→ Metadata
→ Snapshot
→ Manifest List pruning
→ Manifest/file pruning
→ Delete application
→ Split planning
→ Worker scan
```

Planning vs Execution 在这里一次讲清。

### 08 Write Distribution & Ordering
**Keep, deepen Manifest creation.**

新增主讲：
- Data File 形成；
- new Manifest 形成；
- old Manifest immutable；
- new Snapshot 可以复用 old Manifest；
- 8MB 不是 writer rollover threshold。

### 09 Commit
**Keep.**

重点：
- new Manifest List per snapshot commit attempt；
- validation；
- atomic pointer swap；
- retry/rebase；
- operation-specific conflict；
- ambiguous client outcome；
- Forward Fix。

### 10 Maintenance
**Keep, become Manifest lifecycle owner.**

新增：
- auto manifest merge；
- 8MB target；
- 100 min count；
- rewriteManifests；
- automatic order-of-addition grouping；
- explicit rewrite can regroup for query/partition pattern；
- old snapshots may keep old manifests.

### 11 Troubleshooting
**Keep as synthesis only.**

删除：
- `sc-*` 内部 ID 的前台展示；
- 已经在前面主讲过的长原理。

保留：
- Write / Commit / Metadata / Planning / Scan / Maintenance 六层定位；
- SLI/SLO；
- Capacity；
- Incident flow。

## 6. Presentation audit

Content 页统一：

```text
真正代码 / SQL / YAML / Shell
→ CodeBlock

普通列表
→ Bullet List

简单关系
→ Inline / Paragraph relationship chain

复杂非线性关系
→ Optional Diagram
```

本轮不再新增 Iceberg Diagram。

## 7. Implementation sequence

### V0.6.1.0
- 修改 spine 为 11 节；
- 新增 Row-level Changes；
- 调整 order / prerequisite / related；
- 修复 P0 correctness；
- 修复 CONTENT.md 编号。

### V0.6.1.1
- 重写 01–07，使 Read Model 完整且无重复。

### V0.6.1.2
- 重写 08–11，使 Write → Commit → Maintenance → Troubleshooting 完整。

### V0.6.1.3
- 全量去重、CodeBlock 语义审计、移动端阅读审计；
- 再决定是否冻结 Iceberg L5 V1。
