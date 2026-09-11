# dbt Source Notes V0.9.2

Validation date: 2026-09-11

## Primary references

Materializations:
https://docs.getdbt.com/docs/build/materializations

Incremental models:
https://docs.getdbt.com/docs/build/incremental-models

Incremental strategy:
https://docs.getdbt.com/docs/build/incremental-strategy

Snapshots:
https://docs.getdbt.com/docs/build/snapshots

## Materializations

Current docs define five built-in materializations:

```text
table
view
incremental
ephemeral
materialized_view
```

Custom materializations also exist.

Adapter/platform support must be revalidated for specific database objects.

### View

Rebuilt as a view definition.
No duplicated data storage, but heavy stacked views can shift compute cost to query time.

### Table

Rebuilt as a physical table on normal runs.
Fast reads but full builds can become expensive at scale.

### Incremental

Persists a table and updates it across runs using incremental logic.

### Ephemeral

Not directly built as a database relation.
Compiled into downstream models as a CTE.
Overuse can make compiled SQL difficult to debug.

### Materialized View

Database-managed physical query result.
Refresh semantics and support are platform-specific.

## Incremental models

Current docs define `is_incremental()` as true when:

```text
target table already exists
+
model is configured as incremental
+
full-refresh is not active
```

Model SQL must remain valid in both full and incremental paths.

## unique_key

Current docs describe `unique_key` as the model grain identifier used by relevant incremental strategies.

It can be one column or multiple columns.

Important learning rule:

```text
unique_key config
≠ universal database uniqueness constraint
```

Nulls and duplicate keys can create matching/failure problems depending on platform and strategy.

## Built-in incremental strategies

Current documented built-ins:

```text
append
delete+insert
merge
insert_overwrite
microbatch
```

Support varies by adapter.

`insert_overwrite` operates on larger data slices/partitions and does not depend on `unique_key` in the same way row-matching strategies do.

## microbatch

The current microbatch incremental strategy is intended for large time-series datasets.

It uses an `event_time` boundary to split an incremental build into multiple time-based SQL batches.

It may support parallel batch execution.

It must not be presented as a continuously running streaming engine.

## on_schema_change

Current incremental configuration can react to top-level target/source schema changes.

The current docs explicitly note that schema-change behavior does not backfill historic values into old rows for newly added columns.

Historical population still requires manual update, backfill, or full refresh.

## Snapshots

Snapshots implement historical version capture for mutable query results.

A stable `unique_key` identifies the logical record.

### timestamp strategy

Current docs recommend `timestamp` when a reliable `updated_at` column exists.

Advantages include lower configuration maintenance and better resilience to normal source column additions/removals.

### check strategy

Used when no reliable update timestamp exists.

It compares configured `check_cols` between current and previous values.

`check_cols='all'` exists, but explicit business-relevant columns are safer when technical columns change frequently.

## Hard deletes

Current snapshot configuration supports:

```text
hard_deletes:
  ignore
  invalidate
  new_record
```

`new_record` can represent deletion as a new snapshot row with deletion metadata.

The curriculum intentionally does not teach older/deprecated hard-delete configuration names as the current model.

## Guardrails

Revalidate before article-level config detail for:

- adapter-specific materialized-view support;
- adapter incremental-strategy matrices;
- microbatch parallelism/config flags;
- exact snapshot meta-column configuration;
- snapshot YAML/legacy SQL syntax compatibility;
- hard-delete option behavior across version tracks.
