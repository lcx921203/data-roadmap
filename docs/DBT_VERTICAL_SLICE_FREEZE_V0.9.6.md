# dbt Vertical Slice Freeze V0.9.6

## Decision

dbt V1 is frozen.

Public closure:

```text
Learn
↕
Interview
↕
Scale
```

The dbt vertical now contains:

```text
12 Learn nodes
3 hypothetical Scale scenarios
5 existing evidence-backed Interview entry points
direct Interview -> Knowledge mappings
14 contextual section relations
third public Scale domain: Modeling Engineering
```

## Learn

PASS

The 12-node causal spine is complete:

```text
dbt positioning
→ Project / Target / Adapter
→ Source / Model / DAG
→ Jinja / Macro / Package
→ Materialization
→ Incremental
→ Snapshot
→ Tests / Freshness / Reconciliation
→ Contracts / Versions
→ Artifacts / Lineage
→ State / Defer / CI
→ Production Troubleshooting / Cost / Orchestration Boundary
```

No new core dbt mechanism is introduced in V0.9.6.

## Scale

PASS

Three production-pressure training scenarios are frozen:

```text
Incremental Drift & Historical Backfill
Contract / Model Version Breaking Change
Slim CI / State / Defer Cost
```

All remain explicitly hypothetical.

dbt also owns the third Scale domain:

```text
Modeling Engineering
```

The existing multi-domain UI remains sufficient.

## Interview

PASS

Five existing evidence-backed questions have direct dbt Knowledge anchors.

No dbt-specific frequency claim is created.

The strongest mapped evidence remains owned by the canonical Interview registry, including:

```text
Warehouse layering
Data quality diagnosis
```

## Relation integrity

PASS

- direct Interview -> Knowledge registry: loaded;
- Knowledge -> Interview: derived;
- Scale -> Knowledge: scenario-owned;
- Knowledge -> Scale: derived;
- Scale -> Interview: scenario-owned;
- Interview -> Scale: derived;
- contextual anchors: 14 / 14 validated.

No duplicate authoritative relation graph is introduced.

## Mobile / UI

PASS AT STATIC IMPLEMENTATION LEVEL

The third Scale domain reuses the already-frozen multi-domain Scale path.

The deployed UI still provides:

- dynamic Domain -> Theme -> Scenario grouping;
- domain Bottom Sheet when multiple domains exist;
- corrected V1.9 multi-domain page padding;
- three-column public bottom navigation;
- shared mobile reading / one-hand navigation.

No V0.9.6 UI change is required.

## Truth boundary

PASS

```text
dbt engineering pattern
≠ project claim

Scale hypothetical scenario
≠ production experience

dbt relation
≠ dbt-specific interview frequency
```

## Technical baseline rule

The frozen content continues to use:

```text
stable dbt Core v1.12-era framework semantics
```

as its production learning baseline while keeping dbt v2 / Fusion-era implementation details version-sensitive.

Future exact release status, artifact formats, adapter support matrices and managed dbt State behavior must be revalidated before edits.

## Freeze rule

Reopen dbt V1 only for:

- verified technical error;
- verified usability / interaction bug;
- broken cross-tab relation.

Do not keep extending dbt merely because more CLI/config detail exists.

## Next

The next planned vertical slice is:

```text
MetricFlow / Semantic Layer
```

It should begin with its own Knowledge Spine Freeze and preserve the responsibility boundary:

```text
dbt
→ tested / contracted transformation models

MetricFlow / Semantic Layer
→ semantic model / entities / dimensions / measures / metrics / join graph
```

Flink remains deferred until after the MetricFlow slice unless priority changes.
