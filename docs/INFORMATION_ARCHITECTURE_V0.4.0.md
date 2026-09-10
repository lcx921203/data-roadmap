# Information Architecture V0.4.0

## 1. 顶级导航

```text
DataRoadmap
├── Learn
├── Interview
├── Scale Lab
└── Projects
```

Search 为全局能力。

Mobile 使用底部四导航；Desktop 使用左侧导航。

## 2. Learn

```text
Learn
└── Stage
    └── Topic
        └── Knowledge Detail
            ├── Concept
            ├── Production Pattern
            ├── Code / Config
            ├── Failure / Performance
            ├── Project Mapping
            ├── Scale Lab
            └── Interview Mapping
```

Stage 不按供应商组织，而按能力生命周期组织。

## 3. Interview

```text
Interview
├── Evidence-ranked Question List
└── Question Detail
    ├── Evidence
    ├── Interview Mode
    └── Learn Mode
```

Question List 支持：

- Domain；
- Level；
- Frequency Band；
- Company；
- Curated Status。

默认排序不是“最新”，而是 Evidence Priority。

## 4. Scale Lab

```text
Scale Lab
├── Streaming
├── Batch / Spark
├── Lakehouse
├── Semantic / Serving
├── Governance
└── Agent
```

Scenario Detail：

```text
Constraints
→ Bottleneck / Failure
→ Design
→ Trade-off
→ Observability
→ Cost
→ Recovery
```

## 5. Projects

```text
Projects
├── North America
├── Ahu
└── Caishi
```

Project Detail 固定显示：

```text
Actual
Boundary
Knowledge Mapping
Interview Mapping
Scale Extension
```

## 6. Cross-link

四个模式不是四套孤立内容。

```text
Knowledge
 ↕
Interview
 ↕
Project
 ↕
Scale Lab
```

通过稳定 ID 互相跳转。

例如：

```text
Iceberg Knowledge
↓
相关真实面试题
↓
北美项目真实映射
↓
10B Backfill Scale Lab
```

## 7. Mobile Detail Page

统一骨架：

```text
Compact Top Bar
↓
Eyebrow / Metadata
↓
Title
↓
Summary / Quick Answer
↓
Mode-specific Meta
↓
Horizontal Quick Navigation
↓
Long-form Content
↓
Related
```

页面不使用多层嵌套 Card。
