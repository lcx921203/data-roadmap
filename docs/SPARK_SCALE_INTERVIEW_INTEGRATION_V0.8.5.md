# Spark Scale & Interview Integration V0.8.5

## Result

Spark now participates in the full public graph:

```text
Learn
↕
Interview
↕
Scale
```

without changing the frozen UI component contract.

## New Scale domain

V0.8.5 adds the second real Scale domain:

```text
计算引擎 / Compute Engines
```

This intentionally activates the already-implemented multi-domain Scale navigation path.

No ScalePage code or CSS is redesigned.

## Three Scale scenarios

### 1. 30 TB Backfill & Limited Resources

Training chain:

```text
historical volume
→ partition / task shape
→ concurrent backfill units
→ storage / shuffle saturation
→ protect daily ETL and streaming
→ headroom / recovery
```

### 2. Skew Join & Straggler

Training chain:

```text
statistics / join plan
→ shuffle
→ hot key
→ skewed partition
→ huge task working set
→ spill / GC / OOM / long tail
```

### 3. Structured Streaming State & Backlog

Training chain:

```text
input rate
vs
processing rate
→ backlog
→ state growth
→ watermark / retention
→ checkpoint / sink
→ recovery / catch-up
```

All scenarios remain:

```yaml
hypothetical: true
```

They are production-pressure exercises, not project claims.

## Interview integration

No new canonical question is created.

Existing evidence-backed questions are reused.

Strong current Spark evidence includes:

```text
Spark data skew / salting
→ 7 direct evidence
→ 6 companies
→ core_verified

Spark Broadcast Join
→ 3 direct evidence
→ 3 companies
→ repeated_verified

Spark Job / Stage / Task
→ 2 direct evidence
→ 2 companies
→ supported_cross_company
```

Other Spark questions remain at their existing evidence level.

Relationship creation does not change frequency.

## Authoritative relationship ownership

Direct Interview -> Knowledge mapping:

```text
content/mappings/spark-v0.8.5.yaml
```

Scale Scenario owns:

```text
knowledge[]
interviews[]
```

Contextual reading relationships:

```text
content/mappings/spark-section-relations-v0.8.5.yaml
```

Reverse links continue to be derived at runtime.

## Important truth rule

```text
mapped to Spark
≠
Spark-specific interview frequency
```

A broad architecture question can be useful alongside Spark while retaining its original evidence meaning.
