# Trino Runtime Pressure & Reliability V0.7.3

## Scope

Published nodes:

```text
08 Memory / Exchange / Large Query Pressure
09 Concurrency / Queue / Resource Groups
10 Fault-Tolerant Execution & Recovery
```

No UI changes.
No Scale scenarios.
No Interview frequency changes.

## Causal progression

V0.7.2 ended with:

```text
Statistics
→ CBO
→ Join
→ Dynamic Filtering
```

V0.7.3 continues:

```text
Join / Aggregation / Sort
→ Operator State
→ Memory / Exchange Pressure
→ Cluster Concurrency
→ Admission / Queue
→ Failure
→ Retry / Recovery
```

This preserves content-first continuity.

## Node 08

Primary model:

```text
Plan
→ Data Movement
→ Operator State
→ Memory / Network / Skew
→ Slow / OOM
```

Important freeze:

```text
Spill
= legacy memory-pressure mechanism

FTE
= recovery execution model
```

They are not synonyms.

## Node 09

Primary model:

```text
Single Query Cost
× Concurrent Queries
→ Cluster Pressure
→ Queue / Contention / Tail Latency
```

Resource Groups control workload admission and scheduling.

They do not turn logical groups into physically isolated worker fleets.

## Node 10

Primary model:

```text
NONE
→ no FTE retry

QUERY
→ retry whole query

TASK
→ retry failed tasks
→ requires recoverable exchange data
→ Exchange Manager
```

TASK retry is positioned for large batch workloads, with explicit I/O and latency cost.

## Modern Trino correction

Current Trino documentation marks spill-to-disk as legacy functionality and recommends considering task-retry FTE with an Exchange Manager for large workloads.

This is intentionally different from older tuning guides that present spill as the primary solution for memory-heavy queries.

## Next

Only one Learn node remains:

```text
11 Observability / Troubleshooting / Capacity
```

That node must not introduce new engine mechanisms.
It must reorganize nodes 01-10 into a production diagnosis model.
