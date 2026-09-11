# dbt Materialization & Stateful Modeling V0.9.2

## Scope

Published:

```text
05 Materializations & Physical Persistence
06 Incremental Models / Unique Key / Strategies / Backfill
07 Snapshots / Source History / SCD2 Implementation
```

No UI changes.
No Scale Scenario.
No new Interview Question.

## Progression

```text
Model SELECT
→ persistence strategy
→ incremental target state
→ historical source state
```

The learner now moves from project/DAG mechanics into data-state lifecycle.

## Node 05: Materialization

Current built-in materializations are:

```text
view
table
incremental
ephemeral
materialized_view
```

The content teaches selection through:

```text
query cost
build cost
freshness
storage
reuse
debuggability
adapter support
```

It does not treat folder names as a materialization rule.

## Node 06: Incremental Model

The stable model is:

```text
existing target
+
selected new / changed source rows
+
write strategy
→ updated target
```

Key boundaries:

```text
unique_key
≠ database UNIQUE constraint

incremental
≠ automatically idempotent

microbatch
≠ streaming engine

on_schema_change
≠ historical backfill
```

Built-in strategy concepts covered:

```text
append
delete+insert
merge
insert_overwrite
microbatch
```

Adapter support remains version/platform-specific.

## Late-arriving data

The causal model is:

```text
strict high-water mark
→ cheap
→ may miss late updates

lookback window
→ reprocess recent history
→ better late-data coverage
→ more compute
```

Long-term drift requires reconciliation and controlled rebuild/backfill paths.

## Node 07: Snapshot

The stable model is:

```text
mutable source
→ unique key
→ change detection
→ historical versions
```

Current strategy guidance:

```text
reliable updated_at
→ timestamp strategy preferred

no reliable updated_at
→ check strategy
```

Hard delete handling is taught through current:

```text
ignore
invalidate
new_record
```

without binding the curriculum to deprecated configuration names.

## Incremental vs Snapshot

```text
Incremental Model
→ efficiently maintain current modeled result

Snapshot
→ preserve historical states of a mutable source
```

This distinction is frozen.

## Dimensional-modeling boundary

Stage 03 owns:

```text
why SCD2 is needed
how a dimension should be modeled
```

Stage 05 owns:

```text
how dbt Snapshot can implement historical version capture
```

## Next

V0.9.3:

```text
08 Tests / Unit Tests / Freshness / Reconciliation
09 Contracts / Versions / Change Safety
10 Docs / Artifacts / Lineage / Metadata
```
