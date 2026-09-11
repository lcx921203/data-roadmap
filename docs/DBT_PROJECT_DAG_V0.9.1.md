# dbt Project & DAG V0.9.1

## Scope

Published:

```text
01 dbt Overview & Transformation Mental Model
02 Project / Target / Adapter / Command Lifecycle
03 Sources / Models / ref() / source() / Dependency Graph
04 Jinja / Macros / Packages / Adapter Abstraction
```

No UI changes.

No Scale Scenario.

No new Interview Question.

## Progression

```text
Transformation Framework
→ Project / Environment / Platform Adapter
→ Resources
→ ref() / source()
→ Dependency Graph
→ Jinja / Macros
→ Compiled SQL
→ Target Data Platform
```

At the end of node 04, the learner can explain how dbt turns project code into executable SQL without yet depending on materialization or incremental-state concepts.

## Important correctness boundaries

### dbt DAG is not the SQL physical plan

```text
dbt DAG
= resource dependencies and build order

database physical plan
= scan / join / shuffle / execution strategy
```

The target engine owns the latter.

### Project / Target / Adapter

```text
Project
→ what resources and project-level rules exist

Target
→ where this invocation is intended to execute

Adapter
→ how dbt maps framework operations to a specific data platform
```

### parse / compile / run / build

Learning model:

```text
parse
→ resource graph

compile
→ render dbt / Jinja code into executable SQL

run
→ execute selected models

build
→ build selected DAG resources in dependency-aware workflow
```

The article deliberately does not turn command differences into a CLI encyclopedia.

### ref() / source()

`ref()` and `source()` are taught as:

```text
relation resolution
+
dependency declaration
```

Using a hard-coded relation can bypass graph/environment semantics.

### Jinja / Macro

```text
Jinja / macro
→ compile time
→ generated SQL

database SQL operators / UDF
→ query runtime
```

These are not the same execution layer.

### Adapter dispatch

Adapter abstraction reduces platform-specific duplication but does not make every warehouse capability identical.

## Next

V0.9.2 starts the stateful modeling portion:

```text
05 Materializations
06 Incremental Models
07 Snapshots
```
