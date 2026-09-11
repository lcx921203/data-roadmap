# Green Color Cleanup V1.0.2.2

Baseline main before this patch:

```text
3493467d3a02bd8a74d536db1a30ae1a5c2631ba
```

## Result of the residual-color scan

The deployed green signal palette is already active for:

```text
Bottom Nav active state
Progress
Directory current item
Continue Learning
Signal text / interaction state
```

The visible legacy blue in Light Mode came from two old literals in `app.css`:

```text
Quick Answer border
legacy pale blue

Quick Answer paragraph text
legacy blue-gray
```

They bypassed the semantic signal tokens, which is why they stayed blue after the global palette changed to green.

## V1.0.2.2 correction

Quick Answer border now derives from:

```text
--color-signal
+
--color-hairline
```

Quick Answer body copy now uses:

```text
--color-ink-soft
```

so green remains an accent / state color instead of tinting normal article copy.

Dark Mode keeps the already accepted restrained graphite surface and uses only a subtle green border mix.

## Frozen palette after this patch

### Light

```text
warm off-white / white
deep neutral ink
muted forest green signal
very pale green emphasis surface
```

### Dark

```text
graphite canvas
soft neutral ink
sage / evergreen signal
graphite surfaces with restrained green tint
```

## Not changed

```text
green hue
layout
typography
motion
reading directory
Light / Dark behavior
MetricFlow content
technical multi-color diagram semantics
```

After visual verification, the UI palette can be treated as frozen again.
