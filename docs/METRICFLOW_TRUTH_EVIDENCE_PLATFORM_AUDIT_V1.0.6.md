# MetricFlow Truth, Evidence & Platform-Support Audit V1.0.6

## Result

PASS

## Current-spec truth boundary

MetricFlow V1 keeps the following current-spec corrections frozen:

```text
Measures are deprecated in the current v1.12+ specification
Simple Metric is the current primitive aggregation object
Semantic Graph is not the dbt transformation DAG
```

Exact CLI behavior, managed-product features, platform support and multi-hop implementation limits remain version-sensitive.

## Platform-support boundary

PASS

The content explicitly forbids inferring:

```text
Trino exists in DataRoadmap
→ managed dbt Semantic Layer must support Trino
```

Any concrete deployment statement must revalidate:

```text
current official support matrix
+
current adapter / product behavior
+
actual implementation
```

No V1.0.6 patch turns this into a project claim.

## Cache / product boundary

PASS

The curriculum separates:

```text
Result Cache
→ target data platform behavior

Declarative Cache
→ current managed dbt Semantic Layer product behavior

Stage 09 Serving Cache
→ broader production serving architecture
```

Current declarative-cache invalidation and security-context caveats remain explicitly platform / version sensitive.

## Agent boundary

PASS

MetricFlow owns:

```text
governed semantic query surface
```

Stage 10 owns:

```text
Planner
Router
Executor
Tool Registry
Agent evaluation / runtime behavior
```

A Scale scenario may use an Agent as a Semantic Layer consumer without claiming that MetricFlow is an Agent runtime.

## DataHub boundary

PASS

MetricFlow owns executable semantic metadata.

DataHub remains owner of enterprise-wide:

```text
catalog
ownership
glossary
cross-system lineage
governance context
```

## Interview evidence

PASS

V1.0.5 links only existing canonical questions.

It does not:

- add direct evidence;
- add companies;
- change frequency bands;
- invent a MetricFlow-specific canonical question;
- convert a relevance mapping into a frequency claim.

## Scale truth

PASS

All three MetricFlow scenarios are explicitly hypothetical.

Their numeric parameters are training constraints, not measured project facts.

## Project boundary

PASS

Public Learn / Interview / Scale content does not use backstage project material as evidence of production deployment.

Project material may later support resume / interview preparation only after separate fact verification.

## Reopen rule

MetricFlow V1 should be reopened only for:

- a verified technical error;
- a material current Semantic Layer / MetricFlow spec change;
- a broken cross-tab relation;
- a verified usability / interaction bug.

Do not reopen it merely to add more YAML / CLI reference detail.
