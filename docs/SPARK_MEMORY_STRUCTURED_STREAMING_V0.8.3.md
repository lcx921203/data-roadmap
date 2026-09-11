# Spark Memory & Structured Streaming V0.8.3

## Scope

Published:

```text
09 Memory / Cache-Persist / Serialization / Spill / OOM
10 Structured Streaming Execution Model
11 State / Event Time / Watermark / Checkpoint / Exactly-once
```

No UI changes.
No Scale scenarios.
No Interview frequency changes.

## Progression

```text
Skew / Partition
→ Task Working Set
→ Execution / Storage Memory
→ Spill / GC / OOM

then

Unbounded Input
→ Trigger / Progress
→ Incremental Query
→ Stateful Operator
→ State Store
→ Event Time / Watermark
→ Checkpoint
→ Recovery
→ Sink Semantics
```

## Node 09 freeze

The memory model is:

```text
Execution Memory
+
Storage Memory
→ shared Unified Memory Region
```

Important rules:

- cache is a performance optimization, not durable storage;
- execution can evict some cached storage when necessary;
- spill exchanges memory pressure for disk / CPU / serialization cost;
- OOM diagnosis starts from the task working set and data distribution, not from executor-memory tuning alone.

## Node 10 freeze

Structured Streaming remains built on Spark SQL.

Default execution model:

```text
Micro-batch
```

Modern alternatives are kept distinct:

```text
Micro-batch
Real-Time Mode
Continuous Processing
```

Real-Time Mode is a modern Spark 4.x low-latency path with source / operator / sink support boundaries.

Continuous Processing remains a separate low-latency execution model with different fault-tolerance semantics.

None of these are presented as identical to the Flink runtime.

## Node 11 freeze

The state model is:

```text
Event Time
→ Stateful Operator
→ State Store
→ Watermark / TTL / Timer
→ State Retention
```

The recovery model is:

```text
Replayable Source
+
Checkpointed Progress
+
Recoverable Processing State
+
Safe Sink Semantics
→ End-to-end delivery guarantee
```

Therefore:

```text
Checkpoint
≠
Exactly-once by itself
```

## Watermark rule

Watermark is not a precise timer that drops every record exactly `delayThreshold` late.

It advances from observed event-time progress and enables supported operators to bound state and late-data handling.

The latency / completeness / state-size trade-off is explicitly part of production design.

## Next

Only one Spark Learn node remains:

```text
12 Failure / Observability / Backfill / Capacity
```

V0.8.4 must introduce no new core Spark mechanism.
