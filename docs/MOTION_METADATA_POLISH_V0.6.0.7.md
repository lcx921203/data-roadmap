# Motion & Metadata Polish V0.6.0.7

## Scope

根据 iPhone Safari 实测，收敛三个页面：

- Interview Detail / 规模追问
- Interview Detail / 关联追问
- Scale / 生产场景

同时增加 Continue Learning 的 Current State Motion。

## 规模追问

删除 `INTERVIEW FOLLOW-UP`。

旧的 ASCII：

```text
Conformed Atomic Tables
├── Semantic Query
├── Incremental Aggregate
└── Serving Materialization
```

前台不再打印树符号，转换为真实的缩进与 Hairline 层级。

## 关联追问

整行仍是点击区域。

右侧 `+ / −` 从圆形迷你按钮改为安静状态符号，减少连续圆圈造成的视觉噪音。

## Scale Metadata

旧：

```text
数据规模   资源隔离   查询 SLO   成本
```

新：

```text
数据规模 · 资源隔离 · 查询 SLO · 成本
```

描述性 Metadata 与 Projects 保持同一视觉语法。

Scale 页面删除重复 `SCALE LAB` eyebrow，只保留：

```text
Scale
生产场景
```

## Continue Learning 流动高光

允许一个极轻的 Signal Border Moving Highlight：

- 只在 Continue Learning 使用；
- 只在 1px Border 内；
- Signal Blue 单色系；
- 8 秒一圈；
- 无外发光；
- 无 Shadow；
- 无多色霓虹；
- Reduced Motion 自动关闭；
- 不支持 Mask 时回退静态 Hairline。

它表达“当前学习状态”，不是装饰动画。

## Design System

```text
V1.2
→
V1.3
```

新增冻结规则：

- Metadata Grammar；
- Current State Motion Exception；
- Scale Follow-up hierarchy；
- Quiet Follow-up Indicator。
