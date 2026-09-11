# Trino Source Notes V0.7.3

Validation date: 2026-09-11

Current documentation baseline: Trino 483.

## Primary current references

Resource management properties:
https://trino.io/docs/current/admin/properties-resource-management.html

Spill to disk:
https://trino.io/docs/current/admin/spill.html

Resource groups:
https://trino.io/docs/current/admin/resource-groups.html

Fault-tolerant execution:
https://trino.io/docs/current/admin/fault-tolerant-execution.html

## Confirmed current behavior

### Query memory

Current Trino distinguishes query user-memory limits, total query memory, revocable memory and JVM heap headroom.

Hash tables and sorting are explicit examples of user memory.

### Spill

Current documentation marks spill-to-disk as legacy functionality.

It lowers peak memory by offloading supported operator state to local disk, but increases I/O and may increase query duration by orders of magnitude.

Spill does not guarantee that all memory-intensive queries complete.

### Resource groups

A query belongs to one resource group and consumes resources from that group and its ancestors.

Resource groups can enforce queueing and limits such as:

- max queued queries;
- soft / hard concurrency;
- distributed memory;
- CPU;
- physical data scan;
- scheduling policy.

When a group exhausts a resource, the normal behavior is to queue new queries rather than fail already-running queries, except where explicit limits / rejection behavior apply.

### Fault-tolerant execution

Current retry policies:

```text
NONE
QUERY
TASK
```

QUERY retries the full query.

TASK retries failed tasks and requires an Exchange Manager.

Intermediate exchange data is spooled so replacement tasks can re-read recoverable input.

TASK retry is recommended for large batch queries but can add latency for high-volume short queries.

### Connector boundary

FTE support is connector-specific.

Iceberg is currently listed among supported connectors.

## Stability rule

Do not freeze numeric defaults as universal architecture guidance.

Configuration values and supported connectors must be revalidated when used in deployment-specific content.
