# MetricFlow Source Notes V1.0.1

Validation date: 2026-09-12

## Primary references

Semantic models:
https://docs.getdbt.com/docs/build/semantic-models

Entities:
https://docs.getdbt.com/docs/build/entities

Dimensions:
https://docs.getdbt.com/docs/build/dimensions

Simple metrics:
https://docs.getdbt.com/docs/build/simple

## Semantic models

Current documentation states:

```text
dbt v1.12+
```

Semantic models are the foundation of MetricFlow's semantic graph.

Each dbt model can define one semantic model.

Current native YAML embeds semantic metadata in model definitions:

```text
models:
  semantic_model:
  agg_time_dimension:
  columns:
    entity / dimension
  metrics:
```

The current spec therefore differs materially from older standalone `semantic_models:` examples.

## Semantic model components

Current documentation describes semantic models as graph nodes connected through entities.

Current components include:

```text
semantic model name
aggregation time dimension
entities
primary entity
dimensions
derived semantics
simple metrics
config / metadata
```

## Entities

Current entity types:

```text
primary
unique
foreign
natural
```

Entity names identify business objects / join keys in the semantic graph.

Current docs explicitly say MetricFlow join logic depends on entity type.

Current boundaries:

```text
primary
→ unique / non-null record identity for the model

unique
→ unique non-null values but may represent a subset and allow nulls

foreign
→ repeated / nullable references to another entity

natural
→ business-derived unique key, currently used for SCD Type II dimension semantics
```

Entity declaration is semantic metadata; the DataRoadmap curriculum does not equate it with guaranteed database constraint enforcement.

## Semantic grain

Current spec supports:

```text
physical primary entity
or
top-level primary_entity for a virtual semantic grain
```

The top-level primary entity does not need to map to a physical column and assigning the name alone does not change query generation.

This must not be confused with dbt Model Contract or warehouse primary-key constraints.

## Derived semantics / composite key

Current docs support derived entity and dimension semantics using expressions.

Multiple columns can be combined to form a semantic key.

The curriculum teaches the correctness requirement first:

```text
combined key
must actually represent the intended business grain
```

not one particular string-concatenation syntax.

## Dimensions

Current dimension types:

```text
categorical
time
```

Dimensions are grouping / slicing semantics.

Current docs bind dimensions to the primary entity of the semantic model.

A qualified dimension can therefore be understood as:

```text
entity__dimension
```

for cross-model semantic access.

## Time dimensions

Current v1.12+ time dimensions:

- define `granularity` at column level for direct column-backed dimensions;
- may define granularity inside derived semantic configuration;
- use the model's `agg_time_dimension` as the default metric aggregation time;
- allow a metric-level aggregation-time override.

Current docs state that query granularity can roll from finer to coarser, but cannot recover finer detail from a coarser underlying time grain.

When combining metrics with different granularities, current docs describe the coarser granularity as the default result grain.

## Time semantics guardrail

Do not confuse:

```text
MetricFlow is_partition
```

with:

```text
Iceberg / warehouse physical partitioning
```

The former is semantic time metadata.

## SCD note

Current docs also support joins to SCD Type II dimension values.

However, the foundation article does not expand SCD semantics because:

```text
Stage 03
→ owns SCD business modeling

Node 06+
→ owns semantic join behavior
```

Current docs also expose version-sensitive SCD limitations that should be revalidated before a dedicated article expands them.

## Version-sensitive guardrails

Revalidate before future exact claims about:

- current YAML nesting;
- Entity type behavior;
- virtual primary entity behavior;
- derived semantics syntax;
- SCD Type II support limitations;
- time-granularity support list;
- platform-specific time granularity;
- dbt v2 Semantic Layer syntax.
