# MetricFlow Source Notes V1.0.4

Validation date: 2026-09-12

## Primary references

Validations:
https://docs.getdbt.com/docs/build/validation

Semantic Layer caching:
https://docs.getdbt.com/docs/use-dbt-semantic-layer/sl-cache

Semantic Layer APIs:
https://docs.getdbt.com/docs/dbt-apis/sl-api-overview

Saved queries:
https://docs.getdbt.com/docs/build/saved-queries

## Validation

Current docs define three built-in validation layers:

```text
Parsing
Semantic
Data Platform
```

They occur sequentially.

Current docs state Data Platform Validation checks that:

```text
simple metrics / dimensions exist
underlying source tables exist
generated metric SQL executes
```

Current availability differs by dbt v1 / v2 / platform / local MetricFlow.

## Semantic validation in CI

Current docs explicitly support semantic validation in CI to catch changes to dbt models that would break metrics.

This validates graph / physical compatibility, not business reconciliation.

## Declarative caching

Current managed dbt Semantic Layer distinguishes:

```text
Result Caching
Declarative Caching
```

Declarative caching currently:

- uses Saved Query configuration;
- requires an Export;
- builds cached tables in the data platform;
- invalidates caches based on upstream model freshness/run metadata;
- refreshes/rebuilds on the saved-query schedule.

These are product-specific current behaviors.

## Current cache security caveat

Current docs state cached data is stored separately from underlying models and that cached-table queries do not automatically apply the source-table security context at query time.

This must be treated as:

```text
current product caveat
not universal semantic-layer theory
```

and revalidated before future production architecture claims.

## Production correctness model used by DataRoadmap

The curriculum closes production quality through:

```text
upstream data correctness
→ semantic-definition correctness
→ relationship correctness
→ time correctness
→ generated-SQL correctness
→ target-runtime health
→ cache/export freshness
→ consumer behavior
→ business reconciliation
```

## Reconciliation

Reconciliation is intentionally treated as a project/business validation pattern, not a built-in MetricFlow validation type.

Examples include comparing governed metrics against:

```text
finance settlement
payment system
audited ledger
trusted operational aggregate
```

No universal tolerance value is published.

## Guardrails

Revalidate before exact future claims about:

- dbt v2 / Fusion release status;
- Validation automatic behavior;
- supported data platforms;
- MetricFlow command names;
- API interfaces;
- declarative cache prerequisites;
- cache invalidation;
- cached-data access-control behavior;
- export scheduling;
- managed Semantic Layer product plans.
