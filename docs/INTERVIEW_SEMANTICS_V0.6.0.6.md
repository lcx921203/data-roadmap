# Interview Semantics V0.6.0.6

## Why

移动端实测发现两个语义混淆：

1. Interview Answer 内的 `Scale Lab` 与顶级导航 `Scale` 看起来像两套相同功能；
2. `真实关联追问` 只有题目，没有站内答案。

## Final distinction

```text
Interview / 规模追问
= 当前主问题在更大规模、并发、SLO、故障约束下怎么继续回答
= 短、贴近当前题
= 不创建第二份完整 Scale Lab

Top-level Scale / 生产场景
= 独立系统设计训练
= 完整 Scenario → Constraint → Bottleneck → Design → Cost → Recovery
```

如果规模追问值得完整展开：

```text
Interview 规模追问
→ stable scenario_id
→ 站内 Scale Detail
```

## Follow-up answers

V1.0：

```text
真实关联追问
→ 只有问题
```

V1.1：

```text
关联追问
→ 点击展开精简 Curated Answer
```

当前 10 道已整理主问题的追问全部加入第一版预制答案。

它们默认属于：

```text
curated_extension
```

除非某条追问本身已有独立 Interview Evidence 和 Canonical Question ID，否则不能称为“真实高频追问”。

## Scale parameter rendering

Interview 里的：

```text
10,000 张表
3,000 个指标
500 条 Pipeline
```

以及：

```text
P0 / P1 / P2
```

是系统设计参数，不是代码。

因此 V1.2 不再渲染为：

```text
black CodeBlock + Copy
```

而使用轻量 Row / Divider。

## Related page cleanup

- Evidence：公司按记录数降序；公司内日期倒序；删除重复“5 组”。
- Scale List：删除 `SENIOR` 枚举，只显示领域。
- Projects：删除重复 `PROJECTS` eyebrow，使用北美项目 / 阿虎医考 / 彩视直播为主标题。
