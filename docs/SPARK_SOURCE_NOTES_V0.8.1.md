# Spark Source Notes V0.8.1

Validation date: 2026-09-11
Current Apache Spark documentation baseline: 4.2.0

## Primary references

Cluster Mode Overview:
https://spark.apache.org/docs/latest/cluster-overview.html

RDD Programming Guide:
https://spark.apache.org/docs/latest/rdd-programming-guide.html

Spark SQL / DataFrame / Dataset:
https://spark.apache.org/docs/latest/sql-programming-guide.html

## Confirmed current behavior

### Application runtime

Current Spark documentation defines an Application as a user program consisting of a Driver and Executors.

Driver / SparkContext coordinates the application.

Cluster Manager allocates resources.

Executors run tasks and store application data.

### Job / Stage / Task

Current Spark glossary defines:

```text
Job
= parallel computation spawned in response to a Spark action

Stage
= smaller set of tasks inside a Job

Task
= unit of work sent to an Executor
```

### Lazy evaluation

Spark transformations remain lazy.

They record transformations / dependencies and are computed when an Action requires a result.

### Shuffle

Current Spark documentation describes Shuffle as redistribution of data across partitions, often across executors and machines.

Shuffle can incur:

- network I/O;
- disk I/O;
- serialization;
- memory pressure.

### Partitions

A Task operates on one Partition for a Stage.

Partition count therefore determines the amount of independent work available to schedule, but real concurrency is bounded by available execution resources.

### Repartition / Coalesce

RDD documentation defines `repartition` as reshuffling data to create more or fewer partitions.

`coalesce` is primarily used to reduce partition count and can avoid a full reshuffle in its normal form.

### Structured APIs

Spark SQL documentation states that structured APIs expose more information about data and computation than raw RDD APIs, enabling additional optimization.

DataFrame is available across Python / Scala / Java / R.

Typed Dataset API is available in Scala / Java.

## Stability guardrails

Do not freeze universal numeric guidance for:

- ideal partition size;
- partitions per CPU;
- executor core count;
- task concurrency;
- file split size.

Those depend on workload, data source, Spark version and cluster environment.
