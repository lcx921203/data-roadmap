---
id: kb-trino-catalog-connector-spi-001
type: knowledge
title: Catalog, Connector & SPI Boundary
title_cn: Catalog、Connector 与 SPI 边界
stage_id: '04'
domain: lakehouse
topic: trino
order: 14
learning_depth: L5
stack_role: core
difficulty: advanced
content_status: trino_l5_v1
summary: Catalog 把一个 Trino 名称空间绑定到 Connector；Connector 通过 SPI 把外部系统的 Metadata、Statistics、数据位置与读写能力翻译给 Trino Core。
prerequisites:
  - kb-trino-query-lifecycle-001
related:
  - kb-trino-query-planning-001
  - kb-iceberg-trino-read-path-001
---
# Catalog、Connector 与 SPI 边界

## 30 秒理解

Trino 能查询很多数据源，不是因为 Trino Core 内置理解所有系统。

而是因为：

**Catalog（目录配置）**

把一个 Trino 名称空间绑定到某个：

**Connector（连接器）**

Connector 再通过：

**SPI（Service Provider Interface，服务提供者接口）**

向 Trino Core 提供统一能力。

先记住：

**Catalog Name → Connector → External Data Source**

例如：

**lakehouse → Iceberg Connector → Iceberg Catalog + Object Storage**

**mysql_prod → MySQL Connector → MySQL**

## 三段式名字到底是什么

Trino 中常见表名：

```text
catalog.schema.table
```

例如：

```sql
SELECT *
FROM lakehouse.sales.orders;
```

这里：

**lakehouse**

是 Trino Catalog。

**sales**

是这个 Connector 暴露出来的 Schema。

**orders**

是 Table。

所以 Trino 在看到：

`lakehouse.sales.orders`

以后，第一件重要的事就是：

> `lakehouse` 应该交给哪个 Connector？

## Trino Catalog 和 Iceberg Catalog 不是一回事

这是一个非常容易混淆的名字。

**Trino Catalog**

是 Trino 里的配置和命名入口。

例如：

```text
etc/catalog/lakehouse.properties
```

里面会声明：

```properties
connector.name=iceberg
```

这表示：

**Trino 的 `lakehouse` Catalog 使用 Iceberg Connector。**

但 Iceberg 自己也有 Catalog 概念，例如：

- REST Catalog；
- JDBC Catalog；
- Hive Metastore；
- Glue；
- 其他实现。

因此更准确地看：

**Trino Catalog**

→ **Iceberg Connector**

→ **Iceberg Metadata Catalog**

→ **Iceberg Table Metadata / Object Storage**

不要把两个 Catalog 当成同一个组件。

## Connector 为什么叫“翻译层”

不同数据源对“表”的理解差异很大。

MySQL 里的表：

- Metadata 在数据库内部；
- 数据页由数据库自己管理；
- SQL 和索引能力由 MySQL 提供。

Iceberg 里的表：

- Metadata 是 Table Format Metadata；
- 数据通常在 Object Storage；
- 文件可能是 Parquet；
- Snapshot / Manifest 由 Iceberg 语义管理。

但 Trino Core 希望统一问：

- 这张表存在吗？
- 有哪些 Column？
- Data Type 是什么？
- Statistics 是什么？
- 数据怎样切成可并行处理的工作单元？
- 哪些 Filter 可以下推？
- 怎样读数据？

Connector 的作用就是：

> 把各个数据源自己的语义翻译成 Trino Core 能理解的统一接口。

## SPI 是什么

SPI 可以先理解成：

**Trino Core 和 Plugin / Connector 之间的契约。**

它不是一个单独部署的服务。

而是一组 Connector 需要实现或参与的接口能力。

高层看，Connector 需要向 Trino 提供几类信息。

### Metadata

例如：

- Schema / Table 是否存在；
- Column；
- Data Type；
- Table Handle；
- 写入能力。

### Statistics

例如：

- Row Count；
- Column Statistics；
- 数据分布相关统计。

这些会在后面的 CBO 中产生重要作用。

### Split / Data Location

Trino 要并行执行，必须把数据切成 Worker 能处理的工作单元。

Connector 会参与告诉 Trino：

> 哪些数据块 / 文件 / Partition 可以被作为 Split 读取？

第 5、6 节会继续展开。

### Read / Write

Connector 还需要参与真正的数据读取和部分写入能力。

具体能力取决于 Connector 和底层系统。

所以不要认为：

> 只要 Trino 支持一个 SQL 语法，所有 Connector 都一定能以相同方式执行。

## 一个最小 Catalog 配置

最简单的 Catalog 可以长这样：

```properties
# etc/catalog/tpch.properties
connector.name=tpch
```

这就创建了一个名为：

`tpch`

的 Trino Catalog。

之后可以：

```sql
SELECT *
FROM tpch.tiny.orders;
```

真实 Iceberg、MySQL、PostgreSQL Connector 会有更多配置。

但核心模式不变：

**Catalog 配置决定使用哪个 Connector。**

## 为什么 Connector 能影响性能

因为 Connector 不只决定“能不能查”。

它还影响：

- 能不能 Filter Pushdown；
- 能不能 Projection Pushdown；
- 能不能 Aggregate / Join Pushdown；
- 能拿到什么 Statistics；
- Split 怎么生成；
- 数据读取格式和路径。

所以同一个 SQL，在不同 Connector 上：

**执行计划和实际扫描成本可能完全不同。**

这也是为什么以后做 Trino Performance Tuning（性能调优）不能只盯 Trino Core。

## Iceberg Connector 在哪里结束

到了 Iceberg 场景，Connector 会利用 Iceberg 的表状态和 Metadata 做数据发现。

但这一章不重新解释：

- Snapshot；
- Manifest List；
- Manifest；
- Delete Applicability。

这些属于 Iceberg Vertical Slice。

Trino 这里只关心：

**Connector 最终如何把可读范围和能力暴露给 Query Engine。**

## 这一节先不要学什么

现在不要展开：

- Connector Java Source Code；
- Connector SPI 每个 Interface 名；
- Iceberg Manifest 遍历实现；
- Join Pushdown 细节；
- CBO Join Strategy。

否则很容易从“架构边界”跳进实现碎片。

## 关联知识

下一节进入 **从 SQL 到 Distributed Plan**。

现在 Coordinator 已经能够通过 Connector 获取：

- Table；
- Column；
- Type；
- Metadata；
- Statistics。

下一步自然就是：

> 这些信息如何和 SQL 一起变成可执行的 Query Plan？
