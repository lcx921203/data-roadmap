# Iceberg Vertical Slice Audit V0.6.6

## Result

Iceberg V1 is ready to freeze after a small set of structural corrections.

The audit does **not** recommend:

- reordering the 11-node spine;
- adding more Iceberg chapters;
- adding more hypothetical scenarios;
- inventing Iceberg-specific interview frequency;
- adding diagrams for simple linear relationships.

The existing learning spine is fundamentally sound.

---

## 1. Knowledge Progression

Current spine:

```text
1  Overview
2  Table Metadata & Snapshot
3  Manifest List & Manifest
4  Data / Delete / Row-level Changes
5  Partition Evolution
6  Schema Evolution
7  Trino Read Path
8  Write Distribution / Ordering
9  Commit / Conflict / Recovery
10 Maintenance
11 Production Troubleshooting
```

### Finding

The order itself is correct.

The main progression defect was inside node 4:

```text
Row-level Changes
```

It previously explained exact Partition / Sequence Number delete-scope rules before Partition had been formally taught.

### Resolution

Node 4 now teaches:

```text
What Data / Delete are
→ Position Delete
→ Equality Delete
→ Deletion Vector
→ three scope dimensions only
```

Exact applicability moves to node 7:

```text
Trino Read Path
```

after Partition and Schema are already known.

This keeps the sequence progressive rather than fragmented.

---

## 2. Duplicate / Fragmented Explanations

### Healthy repetition

Some concepts intentionally reappear as short anchors:

```text
Snapshot
Manifest
Small Files
Commit
```

This is acceptable when the later chapter applies an already-known concept rather than redefining it.

### Unhealthy duplication found

Cross-tab relationship metadata had multiple possible owners:

```text
Knowledge.scale_scenarios
Scenario.knowledge

Knowledge.interview_relevance
Topic Mapping.interview_to_knowledge
```

This creates drift risk.

### Resolution

Frozen ownership:

```text
Scenario owns:
- knowledge[]
- interviews[]

Topic Mapping owns:
- precise Interview → Knowledge anchors

Registry derives reverse links.
```

Legacy Knowledge relationship fields are no longer authoritative or consumed by the Iceberg registry.

---

## 3. Mapping Precision

### Kept

```text
Lakehouse / Warehouse
→ Iceberg Overview
```

Reason: direct conceptual fit.

```text
Concurrency / Fault Tolerance
→ Iceberg Commit, Conflict & Recovery
```

Reason: direct mechanism fit inside the Iceberg vertical.

### Removed

```text
Large Dataset Technology Selection
→ Iceberg Production Troubleshooting
```

Reason:

The interview question is a broad architecture-selection question.
Directly mapping it to an Iceberg troubleshooting chapter was too forced.

It remains connected through:

```text
Interview Question
→ 10B Backfill Scale Scenario
→ relevant Iceberg Knowledge
```

A two-hop truthful relationship is better than a one-hop inaccurate relationship.

---

## 4. Mobile Content Density

Scale Scenario V1 intentionally contains full system-design depth:

```text
Parameters
Constraints
Failure / Bottleneck
Design
Trade-offs
Observability
Cost
Recovery
```

Each Iceberg scenario is approximately 29–30 information rows.

### Decision

Do not delete production content just to shorten mobile pages.

Instead:

```text
Scale Detail
→ horizontal Quick Navigation
→ jump to the needed section
```

This mirrors Learn Detail and reduces navigation cost without flattening the content.

Full UI polish remains a separate UI Review milestone.

---

## 5. Interview Detail Semantics

Old local reading switch:

```text
Interview | Learn
```

Problem:

These names are now also top-level product concepts and can look like nested navigation.

Frozen local labels:

```text
面试回答 | 深入理解
```

Internal mode values may remain `interview / learn`; only the user-facing semantics change.

---

## 6. Truth / Evidence Boundary

Audit result: **pass**.

### Scale

All current Iceberg Scale scenarios remain:

```yaml
hypothetical: true
```

No scenario is presented as a real project incident.

### Interview

Frequency continues to come from Interview Evidence.

Cross-links mean:

```text
useful together
```

not:

```text
Iceberg-specific high frequency
```

### Project

Project content remains backstage only and is not required for the public product loop.

---

## 7. Iceberg V1 Frozen Product Loop

```text
Learn
  ↕
Scale
  ↕
Interview
```

Responsibilities remain:

```text
Learn
= reusable mechanism and production knowledge

Scale
= explicit production-pressure training

Interview
= evidence-backed question and answer experience
```

No asset is generated merely to fill another asset.

---

## 8. Freeze Decision

After V0.6.6:

```text
Iceberg Learn V1        FROZEN
Iceberg Scale V1        FROZEN
Iceberg Interview links FROZEN
Cross-tab relation rule FROZEN
Truth boundary          FROZEN
```

The next step is **UI Review & Polish**, not more Iceberg content expansion.

A verified technical error may still reopen a frozen chapter.
A visual preference or desire for “more content” should not.
