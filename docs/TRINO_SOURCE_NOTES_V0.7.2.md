# Trino Source Notes V0.7.2

Validation date: 2026-09-11

Current documentation baseline: Trino 483.

## Primary references

Pushdown:
https://trino.io/docs/current/optimizer/pushdown.html

Table statistics:
https://trino.io/docs/current/optimizer/statistics.html

Cost in EXPLAIN:
https://trino.io/docs/current/optimizer/cost-in-explain.html

Cost-based optimizations:
https://trino.io/docs/current/optimizer/cost-based-optimizations.html

Dynamic filtering:
https://trino.io/docs/current/admin/dynamic-filtering.html

Iceberg connector:
https://trino.io/docs/current/connector/iceberg.html

## Confirmed current behavior

### Pushdown

Trino can delegate predicates, projections and some higher-level operations to a connector / underlying data source.

Support is connector-specific.

### Statistics

Connectors provide statistics to the planner. Current Trino statistics include table row count and column-level size, null fraction, distinct count, low value and high value where supported.

### CBO

Current Trino supports cost-based join enumeration and automatic join distribution selection when sufficient cost information is available.

### Hash join

The planner distinguishes:

```text
Build Side
Probe Side
```

and can choose:

```text
Broadcast
Partitioned
```

### Dynamic filtering

Runtime values are collected from the join build side and used to reduce probe-side scanning.

Depending on connector support, filtering can reach:

- table scan;
- split enumeration;
- partition / file-reader pruning.

Dynamic filtering is not identical to static predicate pushdown.

## Content stability rule

Do not freeze numeric defaults, optimizer heuristics or connector-specific support as timeless product facts.

If a later lesson needs exact property defaults or version-specific behavior, revalidate against current Trino docs.
