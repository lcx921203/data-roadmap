# MetricFlow / Semantic Layer Source Notes V1.0.0

Validation date: 2026-09-12

## Baseline

Current learning baseline:

```text
dbt v1.12+ current semantic specification
+
current dbt Semantic Layer / MetricFlow documentation
```

dbt v2 release tracks are current next-generation context.

Exact managed-product behavior, command availability and supported data platforms remain version-sensitive.

## Primary references

Semantic models:
https://docs.getdbt.com/docs/build/semantic-models

About MetricFlow:
https://docs.getdbt.com/docs/build/about-metricflow

Entities:
https://docs.getdbt.com/docs/build/entities

Dimensions:
https://docs.getdbt.com/docs/build/dimensions

Metrics:
https://docs.getdbt.com/docs/build/metrics-overview

Simple metrics:
https://docs.getdbt.com/docs/build/simple

Measures / migration context:
https://docs.getdbt.com/docs/build/measures

Joins:
https://docs.getdbt.com/docs/build/join-logic

Time spine:
https://docs.getdbt.com/docs/build/metricflow-time-spine

Ratio:
https://docs.getdbt.com/docs/build/ratio

Derived:
https://docs.getdbt.com/docs/build/derived

Cumulative:
https://docs.getdbt.com/docs/build/cumulative

Conversion:
https://docs.getdbt.com/docs/build/conversion

MetricFlow commands:
https://docs.getdbt.com/docs/build/metricflow-commands

Validations:
https://docs.getdbt.com/docs/build/validation

Saved queries:
https://docs.getdbt.com/docs/build/saved-queries

dbt Semantic Layer:
https://docs.getdbt.com/docs/use-dbt-semantic-layer/dbt-sl

## Current verified semantic-model model

Current v1.12+ docs define semantic models as the foundation of MetricFlow's semantic graph.

Current model definition connects:

```text
dbt model
→ semantic_model metadata
→ entities
→ dimensions
→ simple metrics
```

The curriculum should teach the current embedded model-oriented YAML spec first.

Older standalone semantic-model YAML forms may appear only as migration/history context when relevant.

## Measures correction

Current docs explicitly mark:

```text
Measures are deprecated in the new spec
```

Current replacement:

```text
type: simple metric
```

Therefore V1 must not teach Measure as the primary active MetricFlow object.

Stage 03 may still use “measure” as a generic metric-modeling concept.

## Entities

Current entity types:

```text
primary
unique
foreign
natural
```

Entities are business objects / join keys in the semantic graph.

Join behavior depends on entity type.

## Dimensions

Current dimension types:

```text
categorical
time
```

Dimensions provide metric grouping / slicing semantics.

Time dimensions add granularity.

For semantic models defining metrics, aggregation time semantics are tied to `agg_time_dimension`.

## Current metric types

Current metric types:

```text
simple
ratio
derived
cumulative
conversion
```

Simple metrics are direct aggregations over one column expression and replace the old Measure-centric configuration.

Advanced metrics compose or transform metric inputs.

## Semantic graph / joins

Current docs define:

```text
semantic model
= graph node

entity relationship
= graph edge / join path
```

MetricFlow generates joins automatically from entity definitions.

Current rules restrict fan-out and chasm joins.

Current docs describe:

- left joins for many fact-to-dimension patterns;
- full outer join behavior for multi-fact queries;
- semantic validation for ambiguous paths;
- multi-hop joins with current documented hop limits.

The exact hop limit must be treated as version-sensitive rather than timeless architecture.

## Time spine

A MetricFlow time spine supports time-based joins / aggregations and is used by current features including:

```text
cumulative metrics
metric offsets
conversion metrics
slowly changing dimensions
join_to_timespine metrics
```

Time spine is not the same thing as teaching dimensional Date Dimension theory from scratch.

## Validation

Current built-in validation layers:

```text
Parsing
→ Semantic
→ Data Platform
```

Availability differs between dbt platform / dbt v2 / self-hosted dbt v1 contexts.

Current production learning must teach the responsibility of each validation layer, not one universal command.

## Commands

Current command surfaces differ by environment.

Examples currently include:

```text
dbt sl ...
mf ...
```

The curriculum should teach intent:

```text
query
list dimensions
inspect values
compile / inspect SQL
validate
```

before exact command syntax.

## Saved queries / exports

Saved Queries group reusable:

```text
metrics
dimensions
filters
```

and are dbt DAG resources.

Exports can write Saved Query results as tables / views in supported Semantic Layer deployment contexts.

Caching is available as a Semantic Layer concern, but physical cache/runtime details remain Stage 09.

## Managed Semantic Layer

Current dbt Semantic Layer centralizes metric definitions and provides downstream consumption integrations / APIs.

Availability and plan/support requirements are product-level facts and must be revalidated if precise plan claims are later published.

## Platform support guardrail

Current MetricFlow docs explicitly list a finite supported data-platform set and do not list support as universal.

The curriculum must not infer support for Trino from the existence of a Trino vertical slice elsewhere in DataRoadmap.

If a future article discusses actual deployment architecture:

```text
supported adapter/platform
+
current dbt docs
+
project implementation
```

must all be verified.

## Version-sensitive guardrails

Revalidate before exact publication of:

- managed Semantic Layer platform list;
- MetricFlow package / Python support;
- current YAML nesting rules;
- entity-type semantics if changed;
- multi-hop hop limits;
- generated join strategies;
- command names and remote/local behavior;
- validation availability;
- Saved Query cache / export behavior;
- dbt v2 / Fusion semantic-manifest changes.
