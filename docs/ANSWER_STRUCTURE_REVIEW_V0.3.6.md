# Answer Structure Review V0.3.6

> 目标：审查 V0.3.5 的 5 道 First Answer Slice，冻结 Interview Answer V1 结构。  
> 结论：**结构通过，不需要为了移动端把 L5 内容整体压短；改用 Progressive Disclosure（渐进式展开）解决阅读长度。**

## 1. 总体结论

V0.3.5 的方向是对的：

```text
Evidence
↓
这道题在考什么
↓
30 秒回答
↓
核心原理
↓
Production
↓
Troubleshooting
↓
Code / Config
↓
常见错误
↓
Project
↓
Scale Lab
↓
真实追问
```

真正需要校准的不是“再删一半内容”，而是把一份内容同时服务于两种阅读路径：

```text
Interview Mode
快速口述 / 临场复习
```

和：

```text
Learn Mode
原理 / 生产实现 / 排查 / 规模化
```

因此后续前端不复制两套答案，而是读取同一份 Markdown，通过锚点、折叠和模式切换展示不同深度。

---

## 2. 五道答案逐题评审

| Question | 30 秒回答 | 原理深度 | Production | 排查路径 | Code | Truthfulness | 结论 |
|---|---|---|---|---|---|---|---|
| 数仓分层 | 通过 | 通过 | 通过 | 通过 | 合适 | 通过 | PASS |
| 数据质量 | 略密但可口述 | 通过 | 通过 | 很强 | 稍多但合理 | 通过 | PASS |
| Fact / Dimension / Grain | 通过 | 通过 | 通过 | 通过 | 合适 | 通过 | PASS |
| Spark Skew / Salting | 通过 | 很强 | 很强 | 很强 | 较长但必要 | 通过 | PASS |
| Flink Exactly-once | 略密但可口述 | 很强 | 很强 | 通过 | 合适 | 通过 | PASS |

### 数仓分层

优点：

- 没有机械背 ODS/DWD/DWS/ADS；
- 把“职责边界、数据契约、回溯、血缘”放进回答；
- 能自然连接现代 dbt / Semantic Layer / Serving；
- Project 段没有把传统五层虚构成真实项目。

保持当前密度。

### 数据质量

这是五道里信息密度最高的一道，但不是因为冗余，而是题目本身同时包含“体系建设 + 事故定位”。

V1 不拆成两份答案，前端在 Interview Mode 默认展示：

```text
30 秒回答
+
标准排查路径
+
常见错误
```

Learn Mode 再展开 Rule / Result Store / Lineage / Reconciliation / Code。

### Fact / Dimension / Grain

这道最接近 V1 的标准长度和节奏。

关键表达：

```text
Business Process
↓
Grain
↓
Facts
↓
Dimensions
```

足够短，同时可以继续展开 Join Fan-out、SCD 和 Scale Lab。

可作为后续建模类答案的参考样板。

### Spark Data Skew

代码较长，但它不是装饰代码，而是在解释 Hot Key Salting 如何真正落地，因此保留。

前端默认折叠代码，不需要为了手机阅读删掉实现细节。

内容结构保持：

```text
先证明 Skew
↓
定位 Shuffle / Key
↓
先减数据
↓
Broadcast / AQE
↓
必要时 Salting
```

这比“倾斜就加盐”更适合高级岗位。

### Flink Exactly-once

30 秒回答术语较密，但核心区分必须保留：

```text
State
Checkpoint
Barrier
End-to-End Exactly-once
```

移动端不删术语，而是在后续 UI 中对关键术语提供短解释/跳转。

最重要的边界已经表达清楚：

```text
Checkpoint 开启
≠
端到端 Exactly-once 自动成立
```

---

## 3. V1 结构调整

### 调整一：从“固定长页面”改成“双阅读路径”

```text
                   ┌─ 30 秒回答
                   ├─ 排查框架
Question ──────────┤
                   ├─ 核心原理
                   ├─ Production
                   └─ Scale Lab
```

Interview Mode 默认关注：

- 这道题在考什么
- 30 秒回答
- 排查 / 答题框架
- 常见错误
- 真实追问

Learn Mode 默认关注：

- 核心原理
- Production
- Troubleshooting
- Code / Config
- Project
- Scale Lab

两种模式共享一份内容。

### 调整二：代码变成 Optional（可选）

不是所有题都必须有代码。

只有代码能帮助解释：

- 执行机制；
- 配置边界；
- SQL 语义；
- 故障根因；
- 生产实现

时才保留。

### 调整三：Production 与 Troubleshooting 不机械重复

如果题目本身是故障题，例如：

> Spark 数据倾斜怎么排查？

Troubleshooting 就是主干，Production 不需要再重复一遍同样步骤。

如果题目是原理题，例如：

> Flink Exactly-once 怎么实现？

则：

```text
核心原理
→ Production 配置
→ Checkpoint 变慢怎么排查
```

三层都保留。

### 调整四：Project 允许没有“漂亮案例”

Project Section 有三种合法状态：

```text
verified_project_fact
needs_project_fact_check
no_verified_project_anchor_yet
```

`no_verified_project_anchor_yet` 不是内容缺陷。

它比编造一段“我们线上就是这么做的”更正确。

---

## 4. V1 长度指导

这是编辑指导，不是 CI 硬限制。

### 30 秒回答

目标：

```text
20–40 秒
3–6 个关键句
约 80–180 个中文字
```

优先做到：

```text
结论
→ 判断依据
→ 生产边界
```

### L5 完整答案

不设固定字数。

通常应做到：

- 1 个清楚的机制链路；
- 1 个 Production 策略；
- 1 个可执行排查路径；
- 0–2 个真正有价值的代码/配置块；
- 3–5 个常见错误；
- 1 个明确 Scale Lab；
- 4–8 个关联追问。

如果为了满足模板硬填内容，应删掉该节，而不是制造重复。

---

## 5. Mobile-first 结论

内容不需要因为手机端而变浅。

正确方式是：

```text
顶部
Question + Evidence + 30 秒回答
        ↓
Quick Actions
原理 / 排查 / 项目 / Scale
        ↓
折叠的深度 Section
```

未来 React 页面可以支持：

```text
Interview
Learn
```

模式切换，但读取同一个 Markdown。

---

## 6. 评审结果

V0.3.5 First Answer Slice：

```yaml
structure_review: passed
answer_format_version: "1.0"
```

可以冻结 Interview Answer V1，并进入下一阶段。

仍然不能直接把 5 道题设为：

```yaml
publishable: true
```

因为 Evidence Frequency 最终校准与 Project Fact Check 仍是独立发布门槛。
