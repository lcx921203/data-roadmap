# Three-Tab Product Contract V0.6.2.1

## 1. Decision

DataRoadmap 的公共产品信息架构正式冻结为：

```text
Learn
Interview
Scale
```

`Projects` 从 Frontstage（前台）移除。

原因不是 Project Case 内容没有价值，而是作者自己的项目经历不具有足够的公共产品普适性。

DataRoadmap 面向任何数据工程学习者，因此一级导航必须回答用户自己的问题，而不是展示作者自己的经历。

---

## 2. Product Loop

三 Tab 对应：

```text
Learn
我应该懂什么？
        ↓
Interview
企业会怎么问？
        ↓
Scale
生产约束扩大后怎么设计？
```

更完整的能力链路：

```text
Understand
→ Build
→ Scale
→ Explain
```

三者共享同一知识图谱，但职责互不替代。

---

## 3. Learn Contract

Learn 是可复用 Knowledge System（知识系统）。

负责：

- Concept
- Internal Mechanism
- Production Pattern
- Code / Config
- Failure / Performance
- Production Engineering Principles

不依赖作者个人项目才能成立。

---

## 4. Interview Contract

Interview 是 Evidence-backed Interview System（证据驱动的面试系统）。

负责：

- real Interview Evidence;
- canonical question;
- verified frequency;
- curated answer;
- follow-up;
- Learn / Scale mapping.

禁止为了覆盖 Knowledge 而生成伪题或伪频率。

---

## 5. Scale Contract

Scale 是 Production Scenario Training（生产场景训练）。

完整结构：

```text
Scenario
Scale Parameters
Constraints
Failure / Bottleneck
Design
Trade-offs
Observability
Cost
Recovery
```

默认保持明确的 hypothetical（假设训练）边界。

---

## 6. Projects Policy

`Projects` 不再拥有：

- public route;
- bottom navigation item;
- desktop navigation item;
- public vertical-slice responsibility;
- public cross-tab mapping target.

仓库中的 Project Case / project mapping 可以暂时作为 Backstage Editorial Context 保留，用于作者个人事实核验和内容编辑。

未来如果支持用户自己的项目，应重新设计：

```text
Personal Workspace
→ My Projects
→ My Resume
→ My Interview Stories
```

它是用户私有能力，不是作者项目展示页。

---

## 7. Routing Contract

合法 Frontstage Routes：

```text
#/learn
#/interview
#/scale
```

旧地址：

```text
#/projects
```

不再识别，自动回落到 Learn。

---

## 8. Iceberg Vertical Slice

Iceberg 产品闭环重新定义为：

```text
Iceberg Learn
    ↓
Iceberg Scale
    ↓
Iceberg Interview
    ↓
Cross-Tab Navigation
```

Project Case 不再是 Definition of Done（完成标准）。

---

## 9. Supersession

本文档覆盖以下旧定义中的前台 Projects 规则：

- `docs/FOUR_TAB_CONTENT_CONTRACT_V0.6.1.md`
- `DESIGN.md` 中旧的 Four-Tab Information Architecture / Projects frontstage 章节
- 历史 prototype 中的 Projects navigation

旧文件可以保留用于版本历史，但不得作为当前产品信息架构依据。
