# MetricFlow Query & Consumption V1.0.3

## Scope

Published:

```text
10 Metric Query Generation / Commands / Validation
11 Saved Queries / Exports / Cache / Consumption
```

MetricFlow Learn progress:

```text
11 / 12
```

No UI changes.

## Query path freeze

```text
Metric request
+
group by
+
filter
+
time
→ semantic dependency resolution
→ dimension reachability
→ join-path validation
→ dataflow plan
→ generated SQL
→ target execution
```

## Command boundary

Current environment split:

```text
dbt Platform
→ dbt sl ...

self-hosted local MetricFlow
→ mf ...
```

Exact command names and flags remain version-sensitive.

The curriculum teaches intent first:

```text
discover metrics
discover dimensions
inspect values
query
compile/explain
validate
```

## Validation freeze

Stable responsibility model:

```text
Parsing
→ config/schema legality

Semantic
→ graph / metric / relationship constraints

Data Platform
→ physical relation and generated-SQL executability
```

Validation is explicitly not equivalent to business reconciliation.

## Saved Query freeze

Saved Query owns a reusable semantic request:

```text
metrics
group_by
where
order_by
limit
```

It is not stored final SQL.

For multiple metrics:

```text
valid group_by
=
intersection of common dimensions
```

## Export boundary

```text
Saved Query
→ semantic contract

Export
→ table/view written to the target data platform
```

Export is a semantic materialization mechanism, not the complete Stage 09 serving architecture.

## Cache boundary

Current Semantic Layer exposes:

```text
Result Cache
→ leverage target data platform caching

Declarative Cache
→ explicitly pre-warm selected saved queries
```

Declarative cache behavior is dbt Platform / release-track sensitive and must not be generalized into a universal caching model.

## Consumption

Current managed Semantic Layer exposes consumption paths including:

```text
BI / partner integrations
GraphQL
JDBC
Python SDK
```

The DataRoadmap architecture may place an Agent-facing `semantic_query` tool on top of this governed surface.

That is an architecture handoff, not a claim that MetricFlow itself contains Agent planning logic.

## Next

V1.0.4 closes Learn with:

```text
12 Production Quality / Reconciliation / Semantic Operations
```

followed by:

```text
Knowledge progression audit
Technical correctness audit
```
