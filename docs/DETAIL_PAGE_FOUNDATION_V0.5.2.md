# Detail-page Foundation V0.5.2

> V0.5.2 让 V0.5.0 的四个顶级页面从“入口骨架”进入真正可深链的内容页面。

## 本轮完成

```text
Hash Deep Link
↓
Stage Detail
↓
Knowledge Detail
↓
Markdown Front Matter
↓
Interview Detail
↓
Evidence Bottom Sheet
↓
Interview / Learn Reading Mode
↓
Code Collapse / Copy
```

## 1. Deep Link

V0.5.0 只有：

```text
#/learn
#/interview
#/scale
#/projects
```

V0.5.2 增加：

```text
#/learn/stage/04
#/learn/kb-iceberg-overview-001
#/interview/iq-warehouse-layering-001
```

Hash Routing 继续保证 GitHub Pages 刷新不会因为静态服务器缺少子目录而 404。

## 2. Markdown Front Matter

Knowledge 和 Interview Answer 都通过：

```text
---
id:
type:
...
---
Markdown Body
```

驱动 Detail Page。

React 页面不复制第二份文章内容。

## 3. Knowledge Detail

本轮加入一个最小但真实的 Iceberg Foundation Seed：

```text
content/knowledge/kb-iceberg-overview-001.md
```

它的目标是验证完整 Content Pipeline，不代表 Iceberg L5 已经完成。

V0.6 才会继续扩展：

- Manifest；
- Partition；
- Write Ordering；
- Schema Evolution；
- Concurrent Commit；
- Maintenance；
- Failure Recovery；
- Project Mapping；
- Scale Lab；
- Interview Mapping。

## 4. Interview Detail

First 30 每一道题都有可分享的 Detail URL。

如果：

```text
answer_curated: true
```

则加载：

```text
content/interviews/answers/<question-id>.md
```

如果尚未 Curated：

```text
Evidence 仍然可看
Answer 显示 Curation Backlog
```

不使用 Runtime AI 临时补答案。

## 5. Frequency Source of Truth

Answer Markdown 中早期 Front Matter 可能保留 V0.3.5 时的旧 Evidence Count。

V0.5.2 UI 不使用这些旧数字。

当前题目顶部 Frequency / Direct Count / Company Count 统一来自：

```text
first-interview-bank-30-v0.3.8.yaml
```

保证显示当前 V0.3.8 校准结果。

## 6. Evidence Bottom Sheet

Evidence Detail 从：

```text
content/interview-evidence/final-review/*.yaml
```

动态加载。

按：

```text
canonical_question_id
```

映射到题目。

展示：

- Company；
- Role；
- Round；
- Publisher；
- Published Date；
- Reliability；
- Mapping Type；
- Summary；
- Original Source Link。

并按 `independence_group` 去重。

## 7. Reading Mode

```text
Interview
↔
Learn
```

不是两份 Markdown。

Interview 优先展示：

```text
这道题在考什么
故障排查路径
常见错误回答
项目怎么结合
真实关联追问
```

Learn 优先展示：

```text
完整原理
Production 实现
代码 / 配置示例
项目怎么结合
Scale Lab
```

30 秒回答始终位于顶部。

## 8. Code

短代码：

```text
默认展开
```

超过 12 行：

```text
默认折叠
```

支持：

- Expand / Collapse；
- Copy；
- Horizontal Scroll；
- `aria-expanded`。

## 9. Build Gate 增强

Build Validation 现在额外检查：

- First 30 中每个 `answer_curated: true` 都必须存在对应 Markdown；
- Answer Front Matter ID 必须匹配；
- Curated Answer 必须有 `30 秒回答`；
- Iceberg Foundation Seed Front Matter 正确；
- Knowledge 必须有 `30 秒理解`。

## 10. V0.5 状态

V0.5 Web Foundation 的关键链路已经具备：

```text
Content-as-Code
→ Typed Registry
→ List
→ Stable ID
→ Deep Link
→ Detail
→ Evidence
→ Curated Answer
→ GitHub Pages
```

V0.5.2 上线验证通过后，下一阶段进入 V0.6 First Vertical Slice。
