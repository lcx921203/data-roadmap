# MetricFlow Source Notes V1.0.2

Validation date: 2026-09-12

## Primary references

Simple metrics:
https://docs.getdbt.com/docs/build/simple

Join logic:
https://docs.getdbt.com/docs/build/join-logic

Ratio metrics:
https://docs.getdbt.com/docs/build/ratio

Derived metrics:
https://docs.getdbt.com/docs/build/derived

MetricFlow time spine:
https://docs.getdbt.com/docs/build/metricflow-time-spine

Cumulative metrics:
https://docs.getdbt.com/docs/build/cumulative

Conversion metrics:
https://docs.getdbt.com/docs/build/conversion

## Simple metrics

Current docs apply current Simple Metric syntax to dbt v1.12+.

Current core parameters include:

```text
name
type: simple
agg
expr
non_additive_dimension
agg_time_dimension
join_to_timespine
fill_nulls_with
filter
```

Current aggregation options include:

```text
sum
max
min
average
median
count
count_distinct
percentile
sum_boolean
```

Current docs explicitly define Simple Metrics as aggregations over a single column expression in a semantic model.

## Join logic

Current MetricFlow builds a graph:

```text
semantic model = node
join path = edge
```

Entities are join keys.

Current documented behavior includes:

```text
fact -> dimension
→ primarily left join

multi-fact result composition
→ full outer join of aggregated results

fan-out / chasm
→ restricted
```

Current entity relationship matrix permits primary/unique combinations and foreign-to-primary/unique joins while blocking relationships that would create fan-out.

## Multi-hop joins

Current docs, last updated 2026-09-10, state:

```text
maximum two hops to reach a dimension
```

This is treated as current implementation behavior, not timeless Semantic Layer theory.

Current validation also checks ambiguous paths.

## Ratio

Current Ratio Metric uses:

```text
numerator
denominator
```

Each input can optionally specify:

```text
name
filter
alias
```

Current docs show cross-semantic-model ratio inputs being computed in subqueries and joined on common dimensions before final division.

## Derived

Current Derived Metric uses:

```text
expr
```

over other metrics.

Optional `input_metrics` metadata can add:

```text
alias
filter
offset_window
```

Current docs state `offset_window` is available for derived metrics.

## Time Spine

Current docs require at least one dbt model configured as a Time Spine for time-based MetricFlow operations.

Current documented Time Spine consumers include:

```text
cumulative metrics
metric offsets
conversion metrics
SCD joins
metrics with join_to_timespine
```

Current configuration uses:

```text
time_spine
standard_granularity_column
column granularity
```

At minimum a daily Time Spine is currently required; finer-grain use cases may require a finer Time Spine.

Multiple non-overlapping Time Spines can be configured.

Exact selection behavior between compatible spines remains implementation-sensitive.

## Cumulative

Current Cumulative Metric requires an input metric and a configured Time Spine.

Current semantics:

```text
window
→ sliding accumulation window

grain_to_date
→ period-to-date accumulation

neither
→ all-time accumulation
```

`window` and `grain_to_date` are mutually exclusive.

Current docs expose `period_agg` for re-aggregation at non-default query granularity.

## Conversion

Current Conversion Metric measures whether one event leads to another for a specific entity within a time window.

Current core parameters:

```text
entity
calculation
base_metric
conversion_metric
window
constant_properties
```

Current calculation options include:

```text
conversion_rate
conversions
```

Current docs explicitly distinguish Conversion from Ratio because Conversion performs an entity-aware pre-aggregation join.

Current documented matching logic connects a conversion event to the closest valid base event inside the configured time window, removes duplicate attribution, then aggregates.

## Guardrails

Revalidate before future edits for:

- aggregation function list;
- exact non-additive configuration behavior;
- entity relationship matrix;
- multi-hop limits;
- generated fact-to-fact SQL strategy;
- Time Spine configuration / selection behavior;
- cumulative period_agg support;
- conversion attribution implementation;
- dbt v2 / Fusion semantic query behavior.
