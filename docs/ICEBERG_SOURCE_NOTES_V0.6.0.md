# Iceberg Source Notes V0.6.0

本轮技术内容以 Apache Iceberg 官方文档 / Table Spec 与 Trino 官方 Iceberg Connector 文档为主要校验来源。

Review date: 2026-09-11

## Apache Iceberg

- Table Spec / Optimistic Concurrency:
  https://iceberg.apache.org/spec/

- Spark Writes / Distribution Modes / File Size:
  https://iceberg.apache.org/docs/latest/spark-writes/

- Spark DDL / Write Ordering / Partition Evolution:
  https://iceberg.apache.org/docs/latest/spark-ddl/

- Configuration:
  https://iceberg.apache.org/docs/latest/configuration/

- Maintenance:
  https://iceberg.apache.org/docs/latest/maintenance/

- Spark Procedures:
  https://iceberg.apache.org/docs/latest/spark-procedures/

## Trino

- Iceberg Connector:
  https://trino.io/docs/current/connector/iceberg.html

## Version Boundary

当前文档写法尽量使用稳定概念，不把 “latest docs” 的具体默认值硬编码成用户项目事实。

例如：

```text
write.distribution-mode
target file size
retention
connector procedures
metadata table columns
```

生产项目应以实际 Iceberg / Spark / Trino 版本的官方文档和运行配置为准。

Source Code Learning 也优先讲职责路径，不把某个版本的具体 Java 类名冻结为永久知识。
