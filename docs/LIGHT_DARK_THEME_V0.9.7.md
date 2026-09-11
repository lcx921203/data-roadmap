# Light / Dark Theme V0.9.7

Audited baseline main before the patch:

```text
709292d6cdd1d9fb83966b99cf3389f3ad9e5246
```

## Goal

Add night reading without redesigning DataRoadmap.

The theme system keeps:

```text
same components
same spacing
same information hierarchy
same Learn / Interview / Scale navigation
```

and changes only semantic color presentation.

## Behavior

### First visit

When the user has never chosen a theme:

```text
prefers-color-scheme: light
→ Light

prefers-color-scheme: dark
→ Dark
```

The app continues following system changes while there is no manual override.

### Manual toggle

The shared TopBar now contains a 44px Sun / Moon action.

```text
Light
→ Moon icon
→ switch to Dark

Dark
→ Sun icon
→ switch to Light
```

The manual choice is persisted in:

```text
localStorage
dataroadmap-theme
```

After the user makes an explicit choice, that choice wins over the system preference.

## Startup flash prevention

Theme resolution runs in the document `<head>` before React mounts.

This sets:

```text
html[data-theme]
color-scheme
theme-color
```

before the application UI is painted, so opening the site at night does not intentionally render a bright Light frame first and then flip to Dark.

## Palette

Light remains the frozen V1.9 palette.

Dark uses warm neutral surfaces rather than pure black:

```text
Canvas        #11110F
Surface       #171714
Raised        #1D1D19
Strong        #282822

Ink           #F2F2ED
Ink Soft      #C1C1B8
Ink Muted     #94948B

Signal        #9EB2FF
Signal Soft   #1B2440
```

The goal is long-form reading comfort, not a high-contrast neon developer theme.

## Semantic colors

Success / warning / danger receive dark-theme counterparts rather than reusing their very light backgrounds.

## Diagrams

The existing technical diagram families receive dark equivalents:

```text
Blue
Green
Amber
Violet
Rose
Cyan
```

This prevents pastel Light-mode diagram nodes from becoming bright islands inside a dark article.

## Legacy literal-color corrections

Most of the product already uses semantic CSS variables.

The patch explicitly corrects the important legacy literals that would break dark contrast:

```text
selected technology chips
primary action foreground
Quick Answer text / border
small signal-count badge
light-mode surface shadows
```

Code blocks already own a dark semantic surface and remain visually distinct from the surrounding dark page.

## Mobile

The patch does not change:

- 390px content width rules;
- Safe Area handling;
- Bottom Nav;
- Reading Directory;
- Scale Domain navigation;
- Bottom Sheet interaction.

The toggle reuses the existing `.icon-button` 44px touch-target contract.

## Accessibility

The theme action exposes:

```text
aria-label
aria-pressed
title
```

and uses icons with `currentColor`.

Native browser controls receive the appropriate:

```text
color-scheme
```

value.

## Design rule

Theme support is a presentation layer.

It does not reopen frozen product information architecture or vertical-slice content.

Future components should use semantic tokens instead of literal Light-theme colors so both themes work automatically.
