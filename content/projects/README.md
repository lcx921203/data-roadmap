# Project Cases

这里存放三个项目案例的事实资产。

项目是知识锚点，不是知识边界。必须严格区分：

```text
Actual
= 已有项目证据支持的实现事实

Boundary
= 当前不能作为项目事实宣称的内容

Knowledge Mapping
= 用哪些知识解释项目，不代表这些问题一定在项目中实际发生过

Interview Mapping
= 与真实面试题建立关联

Scale Extension
= 假设生产规模训练，不是项目经历
```

## Truthfulness Rules

1. `Actual` 只能写有项目工程资料支持的内容。
2. 架构图出现某组件，不自动证明它已经完整落地。
3. 有源码不自动等于通过生产运行验证。
4. Knowledge relevance 不等于 implementation proof。
5. Scale Scenario 默认是 `hypothetical: true`。
6. 生产规模、SLO、QPS、延迟、集群规模和成本数字，没有证据就不写进 Actual。
7. Project Case 可以链接生产知识和 Scale Lab，但必须保留清晰标签。

## Current Cases

- `pj-north-america-iceberg-001`
  - Iceberg vertical slice 的第一个 Project Case。
  - 当前事实级别：`artifact_verified_demo_boundary`。
