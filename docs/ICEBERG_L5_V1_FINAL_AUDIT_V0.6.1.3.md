# Iceberg L5 V1 Final Audit — V0.6.1.3

## Decision

**Freeze Iceberg L5 V1.**

The 11-chapter learning spine now passes the two primary requirements:

1. Correctness first.
2. Knowledge structure first.

The chapter order is now:

```text
01 Overview
02 Table Metadata & Snapshot
03 Manifest List & Manifest
04 Data / Delete Files & Row-level Changes
05 Hidden Partitioning & Partition Evolution
06 Schema Evolution & Field ID
07 Trino Read Path & Pruning
08 Write Distribution & Ordering
09 Commit / Conflict / Recovery
10 Maintenance & Metadata Growth
11 Production Troubleshooting
```

## Ownership audit

- Snapshot: primary teaching in 02; commit visibility only revisited in 09.
- Manifest structure: primary teaching in 03.
- Row-level delete semantics: primary teaching in 04.
- Partition evolution: primary teaching in 05.
- Schema evolution: primary teaching in 06.
- Pruning: full chain only in 07.
- Writer layout: primary teaching in 08.
- Conflict / retry / recovery: primary teaching in 09.
- 8 MB / 100 / rewriteManifests / lifecycle: primary teaching in 10.
- SLO / capacity / incident flow: synthesis only in 11.

## Final correctness refinements

### Row-level delete scope

Clarified:

- DV / position deletes: target file + partition + sequence scope.
- Equality deletes: strictly older data sequence.
- Unpartitioned equality delete can act as global delete.

### Spark write distribution

Clarified:

- Spark + Iceberg uses hash as the normal default from Iceberg 1.2.0.
- A table with Sort Order uses range distribution by default.

### Manifest maintenance

Clarified that automatic manifest compaction preserves the order manifests are added to the metadata tree.

## Fragmentation audit

No chapter now relies on another chapter to complete its primary definition.

Repetition that remains is intentional bridge/synthesis repetition only:

- 03 → 04: Manifest points to Data/Delete content.
- 07: Read Model synthesizes 02–06.
- 08 → 09: Writer output becomes commit input.
- 10 → 11: Maintenance signals become troubleshooting signals.

## Presentation audit

- No Iceberg technical diagram is required for the current 11 chapters.
- Simple relationships are expressed as text chains.
- Fenced CodeBlock is reserved for real SQL in the Iceberg L5 slice.
- Quick Navigation remains lightweight text, not pill cards.
- Quick Answer keeps 16px mobile reading size and resets blockquote indentation.

## Freeze boundary

“Iceberg L5 V1 frozen” means the learning architecture is stable.

Future changes are allowed for:

- official spec/version corrections;
- engine-version compatibility notes;
- user-discovered ambiguities;
- genuinely missing production knowledge.

Future changes should **not** casually reorder the spine or duplicate primary teaching locations.
