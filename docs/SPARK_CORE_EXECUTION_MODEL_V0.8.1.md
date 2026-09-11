# Spark Core Execution Model V0.8.1

## Scope

Published nodes:

```text
01 Spark Overview
02 Driver / Executor / Cluster Manager
03 DataFrame / Dataset / Lazy Evaluation / DAG
04 Job / Stage / Task / Narrow-Wide Dependency / Shuffle
05 Partition / Parallelism / Repartition / Coalesce
```

No UI changes.

No Scale Scenario.

No new Interview Question.

## Progression

```text
Spark as Compute Engine
→ Application Runtime
→ Lazy Dependency Graph
→ Action-triggered Execution
→ Job / Stage / Task
→ Shuffle Boundary
→ Partition / Parallelism
```

At the end of node 05, the learner can explain how an Application becomes distributed work without yet depending on Catalyst, AQE or memory tuning.

## Important correctness boundaries

### Application is not Job

```text
Application
= Driver + Executors

Application
→ one or more Jobs
```

### Action / Job

Learning model:

```text
Action
→ triggers computation / Job
```

Do not freeze a universal strict `1 Action = exactly 1 visible Job` invariant for every Spark SQL / adaptive execution path.

### Stage

The learning boundary is:

```text
Shuffle Dependency
→ Stage Boundary
```

Narrow transformations can usually pipeline inside the same Stage.

### Task

For a Stage:

```text
one Partition
→ one Task
```

Task count is not the same as simultaneously running tasks.

### Partition

Spark compute partitions are not Hive / Iceberg table partitions.

Input partition count is also not universally equal to input file count.

### Repartition vs Coalesce

```text
repartition
→ full redistribution / shuffle
→ increase or decrease partitions
→ more balanced distribution

coalesce
→ mainly decrease partitions
→ usually avoids full redistribution
→ cheaper but may preserve imbalance
```

### Output files

Partition / Task distribution strongly affects output file count and size, but:

```text
1 Spark Partition
≠ universal guarantee of exactly 1 output data file
```

The data source and table writer still matter.

## Iceberg boundary

Spark may explain:

```text
Partition
→ Task
→ Writer-side distribution
→ output file shape
```

Iceberg continues to own:

```text
Data File
→ Manifest
→ Snapshot
→ Commit
```

## Next

V0.8.2 starts:

```text
06 Spark SQL / Catalyst / Physical Plan
07 Join Strategy / Statistics / AQE
08 Data Skew / Shuffle Pressure / Stragglers
```
