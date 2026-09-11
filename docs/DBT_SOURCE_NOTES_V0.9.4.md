# dbt Source Notes V0.9.4

Validation date: 2026-09-12

## Primary references

Node selector methods:
https://docs.getdbt.com/reference/node-selection/methods

Local state:
https://docs.getdbt.com/reference/node-selection/state-selection

Defer:
https://docs.getdbt.com/reference/node-selection/defer

Deploy dbt:
https://docs.getdbt.com/docs/deploy/deployments

dbt artifacts:
https://docs.getdbt.com/reference/artifacts/dbt-artifacts

## Classic state selection

Current docs define the `state` selector as comparison against a prior version of the same project represented by a manifest.

Current stable concepts include:

```text
state:new
state:modified
state:old
state:unmodified
```

`state:modified` includes more than model-file body changes and can include relevant config, relation, contract and macro effects.

State comparison remains complex and has documented caveats.

## Defer

Current docs describe defer as a way to build/test a subset in a sandbox while resolving unbuilt upstream parents against another environment's manifest.

High-level resolution rule:

```text
node not selected
+
node not present in current database target
→ state-manifest relation can be used
```

Ephemeral models are never deferred.

Deferral can result in tests or models reading a mix of development and production data.

Separate logical comparison state and defer/applied state can be supplied.

## Idempotence

Current local-state docs state that state selection and deferral rely on models being idempotent.

Artifacts provide point-in-time state; they do not turn dbt transformation operations into arbitrary stateful side effects.

## Managed dbt State

Current Developer Hub exposes managed `dbt State` as a Preview product capability.

This is not treated as identical to classic Core state selection.

The V1 learning baseline remains the Artifact-based mechanism.

## Deployment

Current dbt Platform documentation explicitly provides:

```text
job scheduler
deployment jobs
continuous integration
dbt State
orchestration / downstream exposure workflows
```

Therefore production material must distinguish dbt Core from dbt Platform instead of making blanket product-wide statements.

## Cost and orchestration boundary

The stable project architecture rule remains:

```text
dbt Core
→ transformation resource graph/build semantics

dbt Platform
→ may schedule/orchestrate dbt workloads

external orchestrator
→ may coordinate dbt together with ingestion, compute, serving and metadata systems
```

Our project taxonomy assigns that cross-system layer to Dagster.

## Guardrails

Revalidate before future edits for:

- dbt State preview/GA status;
- dbt v2 state/defer changes;
- selector methods introduced after v1.12;
- dbt Platform orchestration product behavior;
- event/log/telemetry differences between v1 and v2;
- exact threads/defaults/concurrency configs.
