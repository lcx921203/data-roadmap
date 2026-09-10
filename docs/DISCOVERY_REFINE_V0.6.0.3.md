# V0.6.0.3 Discovery Refine

## Continue Learning

首页“继续学习”不再使用浅灰描边卡片 + 孤立蓝色 CTA。

现在整块轻蓝 Surface 是一个点击入口：

- 整块可点击；
- 不出现单独“继续”按钮；
- 显示最近学习章节；
- 显示当前章节在 Stage 中的位置；
- 进度条仍表示“学习位置”，不是完成率。

## Interview Discovery

Search 与 Quick Tags 分工：

```text
Search
= 我知道我要解决什么问题 / 场景

Quick Tags
= 我知道今天想刷什么技术
```

Search 会匹配：

- 题目正文；
- 技术别名；
- 场景关键词；
- 故障关键词。

例如：

```text
数据倾斜
指标不一致
历史回填
慢查询
迟到数据
```

Quick Tags 使用当前题库实际有覆盖的技术 / 领域：

```text
Spark
Flink
Kafka
SQL
HDFS
OLAP
数仓
湖仓
治理
架构
```

没有真实题目覆盖的组件，不提前显示空标签。

## Advanced Filter

频次和答案状态不再占用第一层快捷标签，而是进入 Bottom Sheet：

- 核心重复题；
- 多次重复题；
- 有重复证据；
- 真实单次题；
- 答案已整理。

后续当 Evidence Index 能稳定按公司聚合后，再加入 Company Filter。
