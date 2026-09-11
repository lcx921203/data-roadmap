# V0.6.7.2 Three-Tab Page Polish

## Goal

The goal is not visual decoration.

The goal is to make the product preserve:

```text
Knowledge Progression
Causal Model
Reading Continuity
Fast Positioning
Structural Hierarchy
```

The user should not need short-term memory to know where they are.

## Learn

Before:

```text
Stage
→ flat article list
```

After:

```text
Stage
→ ordered knowledge spine
→ numbered nodes
→ current node
→ causal progression
```

Learn Home also exposes the current Stage explicitly.

## Interview

The existing discovery model remains because it already supports fast positioning.

The improvement is:

```text
sticky discovery context
```

As the user scrolls through a long question list, the current search / technology context and result count remain visible.

No frequency logic changes.

## Scale

Before:

```text
Scale
→ flat scenarios
→ repeated domain label on every row
```

After:

```text
Scale
→ Domain Group
→ Scenario
```

Current domain architecture:

```text
Lakehouse
Streaming
Batch / Spark
Semantic / Serving
Governance
Agent
```

Only domains with published scenarios render.

When multiple domains exist, a Domain Filter automatically appears.

Each Domain Header is sticky under the global TopBar.

This is the primary defense against “scrolling for a long time and forgetting what section I am in.”

## Scenario rows

Domain is no longer repeated inside each row.

A row focuses on:

```text
Scenario Title
Summary
Training Dimensions
```

This makes the list more scannable and reduces redundant text.

## Design principle

A long page should always answer:

```text
Where am I?
Why am I here?
What belongs to this group?
Where can I go next?
```

If the UI makes the user remember those answers manually, the UI needs another structural layer.
