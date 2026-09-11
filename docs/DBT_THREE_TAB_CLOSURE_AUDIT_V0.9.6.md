# dbt Three-Tab Closure Audit V0.9.6

Audited deployed main commit:

```text
6ab01f277a4d98ef7cce9de050cd438526407d36
```

## Result

PASS

dbt now closes the public product graph:

```text
Learn
↕
Interview
↕
Scale
```

No public Project route, project-completion requirement or project-derived frequency claim is introduced.

## Learn -> Interview

PASS

Authoritative direct mapping:

```text
content/mappings/dbt-v0.9.5.yaml
```

Mapped existing questions:

```text
Warehouse layering
Data quality diagnosis
Late / partial fact data
SCD1 vs SCD2
Data Product system design
```

No canonical dbt-specific Interview question is invented.

## Interview -> Learn

PASS

The deployed runtime registry loads:

```text
Iceberg
+
Trino
+
Spark
+
dbt
```

Therefore dbt is a first-class topic in the shared Interview -> Knowledge relation model.

## Learn -> Scale

PASS

dbt Learn connects to three production-pressure scenarios:

```text
Incremental Drift / Late Data / Backfill
Contract / Breaking Change Migration
Slim CI / State / Defer Cost
```

The authoritative relation remains scenario-owned through:

```text
knowledge[]
```

Knowledge-side Scale links are derived.

## Scale -> Learn

PASS

Each scenario owns explicit Knowledge IDs.

Contextual relations additionally put the reverse link beside the exact design / diagnosis step where it helps reading.

## Interview -> Scale

PASS

Derived from scenario-owned:

```text
interviews[]
```

No second Interview-side Scale registry is maintained.

## Scale -> Interview

PASS

The same scenario ownership remains authoritative.

Contextual relations can expose a question at a specific scenario section without changing evidence strength.

## Contextual anchor integrity

PASS — 14 / 14

The V0.9.5 package validated every dbt contextual relation anchor against the exact Learn heading or Scale item title.

V0.9.6 confirms the deployed main contains the same dbt section-relation registry and integrated runtime loader.

No relationship is allowed to depend on a missing visible anchor.

## Evidence boundary

PASS

The mapped questions retain their original evidence ownership.

Important current examples:

```text
Warehouse layering
→ 11 direct evidence
→ 5 companies
→ core_verified

Data quality diagnosis
→ 10 direct evidence
→ 6 companies
→ core_verified
```

The remaining dbt-linked questions keep their original evidence strength.

A relation to dbt means:

```text
useful to learn together
```

not:

```text
verified dbt-specific interview frequency
```

## Project boundary

PASS

All three dbt Scale scenarios remain:

```yaml
hypothetical: true
```

They are production-pressure exercises, not claims about a deployed project.

## Closure

dbt satisfies the same truth model as the frozen Iceberg / Trino / Spark slices:

```text
Knowledge
≠ Project Claim

Scale
≠ Production Experience

Relation
≠ Interview Frequency
```
