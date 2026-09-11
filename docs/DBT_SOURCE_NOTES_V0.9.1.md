# dbt Source Notes V0.9.1

Validation date: 2026-09-11

## Version baseline

Stable v1 production baseline:

```text
dbt-core v1.12.2
```

Next-generation context:

```text
dbt Core v2.0 beta
```

The dbt-core main branch currently hosts the Rust-based v2 beta.
The v1 Python implementation continues on the v1 maintenance line.

## Primary references

Developer Hub:
https://docs.getdbt.com/

dbt Core repository:
https://github.com/dbt-labs/dbt-core

Project configuration:
https://docs.getdbt.com/reference/dbt_project.yml

Profiles / connection:
https://docs.getdbt.com/docs/core/connect-data-platform/profiles.yml

Commands:
https://docs.getdbt.com/reference/dbt-commands

ref():
https://docs.getdbt.com/reference/dbt-jinja-functions/ref

source():
https://docs.getdbt.com/reference/dbt-jinja-functions/source

Jinja and macros:
https://docs.getdbt.com/docs/build/jinja-macros

Packages:
https://docs.getdbt.com/docs/build/packages

adapter.dispatch:
https://docs.getdbt.com/reference/dbt-jinja-functions/dispatch

## Verified current conceptual model

### Project

A dbt project is anchored by `dbt_project.yml` and groups project resources / configurations.

### Target / profile

Classic dbt Core v1 commonly resolves data-platform connection information from a profile / target configuration.

Exact installation and credential mechanics remain environment-specific and may differ across dbt Platform and future v2 distribution models.

### Adapter

Adapter behavior maps dbt framework operations to the target data platform.

The adapter boundary must not be confused with the target engine's SQL optimizer.

### Parse / compile / execute

The stable learning invariant is:

```text
project source
→ parse resources
→ compile dbt/Jinja references
→ executable SQL
→ target execution
```

Specific parser implementation is version-sensitive because v2 is a Rust rewrite.

### ref()

Current dbt semantics treat `ref()` as both:

```text
relation resolution
+
dependency declaration
```

It is central to graph ordering and environment-aware relation resolution.

### source()

`source()` resolves a declared source relation and integrates that source into project metadata / lineage.

### Jinja / macros

Jinja is evaluated before the resulting SQL is executed by the database.

A dbt macro is therefore best taught as compile-time SQL code generation, not as a row-by-row database function.

### Packages

Packages allow reusable dbt project resources / macros to be shared as dependencies.

Package versioning and maintenance remain normal dependency-governance concerns.

### Adapter dispatch

Dispatch supports selecting macro implementations by namespace / adapter context.

This provides a framework for cross-database behavior without implying every data platform supports identical capabilities.

## v2 guardrail

Current dbt Core v2.0 remains beta.

The v2 rewrite changes implementation areas including parser/runtime internals, distribution and artifact architecture.

V0.9.1 therefore publishes stable framework responsibilities, not v1 Python-internal class paths or v2 beta internals.
