# Trino Source Notes V0.7.0

## Source Policy

Trino 技术内容优先校验：

1. Trino Current Documentation
2. Trino 官方 Blog / Community Broadcast
3. Trino Release Notes
4. Connector-specific current documentation

旧 Presto / 旧 Trino 资料只用于解释历史，不直接作为当前生产结论。

## Current baseline

V0.7.0 建立结构时重点确认了以下当前能力：

### Architecture

Trino 是分布式 SQL Query Engine。

核心角色：

```text
Coordinator
Worker
Connector
```

### Planning

Query Planning 至少需要区分：

```text
Parser / Analyzer
Logical Plan
Optimizer
Distributed Plan
```

### Connector Boundary

Connector 不只是“驱动”。

它向 Trino 暴露：

- Metadata
- Statistics
- Split / Data Location
- Pushdown 能力
- 读写能力

### Join & Optimization

必须把：

```text
Statistics
CBO
Join Order
Join Distribution
Dynamic Filtering
```

作为一条因果链学习，而不是独立优化技巧。

### Fault-Tolerant Execution

现代 Trino 必须单独讲 FTE。

核心概念：

```text
QUERY Retry
TASK Retry
Exchange Manager
Intermediate Exchange Spooling
```

Task-level Retry 适合更重、运行时间更长的 workload，但不是免费的。

### Spill

Spill 仍然需要理解，但不能教授成：

```text
Memory 不够
→ 开 Spill
→ 问题解决
```

正文阶段必须结合当前 Trino 文档重新校验其适用边界。

## Official references

- https://trino.io/docs/current/
- https://trino.io/episodes/29.html
- https://trino.io/episodes/6.html
- https://trino.io/blog/2022/05/05/tardigrade-launch.html
- https://trino.io/blog/2020/06/14/dynamic-partition-pruning.html

写正文时继续按每个知识点补更精确的 Current Docs 页面。
