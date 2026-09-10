# Product Prototypes V0.4.1

> 本轮把 V0.4.0 Design Foundation 从设计规则推进为 390px Mobile-first 产品结构原型。

## 本轮 6 个页面

```text
Learn Home
Knowledge Detail
Interview List
Interview Detail
Scale Lab Detail
Project Case Detail
```

交互式静态原型：

```text
prototype/v0.4.1/index.html
```

它只验证产品结构和视觉层级，不提前进入 React 工程实现。

## Learn Home

首页不是营销页，也不是“今日计划 / 连续学习 / 排行榜” Dashboard。

```text
Brand + Search
↓
Product Direction
↓
Continue
↓
12-stage Roadmap Rows
↓
4-item Bottom Navigation
```

12 个 Stage 使用 Row，而不是 12 张彩色卡片。

## Knowledge Detail

使用 Iceberg 验证 L5 长内容：

```text
Stage Metadata
↓
Title / Summary
↓
L5 / Core
↓
Quick Navigation
↓
30 秒理解
↓
Architecture Diagram
↓
Core Mechanism
↓
Production Sections
```

正文以阅读为主，只有 Quick Answer、Code 等真正需要 containment 的内容进入容器。

## Interview List

列表直接显示 Evidence：

```text
#01 · CORE VERIFIED
11 direct · 5 companies
数仓为什么要分层？
Warehouse · L5 · Curated
```

排序是 Evidence Priority，而不是随机题或营销热度。

## Interview Detail

第一优先级：

```text
Question
Evidence
30 秒回答
```

之后才是：

```text
Interview | Learn
```

双模式仍然读取一份 Curated Answer。

## Scale Lab

用 10B-row Backfill 验证系统设计页：

```text
Scale Parameters
↓
Constraint
↓
Where it breaks
↓
Design
↓
Trade-off
```

页面明确标记它是假设生产练习，不是项目经历。

## Project Case

固定区分：

```text
Actual
Boundary
Knowledge Mapping
Scale Extension
```

Scale Extension 单独标注 `HYPOTHETICAL SCALE LAB`，避免和实际项目事实混淆。

## V0.4.1 结论

V0.4.0 的几个关键原则在 6 个页面上都能成立：

- Row over Card；
- 20px Mobile Page Padding；
- 单一 Signal Blue Accent；
- 默认无 Shadow；
- 16px 中文正文；
- Evidence 可见；
- 技术图默认纵向；
- Project Fact 与 Scale Lab 可区分；
- Learn / Interview 可共享同一内容源。

下一轮进入 V0.4.2 Component Freeze。
