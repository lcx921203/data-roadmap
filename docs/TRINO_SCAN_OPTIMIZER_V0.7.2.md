# Trino Scan & Optimizer V0.7.2

## Scope

V0.7.2 adds exactly two nodes:

```text
06 Scan / Pushdown / Iceberg Read Boundary
07 Statistics / CBO / Join / Dynamic Filtering
```

No UI changes.
No Scale scenarios.
No new Interview questions.

## Progression

V0.7.1 ended with:

```text
Stage
→ Task
→ Split
→ Driver
→ Operator
```

V0.7.2 continues:

```text
Split
→ Scan
→ Pushdown / Pruning
→ Statistics
→ CBO
→ Join
→ Dynamic Filtering
```

The key progression is:

> First minimize how much data enters execution. Then decide how remaining data should be joined.

## Node 06 boundary

Iceberg owns:

```text
Snapshot
Manifest List
Manifest
Delete Applicability
Candidate File Semantics
```

Trino owns:

```text
Split Enumeration
Worker Scan
Predicate / Projection Pushdown
Connector Execution Boundary
```

The article references the Iceberg read model but does not reteach it.

## Pruning vs Pushdown

Frozen distinction:

```text
Pruning
= determine data that does not need to be read

Pushdown
= move processing closer to the data source
```

They often cooperate but are not synonyms.

## Node 07 causal model

Frozen chain:

```text
Statistics
→ Cost Estimate
→ CBO
→ Join Order
→ Build / Probe
→ Join Distribution
→ Dynamic Filtering
→ Probe-side Scan Reduction
```

This prevents Join, Statistics and Dynamic Filtering from becoming isolated optimization tips.

## Failure model

A key production pattern is now explicit:

```text
stale / missing statistics
→ bad cardinality estimate
→ bad join order / distribution
→ excess network or memory
→ weak runtime filtering
→ slow or failed query
```

Memory internals are intentionally deferred to V0.7.3.
