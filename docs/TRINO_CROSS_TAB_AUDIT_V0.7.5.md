# Trino Cross-Tab Integration Audit V0.7.5

## Truthfulness

PASS

- Scale scenarios are hypothetical.
- No scenario is presented as user project experience.
- Existing Interview evidence counts are not modified.
- No Trino-specific frequency claim is introduced.

## Learn -> Scale

PASS through contextual relations:

- Memory / Exchange -> Heavy Join Pressure
- Resource Groups -> Interactive Concurrency
- FTE -> Batch Recovery

## Learn -> Interview

PASS through contextual relations:

- Trino positioning -> OLAP engine selection
- Resource Group / concurrency -> system concurrency question
- Production troubleshooting -> SQL plan and Join slowdown questions

## Scale -> Learn / Interview

PASS through scenario-owned relationships and contextual detail-item links.

## Interview -> Scale

PASS through existing `getScalesForInterview()` derivation from scenario `interviews[]`.

## Direct Interview -> Knowledge

Not expanded in V0.7.5.

The existing runtime direct Interview -> Knowledge registry remains Iceberg-curated.
Trino Interview pages still receive relevant Scale scenarios, and those scenarios lead into Trino Knowledge.

This is intentionally left for the V0.7.6 closure audit rather than repurposing the frozen Iceberg mapping file.

## UI

No layout changes.

Scale remains:

```text
Domain
→ Training Theme
→ Scenario
```

The current single Lakehouse domain still does not show a Domain filter or sticky domain context.
