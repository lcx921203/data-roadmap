# V0.7.1.1 Stage Topic Labels

## Goal

Stage 列表右侧不再重复展示低信息密度的 `L5`。

改为展示当前 Knowledge Article 的 Topic：

```text
Iceberg
Trino
```

因为 Stage 04 当前同时包含多个 L5 Core 组件，
用户更需要快速回答：

```text
这一节属于哪个组件？
```

而不是重复回答：

```text
这一节是不是 L5？
```

## Display Rule

Stage list:

```text
Title                         Topic
Summary                       Iceberg / Trino
```

Knowledge detail metadata:

```text
Iceberg · L5 · 深度掌握
Trino · L5 · 深度掌握
```

因此：

- Topic 承担快速定位；
- Learning Depth 继续保留在详情页；
- 不改变知识排序；
- 不新增 Card / Divider / Sticky UI；
- 不改变 Iceberg / Trino 内容结构。

## Implementation

新增：

```text
src/utils/knowledgeLabels.ts
```

作为 Topic 的显示名称规范化入口。

StagePage 和 KnowledgeDetailPage 复用同一个规则，避免以后出现：

```text
Stage = Trino
Detail = Lakehouse
```

这样的信息不一致。
