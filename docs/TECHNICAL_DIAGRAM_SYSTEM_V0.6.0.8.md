# Technical Diagram System V0.6.0.8

## Goal

把 DataRoadmap 中“代码块模拟结构图”的内容升级为真正的响应式技术图，同时保持 Content-as-Code。

## Why not PNG / AI generated image

最终产品不使用生图直接承载核心技术结构，因为：

- 手机缩小后文字会不可读；
- 结构修改成本高；
- 无法自然响应式；
- 文字不可搜索；
- 容易出现 AI 生成关系错误。

生图和 Figma 只用于探索视觉方向，不成为运行时依赖。

## Implementation

```text
Markdown
```diagram-iceberg-metadata-tree
```
        ↓
MarkdownBlocks
        ↓
TechnicalDiagram
        ↓
Responsive React + CSS
```

没有新增第三方 Diagram Library。

## First two diagrams

### 1. Iceberg Metadata Tree

```text
Catalog
↓
Table Metadata
↓
Snapshot
↓
Manifest List
↙          ↘
Manifest A   Manifest B
↓            ↓
Data Files   Data Files
```

用于 `kb-iceberg-overview-001`。

### 2. Manifest Detail Tree

```text
Snapshot
↓
Manifest List
↙            ↘
Manifest A    Manifest B
├ Data File   ├ Data File
└ Data File   └ Delete File
```

用于 `kb-iceberg-manifest-tree-001`。

## Mobile behavior

390px：

- 主链保持单列；
- 一对多最多双列；
- 节点标题 13–15px；
- 说明 10–11px；
- 不需要用户横向拖动；
- 不要求放大。

Desktop 使用相同 Component，只增加宽度和间距。

## Visual language

参考方向：

- 技术文章中的轻量手绘 / Process diagram；
- 白色 Canvas；
- Pastel Node；
- Thin Connector；
- No Shadow；
- No Neon；
- 结构比装饰重要。

但正式实现不是手绘图片，而是精确的 HTML/CSS Component。

## Next candidates

如果首轮手机效果通过，再逐步把以下 `text` 结构升级成 Diagram：

1. Iceberg Trino Read Path；
2. Iceberg Commit / Conflict / Retry；
3. Iceberg Partition Evolution；
4. CDC end-to-end flow；
5. Flink Checkpoint / Barrier；
6. Agent Router / Planner / Executor。
