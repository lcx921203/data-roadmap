# dbt Source Notes V0.9.0

Validation date: 2026-09-11

## Version baseline

Current production-stable dbt Core v1 line:

```text
dbt-core v1.12.2
```

Current next-generation line:

```text
dbt Core v2.0 beta
```

The v2 line is the Rust / Fusion-based rewrite and remains pre-GA at the time of this freeze.

Learning policy:

```text
stable framework semantics
→ production baseline

v2 parser / packaging / artifact/runtime differences
→ version-sensitive awareness
→ revalidate before publishing exact implementation details
```

## Primary references

Developer Hub:
https://docs.getdbt.com/

Materializations:
https://docs.getdbt.com/docs/build/materializations

Incremental models:
https://docs.getdbt.com/docs/build/incremental-models

Data tests:
https://docs.getdbt.com/docs/build/data-tests

Unit tests:
https://docs.getdbt.com/docs/build/unit-tests

Model contracts:
https://docs.getdbt.com/docs/mesh/govern/model-contracts

Snapshots:
https://docs.getdbt.com/docs/build/snapshots

ref():
https://docs.getdbt.com/reference/dbt-jinja-functions/ref

source():
https://docs.getdbt.com/reference/dbt-jinja-functions/source

dbt artifacts:
https://docs.getdbt.com/reference/artifacts/dbt-artifacts

Node selection:
https://docs.getdbt.com/reference/node-selection/methods

dbt Core repository / v2 roadmap:
https://github.com/dbt-labs/dbt-core

## Verified current materialization model

Current docs list five built-in materializations:

```text
table
view
incremental
ephemeral
materialized_view
```

Custom materializations also exist.

Adapter support and behavior vary.

The learning spine therefore teaches materialization as a persistence strategy, not as one universal SQL implementation.

## Verified incremental model model

Current incremental behavior retains these invariants:

```text
first run
→ create / fully build target

later run
→ filter rows selected by project logic
→ insert / update target according to materialization strategy
```

Important concepts include:

```text
is_incremental()
this
unique_key
incremental_strategy
full refresh
schema change
```

Strategy support remains adapter-specific.

Current docs also include microbatch incremental models.

The learning content must explicitly avoid confusing dbt's microbatch incremental strategy with a continuously running streaming engine.

## Verified dependency graph

`ref()` is not just string substitution.

It resolves the target relation and creates an explicit dependency between resources.

`source()` resolves a declared source relation and provides source-aware metadata / lineage.

These dependencies power DAG ordering and later selection / impact analysis.

## Verified testing surface

Current dbt distinguishes:

```text
data tests
unit tests
source freshness
```

Data tests validate records / assertions in built data.

Unit tests validate SQL model logic against controlled inputs before materializing full production data.

Source freshness validates upstream timeliness.

Reconciliation remains a project/business validation pattern rather than a single built-in test type.

## Verified contracts

Model contracts can enforce an expected model shape such as column names and data types.

Constraint enforcement and support depend on the target platform and materialization.

The content must not equate a dbt contract with a universally enforced database constraint.

## Verified artifacts

dbt produces machine-readable project / run artifacts.

For v1, common artifacts include project graph and execution metadata such as:

```text
manifest
run_results
catalog
sources
```

Artifact schemas are versioned.

dbt Core v2 is introducing a newer artifact architecture, including Parquet-oriented metadata.

Therefore article bodies must teach artifact responsibility before file-format implementation detail.

## State / defer guardrail

Classic state-aware selection compares current resources to a prior project state artifact.

`defer` can resolve references to relations from a prior / other environment for unselected upstream nodes.

This is useful for CI but does not by itself prove data correctness.

Do not confuse classic Core state selectors with newer preview/product features branded as dbt State.

## dbt Core / orchestration boundary

The stable conceptual boundary is:

```text
dbt Core
→ parse / compile / build transformation resources

orchestration layer
→ decide when and across which systems work runs
```

Modern dbt platform offerings may include scheduling / orchestration products.

Therefore the learning material must avoid the outdated absolute statement:

```text
dbt cannot schedule anything
```

The narrower and durable statement is:

```text
dbt Core is not a general-purpose cross-system orchestrator.
```

## Version-sensitive guardrails

Revalidate before teaching exact current behavior for:

- dbt Core v2 GA status;
- profile / adapter packaging details;
- artifact storage formats and schemas;
- materialization support matrices;
- incremental strategy support by adapter;
- contract constraint support;
- snapshot configuration syntax;
- state / defer CLI details;
- dbt State preview/product behavior.
