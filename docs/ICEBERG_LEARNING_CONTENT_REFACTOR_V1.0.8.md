# Iceberg Learning Content Refactor V1.0.8 — Phase 2 & Re-freeze

## Result

PASS

Iceberg V1.1 is re-frozen with the same 11-node public spine.

## Phase 2 scope

Refactored:

```text
07 Trino Read Path
08 Write Distribution / Ordering
09 Commit / Conflict / Recovery
10 Maintenance / Snapshot Lifecycle
11 Production Troubleshooting
```

## Learning-quality changes

### 07 Read Path

The first-read model is now:

```text
Snapshot
→ Manifest pruning
→ File pruning
→ Delete applicability
→ Split / Scan
```

Exact delete scope comparisons remain present, but are explicitly marked as second-layer detail.

### 08 Write

The article now explains the causal chain:

```text
Distribution / Ordering
→ Task data shape
→ Data File size / locality
→ File Metrics
→ Read pruning
→ Maintenance cost
```

`write.target-file-size-bytes` is taught as a target, not a guaranteed output file size.

### 09 Commit

The article separates:

```text
metadata commit retry
business replay / idempotency
accident recovery
```

and integrates Time Travel as diagnosis before Rollback / Forward Fix decisions.

### 10 Maintenance

The lifecycle objects are separated:

```text
Data File
Manifest
Snapshot
Table Metadata JSON
Orphan
```

Snapshot expiration is explicitly connected to Time Travel / rollback / recovery windows.

### 11 Troubleshooting

The final chapter is now a locator map rather than a second copy of every mechanism:

```text
Write
Commit
Metadata
Planning
Scan
Maintenance
```

Correctness incidents additionally use:

```text
Snapshot
Schema
Partition
Data / Delete
Commit History
```

## Content priority model

Every refactored chapter now closes with:

```text
必须掌握
生产上要会判断
了解即可
```

This is intended to prevent reference-document completeness from becoming the learning objective.

## Language model

Important terms are introduced as:

```text
中文（English）
```

then prose prefers Chinese once the term is established.

## Cross-tab anchor preservation

The following existing authoritative contextual anchors remain unchanged:

```text
Planning 慢和 Execution 慢怎么区分
Distribution Mode
小文件问题应该先从哪里治
两个 Writer 同时提交会怎样
高并发为什么会出现 Retry Storm
为什么小 Data File 会一路放大成本
Rewrite Data Files
```

## Frozen validator contract

The spine file remains:

```text
version: 0.6.1
11 fixed ordered nodes
```

V1.0.8 changes its learning-refactor status only; it does not bump the frozen validator version.

## UI

No UI / CSS / theme / navigation change.
