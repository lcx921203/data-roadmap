# PRODUCT.md

# DataRoadmap

> From Data Engineering to AI

## 1. 产品定位

DataRoadmap 是一个围绕现代数据工程、数据平台、数据架构和 AI Data Agent 构建的生产导向学习与面试产品。

它面向所有使用者，而不是围绕作者个人项目经历组织产品。

核心能力闭环：

```text
Understand
理解技术
   ↓
Build
理解生产实现
   ↓
Scale
处理规模、稳定性与系统设计
   ↓
Explain
应对真实面试
```

## 2. 三个顶级产品入口

```text
Learn
Interview
Scale
```

### Learn

回答：

> 我应该懂什么？生产系统为什么这样设计？

内容包括：

- 技术原理；
- 内部机制；
- Production Pattern（生产模式）；
- 配置 / 代码；
- 故障与性能；
- 可复用的生产工程原则。

### Interview

回答：

> 企业真实面试到底在问什么？我应该怎样解释？

内容包括：

- 真实 Interview Evidence（面试证据）；
- Canonical Question（标准题）；
- Curated Answer（预制题解）；
- 真实频率校准；
- 关联追问；
- 与 Learn / Scale 的映射。

### Scale

回答：

> 当数据量、吞吐、并发、SLO、稳定性、成本和故障约束扩大后，系统应该怎样设计？

Scale 是完整的生产场景训练层，覆盖：

- Capacity（容量）；
- Throughput（吞吐）；
- Concurrency（并发）；
- Reliability（可靠性）；
- Observability（可观测性）；
- Cost（成本）；
- Recovery（恢复）；
- System Design（系统设计）。

## 3. Projects 不再是前台产品能力

个人项目、简历项目和作者自己的工程案例不适合作为公共产品的一级导航。

因此：

```text
Projects
≠ Public Tab
≠ Public Product Loop
```

已有项目资料可以继续作为 Backstage Editorial Context（后台编辑上下文）帮助内容作者校验知识或准备个人面试，但：

- 不进入顶级导航；
- 不决定公共学习范围；
- 不作为普通用户必须理解的上下文；
- 不把个人经历包装成通用产品内容。

未来如果产品需要“用户自己的项目”，应作为独立的 Personal Workspace（个人工作区）能力设计，而不是恢复作者项目 Tab。

## 4. Learn / Interview / Scale 使用同一知识图谱

```text
Knowledge
   ↕
Interview
   ↕
Scale
```

三者职责不同，但通过稳定 ID 互相连接。

Learn 不由 Interview 自动生成。
Interview 不为了填满知识点而编造问题。
Scale 不把假设场景包装成真实经历。

## 5. Production First

学习正文默认遵循：

```text
技术原理
   ↓
Production Pattern
   ↓
Failure / Performance
   ↓
Scale / Cost / Operations
   ↓
Real Interview
```

Demo 或个人项目实现不能替代标准生产答案。

## 6. Scale Truth Boundary

Scale Scenario 默认是训练场景。

如果没有真实运行证据：

- 不声明真实生产规模；
- 不声明真实 SLO；
- 不声明真实事故；
- 不把假设参数写成项目经历。

## 7. V1 不接 AI 实时回答

V1 面试体验：

```text
Question
   ↓
Think
   ↓
Reveal Answer
   ↓
30 秒回答
   ↓
完整题解
   ↓
生产实现
   ↓
真实追问
   ↓
规模化场景
```

所有标准题解提前制作和审核。

未来 AI 可以用于后台内容生产辅助，例如：

- 面经抽取；
- 相似题聚类；
- 标签建议；
- 去重；
- 来源整理。

但不作为 V1 用户端答案来源。

## 8. V1 产品原则

- Production First
- Content as Code
- Git as CMS
- Static First
- Mobile First
- Quality over Quantity
- Real Interview over Generated Questions
- Evidence before Frequency
- Public Product over Personal Portfolio
