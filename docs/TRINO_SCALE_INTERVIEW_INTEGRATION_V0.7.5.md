# Trino Scale & Interview Integration V0.7.5

## Result

Trino now participates in all three public tabs:

```text
Learn
↕
Scale
↕
Interview
```

without changing the frozen UI contract.

## Scale scenarios

Only three scenarios are added.

### 1. Interactive Query & Workload Isolation

```text
150 BI concurrent queries
+
6 heavy batch queries
→ Resource Group / Queue / SLO / Saturation
```

This trains cluster-level workload design, not single-query tuning.

### 2. Large Query & Runtime Pressure

```text
stale statistics
→ wrong join distribution
→ memory / exchange amplification
→ OOM / long tail
```

This trains the causal path from planning error to runtime pressure.

### 3. Fault-Tolerant Batch Recovery

```text
90-minute batch query
→ worker loss
→ NONE / QUERY / TASK
→ Exchange Manager
→ recovery granularity
```

This trains recovery design and cost trade-offs.

## Interview integration

The following questions already exist in the evidence-backed bank and are reused:

```text
iq-olap-engine-selection-001
iq-sql-performance-plan-index-001
iq-etl-join-slowdown-001
iq-system-concurrency-fault-tolerance-001
```

Their existing frequency remains unchanged.

A relation means:

```text
useful together
```

It does not mean:

```text
Trino-specific high frequency
```

No new Interview question is created.

No answer is fabricated for questions whose curated answer is still pending.

## Navigation ownership

Scale Scenario continues to own:

```text
knowledge[]
interviews[]
```

This preserves the existing graph rule.

Contextual section relations are stored in:

```text
content/mappings/trino-section-relations-v0.7.5.yaml
```

Runtime section relation loading now merges:

```text
Iceberg relations
+
Trino relations
```

without modifying the frozen Iceberg relation file.

## Scale hierarchy

The Lakehouse domain now contains six real training themes:

```text
Capacity & Backfill
Continuous Write & Table Health
Commit Concurrency & Recovery
Interactive Query & Workload Isolation
Large Query & Runtime Pressure
Fault-Tolerant Execution & Recovery
```

It is still one Domain, so the UI correctly remains simple and does not expose a redundant Domain filter.

## Truth boundary

All three new scenarios remain:

```yaml
hypothetical: true
```

They are production-pressure training cases, not project claims.
