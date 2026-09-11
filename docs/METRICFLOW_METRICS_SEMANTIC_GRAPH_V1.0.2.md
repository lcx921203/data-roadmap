# MetricFlow Metrics & Semantic Graph V1.0.2

## Scope

Published:

```text
05 Simple Metrics / Aggregation / Additivity
06 Semantic Graph / Join Logic / Fan-out Safety
07 Ratio / Derived Metrics
08 Time Spine / Cumulative Metrics
09 Conversion Metrics
```

MetricFlow Learn progress:

```text
9 / 12
```

No UI changes.

## Progression

```text
Entity / Dimension foundation
→ primitive metric
→ safe cross-model graph
→ metric composition
→ continuous time
→ event conversion
```

## Simple Metric freeze

Current baseline:

```text
type: simple
→ primitive aggregation metric
```

Legacy Measure syntax remains migration context only.

The article separates:

```text
aggregation function
metric filter
metric time
additivity
null handling
time-spine joining
```

## Semantic Graph freeze

Current graph model:

```text
semantic model
= node

shared entity relationship
= edge
```

Join safety is driven by entity cardinality semantics.

Current high-level rules:

```text
Foreign -> Primary / Unique
→ safe common fact-to-dimension direction

Primary / Unique -> Foreign
Foreign -> Foreign
→ fan-out risk / restricted
```

Current multi-hop path limit is documented as two hops to a target dimension and explicitly marked version-sensitive.

Physical join algorithm remains target-engine responsibility.

## Ratio / Derived freeze

Ratio:

```text
numerator metric
/
denominator metric
```

Cross-model inputs are aligned at common semantic dimensions before final combination.

Derived:

```text
expression over metrics
```

with optional:

```text
alias
filter
offset_window
```

Metric-level calculation is explicitly distinguished from row-level SQL calculation.

## Time Spine freeze

```text
Time Dimension
→ event-time semantics

Time Spine
→ continuous time scaffold
```

Current Time Spine supports:

```text
cumulative
offsets
conversion
SCD joins
join_to_timespine
```

Cumulative semantics:

```text
window
→ sliding period

grain_to_date
→ reset at calendar period boundary

no window
→ all-time accumulation
```

## Conversion freeze

Conversion is not modeled as ordinary ratio.

Frozen causal chain:

```text
base events
+
conversion events
+
entity
+
time window
+
optional constant properties
→ pre-aggregation matching
→ dedup / attribution
→ conversions or conversion rate
```

Source event grain, identity and late arrival remain upstream correctness requirements.

## Next

V1.0.3:

```text
10 Metric Query Generation / Commands / Validation
11 Saved Queries / Exports / Cache / Consumption
```
