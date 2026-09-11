# MetricFlow Source Notes V1.0.3

Validation date: 2026-09-12

## Primary references

MetricFlow commands:
https://docs.getdbt.com/docs/build/metricflow-commands

Validations:
https://docs.getdbt.com/docs/build/validation

Saved queries:
https://docs.getdbt.com/docs/build/saved-queries

Semantic Layer:
https://docs.getdbt.com/docs/use-dbt-semantic-layer/dbt-sl

Semantic Layer caching:
https://docs.getdbt.com/docs/use-dbt-semantic-layer/sl-cache

Semantic Layer APIs:
https://docs.getdbt.com/docs/dbt-apis/sl-api-overview

## Command environments

Current docs distinguish:

```text
dbt Platform
→ dbt sl prefix
→ remote execution

self-hosted dbt / MetricFlow
→ mf prefix
→ local execution
```

Current command families include:

```text
list metrics
list dimensions
list dimension-values
list entities
list saved-queries
query
validate / validate-configs
export / export-all in supported environments
```

Exact support differs by environment.

## Semantic manifest refresh

Current docs state that after metric changes, `dbt parse` should run at minimum so current semantic artifacts are refreshed without rebuilding all physical models.

## Query

Current query inputs include:

```text
metrics
group_by
where
order_by
limit
time bounds in supported environments
```

Current query debugging surfaces include generated SQL and MetricFlow/dataflow plans, but exact flag names differ between dbt Platform/v2 and local v1 paths.

## Multi-metric dimensions

Current `list dimensions` semantics return common dimensions when more than one metric is supplied.

This same intersection rule applies to Saved Query group-by / where usage across multiple metrics.

## Validation

Current Semantic Layer defines three validation layers:

```text
Parsing
Semantic
Data Platform
```

They execute sequentially conceptually.

Current environment availability differs.

Do not freeze one universal validation command.

## Saved queries

Current Saved Queries:

- save commonly used MetricFlow queries;
- can include metrics, group bys and filters;
- are dbt DAG resources;
- can configure cache and exports;
- can be selected/built as resources.

## Exports

Current Export behavior can write Saved Query results as:

```text
table
view
```

in supported Semantic Layer deployment contexts.

Current scheduling is integrated with dbt job scheduling.

Exact export support remains environment-sensitive.

## Cache

Current managed Semantic Layer distinguishes:

```text
Result caching
→ uses target data platform cache

Declarative caching
→ pre-warms configured Saved Query results
```

Current declarative caching behavior requires dbt Platform prerequisites and should not be taught as generic MetricFlow behavior everywhere.

Current docs describe invalidation based on upstream model run/freshness metadata.

## Semantic Layer APIs

Current API surface includes:

```text
GraphQL
JDBC
Python SDK
```

These interfaces enable downstream tools to query governed metrics and dimensions.

## Agent handoff

Using the Semantic Layer as an Agent tool surface is a DataRoadmap architecture pattern:

```text
Agent
→ semantic_query tool
→ Semantic Layer
```

It is not a claim that MetricFlow itself implements Planner / Router / Executor.

## Guardrails

Revalidate before future exact claims about:

- dbt sl vs mf command names;
- validate command behavior;
- local vs remote data-platform validation;
- compile/explain flags;
- Saved Query config syntax;
- export supported forms;
- declarative cache prerequisites / invalidation;
- API product availability;
- partner integration matrix;
- dbt v2 / Fusion query behavior.
