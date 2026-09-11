# MetricFlow Semantic Foundation V1.0.1

## Scope

Published:

```text
01 Semantic Layer & MetricFlow Mental Model
02 dbt Model -> Semantic Model & Current Spec
03 Entities / Semantic Grain / Join Keys
04 Dimensions / Time Dimensions / Aggregation Time
```

MetricFlow Learn is now:

```text
4 / 12
```

## Causal progression

```text
Why Semantic Layer?
→ What is a Semantic Model?
→ What business object / grain does it represent?
→ How can metrics be sliced and timed?
```

No Simple Metric formula or Join Graph deep dive is pulled forward.

## Current-spec foundation

The articles use current dbt v1.12+ semantics:

```text
dbt model
→ semantic_model enabled
→ column-level entity / dimension
→ model-level aggregation time
→ current metrics
```

Legacy standalone semantic-model / Measure-first syntax is not used as the primary teaching model.

## Entity correctness

Frozen causal rule:

```text
physical grain
→ entity type
→ valid semantic relationships
→ safe joins
→ correct metrics
```

Entity metadata is not treated as a replacement for dbt tests or database constraints.

## Time semantics

Frozen distinction:

```text
Time Dimension
→ business event-time grouping

agg_time_dimension
→ default aggregation time for metrics

Time Spine
→ continuous time scaffold, deferred to node 08
```

## UI micro-patch

The existing Continue Learning animation is preserved as a single 1px Signal-family moving border highlight.

V1.0.1 changes only intensity:

```text
Light
→ moderately stronger / slightly longer trail

Dark
→ stronger peak / longer visible trail / slightly faster
```

Still forbidden:

```text
outer glow
shadow
multicolor neon
layout movement
```

Reduced Motion still disables the effect.
