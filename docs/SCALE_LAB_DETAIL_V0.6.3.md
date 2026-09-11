# Scale Lab Detail V0.6.3

## Goal

Turn the three existing Iceberg Scale seeds into real learning assets.

Public route:

```text
#/scale
#/scale/sc-iceberg-10b-backfill-001
#/scale/sc-iceberg-streaming-small-files-001
#/scale/sc-iceberg-concurrent-commit-001
```

## Detail Contract

Every published Scale Scenario uses the same learning sequence:

```text
Scenario
→ Scale Parameters
→ Constraints
→ Failure / Bottleneck
→ Design
→ Trade-offs
→ Observability
→ Cost
→ Recovery
```

Scale must not become a second Learn chapter.

Learn explains reusable Iceberg mechanisms.
Scale applies those mechanisms under explicit production pressure.

## V1 Scenarios

### 100 亿行历史回填

Focus:

- Backfill range decomposition
- resource isolation
- write distribution / file layout
- commit granularity
- staged maintenance
- Trino SLO protection
- resumable recovery

### 10 秒级提交后的文件膨胀

Focus:

- freshness vs table health
- micro-batch sizing
- small files
- snapshot / manifest growth
- compaction backlog
- metadata planning cost

### 100 个 Writer 并发提交

Focus:

- optimistic concurrency
- effective commit concurrency
- conflict classification
- retry storm
- catalog pressure
- unknown commit state
- recovery and idempotency

## Truth Boundary

All three scenarios remain:

```yaml
hypothetical: true
```

They are production training scenarios, not project experience.

## UI Scope

V0.6.3 intentionally does not redesign the product.

It only adds:

- clickable Scale list rows;
- detail route;
- reusable detail renderer;
- quiet text-first detail layout.

No diagram is added because these scenarios can currently be explained more completely with structured text.

## Next

V0.6.4 connects the completed Scale assets to evidence-backed Interview content.
