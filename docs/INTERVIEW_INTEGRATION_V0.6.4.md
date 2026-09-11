# Interview Integration V0.6.4

## Goal

Connect completed Iceberg Learn / Scale assets to the existing real Interview Evidence system without inventing Iceberg-specific frequency.

## Product rule

```text
Knowledge / Scale relevance
!=
Iceberg interview frequency
```

A question can be related to Iceberg content because it tests lakehouse, scale, concurrency or architecture reasoning. That does not mean the evidence source asked an Iceberg-specific question.

## Current mapped questions

- `iq-lake-vs-warehouse-001`
  - real evidence-backed question
  - curated answer exists
- `iq-large-dataset-tech-selection-001`
  - real evidence-backed question
  - answer is still being curated
- `iq-system-concurrency-fault-tolerance-001`
  - real evidence-backed question
  - answer is still being curated

## V0.6.4 UI

Learn Detail and Scale Detail may show a `真实面试关联` section.

Each row shows:

- canonical question;
- current evidence count;
- current company count when available;
- answer status: `已有题解` or `答案整理中`.

The section must state:

> 内容相关，不代表 Iceberg 专项频率。

## Direction

V0.6.4 only implements:

```text
Learn  -> Interview
Scale  -> Interview
```

Reverse navigation is intentionally deferred to V0.6.5:

```text
Interview -> Learn / Scale
```

This keeps Interview Integration separate from full three-tab cross navigation.
