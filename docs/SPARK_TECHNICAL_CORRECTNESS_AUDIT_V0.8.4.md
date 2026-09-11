# Spark Technical Correctness Audit V0.8.4

Validation date: 2026-09-11
Baseline: Apache Spark 4.2.0

## Result

PASS WITH VERSION-SENSITIVE GUARDRAILS

## Application runtime

Verified current model:

```text
Application
= Driver + Executors

Cluster Manager
= resource allocation

Task
= work executed by an Executor
```

## Job / Stage / Task

The learning model remains valid:

```text
Action
→ Job
→ Stages
→ Tasks
```

Shuffle dependency is a key stage boundary.

The content intentionally avoids freezing:

```text
one action = exactly one visible Spark UI job
```

as a universal invariant for every SQL / adaptive execution path.

## Partition model

Verified:

```text
one Stage partition
→ one task attempt
```

at the learning-model level.

Task count is distinct from simultaneously runnable task count.

Spark compute partitions remain distinct from Hive / Iceberg table partitions.

## Catalyst / SQL planning

The content correctly separates:

```text
logical semantics
→ analysis / optimization
→ physical execution plan
```

and treats Data Source pushdown as source-capability dependent.

## Statistics / Join / AQE

Current Spark 4.2.0 continues to use statistics for physical plan decisions.

AQE remains enabled by default and can use runtime statistics for:

- post-shuffle partition coalescing;
- join strategy conversion;
- skew optimization.

Exact thresholds and optimizer preferences are intentionally not frozen.

## Skew

The content correctly distinguishes:

```text
large balanced partitions
≠
data skew
```

Salting is a targeted hot-key technique, not a default optimization.

Speculation is not presented as skew repair.

## Memory

The learning model retains the current unified-memory distinction between:

- execution memory;
- storage memory.

The content correctly frames OOM around task working set, distribution, join strategy, cache, spill and GC before executor-size tuning.

## Retry / failure

Current Spark configuration retains bounded task retry behavior.

The content therefore distinguishes:

```text
transient failure
→ retry can help

deterministic failure
→ retry repeats the same failure
```

Exact retry defaults are not frozen as architecture guidance.

## Structured Streaming

The content preserves current Spark 4.2.0 boundaries:

- Spark SQL-based structured engine;
- default micro-batch execution;
- Real-Time Mode as a separate modern low-latency path;
- Continuous Processing as a separate low-latency mode with different semantics.

It does not claim Spark 4.x is architecturally identical to Flink.

## State / Watermark / Checkpoint

The content correctly separates:

```text
event-time progress
state retention
checkpointed recovery
sink delivery semantics
```

and explicitly rejects:

```text
checkpoint enabled
= universal exactly-once
```

## Observability

Current Spark 4.2.0 still supports:

- Web UI;
- persisted Event Logs;
- Spark History Server;
- REST API;
- Metrics System;
- Structured Streaming progress / metrics.

The closure article uses these as observation surfaces without requiring a specific monitoring vendor.

## Capacity

The capacity section teaches calibration:

```text
representative workload
→ baseline
→ increase data / concurrency
→ observe saturation
→ reserve failure headroom
```

No fixed worker, executor, CPU or memory ratio is presented as universal production sizing.

## Version-sensitive guardrails

Revalidate before teaching exact current values for:

- task retry count;
- speculation thresholds;
- dynamic allocation defaults;
- shuffle partition defaults;
- AQE thresholds;
- memory fractions;
- Real-Time Mode support matrix;
- state-store provider behavior;
- History Server retention / compaction settings.
