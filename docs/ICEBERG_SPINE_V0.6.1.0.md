# Iceberg Spine V0.6.1.0

## Scope

This round implements the first structural changes from the V0.6.1 knowledge architecture audit.

## Changes

- Iceberg Learning Spine: 10 → 11 chapters.
- Added `Data Files, Delete Files & Row-level Changes`.
- Moved Trino Read Path from 09 → 07.
- Shifted Write / Commit / Maintenance / Troubleshooting to 08–11.
- Corrected Manifest semantics:
  - one Manifest tracks data **or** deletes, not both;
  - one Manifest uses one Partition Spec;
  - multiple Partition Values are allowed inside that Spec;
  - Manifest is immutable.
- Added Row-level Delete mental model:
  - Position Delete;
  - Equality Delete;
  - V3+ Deletion Vector;
  - Sequence Number.
- Added Manifest lifecycle clarification:
  - old Manifest is never reopened and appended;
  - 8 MB is merge target;
  - 100 is minimum accumulated manifest count before automatic merge;
  - `rewriteManifests` can regroup metadata.
- Fixed CONTENT.md section numbering.
- Removed internal `sc-*` IDs from the visible troubleshooting body.

## Current structural spine

```text
01 Overview
02 Table Metadata & Snapshot
03 Manifest List & Manifest
04 Data/Delete Files & Row-level Changes
05 Partition Evolution
06 Schema Evolution
07 Trino Read Path & Pruning
08 Write Distribution & Ordering
09 Commit / Conflict / Recovery
10 Maintenance & Metadata Growth
11 Production Troubleshooting
```

## Deliberately deferred

V0.6.1.0 does **not** fully rewrite all 11 chapters.

Next:
- V0.6.1.1: rewrite 01–07 as one coherent Read Model;
- V0.6.1.2: rewrite 08–11 as Write → Commit → Maintenance → Troubleshooting;
- V0.6.1.3: full duplicate / CodeBlock / mobile-reading audit.

This keeps each change reviewable and avoids another large content regression.
