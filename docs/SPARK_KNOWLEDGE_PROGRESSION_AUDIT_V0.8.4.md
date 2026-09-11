# Spark Knowledge Progression Audit V0.8.4

## Result

PASS

Spark Learn V1 is complete at 12 nodes.

The audit criterion is:

> Does each lesson depend on the previous causal model and create the need for the next lesson?

not:

> Does the curriculum contain every Spark term?

## Causal chain

```text
01 Spark Overview
why → establish compute-engine boundary

02 Driver / Executor / Cluster Manager
why → identify who controls and who executes an application

03 DataFrame / Dataset / Lazy Evaluation / DAG
why → explain how user transformations become deferred computation

04 Job / Stage / Task / Shuffle
why → turn lazy dependencies into distributed executable work

05 Partition / Parallelism / Repartition / Coalesce
why → explain how work is divided and how much parallel work exists

06 Spark SQL / Catalyst / Physical Plan
why → structured work needs a concrete physical execution plan

07 Join Strategy / Statistics / AQE
why → physical planning must choose data movement and adapt to real sizes

08 Skew / Shuffle Pressure / Straggler
why → data movement creates uneven partition and long-tail risk

09 Memory / Cache / Spill / OOM
why → partition size and skew become task working-set pressure

10 Structured Streaming Execution
why → the same SQL runtime must now handle never-ending input

11 State / Watermark / Checkpoint / Exactly-once Boundary
why → incremental queries need cross-trigger state and recoverable progress

12 Failure / Observability / Backfill / Capacity
why → all mechanisms become one production diagnosis and capacity model
```

## Fragmentation audit

PASS

Primary topics have one owner:

- Application runtime: node 02
- Lazy execution: node 03
- Job / Stage / Task / Shuffle: node 04
- Partition / parallelism: node 05
- Catalyst / physical planning: node 06
- Join / AQE: node 07
- Skew: node 08
- Memory / cache / spill: node 09
- Streaming execution: node 10
- Streaming state / watermark / checkpoint: node 11
- Production diagnosis / capacity: node 12

Later nodes refer backward but do not restart concepts from zero.

## Spark / Iceberg boundary

PASS

Spark owns:

```text
Partition
Task
Shuffle
Writer-side compute distribution
Backfill compute pressure
```

Iceberg owns:

```text
Data File
Manifest
Snapshot
Table-format commit semantics
Delete applicability
```

Spark may explain why writer-side parallelism creates small files but does not reteach Iceberg metadata internals.

## Spark / Trino boundary

PASS

Spark SQL content is taught through:

```text
Application runtime
Catalyst
Stage / Task / Shuffle
AQE
```

Trino remains responsible for its own:

```text
Coordinator / Worker
Connector runtime
Resource Groups
FTE
```

Shared terms such as Stage or CBO are not assumed to have identical runtime semantics.

## Spark / Flink boundary

PASS

Spark owns its own Structured Streaming execution, state, watermark and checkpoint semantics.

The Spark vertical does not teach:

- Flink JobManager / TaskManager;
- operator chains;
- checkpoint barrier alignment;
- Flink state backend internals.

These remain for the future Flink vertical.

## Closure rule

Spark Learn V1 is closed at 12 / 12.

V0.8.5 may add Scale / Interview relations but must not insert new Spark core-mechanism chapters unless a verified technical gap is found.
