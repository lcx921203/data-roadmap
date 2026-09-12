# Iceberg Learning Content Refactor V1.0.7 — Phase 1

## Why refactor instead of append

The previous Iceberg V1 was technically strong in several runtime chapters but uneven in learning depth.

The goal is not to make every article longer. The goal is:

```text
important knowledge
→ explain deeply

production-relevant judgment
→ explain concretely

secondary detail
→ mark as awareness only
```

## New learning-quality contract

Every major article should prefer this progression:

```text
30-second mental model
→ why the mechanism exists
→ core objects
→ step-by-step mechanism
→ concrete example
→ production failure / decision
→ must-master vs production vs awareness
→ explicit handoff
```

## Language contract

First important occurrence:

```text
中文（English）
```

After the concept is established, prefer Chinese in prose. Do not use long stretches of untranslated English as the main explanatory language.

## Phase 1 scope

Refactored:

```text
01 Apache Iceberg
02 Table Metadata / Snapshot / Time Travel
03 Manifest List / Manifest
04 Data / Delete / Row-level Changes
05 Hidden Partitioning / Partition Evolution
06 Schema Evolution / Schema ID / Field ID
```

The 11-node spine remains unchanged.

## Priority corrections

### Time Travel

Now taught as a consequence of the snapshot model:

```text
Table Metadata
→ historical Snapshot
→ snapshot schema
→ manifest chain
→ historical table state
```

The article separates Time Travel, Rollback, Forward Fix, Branch, Tag and Snapshot Expiration without turning the section into a command reference.

### Schema Evolution

Now centers on:

```text
Schema ID
Field ID
Field ID never reuse
Field-ID projection
historical snapshot schema
partition source field identity
consumer compatibility
```

instead of only listing supported ALTER operations.

### Row-level Changes

First-read model is now:

```text
Target
+
Partition
+
Sequence Number
→ delete applicability
```

Exact comparator rules remain in Read Path, preventing premature detail overload.

### Partition Evolution

Now explicitly connects Partition Source Field ID with Schema Field ID and separates future layout evolution from historical repartition rewrite.

## No UI changes

This package changes content only. The accepted Light / Dark + green signal system and one-hand reading interaction remain frozen.
