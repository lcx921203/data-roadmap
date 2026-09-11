# dbt Scale & Interview Integration V0.9.5

## Result

dbt now participates in the full public graph:

```text
Learn
↕
Interview
↕
Scale
```

No UI redesign is introduced.

## New Scale domain

V0.9.5 adds:

```text
建模工程 / Modeling Engineering
```

Current Scale domains become:

```text
Lakehouse
Compute Engines
Modeling Engineering
```

The existing multi-domain UI is reused.

## Three dbt Scale scenarios

### 1. Incremental Drift & Backfill

Training chain:

```text
incremental boundary
→ late updates missed
→ green pipeline / wrong data
→ reconciliation
→ impacted historical slice
→ targeted backfill
→ recovered business correctness
```

### 2. Contract Breaking Change

Training chain:

```text
shared model
→ breaking interface / semantic change
→ V1 + V2
→ contract
→ lineage / consumer inventory
→ migration
→ deprecation
```

### 3. Slim CI Cost

Training chain:

```text
800-model project
→ full PR build too expensive
→ production manifest
→ state:modified
→ DAG expansion
→ defer stable upstream
→ isolated schema
→ layered CI coverage
```

All scenarios remain:

```yaml
hypothetical: true
```

They are training scenarios, not project experience.

## Interview integration

No new canonical dbt interview question is invented.

Mapped existing evidence-backed questions:

```text
iq-warehouse-layering-001
iq-data-quality-diagnosis-001
iq-dimensional-partial-late-data-001
iq-scd1-vs-scd2-001
iq-data-product-system-design-001
```

Current evidence remains owned by the Interview registry.

Examples:

```text
Warehouse layering
→ 11 direct evidence
→ 5 companies
→ core_verified

Data quality diagnosis
→ 10 direct evidence
→ 6 companies
→ core_verified

Late data
→ 1 / 1

SCD1 vs SCD2
→ 1 / 1

Data Product system design
→ 1 / 1
```

The dbt relation does not convert those questions into dbt-specific frequency claims.

## Authoritative ownership

Direct Interview -> Knowledge mapping:

```text
content/mappings/dbt-v0.9.5.yaml
```

Scale Scenario owns:

```text
knowledge[]
interviews[]
```

Contextual reading relation:

```text
content/mappings/dbt-section-relations-v0.9.5.yaml
```

Reverse relations remain derived.

## Truth boundary

```text
dbt Knowledge
= reusable engineering pattern

dbt Scale Scenario
= hypothetical production-pressure exercise

Interview Evidence
= observed question evidence

Project Experience
= separate backstage fact source
```

These are not interchangeable.
