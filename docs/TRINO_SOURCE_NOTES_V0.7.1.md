# Trino Source Notes V0.7.1

## Validation date

2026-09-11

## Primary sources

Current Trino project documentation and official project material.

Key references used for V0.7.1:

```text
https://trino.io/
https://trino.io/docs/current/
https://trino.io/episodes/48.html
https://trino.io/episodes/29.html
https://trino.io/episodes/6.html
https://trino.io/trino-the-definitive-guide
```

## Confirmed architectural baseline

### Trino is a distributed SQL query engine

It queries external data sources through connectors and does not require data to be stored in a Trino-owned storage engine.

### Coordinator / Worker

Coordinator owns global query management, including analysis, planning, optimization and scheduling.

Workers execute distributed tasks and process source or intermediate data.

### Connector / SPI

Connector is the translation layer between Trino Core and the external data source.

The SPI exposes capabilities such as metadata, statistics, data location / splits and data access.

### Planning

The learning model is:

```text
SQL
→ Parser
→ Analyzer
→ Logical Plan
→ Optimizer
→ Distributed Plan
```

### Runtime

The learning hierarchy is:

```text
Query
→ Stage
→ Task
→ Driver / Operator
```

Source stages additionally consume:

```text
Split
```

## Stability rule

Do not turn old Presto / early Trino implementation details into timeless guarantees.

When later chapters depend on version-sensitive behavior, validate again against Current Docs.
