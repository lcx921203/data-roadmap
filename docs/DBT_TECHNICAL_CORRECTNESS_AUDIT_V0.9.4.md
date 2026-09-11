# dbt Technical Correctness Audit V0.9.4

Validation date: 2026-09-12
Stable learning baseline: dbt Core v1.12.x
Next-generation context: dbt v2 / Fusion release tracks

## Result

PASS WITH VERSION-SENSITIVE GUARDRAILS

## Project / execution model

The curriculum correctly separates:

```text
Project
Target
Adapter
Parse
Compile
Database Execute
```

and does not treat the Adapter as a database query optimizer.

## DAG

`ref()` / `source()` remain dependency-aware relation-resolution primitives.

The curriculum correctly distinguishes:

```text
dbt resource DAG
≠
database physical execution plan
```

## Jinja / macros

Jinja and macros remain compile-time SQL generation mechanisms.

The curriculum does not model dbt macros as database runtime UDFs.

## Materializations

The curriculum covers the current five built-in materialization concepts:

```text
view
table
incremental
ephemeral
materialized_view
```

Adapter/platform support remains version-sensitive.

## Incremental modeling

The curriculum correctly preserves:

```text
is_incremental()
this
unique_key
strategy
late-data lookback
full refresh
backfill
schema change
```

and explicitly rejects:

```text
unique_key = database UNIQUE constraint
microbatch = streaming runtime
incremental = automatically idempotent
```

## Snapshots

Current snapshot concepts are represented through:

```text
unique key
timestamp/check change detection
historical validity
hard-delete semantics
```

without teaching deprecated syntax as timeless architecture.

## Tests / freshness

The curriculum correctly distinguishes:

```text
Data Test
Unit Test
Source Freshness
Reconciliation
```

and explicitly records that source freshness is not automatically included in `dbt build`.

## Contracts / versions

The curriculum treats model contracts as consumer-facing structural guarantees.

Constraint enforcement remains adapter/platform-specific.

Versions are reserved for breaking-change migration rather than routine minor changes.

## Artifacts

The curriculum correctly separates:

```text
manifest
run_results
catalog
sources
semantic metadata
```

by responsibility.

Artifact schemas remain versioned implementation contracts, not permanent universal schemas.

## Classic state selection

Current dbt Core documentation still defines classic state-based selection by comparing current project resources against a prior `manifest`.

Stable learning invariant:

```text
previous manifest
+
current project
→ state comparison
→ state:new / state:modified / related selectors
```

It is not reduced to raw Git diff.

## Defer

Current defer semantics remain:

```text
unselected upstream
+
not present in current target
+
state manifest
→ resolve reference to state relation
```

Ephemeral nodes are not deferred.

The curriculum also records mixed-environment test/data risks.

## Idempotence

Current local-state documentation explicitly keeps idempotence as an underlying assumption for reliable state selection and deferral.

The curriculum therefore treats non-deterministic / side-effectful model behavior as a threat to state-aware reasoning.

## Managed dbt State

Current dbt product documentation exposes a managed dbt State capability in preview.

The curriculum intentionally does not merge that preview product concept into the stable Core meaning of:

```text
--state
state:modified
defer
```

## Deployment / orchestration

Current dbt Platform provides job scheduling, CI and orchestration capabilities.

Therefore the curriculum rejects the outdated blanket statement:

```text
dbt cannot schedule / orchestrate anything
```

Durable boundary:

```text
dbt Core
→ transformation build semantics

dbt Platform
→ can schedule/orchestrate dbt workloads

Dagster in this taxonomy
→ cross-system asset orchestration
```

## Production troubleshooting

The closure correctly separates failure domains:

```text
parse
compile
connection/permission
database execution
materialization lifecycle
incremental state
quality/freshness
state/defer/environment
warehouse capacity
```

## Cost / concurrency

The curriculum does not freeze a universal `threads` value.

It correctly treats configured dbt concurrency as an upper bound constrained by:

```text
DAG readiness
target warehouse concurrency
query/resource saturation
```

## Version-sensitive guardrails

Revalidate before teaching exact details for:

- v2 GA/release-track status;
- managed dbt State behavior;
- selector additions / warnings;
- environment-variable alternatives for state/defer;
- adapter-specific materialization/incremental/contract support;
- artifact file/schema formats;
- dbt Platform Orchestrator behavior;
- thread defaults and platform concurrency limits.
