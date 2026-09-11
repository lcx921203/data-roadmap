# Trino Source Notes V0.7.4

Validation date: 2026-09-11
Current release baseline: Trino 483

## Primary current references

Web UI:
https://trino.io/docs/current/admin/web-interface.html

EXPLAIN ANALYZE:
https://trino.io/docs/current/sql/explain-analyze.html

Monitoring with JMX:
https://trino.io/docs/current/admin/jmx.html

OpenMetrics:
https://trino.io/docs/current/admin/openmetrics.html

OpenTelemetry:
https://trino.io/docs/current/admin/opentelemetry.html

Administration / Event listeners:
https://trino.io/docs/current/admin.html

## Current observations used in node 11

### Web UI

Current Web UI exposes query states including:

```text
QUEUED
PLANNING
STARTING
RUNNING
BLOCKED
FINISHING
FINISHED
FAILED
```

Persistent BLOCKED state can indicate memory, split availability, disk/network I/O, skew, insufficient parallelism, downstream stage cost, or slow client consumption.

### EXPLAIN ANALYZE

Current output includes timing and distributed execution statistics useful for distinguishing:

- queue;
- analysis / planning;
- execution;
- stage CPU / scheduled / blocked time;
- task input distribution;
- skew.

### OpenMetrics

Metrics are available from the coordinator `/metrics` endpoint.

### JMX

Current Trino exposes JVM, cluster, query, task and connector metrics through JMX.

### Event listener

Query events can be published to external systems for longer-term history.

### OpenTelemetry

Tracing can span coordinator, workers, connectors and integrations, enabling query-path correlation across system boundaries.

## Capacity guidance boundary

The content describes a capacity-calibration process, not a universal sizing formula.

No claim is made that a fixed worker count, CPU threshold or memory percentage is universally correct.
