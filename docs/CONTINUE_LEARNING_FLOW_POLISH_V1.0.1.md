# Continue Learning Flow Polish V1.0.1

## Goal

Increase the visibility of the existing Continue Learning border flow, especially in Dark Mode, without changing the visual language.

## Baseline

Previous effect:

```text
1px masked border
single Signal-family conic highlight
8s rotation
peak around 58%
opacity .72
```

## V1.0.1

Light:

```text
longer tail
peak 76%
opacity .84
7.2s rotation
```

Dark:

```text
longer visible arc
peak 96%
opacity .98
6.6s rotation
```

The Dark value is intentionally more visible because the surrounding surface has lower luminance.

## Invariants

Still unchanged:

```text
1px border only
no outer glow
no box shadow
no multiple colors
no layout movement
same card
same click target
```

## Reduced Motion

The new stylesheet reasserts:

```text
animation: none
opacity: 0
```

inside `prefers-reduced-motion: reduce`.

This is necessary because the enhancement stylesheet is loaded after the theme layer.

## Fallback

The original mask-support fallback remains in the existing motion stylesheet.

The additive V1.0.1 stylesheet does not override `display`, so unsupported-mask environments continue using the static Continue Learning hairline.
