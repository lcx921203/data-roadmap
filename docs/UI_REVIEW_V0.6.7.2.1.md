# V0.6.7.2.1 Scale Hierarchy Correction

## Why this correction exists

V0.6.7.2 over-interpreted the product principle of continuity.

Continuity does not mean that every list must become a visible numbered journey.

The user need is narrower:

```text
Do not make me lose my place.
Let me quickly return to what I need.
Keep the knowledge itself coherent.
```

## Restored

The following public pages return to the V0.6.7.1.2 presentation:

- Learn Home
- Learn Stage
- Interview Discovery

Their existing navigation was already sufficient.

Reading continuity is provided by:

- Continue Learning
- Stage order
- Previous / Next
- one-hand Reading Directory
- current directory section highlight

## Scale is different

Scale is expected to grow across many technologies and many scenarios.

A flat list is therefore not enough.

The public hierarchy is now:

```text
Domain
→ Training Theme
→ Scenario
```

Current Lakehouse navigation:

```text
湖仓 / Lakehouse

容量与回填
→ 100 亿行历史回填

持续写入与表健康
→ 10 秒级提交后的文件膨胀

并发提交与恢复
→ 100 个 Writer 并发提交
```

## Future growth rule

When only one Domain exists:

- no Domain filter;
- no Sticky Domain header.

When multiple Domains actually exist:

- Domain filter becomes available;
- Sticky Domain context may be enabled.

Do not add complexity merely because future content might need it.

## Source of truth

Scale list structure lives in:

```text
content/scale-navigation-v1.yaml
```

Scenario files continue to own scenario content.

The Scale page consumes both.

This prevents presentation code from hardcoding scenario titles or training categories.
