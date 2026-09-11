# MetricFlow / Semantic Layer Knowledge Spine V1.0.0

## Decision

MetricFlow / Semantic Layer remains:

```text
Stage 06
L5 Core
```

V1 is frozen to **12 causal nodes**.

The curriculum is not forced to match dbt / Spark / Trino node counts. Twelve nodes are justified because Semantic Graph, advanced metric types, time semantics, query generation and consumption each need their own causal layer.

## Current-spec correction

The previous taxonomy used this older mental model:

```text
Entity
Dimension
Measure
Metric
```

That is no longer the correct current MetricFlow configuration model.

Current dbt v1.12+ semantic specification uses:

```text
Semantic Model
├─ Entity
├─ Dimension
└─ Simple Metric

Advanced Metrics
├─ Ratio
├─ Derived
├─ Cumulative
└─ Conversion
```

`Measures` are deprecated in the current spec and survive only as migration / historical context.

This is a technical correction, not a cosmetic rename.

## Frozen causal chain

```text
01 Why Semantic Layer / MetricFlow
↓
02 dbt Model → Semantic Model
↓
03 Entity / Semantic Grain
↓
04 Dimension / Time Dimension
↓
05 Simple Metric / Aggregation / Additivity
↓
06 Semantic Graph / Join Safety
↓
07 Ratio / Derived
↓
08 Time Spine / Cumulative
↓
09 Conversion
↓
10 Query Generation / Validation
↓
11 Saved Query / Export / Cache / Consumption
↓
12 Production Quality / Reconciliation / Operations
```

## Why this order

### 01 → 02

First answer:

> Why does the Semantic Layer exist?

Then answer:

> What is the actual resource attached to an existing dbt model?

### 02 → 03 → 04

A Semantic Model is not useful until the learner understands:

```text
Entity
→ what business object / join key exists?

Dimension
→ how can a metric be sliced?
```

Entity comes before join-graph mechanics because join safety depends on correct entity type and grain.

### 05

Current MetricFlow's primitive quantitative resource is:

```text
type: simple
```

This is where aggregation, expression, additivity and the old Measure migration are taught.

### 06

Only after entities, dimensions and a metric exist does the learner need to understand:

```text
semantic model nodes
+
entity edges
→ semantic graph
→ reachable dimensions / joins
```

This prevents Join Graph from becoming disconnected graph theory.

### 07 → 09

Advanced metric complexity increases in layers:

```text
Simple
→ Ratio / Derived
→ Time Spine / Cumulative
→ Conversion
```

Conversion is intentionally later because it requires both entity semantics and time-window semantics.

### 10

Only after the graph and metric types are understood do we teach:

```text
metric request
→ graph resolution
→ generated SQL
→ validation
```

### 11

Serving and consumption come after query semantics:

```text
Saved Query
Export
Cache
Semantic Layer API
BI / App / Agent
```

### 12

Production closure finally connects:

```text
upstream dbt model
→ semantic definition
→ join graph
→ generated SQL
→ target execution
→ metric result
→ reconciliation
```

## Important boundary: Semantic Graph ≠ dbt DAG

dbt DAG:

```text
Model A
→ Model B
```

means:

> B depends on A during transformation build.

MetricFlow Semantic Graph:

```text
Semantic Model A
↔ Entity
↔ Semantic Model B
```

means:

> These business objects can be navigated for a semantic query.

They are related systems, but not the same graph.

## Important boundary: MetricFlow ≠ Query Engine

MetricFlow generates SQL.

The target data platform still owns:

```text
physical join algorithm
scan
shuffle
memory
spill
runtime scheduling
```

A slow metric can therefore be:

```text
semantic-model problem
or
generated-SQL problem
or
target-engine problem
```

These must be separated.

## Important boundary: MetricFlow ≠ Serving Table

MetricFlow may provide:

```text
Saved Query
Export
Cache
Semantic API
```

but Stage 09 still owns physical serving architecture:

```text
Serving Table
OLAP
Cache invalidation
Query SLA
Capacity
```

## Important boundary: Agent

Stage 06 owns:

```text
governed semantic query surface
```

Stage 10 owns:

```text
Planner
Router
Executor
Tool Registry
Semantic Query Tool
```

So the Agent consumes the Semantic Layer; MetricFlow does not become an Agent runtime.

## Platform support guardrail

Current dbt documentation publishes a specific supported-platform set for MetricFlow / Semantic Layer and does not make support universal.

Therefore:

> Do not write "our Trino layer directly runs dbt Semantic Layer / MetricFlow" unless current official support and the project implementation are both verified.

This is especially important for the DataRoadmap architecture because Trino is already a separate frozen vertical slice.

## Interview seed policy

V1.0.0 registers only existing evidence-backed questions whose concepts genuinely intersect the Semantic Layer:

```text
Data quality diagnosis
Realtime / offline consistency
Fact / dimension / grain design
Primary / business key design
Data Product system design
Data governance framework
```

There is currently no verified canonical MetricFlow-specific Interview question in the 30-question bank.

Therefore:

```text
related to MetricFlow
≠
MetricFlow interview frequency
```

## Body status

```text
0 / 12 written
12 / 12 responsibilities frozen
```

No article body is added in V1.0.0.
