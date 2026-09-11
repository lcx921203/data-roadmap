# Spark Source Notes V0.8.0

Validation date: 2026-09-11

## Version baseline

Current Apache Spark download / latest documentation baseline:

```text
Apache Spark 4.2.0
```

Do not assume older Spark 3.x or early 4.0 behavior is the current default when a feature is version-sensitive.

## Primary current references

Cluster overview:
https://spark.apache.org/docs/latest/cluster-overview.html

RDD / execution foundation:
https://spark.apache.org/docs/latest/rdd-programming-guide

Spark SQL:
https://spark.apache.org/docs/latest/sql-programming-guide

Spark SQL performance tuning / AQE:
https://spark.apache.org/docs/latest/sql-performance-tuning

General tuning / memory:
https://spark.apache.org/docs/latest/tuning

Structured Streaming:
https://spark.apache.org/docs/latest/streaming/

Monitoring:
https://spark.apache.org/docs/latest/monitoring

Current downloads:
https://spark.apache.org/downloads

## Verified current architecture

### Driver / Executor

Spark applications run as independent process sets coordinated by the Driver.

Cluster Manager allocates resources.

Executors run computations and store application data.

### Lazy execution

Transformations construct dependencies.

Actions trigger execution.

This remains the basis for understanding Job / Stage / Task.

### Spark SQL

Spark SQL / DataFrame provides structured information that Catalyst can optimize before physical execution.

Current Spark SQL performance guidance explicitly includes:

- caching;
- partition tuning;
- statistics;
- join strategy;
- Adaptive Query Execution.

### AQE

AQE is enabled by default in modern Spark and can use runtime statistics to:

- coalesce post-shuffle partitions;
- convert join strategy;
- optimize skewed partitions.

Exact defaults are version-sensitive and should be checked again in article-level code/config sections.

### Memory

Spark uses unified memory management where execution and storage share a managed memory region.

Task working-set size is a critical OOM dimension; OOM is not only a question of whether cached datasets fit in Executor memory.

### Structured Streaming

Structured Streaming is built on the Spark SQL engine.

The current default execution model remains micro-batch.

Spark 4.x also contains newer Real-Time Mode support.

The documentation also retains Continuous Processing as a distinct low-latency mode with different fault-tolerance semantics.

Therefore the learning material must keep these concepts separate.

### Exactly-once boundary

Structured Streaming fault tolerance combines progress tracking / checkpointing with replayable sources and sink behavior.

Do not teach:

```text
Checkpoint enabled
= automatically exactly-once for every source and sink
```

as a universal rule.

### Modern stateful processing

Spark 4.x includes TransformWithState as the newer arbitrary stateful processing API.

The learning spine teaches the state model first; API details belong in the article body only where they help understanding.

## Stability guardrails

Revalidate before publishing exact values for:

- broadcast thresholds;
- shuffle partition defaults;
- AQE skew thresholds;
- memory fractions;
- executor sizing;
- retry counts;
- Structured Streaming mode/operator support;
- Real-Time Mode source / sink support;
- state store encoding / provider behavior.
