# Iceberg Knowledge Spine V0.6.0

> 第一条真正的 L5 Knowledge Vertical Spine。

## 目标

V0.5 已经证明：

```text
Content-as-Code
→ React
→ Detail
→ Evidence
→ GitHub Pages
```

V0.6.0 开始填第一条真正可以学习的主栈内容。

选择 Apache Iceberg，因为它同时连接：

```text
Storage
Compute
Lakehouse
Trino
Serving
Reliability
Scale
Interview
```

## 10 节主干

```text
01 Iceberg Overview
02 Table Metadata & Snapshot
03 Manifest List & Manifest
04 Hidden Partitioning & Partition Evolution
05 Schema Evolution & Field ID
06 Write Distribution & Ordering
07 Optimistic Commit, Conflict & Recovery
08 Maintenance & Small Files
09 Trino Read Path
10 Production Troubleshooting
```

不是百科拆分，而是一条完整读写链。

## 顺序设计

```text
“表是什么”
↓
“当前版本是什么”
↓
“怎么找到文件”
↓
“文件按什么分区”
↓
“Schema 怎么变”
↓
“文件怎么写出来”
↓
“多个 Writer 怎么提交”
↓
“长期怎么维护”
↓
“Trino 怎么读”
↓
“线上怎么排障”
```

## Production First

每节都尽量包含：

```text
30 秒理解
原理
Production 实现
代码 / 配置
性能 / 故障
Scale
Project boundary
关联知识
```

不是只写概念定义。

## Truthfulness

北美项目与 Iceberg 相关性高，但 V0.6.0 不把：

- 具体 Catalog；
- 具体写入参数；
- 具体吞吐；
- 具体 Commit 冲突；
- 具体 Maintenance；
- 具体 SLO；

自动声明为真实项目事实。

统一保持：

```text
project_fact_status: needs_fact_check
```

后续 Project Case 再逐项核验。

## Interview Boundary

Knowledge 可以按照岗位价值完整学习。

Interview Bank 不能因此自动生成：

```text
“Manifest List 是什么？”
“Write Ordering 怎么实现？”
“Concurrent Commit 怎么做？”
```

只有出现真实、可追溯的 Direct Evidence 才进入 Interview Frequency。

当前映射仅连接已有的高层湖仓、选型、并发问题。

## Scale Lab

V0.6.0 建了三条独立 Scenario Seed：

```text
10B Backfill
10-second Streaming Small-file Explosion
100 Concurrent Writers
```

全部：

```yaml
hypothetical: true
```

不允许在项目页面被渲染成 `Actual`。

## UI

Stage 04 会自动按 Front Matter `order` 排序。

Knowledge Detail 新增：

- Quick Navigation；
- Previous / Next；
- Reduced Motion 兼容。

因此 Iceberg 10 节可以在手机上顺序连续阅读。
