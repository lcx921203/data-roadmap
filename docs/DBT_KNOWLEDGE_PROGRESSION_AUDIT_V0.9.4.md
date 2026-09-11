# dbt Knowledge Progression Audit V0.9.4

## Result

PASS

dbt Learn V1 is complete at 12 nodes.

The audit criterion is:

> Does each lesson create the conceptual need for the next lesson?

not:

> Does the curriculum enumerate every dbt command / config?

## Causal chain

```text
01 dbt Overview
why → establish Transformation Engineering boundary

02 Project / Target / Adapter / Command Lifecycle
why → explain how a project becomes an invocation against a target platform

03 Sources / Models / ref / source / DAG
why → project resources need explicit dependencies and build order

04 Jinja / Macros / Packages / Adapter Abstraction
why → resource code must compile reusable/platform-aware SQL before execution

05 Materializations
why → compiled SELECT logic still needs a persistence strategy

06 Incremental Models
why → full rebuild becomes too expensive and introduces target-state semantics

07 Snapshots
why → current-state maintenance does not preserve mutable-source history

08 Tests / Unit Tests / Freshness / Reconciliation
why → built/stateful models need multiple layers of correctness validation

09 Contracts / Versions
why → correct data today does not guarantee downstream interface stability tomorrow

10 Docs / Artifacts / Lineage / Metadata
why → graph, runtime and interface state must become machine-readable

11 Selection / State / Defer / CI
why → machine-readable prior state enables change-aware build and isolated CI

12 Production Troubleshooting / Cost / Orchestration Boundary
why → all mechanisms must collapse into one production failure/cost/deployment model
```

## Fragmentation audit

PASS

Primary ownership remains singular:

- dbt positioning: node 01
- project/runtime invocation: node 02
- resource graph: node 03
- compile-time abstraction: node 04
- persistence strategy: node 05
- current-state incremental maintenance: node 06
- mutable-source history: node 07
- quality verification: node 08
- consumer interface safety: node 09
- machine-readable metadata: node 10
- change-aware CI: node 11
- production closure: node 12

Later nodes refer backward but do not restart concepts from zero.

## Dimensional-modeling boundary

PASS

Stage 03 owns:

```text
grain
fact / dimension
star / snowflake
SCD business modeling
business key semantics
```

dbt owns:

```text
implement those decisions as SQL/resources
dependency/test/contract/CI engineering
```

## Semantic-layer boundary

PASS

dbt ends at tested/contracted transformation models plus metadata handoff.

Stage 06 owns:

```text
semantic model
entity
dimension
measure
metric
semantic join graph
metric query
```

## Dagster boundary

PASS

dbt Core owns transformation-resource execution semantics.

dbt Platform may schedule/orchestrate dbt workloads.

Dagster remains the project taxonomy owner for cross-system asset orchestration.

## DataHub boundary

PASS

dbt owns project-local transformation metadata and artifacts.

DataHub remains responsible for enterprise catalog, cross-system lineage, ownership and discovery.

## Execution-engine boundary

PASS

dbt selects/compiles/submits SQL.

The target platform owns:

```text
physical query planning
join algorithms
scan/shuffle/runtime memory
transaction/storage internals
```

## Closure rule

dbt Learn V1 is closed at 12 / 12.

V0.9.5 may add Scale / Interview relations but must not insert new dbt core-mechanism chapters unless a verified technical gap is found.
