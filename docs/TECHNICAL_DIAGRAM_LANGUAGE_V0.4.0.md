# Technical Diagram Language V0.4.0

## 目标

DataRoadmap 的图不是装饰物，而是学习内容。

一张图至少回答一个问题：

- 数据怎么流？
- 状态怎么变？
- 谁依赖谁？
- 故障发生在哪里？
- 两种方案差异在哪里？

## 1. 五类图

```text
Architecture
Pipeline / Data Flow
State / Lifecycle
Failure / Recovery
Comparison
```

## 2. 基础元素

### Node

默认：

```text
white / warm surface
1px neutral border
8–10px radius
```

Active：

```text
Signal Soft fill
Signal border
```

Failure：

```text
Danger Soft
Danger border
```

不要用 8 种颜色表示 8 个组件。

### Edge

默认路径：

```text
1.25px neutral
```

当前讲解路径：

```text
1.5px Signal
```

错误 / rollback：

```text
1.5px Danger
dashed when semantic means rollback / retry
```

### Label

```text
Node title     14px semibold
Node note      12px regular
Technical ID   12px mono
Edge label     12px
```

## 3. 布局语义

### 数据流

优先：

```text
Top → Bottom
```

手机天然可读。

### 依赖图

复杂依赖允许：

```text
Left → Right
```

但 390px 下必须提供 vertical reflow 或可聚焦子图。

### 状态机

状态 Node + transition label，不把状态和事件混在同一层。

## 4. 示例：CDC Pipeline

```text
MySQL
  │ binlog
  ↓
CDC
  │ events
  ↓
Kafka
  │ partitions
  ↓
Flink
  │ normalized stream
  ↓
Iceberg
  │ snapshot
  ↓
Trino / Serving
```

Accent 只高亮当前讲到的一段。

## 5. 示例：Flink Recovery

```text
Running
  ↓ checkpoint
Checkpoint N
  ↓ failure
Failed
  ↓ restore
State N + Source Position
  ↓ replay
Running
```

Rollback / Replay 使用 dashed 或 danger semantics。

## 6. Comparison 图

不要使用营销型“我们全是绿勾、别人全是红叉”。

使用对称结构：

```text
Iceberg     | Hudi
------------|------------
Commit      | Commit
CDC         | CDC
Streaming   | Streaming
Metadata    | Metadata
Operations  | Operations
```

## 7. Mobile Rule

390px 是设计基准之一。

如果图在 390px 需要用户缩小到 60% 才看得见，就是失败。

处理顺序：

1. 横向改纵向；
2. 合并次要 Node；
3. 分为 Overview + Detail；
4. 最后才允许横向滚动。

## 8. Accessibility

每张关键图必须同时有：

- `alt` 或图下注释；
- 文本版关系；
- 不依赖颜色单独表达；
- 关键 Edge 有 Label。
