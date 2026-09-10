# Mobile UI Conformance Audit V0.6.0.5

## Scope

基于真实 iPhone Safari 截图重新审视：

- Learn Home
- Knowledge Detail
- Interview List
- Interview Detail
- Evidence BottomSheet
- Bottom Navigation
- Dynamic Inventory Numbers

并对照：

```text
DESIGN.md
content/design/components-v1.yaml
VoltAgent/awesome-design-md 中的 Linear / editorial / filter-chip patterns
```

## Screenshot Findings

### 1. Continue Learning edge

问题：

```text
Signal Blue
+
Neutral Hairline
```

混色后的边框在浅蓝 Surface 外围形成偏灰的“脏边”。

修复：

```text
Signal Soft Surface
+
Signal family hairline
```

只用同一色系建立边界，不加 Shadow。

### 2. Filter control

旧布局：

```text
[ chips scroll + fade ][ Filter ]
```

在 390px 上会出现半个 Chip 被裁切后紧贴 Filter，看起来像布局坏掉。

新布局：

```text
Search
Technology Chips — full width horizontal scroll

题目 · N 道                         [ funnel 筛选 ]
```

Filter 放到它真正作用的题目列表 Heading 上。

### 3. Evidence hierarchy

旧：

```text
3 份面经 · 2 家公司   17px
ByteDance             17px
Meituan               17px
```

三者同层级，容易把 Overview 看成第三个 Company。

新：

```text
[题目出现记录]
11 份面经 · 5 家公司     ← Overview Surface

按公司 · 5 组             ← Group label

ByteDance · 4份           ← Company
  Role / Round
  Platform · Date
```

## Critical Data Fix

V0.6.0.4 误把 `final-review/` 子目录当作完整 Evidence Corpus。

结果：

```text
iq-warehouse-layering-001
权威校准：11 份 / 5 家公司
错误前台：3 份 / 2 家公司
```

V0.6.0.5 修正为：

```text
canonical-frequency-v0.3.8.yaml
+
canonical-frequency-supplement-v1.yaml
        ↓
verified_direct.ids / companies
        ↓
Frontstage Counts
```

Evidence Detail 再用这些 Verified IDs 到所有 Evidence 子目录查 Metadata。

因此：

- 频次数字来自完整校准记录；
- 来源详情来自实际 Evidence 文件；
- 历史 V0.3.8 不为 UI 修改而被重写；
- 后续 Current Supplement 可以覆盖旧题或增加新题。

## Dynamic Number Audit

| UI Number | Source |
| --- | --- |
| 学习阶段总数 | `taxonomy.stages.length` |
| Stage 内知识节数 | `getKnowledgeForStage(...).length` |
| 最近学习 N / M | 当前 Knowledge Index + Stage Knowledge Count |
| 面试题总数 | Current Interview Bank Array |
| 筛选结果数 | Filtered Question Array |
| 题目排名 | Current Sorted Interview Registry |
| 面经数量 | Current Canonical Frequency `verified_direct.ids` |
| 公司数量 | Current Canonical Frequency `verified_direct.companies` |
| 某公司记录数 | Company Group `items.length` |

不属于动态库存数字：

```text
30 秒回答
30 秒理解
L1-L5
10B Backfill
100 Concurrent Writers
```

## Design Conformance Findings

已修：

- TopBar / BottomNav 移除透明 Blur，避免 Glassmorphism；
- Technology Chip 触控高度提升到 >=44px；
- ContinueLearning 使用 Surface + Hairline，无 Shadow；
- FilterChip Selected 使用 Ink Fill，不使用 Signal Blue Fill；
- Evidence 只保留一个展开入口；
- Source URL 保留后台，不前台外跳；
- BottomSheet 继续维持 82vh / focus trap / Escape / restore focus；
- BottomNav Label 提升到更接近 Meta Scale；
- StageRow 的 Chevron 移除已写入 Design System V1.1，不再让规范与实现冲突。

## Design System Revision

本轮将：

```text
Design System V1.0
→
Design System V1.1
```

这是 Mobile Validation Revision，不改变：

```text
Top-level IA
Color Architecture
Typography Scale
Truthfulness Boundary
```

主要把已经经过手机实测确认的组件行为写回规范。
