# Spark Three-Tab Closure Audit V0.8.6

Audited main commit before freeze:

```text
01b3dd5710d4b82c1ad2810653d35625cb7ee1b3
```

## Result

PASS

Spark now closes the same public graph as the frozen Iceberg and Trino slices:

```text
Learn
↕
Interview
↕
Scale
```

No public Project route or Project relation is introduced.

## Learn -> Interview

PASS

Direct curated mappings are owned by:

```text
content/mappings/spark-v0.8.5.yaml
```

They cover existing evidence-backed questions for:

```text
Job / Stage / Task
Repartition / Coalesce
Broadcast Join
Data Skew / Salting
Cache / Persist
ETL Join slowdown
Large-scale limited resources
Large dataset technology selection
Batch / realtime platform design
```

Contextual section links provide more precise local entry points without duplicating the authoritative mapping.

## Interview -> Learn

PASS

The runtime cross-navigation registry now merges:

```text
Iceberg
+
Trino
+
Spark
```

Spark is therefore a first-class topic in the existing multi-topic Interview -> Knowledge model.

## Learn -> Scale

PASS

Spark Learn connects to three production-pressure scenarios:

```text
30 TB Backfill & Capacity
Skew Join & Straggler
Structured Streaming State & Backlog
```

The authoritative Scale relationship remains scenario-owned through:

```text
knowledge[]
```

No second Knowledge-side scenario registry is introduced.

## Scale -> Learn

PASS

Scenario detail pages resolve the scenario-owned Knowledge IDs.
Contextual item-level links place the relation beside the exact design / diagnosis step where it is useful.

## Interview -> Scale

PASS

Derived from each Scale Scenario's:

```text
interviews[]
```

No duplicate Interview-side Scale list is maintained.

## Scale -> Interview

PASS

The same scenario ownership remains authoritative.
Contextual relations can additionally position the Interview question beside a specific scenario item.

## Contextual anchor resolution

PASS — 14 / 14

Every Spark relation anchor in:

```text
content/mappings/spark-section-relations-v0.8.5.yaml
```

was checked against the actual Learn headings / Scale item titles.

All anchors resolve.

This prevents the silent failure mode where a relationship exists in YAML but its visible source anchor no longer exists in content.

## Evidence boundary

PASS

V0.8.5 / V0.8.6 do not modify:

- direct evidence counts;
- company counts;
- frequency bands;
- curated-answer status.

A Spark relation still means only:

```text
useful together
```

It does not mean:

```text
Spark-specific interview frequency
```

## Project boundary

PASS

All three Spark Scale scenarios remain:

```yaml
hypothetical: true
```

No scenario is converted into project experience.
Historical `pj-*` material remains backstage only.
