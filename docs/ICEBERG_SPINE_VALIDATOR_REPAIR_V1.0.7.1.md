# Iceberg V1.0.7.1 Spine Validator Repair

## Root cause

The V1.0.7 content package applied successfully, but Pages deployment failed during:

```text
npm run validate:content
```

The repository validator freezes:

```text
content/knowledge/iceberg-spine-v0.6.0.yaml
version: 0.6.1
```

V1.0.7 incorrectly changed the version field to `0.6.2`.

The 11-node order and IDs were not the problem.

## Repair

This package:

- restores `version: 0.6.1`;
- keeps the 11-node spine unchanged;
- keeps the Phase 1 learning-refactor state;
- keeps all six already-applied refactored articles untouched;
- changes no UI and no article body.

Baseline after the successful package apply:

```text
6e5aa308618cef28b594793f6f555d7b1dbb89e6
```
