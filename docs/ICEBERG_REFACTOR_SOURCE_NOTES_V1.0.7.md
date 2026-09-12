# Iceberg Refactor Source Notes V1.0.7

Validation date: 2026-09-12

Primary current baseline:

- Apache Iceberg latest docs: 1.11.0
- Apache Iceberg specification
- Apache Iceberg Spark queries / DDL / configuration
- Trino Iceberg time-travel syntax used only as an engine example

## Revalidated technical points

- Table state changes produce new table metadata through atomic replacement.
- Snapshot is an immutable table-content version, not a full data copy.
- Snapshot metadata can reference a schema ID.
- Time-travel to a snapshot / timestamp resolves historical table state.
- Spark's current Iceberg docs explicitly describe time-travel queries as using the selected snapshot's schema.
- Tags point to individual snapshots; branches are mutable named references.
- Each evolved schema has a unique schema ID.
- Field IDs identify logical fields and are never reused in a table.
- Column projection is performed by field ID.
- Add / Drop / Rename / Reorder apply to structs, including nested structs.
- Partition fields reference source columns by source field ID.
- Old and new partition specs can coexist.
- Partition evolution does not automatically rewrite historical data.

## Guardrails

Revalidate exact claims before future edits for:

- engine-specific Branch / Tag write syntax;
- rollback / set-current / cherry-pick procedures;
- Format V3 engine support;
- default-value support across Spark / Flink / Trino releases;
- exact Trino / Spark SQL time-travel syntax;
- row-level delete support by engine version.
