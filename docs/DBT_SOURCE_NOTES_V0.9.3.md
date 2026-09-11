# dbt Source Notes V0.9.3

Validation date: 2026-09-12

## Primary references

Data tests:
https://docs.getdbt.com/docs/build/data-tests

Unit tests:
https://docs.getdbt.com/docs/build/unit-tests

Source freshness:
https://docs.getdbt.com/docs/deploy/source-freshness

Model contracts:
https://docs.getdbt.com/docs/mesh/govern/model-contracts

Model versions:
https://docs.getdbt.com/docs/mesh/govern/model-versions

dbt artifacts:
https://docs.getdbt.com/reference/artifacts/dbt-artifacts

## Data tests

Current dbt describes a data test as a query that returns failing records.

Passing behavior:

```text
zero failing rows
→ pass
```

Current built-in generic data tests remain:

```text
unique
not_null
accepted_values
relationships
```

Two principal definition forms:

```text
generic data test
singular data test
```

## Unit tests

Current unit tests validate SQL model logic using static fixtures before fully materializing a production model.

Current docs recommend unit tests primarily in:

```text
development
CI
```

Current notable boundaries include:

- SQL models are the supported unit-test target;
- model references must be represented as test inputs;
- current support has adapter/model limitations;
- versioned models can be unit tested;
- incremental full/incremental branches can be exercised through overrides.

The content intentionally does not freeze today's full support matrix.

## Source freshness

Current dbt deployment docs explicitly state:

```text
dbt build
does not include
source freshness checks
```

Freshness is run separately, commonly via:

```text
dbt source freshness
```

or deployment-job configuration.

Freshness check frequency should be aligned with the source SLA.

## Reconciliation

Reconciliation is treated as an analytics-engineering validation pattern rather than a dedicated dbt built-in test resource.

Typical forms:

```text
row-count comparison
financial / amount comparison
slice-level comparison
tolerance-based comparison
```

## Model contracts

Current contract enforcement requires declared:

```text
column name
data type
```

for contracted model columns.

Current support is model/materialization-specific.

Platform constraints vary across adapters and fall into categories such as:

```text
definable + enforced
definable + not enforced
not definable
```

Therefore:

```text
dbt constraint declaration
≠ universal database enforcement
```

## Model versions

Current versioning is intended for mature shared models where intentional breaking changes need coordinated consumer migration.

Current stable concepts:

```text
versions
latest_version
version-specific ref
deprecation_date
```

Non-breaking changes should generally avoid unnecessary version proliferation.

## dbt artifacts

Current v1.12 docs list generated JSON artifacts including:

```text
semantic_manifest.json
osi_document.json
manifest.json
catalog.json
run_results.json
sources.json
```

Responsibilities include:

```text
documentation
state
source freshness visualization
run timing analysis
project / schema analysis
```

Default CLI artifact output is under the project target directory unless configured otherwise.

## Artifact versioning

All dbt artifacts carry metadata including:

```text
dbt_version
dbt_schema_version
generated_at
adapter_type
invocation_id
```

Current docs explicitly state that artifact versions can change in any dbt minor release and are versioned independently.

The learning content therefore must not freeze one artifact schema as permanent.

## Metadata / DataHub boundary

The dbt article may teach artifacts as metadata-export inputs.

Enterprise cross-platform ingestion, ownership, discovery and governance remain DataHub-stage responsibilities.

## Guardrails

Revalidate before future article edits for:

- unit-test local-compute support matrix;
- unit-test unsupported resource/model combinations;
- source freshness platform-specific timestamp calculation;
- constraint enforcement matrix;
- model-version syntax details;
- artifact file list and schema versions;
- dbt v2 artifact-format changes.
