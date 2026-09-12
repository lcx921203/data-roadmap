# Iceberg Refactor Source Notes V1.0.8

Validation date: 2026-09-12

Primary current baseline:
- Apache Iceberg latest docs 1.11.0
- Apache Iceberg specification
- Spark Writes
- Maintenance
- Configuration

## Revalidated points

### Spark write distribution
- Current Spark integration documents none / hash / range.
- Starting in Iceberg 1.2.0, Spark writes normally request hash distribution.
- Tables with sort order use range distribution by default.
- Fanout avoids the clustering requirement but keeps more file handles open.
- Spark task size, partition boundaries and compression all affect final file size.
- Current default write.target-file-size-bytes is 512 MB.

### Row-level delete planning
- Sequence numbers represent relative age after successful commits.
- Position-style deletes may apply when data sequence <= delete sequence.
- Equality deletes require data sequence < delete sequence.
- Delete applicability also includes partition / target scope.

### Manifest maintenance
Current defaults revalidated:
- commit.manifest-merge.enabled = true
- commit.manifest.min-count-to-merge = 100
- commit.manifest.target-size-bytes = 8 MB

8 MB remains a merge target.

### Snapshot lifecycle
- Expired snapshots are no longer available for time travel.
- Files cannot be physically deleted while retained snapshots still reference them.
- Current table defaults include a 5-day max snapshot age and minimum 1 retained snapshot, but production retention must be chosen by business recovery / audit needs.
- Branch / tag references participate in snapshot retention.
- main does not expire as a reference.

### Orphan cleanup
- Orphan cleanup must use a retention interval longer than expected write duration.
- Current Spark procedure defaults to approximately 3 days.
- Too-short retention can delete in-progress files and corrupt a table.

## Version-sensitive guardrails
Revalidate exact engine behavior for:
- Spark / Flink / Trino row-level write support;
- v3 deletion vectors;
- branch / WAP workflows;
- isolation defaults;
- time-travel syntax;
- maintenance procedure options.
