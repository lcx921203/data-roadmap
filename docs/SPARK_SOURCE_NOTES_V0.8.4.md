# Spark Source Notes V0.8.4

Validation date: 2026-09-11
Baseline: Apache Spark 4.2.0

## Primary references

Monitoring and Instrumentation:
https://spark.apache.org/docs/4.2.0/monitoring.html

Configuration:
https://spark.apache.org/docs/4.2.0/configuration.html

Job Scheduling:
https://spark.apache.org/docs/4.2.0/job-scheduling.html

Tuning:
https://spark.apache.org/docs/4.2.0/tuning.html

Structured Streaming:
https://spark.apache.org/docs/latest/streaming/

## Verified current observability

Spark Web UI exposes live application information including:

- scheduler stages and tasks;
- RDD storage / memory;
- executor information;
- SQL execution;
- Structured Streaming.

The live UI is application-lifetime scoped by default.

Persisted Spark Event Logs allow Spark History Server to reconstruct completed application UIs.

## Verified Structured Streaming metrics

Spark's current metrics system exposes Structured Streaming signals including:

```text
eventTime-watermark
inputRate-total
processingRate-total
latency
states-rowsTotal
states-usedBytes
```

These directly support backlog and state-growth diagnosis.

## Verified task retry

Current configuration includes bounded per-task failure attempts through:

```text
spark.task.maxFailures
```

The learning content uses only the invariant:

```text
task retry is bounded
```

and does not freeze the current numeric default as a production recommendation.

## Verified speculation

Current Spark supports speculative execution by relaunching unusually slow tasks.

The production model therefore treats speculation as:

```text
straggler mitigation
```

not:

```text
data skew correction
```

## Verified dynamic allocation

Current Spark dynamic allocation can increase / decrease application executors according to workload.

It depends on supported shuffle-preservation conditions.

The Learn closure only uses it as an example of resource elasticity and does not present it as a replacement for correct partitioning, plan selection, storage capacity or skew handling.

## Verified scheduling isolation

Current Spark supports scheduling across applications through the cluster manager and scheduling within an application through FIFO / FAIR scheduling.

Fair-scheduler pools may express weights and minimum shares.

The closure article introduces only the production principle:

```text
different workloads need resource-isolation policy
```

without turning node 12 into a scheduler-configuration tutorial.

## Stability guardrails

All exact config defaults and environment-specific resource settings must be revalidated at deployment-design time.
