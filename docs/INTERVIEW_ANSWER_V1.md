# Interview Answer V1

> DataRoadmap Interview Bank 的标准答案规范。  
> Version: **1.0**

## 一份内容，两种使用方式

```text
                 same Markdown
                      │
             ┌────────┴────────┐
             │                 │
       Interview Mode      Learn Mode
       快速面试表达          深度学习
```

不为两种模式维护两份重复答案。

## 必备 Section

每一道 Curated Answer 至少包含：

```text
这道题在考什么
30 秒回答
核心原理 / 完整原理
常见错误回答
项目怎么结合
Scale Lab
真实关联追问
```

Production 型题还必须提供至少一个：

```text
Production 实现
故障排查
性能 / 一致性 / 容错路径
```

## 可选 Section

```text
代码 / 配置
架构图
状态流
SQL 示例
源码路径
容量估算
SLO
```

只在真正帮助回答问题时加入。

## Interview Mode

默认优先级：

```text
1. Question
2. Evidence Summary
3. 这道题在考什么
4. 30 秒回答
5. Troubleshooting / 答题框架
6. 常见错误回答
7. 真实关联追问
```

目标是面试前 1–3 分钟快速复习。

## Learn Mode

默认优先级：

```text
1. 核心原理
2. Production 实现
3. Troubleshooting
4. Code / Config
5. Project Connection
6. Scale Lab
7. Related Knowledge
```

目标是把同一道题学到 L4/L5。

## 30 秒回答规则

必须：

- 第一两句直接回答；
- 不从技术历史开始；
- 可以直接口述；
- 给后续追问留展开点；
- 不塞无关名词。

建议长度：

```text
20–40 秒
3–6 个关键句
```

## Production 规则

Production 内容优先回答真实工程约束：

```text
数据量
增量
并发
一致性
容错
SLO
可观测
成本
Backfill
Schema Evolution
```

不用每题全部覆盖。

## Troubleshooting 规则

优先形成顺序：

```text
症状
↓
验证假设
↓
缩小范围
↓
确认根因
↓
修复
↓
回放 / 恢复
↓
验证
```

禁止写成无优先级的十几个“可能原因”。

## Code 规则

代码是解释工具，不是展示技术栈的装饰。

建议：

- 0–2 个核心代码块；
- 单个主代码块尽量保持可在手机横向阅读；
- 大段源码后续使用折叠；
- 配置值注明“示例”还是“生产建议”；
- 对版本敏感的配置需要技术来源。

## Project Truthfulness

项目关联状态：

```yaml
project_connection:
  status: verified_project_fact
```

表示已核验真实项目事实。

```yaml
project_connection:
  status: needs_project_fact_check
```

表示可以关联，但发布前要核验。

```yaml
project_connection:
  status: no_verified_project_anchor_yet
```

表示暂时没有合适真实项目案例。

任何 Production Pattern 或 Scale Lab 都不能转换为未发生过的项目经历。

## Scale Lab

必须显式是：

> 假设生产规模化练习。

用于回答：

```text
如果数据量 100x 呢？
如果吞吐增加 10x 呢？
如果多租户呢？
如果恢复 SLO 只有 5 分钟呢？
```

Scale Lab 训练架构能力，不给简历“补经历”。

## Evidence 与答案关系

```text
Evidence
证明：这个问题真实出现过

Curated Answer
负责：我们如何高质量回答

Knowledge
负责：完整知识体系

Project Case
负责：真实项目事实

Scale Lab
负责：假设生产规模训练
```

四者不能混淆。

## Publish Gate

```text
Direct Evidence 已验证
+
Dedup 已完成
+
Curated Answer 已完成
+
必要的 Project Fact 已核验或移除
+
Frequency 状态满足发布策略
=
publishable
```
