# dbt Quality, Contracts & Metadata V0.9.3

## Scope

Published:

```text
08 Data Tests / Unit Tests / Freshness / Reconciliation
09 Model Contracts / Versions / Change Safety
10 Docs / Artifacts / Lineage / Metadata Integration
```

No UI changes.
No Scale Scenario.
No Interview frequency changes.

## Progression

```text
built model
→ validate actual data
→ validate transformation logic
→ validate source timeliness
→ reconcile business result
→ freeze consumer-facing shape
→ manage breaking changes
→ export project / runtime / warehouse metadata
```

## Node 08 freeze

Four distinct validation responsibilities:

```text
Data Test
→ actual built data violates assertion?

Unit Test
→ SQL logic produces expected output on fixtures?

Source Freshness
→ upstream meets timeliness SLA?

Reconciliation
→ business result matches trusted baseline?
```

Important current boundary:

```text
dbt build
≠ source freshness
```

Freshness remains a separately invoked / scheduled check.

## Data Test model

Data tests return failing records.

Built-in generic tests:

```text
unique
not_null
accepted_values
relationships
```

Singular tests remain custom one-off SQL assertions.

## Unit Test model

Unit tests validate SQL logic with static inputs before full production materialization.

Primary use:

```text
development
CI
```

not repeated production data validation.

Incremental unit testing can exercise full/incremental branches, but does not by itself prove the adapter merge/update produced a correct final target relation.

## Node 09 freeze

Contract:

```text
column name
data type
optional platform-supported constraints
→ model interface guarantee
```

Data Test:

```text
actual row/data property
```

They are not interchangeable.

Constraint support/enforcement stays platform-specific.

Model Versions are reserved for intentional breaking changes that require a migration window.

## Node 10 freeze

Artifact responsibilities are separated:

```text
manifest
→ project graph / resources

run_results
→ invocation execution results

catalog
→ observed warehouse relation/column metadata

sources
→ source freshness result

semantic_manifest
→ semantic metadata handoff
```

The curriculum teaches responsibility first, filename/schema detail second.

Artifact schemas are versioned and may evolve independently.

## DataHub boundary

dbt owns project-level transformation metadata.

DataHub later owns:

```text
enterprise catalog
cross-system lineage
ownership / discovery / governance
```

dbt artifacts are an input to that wider metadata graph.

## Next

V0.9.4 closes Learn:

```text
11 Selection / State / Defer / CI
12 Production Troubleshooting / Cost / Orchestration Boundary
```

followed by progression and technical-correctness audits.
