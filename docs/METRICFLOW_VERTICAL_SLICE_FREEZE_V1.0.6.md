# MetricFlow Vertical Slice Freeze V1.0.6

## Decision

MetricFlow / Semantic Layer V1 is frozen.

Public closure:

```text
Learn
↕
Interview
↕
Scale
```

The MetricFlow vertical now contains:

```text
12 Learn nodes
3 hypothetical Scale scenarios
6 existing evidence-backed Interview entry points
direct Interview -> Knowledge mappings
15 contextual section relations
fourth public Scale domain: Semantic Layer
```

## Learn

PASS

The 12-node causal spine is complete:

```text
Semantic Layer mental model
→ dbt Model -> Semantic Model
→ Entity / Grain
→ Dimension / Time
→ Simple Metric
→ Semantic Graph / Join Safety
→ Ratio / Derived
→ Time Spine / Cumulative
→ Conversion
→ Query / Validation
→ Saved Query / Export / Cache / Consumption
→ Production Quality / Reconciliation
```

No new core MetricFlow mechanism is introduced in V1.0.6.

## Scale

PASS

Three production-pressure training scenarios are frozen:

```text
Metric Drift / Reconciliation
Semantic Graph / Fan-out
BI + App + Agent Semantic Serving
```

All remain explicitly hypothetical.

MetricFlow owns the fourth Scale domain:

```text
Semantic Layer
```

The existing generic multi-domain UI remains sufficient.

## Interview

PASS

Six existing evidence-backed questions have curated MetricFlow Knowledge anchors.

No MetricFlow-specific frequency claim is created.

## Relation integrity

PASS

- direct Interview -> Knowledge registry: loaded;
- Knowledge -> Interview: derived;
- Scale -> Knowledge: scenario-owned;
- Knowledge -> Scale: derived;
- Scale -> Interview: scenario-owned;
- Interview -> Scale: derived;
- contextual anchors: 15 / 15 validated.

No duplicate authoritative relation graph is introduced.

## Mobile / theme

PASS AT STATIC IMPLEMENTATION LEVEL

The fourth Scale domain reuses the existing Domain -> Theme -> Scenario path and Bottom Sheet filter.

MetricFlow Learn / Scale detail reuse the accepted mobile reading system.

The product retains:

```text
3-column public bottom nav
390px-oriented reading layout
one-hand directory
Safe Area handling
Light / Dark Theme
green signal palette
Reduced Motion
```

No V1.0.6 UI change is required.

## Truth boundary

PASS

```text
MetricFlow engineering pattern
≠ project claim

Scale hypothetical scenario
≠ production experience

MetricFlow relation
≠ MetricFlow-specific interview frequency

SQL-engine capability
≠ managed Semantic Layer platform support
```

## Technical baseline rule

The frozen V1 content keeps current dbt v1.12+ Semantic Layer / MetricFlow semantics as the publication baseline used during this slice.

The following remain version-sensitive and must be revalidated before exact future edits:

```text
dbt v2 / Fusion Semantic Layer behavior
CLI names / flags
managed product APIs
supported data-platform matrix
multi-hop limits
cache / export behavior
validation availability
artifact / manifest details
```

## Freeze rule

Reopen MetricFlow V1 only for:

- verified technical error;
- material current-spec correction;
- verified usability / interaction bug;
- broken cross-tab relation.

Do not keep extending MetricFlow merely because more configuration keys or product features exist.

## Next

The next planned vertical slice returns to:

```text
Flink
```

It should begin independently with:

```text
V1.1.0 Flink Knowledge Spine Freeze
```

and preserve the boundary:

```text
Spark
→ Spark application / SQL / Structured Streaming runtime

Flink
→ native Flink stream-processing runtime / operators / state / checkpoint mechanics
```
