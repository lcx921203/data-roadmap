# Trino Core Execution Model V0.7.1

## Scope

V0.7.1 publishes the first five nodes of the frozen Trino spine.

```text
01 Trino Overview
02 Coordinator / Worker & Query Lifecycle
03 Catalog / Connector / SPI
04 SQL → Logical / Distributed Plan
05 Stage / Task / Split / Driver / Operator
```

No UI changes are included.

No Scale Scenario is added.

No new Interview Question is created.

## Stage 04 ordering

Iceberg already occupies Knowledge orders:

```text
1 - 11
```

Trino therefore uses:

```text
12 - 22
```

for the published Markdown front matter.

The Trino spine still uses its own local sequence:

```text
1 - 11
```

This produces a clean Stage 04 reading chain:

```text
Iceberg
→ Trino
```

without changing the shared registry sorter.

## Progression audit

### Node 1

Establishes:

```text
Trino = distributed SQL query engine
```

It does not teach detailed planning or execution internals.

### Node 2

Introduces the runtime roles:

```text
Coordinator
Worker
Query Lifecycle
```

It deliberately does not teach Resource Groups or FTE.

### Node 3

Explains why Trino can access heterogeneous systems:

```text
Trino Catalog
→ Connector
→ SPI
→ External Data Source
```

It explicitly separates:

```text
Trino Catalog
```

from:

```text
Iceberg Metadata Catalog
```

### Node 4

Builds the planning chain:

```text
SQL
→ Parser
→ Analyzer
→ Logical Plan
→ Optimizer
→ Distributed Plan
```

Join selection remains deferred.

### Node 5

Turns planning into runtime:

```text
Stage
→ Task
→ Split
→ Driver
→ Operator
```

At this point the learner has a complete Core Execution Model.

## Iceberg boundary

The Trino articles do not reteach:

- Snapshot;
- Manifest List;
- Manifest;
- Delete Applicability;
- Partition Evolution.

The next Trino node may reference Iceberg Read Path only as an external prerequisite.

## Technical source baseline

The content was checked against current Trino project material for:

- distributed Coordinator / Worker architecture;
- Connector / SPI boundary;
- logical vs distributed query planning;
- Stage / Task / Split execution model;
- current multi-source and lakehouse positioning.

Current release-specific behavior is intentionally not hardcoded into these foundational articles unless required.

## Next

V0.7.2 begins:

```text
06 Scan / Pushdown / Iceberg Read Boundary
07 Statistics / CBO / Join / Dynamic Filtering
```
