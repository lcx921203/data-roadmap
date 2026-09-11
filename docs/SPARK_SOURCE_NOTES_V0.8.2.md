# Spark Source Notes V0.8.2

Validation date: 2026-09-11
Baseline: Apache Spark 4.2.0

## Primary references

Spark SQL Performance Tuning:
https://spark.apache.org/docs/4.2.0/sql-performance-tuning.html

Spark SQL / DataFrame:
https://spark.apache.org/docs/4.2.0/sql-programming-guide.html

EXPLAIN:
https://spark.apache.org/docs/4.2.0/sql-ref-syntax-qry-explain.html

Data Source V2 read capability APIs:
https://spark.apache.org/docs/4.2.0/api/java/org/apache/spark/sql/connector/read/

## Confirmed current behavior

### Statistics

Spark 4.2.0 documentation explicitly identifies three statistics sources:

- data-source statistics;
- catalog statistics;
- runtime statistics from AQE.

Missing or inaccurate statistics can lead to poor execution plans.

Plan estimates can be inspected with:

```text
EXPLAIN COST
DataFrame.explain(mode="cost")
```

### Join planning

Spark currently supports join strategy hints including:

```text
BROADCAST
MERGE
SHUFFLE_HASH
SHUFFLE_REPLICATE_NL
```

A hint is not an unconditional guarantee; the requested strategy must be compatible with the join.

### AQE

AQE is enabled by default in current Spark.

Current documented adaptive behaviors include:

- post-shuffle partition coalescing;
- sort-merge join to broadcast-hash join conversion;
- sort-merge join to shuffled-hash join conversion;
- skewed shuffle partition / skew join optimization.

### Skew

Current AQE skew join optimization can split skewed partitions and replicate data from the other join side when needed.

Exact skew thresholds are configuration details and are not frozen into the learning model.

### Pushdown

Current Data Source V2 APIs expose capabilities for:

- required-column pushdown;
- filter pushdown;
- aggregate pushdown;
- limit / top-N pushdown;
- join pushdown;
- runtime filtering.

Actual support is data-source specific.

## Guardrails

Revalidate before teaching exact values for:

- auto-broadcast threshold;
- shuffle partition default;
- AQE advisory partition size;
- skew threshold / factor;
- local shuffle reader behavior;
- join preference properties.

These are version / workload-sensitive implementation details, not core mental-model constants.
