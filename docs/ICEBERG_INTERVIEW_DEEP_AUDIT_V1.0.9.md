# Iceberg Interview Deep Audit V1.0.9

## Result

PASS

## Evidence boundary

Current canonical evidence remains authoritative.

- `iq-lake-vs-warehouse-001`: 6 direct evidence / 4 companies / core_verified
- `iq-large-dataset-tech-selection-001`: 1 direct evidence / 1 company
- `iq-system-concurrency-fault-tolerance-001`: 1 direct evidence / 1 company

There is still no independently calibrated canonical question whose primary wording is an Iceberg-specific internal-mechanism question.

Therefore V1.0.9 does not invent an Iceberg-specific frequency band.

## New Interview model

The evidence-backed Lakehouse question remains the primary entry point.

Twelve curated Iceberg follow-ups now cover:

P0 preparation:
- Snapshot -> Manifest List -> Manifest -> File
- Time Travel vs Rollback
- historical Snapshot Schema
- Schema Evolution / Field ID
- concurrent Writer / optimistic commit

P1 preparation:
- Field ID never reuse
- Partition Evolution
- ambiguous commit outcome
- Rollback vs Forward Fix
- small-file root cause
- Manifest / Planning pressure

P2 preparation:
- Iceberg / Paimon / Hudi / Delta selection framing

P0 / P1 / P2 are preparation priorities, not frequency labels.

## Regional framing

The current evidence corpus does not support absolute China-vs-overseas interview-frequency percentages.

Use regional framing only as a preparation heuristic:

- China: Lakehouse / Table Format / technology-selection framing is a useful default entry point unless the role or resume explicitly names Iceberg.
- Overseas lakehouse / data-platform preparation: deeper product-specific Iceberg internals deserve preparation, but no absolute regional frequency is claimed.

## Truth rule

Canonical question frequency = direct interview evidence only.

Curated Iceberg follow-up = technical preparation.

Regional framing = preparation heuristic.

Learn relation = contextual relevance.

These must never be collapsed.
