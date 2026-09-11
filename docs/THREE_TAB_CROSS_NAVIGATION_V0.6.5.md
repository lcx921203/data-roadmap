# Three-Tab Cross Navigation V0.6.5

## Goal

Complete the first public vertical slice as one connected graph:

```text
Learn
 ↕
Interview
 ↕
Scale
 ↕
Learn
```

This is navigation across independent content assets, not content duplication.

## Relationship ownership

### Knowledge ↔ Scale

Scale Scenario owns its explicit `knowledge` IDs.

The UI derives reverse `Knowledge → Scale` links from Scenario metadata and also respects existing Knowledge `scale_scenarios` metadata during migration.

### Interview ↔ Scale

Scale Scenario owns its explicit `interviews` IDs.

The UI derives reverse `Interview → Scale` links.

### Interview ↔ Knowledge

Iceberg primary mappings are curated in:

```text
content/mappings/iceberg-v0.6.0.yaml
```

Current primary anchors:

```text
Lakehouse / Warehouse
→ Iceberg 总览

大规模数据技术选型
→ Iceberg 生产排障与容量思维

高并发 / 容错
→ 乐观提交、冲突与恢复
```

The mapping is intentionally narrow. A question should not link to every remotely related chapter.

## Frontstage behavior

### Learn Detail

After the main article:

```text
相关生产场景
真实面试关联
```

### Scale Detail

After the scenario:

```text
相关学习
真实面试关联
```

### Interview Detail

Whether the curated answer is ready or still pending:

```text
相关学习
相关生产场景
```

This means a user can continue learning even when an evidence-backed interview question does not yet have a finished curated answer.

## Evidence boundary

Cross-navigation never changes interview frequency.

A relationship means:

```text
these two assets are useful together
```

It does not mean:

```text
this technology is frequently asked
```

Frequency continues to come only from Interview Evidence.

## Project cleanup

Legacy answer sections titled `项目怎么结合` are no longer rendered in the public Interview detail.

The source text remains in Git history / backstage content, but author-specific project context is not part of the public three-tab product.

## Definition of Done

Iceberg V1 public loop is complete when:

- Learn can reach relevant Scale and Interview assets;
- Scale can return to relevant Learn and Interview assets;
- Interview can reach relevant Learn and Scale assets;
- no relationship fabricates evidence or frequency;
- no public navigation requires author-specific project context.

After this milestone, the next phase is an Iceberg vertical-slice audit before copying the pattern to the next technology.
