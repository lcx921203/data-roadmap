# Iceberg Write Model V0.6.1.2

## Goal

把后半段从零散的 Production Topic 收成一条连续因果链：

```text
Write Layout
→ Data Files / Manifest
→ Commit
→ Metadata Growth
→ Maintenance
→ Troubleshooting
```

## Ownership

- 08: Distribution / Ordering / File Size / Writer Layout
- 09: Atomic Commit / Conflict / Retry / Recovery
- 10: Data File / Manifest / Snapshot / Orphan lifecycle
- 11: only synthesis and troubleshooting, no re-teaching

## Content cleanup

- 30 秒理解继续收短；
- 普通流程与指标列表不再使用 `text` CodeBlock；
- 08 只保留真正 SQL 示例；
- Maintenance 保留 manifest 8 MB / 100 / rewriteManifests 的精确定义；
- Troubleshooting 不再重复解释前面每个机制，而是按六层快速定位。

## Next

V0.6.1.3:
- all 11 chapters duplicate audit;
- section transition audit;
- code-block semantic audit;
- iPhone reading pass;
- Iceberg L5 V1 freeze decision.
