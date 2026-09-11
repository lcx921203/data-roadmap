# MetricFlow Taxonomy Correction V1.0.0

## Current taxonomy correction

The old Stage 06 taxonomy contains:

```text
Semantic Model
- Entity
- Dimension
- Measure
```

For current MetricFlow / dbt v1.12+ semantics, interpret this as:

```text
Semantic Model
- Entity
- Dimension
- Simple Metric
```

because MetricFlow Measures are deprecated in the latest spec.

This file records the correction without rewriting unrelated taxonomy sections in the V1.0.0 incremental package.

## Current Stage 06 L5 learning contract

```text
Semantic Layer purpose
Semantic Model
Entity / semantic grain
Dimension / time dimension
Simple Metric
Semantic Graph / safe joins
Ratio / Derived
Time Spine / Cumulative
Conversion
Query generation / validation
Saved Query / export / cache / consumption
Production quality / reconciliation
```

A later taxonomy-wide cleanup may update the human-readable `docs/TAXONOMY.md` wording directly, but no article should teach deprecated Measure syntax as the current primary model.
