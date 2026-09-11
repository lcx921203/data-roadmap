# Spark Cross-Tab Integration Audit V0.8.5

## Truth boundary

PASS

- All new Scale scenarios are hypothetical.
- No scenario is described as project experience.
- No Interview evidence count is edited.
- No new Spark-specific frequency claim is created.

## Learn -> Interview

PASS

Direct curated mappings cover:

- Job / Stage / Task
- Repartition / Coalesce
- Broadcast Join
- Data Skew / Salting
- Cache / Persist
- ETL Join slowdown
- large-scale limited resources
- large dataset technology selection
- batch / realtime platform design

## Interview -> Learn

PASS

`src/content/registry.ts` now loads:

```text
Iceberg
+
Trino
+
Spark
```

cross-navigation registries.

Spark is therefore a first-class topic in the existing multi-topic mapping model.

## Learn -> Scale

PASS

Contextual links connect:

- Backfill production pressure
- Skew diagnosis
- Streaming backlog / state growth

to their matching Scale scenarios.

## Scale -> Learn / Interview

PASS

Each Spark Scale scenario owns explicit:

```text
knowledge[]
interviews[]
```

and contextual links are added only at useful scenario-detail anchors.

## Scale domain expansion

PASS AT CONTENT / IMPLEMENTATION LEVEL

Current Scale UI already contains the multi-domain code path:

```text
groups.length > 1
→ show domain filter
→ show all domains or one selected domain
```

V0.8.5 activates it with:

```text
Lakehouse
Compute Engines
```

No UI patch is introduced.

The final 390px visual / interaction verification remains part of V0.8.6.

## Duplication audit

PASS

Scale scenarios do not reteach the Learn articles.

They start from explicit production constraints and force:

```text
parameters
→ bottleneck
→ design
→ trade-off
→ observability
→ cost
→ recovery
```

## Next

V0.8.6 performs final:

- three-tab closure audit;
- first real multi-domain Scale mobile audit;
- truth / relation audit;
- Spark V1 freeze.
