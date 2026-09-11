# Spark Source Notes V0.8.3

Validation date: 2026-09-11
Baseline: Apache Spark 4.2.0

## Primary references

Tuning / memory:
https://spark.apache.org/docs/4.2.0/tuning.html

Structured Streaming overview:
https://spark.apache.org/docs/latest/streaming/index.html

Structured Streaming getting started / fault tolerance:
https://spark.apache.org/docs/latest/streaming/getting-started.html

Structured Streaming additional information:
https://spark.apache.org/docs/latest/streaming/additional-information.html

TransformWithState:
https://spark.apache.org/docs/latest/streaming/structured-streaming-transform-with-state.html

State Data Source:
https://spark.apache.org/docs/latest/streaming/structured-streaming-state-data-source.html

Configuration:
https://spark.apache.org/docs/latest/configuration

## Confirmed current behavior

### Unified memory

Spark 4.2 documentation continues to distinguish:

```text
Execution Memory
Storage Memory
```

inside a shared managed memory region.

Execution may evict storage blocks down to the protected storage boundary.

Storage does not simply evict execution memory.

### Task working set

The current tuning guide explicitly notes that a reduce-side OOM can result from one task having too large a working set even when the entire dataset is not the problem.

### Serialization

Serialization affects:

- shuffle network bytes;
- disk data;
- cached representation;
- CPU and GC overhead.

### Structured Streaming default

Structured Streaming remains built on Spark SQL.

Default processing continues to use micro-batches.

### Continuous Processing

Continuous Processing remains a distinct low-latency mode with at-least-once fault tolerance and limited query support.

### Real-Time Mode

Spark 4.1 introduced official Real-Time Mode support.

Spark 4.2 retains real-time-mode configuration and API support.

The mode has explicit source / operator / sink support boundaries and should not be generalized to every Structured Streaming workload.

### State

Stateful Structured Streaming retains cross-trigger state for operations such as:

- aggregation;
- deduplication;
- stream-stream joins;
- arbitrary stateful processing.

Spark 4.x includes TransformWithState as the newer arbitrary stateful API.

### Watermark

A watermark is computed from observed maximum event time minus a delay threshold.

It is used by supported stateful operations to manage late data and state cleanup.

The threshold is not a strict wall-clock guarantee; some records later than the threshold can still be processed depending on execution progress.

### Checkpoint / recovery

Structured Streaming records source progress and query recovery state in checkpoint storage.

Spark 4.2 tightened checkpoint metadata validation to reduce unsafe restart behavior that can duplicate data in exactly-once sinks.

### Exactly-once boundary

The Structured Streaming design can provide end-to-end exactly-once semantics when the complete path supports it.

The learning model therefore requires:

```text
replayable / position-aware source
+
checkpointed progress
+
recoverable processing
+
idempotent or transactional sink behavior
```

A checkpoint directory alone is not treated as a universal exactly-once switch.

## Stability guardrails

Revalidate before teaching exact values or support matrices for:

- memory fractions;
- storage levels;
- Real-Time Mode source / sink / operator allowlists;
- Continuous Processing support;
- State Store provider details;
- watermark multi-policy behavior;
- checkpoint compatibility across code / schema changes.
