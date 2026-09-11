# MetricFlow Scale & Interview Integration V1.0.5

## Result

MetricFlow now participates in the full public graph:

```text
Learn
↕
Interview
↕
Scale
```

No UI redesign is introduced.

## New Scale domain

V1.0.5 adds the fourth domain:

```text
语义层 / Semantic Layer
```

Current Scale domains:

```text
Lakehouse
Compute Engines
Modeling Engineering
Semantic Layer
```

The existing multi-domain navigation is reused.

## Three Semantic Layer Scale scenarios

### 1. Metric Drift & Reconciliation

Training chain:

```text
semantic definition release
→ BI / API / Agent drift
→ validation still green
→ old/new definition dual-run
→ slice reconciliation
→ identify data vs definition vs consumer
→ rollback or governed migration
```

### 2. Semantic Graph / Fan-out

Training chain:

```text
new dimension
→ result multiplies
→ inspect physical grain
→ validate entity type
→ trace join path
→ remove fan-out
→ reconciliation
```

### 3. BI + Agent Semantic Serving

Training chain:

```text
many consumers
→ repeated semantic queries
→ classify dynamic vs stable query shapes
→ Saved Query / Export / Cache where justified
→ governed dynamic query for flexible consumers
→ freshness / cost / access-control trade-off
```

All three remain:

```yaml
hypothetical: true
```

They are production-pressure training scenarios, not project-experience claims.

## Interview integration

No canonical MetricFlow-specific interview question is invented.

Mapped existing evidence-backed questions:

```text
iq-data-quality-diagnosis-001
iq-realtime-offline-consistency-001
iq-dimensional-fact-dimension-design-001
iq-dimensional-primary-key-001
iq-data-product-system-design-001
iq-data-governance-framework-001
```

The strongest current directly relevant evidence includes:

```text
Data quality diagnosis
→ 10 direct evidence
→ 6 companies
→ core_verified

Data governance framework
→ 5 direct evidence
→ 4 companies
→ core_verified

Fact / dimension / grain design
→ 5 direct evidence
→ 4 companies
→ core_verified
```

Their relation to MetricFlow does not convert them into MetricFlow-specific frequency claims.

## Authoritative ownership

Direct Interview -> Knowledge mapping:

```text
content/mappings/metricflow-v1.0.5.yaml
```

Scale Scenario owns:

```text
knowledge[]
interviews[]
```

Contextual reading relation:

```text
content/mappings/metricflow-section-relations-v1.0.5.yaml
```

Reverse relationships remain derived.

## Truth boundary

```text
MetricFlow Knowledge
= reusable semantic-engineering knowledge

MetricFlow Scale
= hypothetical production-pressure exercise

Interview Evidence
= observed interview evidence

Project Experience
= backstage fact source
```

These are not interchangeable.
