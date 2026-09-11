# Spark SQL & Adaptive Execution V0.8.2

## Scope

Published:

```text
06 Spark SQL / Catalyst / Physical Plan
07 Join Strategy / Statistics / AQE
08 Data Skew / Shuffle Pressure / Straggler
```

No UI changes.
No new Scale Scenario.
No Interview frequency changes.

## Causal progression

```text
SQL / DataFrame
→ Logical Plan
→ Analyzer
→ Optimized Logical Plan
→ Physical Plan
→ Statistics
→ Join Strategy
→ Runtime Statistics
→ AQE
→ Shuffle Distribution
→ Skew / Straggler
```

## Node 06 boundary

Node 06 teaches:

```text
what to compute
vs
how to execute it
```

It introduces:

- Analyzer;
- Catalyst logical optimization;
- Physical planning;
- EXPLAIN;
- statistics as plan input;
- data-source pushdown boundary.

It does not enumerate Catalyst rules.

## Node 07 boundary

Join strategies are taught through cost shape:

```text
Broadcast Hash
→ avoid large-side shuffle
→ pay broadcast + build-memory cost

Sort Merge
→ shuffle / sort both sides when needed
→ suitable for large equi-joins

Shuffled Hash
→ shuffle
→ build local hash map per partition
→ depends on partition working set
```

AQE is taught as:

```text
runtime statistics
→ re-optimize remaining physical plan
```

not as a universal auto-tuning solution.

## Node 08 boundary

The audit explicitly separates:

```text
large but balanced shuffle
≠
data skew
```

Skew means a highly uneven distribution where a few partitions / tasks dominate.

Mitigation order:

```text
prove skew
→ inspect key distribution
→ evaluate AQE
→ correct key / null / default-value issues
→ only then consider salting
```

Speculative execution is not positioned as a skew fix.

## Next

V0.8.3 continues:

```text
09 Memory / Cache-Persist / Serialization / Spill / OOM
10 Structured Streaming Execution Model
11 State / Event Time / Watermark / Checkpoint / Exactly-once
```
