# DataRoadmap

**From Data Engineering to AI**

DataRoadmap 是一个面向数据工程、数据平台、数据架构与 AI Data Agent 的生产导向学习与面试产品。

它不是“大而全”的技术百科，也不是单纯的八股题库。当前公共产品围绕三个入口：

```text
Learn
Interview
Scale
```

核心原则：

- **Production First（生产优先）**：知识正文优先讲真实生产系统的机制、设计与权衡。
- **Scale Lab（规模化场景）**：独立训练大数据量、高并发、稳定性、故障、成本和系统设计。
- **Real Interview First（真实面试优先）**：题库优先使用真实面经与高可信公开资料。
- **Prewritten Answers（预制题解）**：V1 不接 AI 实时回答，重点题目提前制作并审核。
- **Content as Code**：内容、映射与证据跟随 Git 版本管理。
- **Public Product over Personal Portfolio**：公共产品不以作者个人项目作为一级导航。

## Content model

```text
Knowledge Base
    │
    ├── Production Pattern
    ├── Scale Lab
    └── Interview Bank
```

前台三类内容分别维护：

- `knowledge/`：系统知识与生产实现；
- `interviews/`：真实面试题、证据与预制题解；
- `scenarios/`：规模化场景、排障题、系统设计题。

仓库中历史 `projects/` 内容仅作为后台编辑上下文保留，不属于公共产品 Tab。

## Current vertical slice

当前优先完成 Iceberg：

```text
Learn
  ↓
Scale
  ↓
Interview
  ↓
Cross-link
```

内容闭环稳定后再统一审计 UI。
