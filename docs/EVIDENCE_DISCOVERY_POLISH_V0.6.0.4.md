# V0.6.0.4 Evidence & Discovery Polish

## 1. Continue Learning

继续学习保持轻蓝 Surface，但增加一条极轻的冷蓝 Hairline。

目的：

- 明确它是一整块独立可点击入口；
- 不重新引入孤立 CTA；
- 不依赖 Shadow；
- 保持 Design System 的 Surface + Hairline 层级。

## 2. Interview Discovery

删除重复的“按技术快速进入”标题。

技术标签本身就是快捷入口：

```text
全部 · Spark · Flink · Kafka · SQL · HDFS ...
```

右侧增加独立的 Filter Control：

```text
[ sliders icon  筛选 ]
```

它使用圆角矩形 + Hairline，而不是技术标签的 Pill，因此用户可以一眼区分：

```text
Pill = 技术快捷入口
Filter Control = 高级筛选
```

应用高级筛选后：

```text
筛选 2
```

数字表示当前生效的高级条件数量。

## 3. Evidence Summary

题目详情收敛为：

```text
核心重复题
11 份面经 · 5 家公司            面经依据 ›
```

频次结论、证据数量和唯一操作入口职责明确。

## 4. Evidence Sheet

`查看来源` 改为 `面经依据`。

去掉：

- “一手完整记录”等内部可靠性 Badge；
- “直接题目”等后台映射类型；
- 外部原始 URL；
- “打开原始来源”。

保留：

- 公司；
- 岗位；
- 轮次；
- 来源平台；
- 日期。

并按公司聚合，减少重复阅读。

原 URL 仍保存在后台 Evidence YAML 中，继续用于后续核验和审计，但不再成为学习流程中的外跳入口。

## 5. Dynamic Evidence Counts

题目显示的：

```text
N 份面经 · M 家公司
```

优先从当前 `final-review` Evidence 记录动态计算：

```text
direct_question / direct_followup
→ independence_group 去重
→ evidence count
→ unique company count
```

并根据冻结的 Frequency Band V1 阈值动态得出：

```text
核心重复题
多次重复题
跨公司验证题
单公司重复题
真实单次题
```

如果某道题当前 Bundle 中没有加载到 direct evidence，才回退到历史校准字段。

因此以后新增已核验面经 Evidence 后，前台数字不需要手工写死。

## 6. Dynamic Question Count

历史 `First 30` 文件继续冻结，不破坏 V0.3.8 里程碑。

新增：

```text
interview-bank-supplement-v1.yaml
```

App Registry 运行时合并：

```text
First 30
+
Supplement
=
Current Interview Bank
```

Interview 页的：

```text
visible / total
```

直接来自合并后的数组长度。

以后增加第 31、32…道 Canonical Question，不需要修改“30 道”这种页面硬编码。

## 7. L5

Knowledge Badge：

```text
L5 高阶
```

改为：

```text
L5 · 深度掌握
```

L1–L5 表示 Learning Depth（学习深度），不是题目难度。
