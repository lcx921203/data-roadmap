# MetricFlow Semantic Domain Mobile & Theme Audit V1.0.6

## Audit type

Static implementation audit against the accepted mobile / reading design contract.

The recent green Light / Dark palette was also visually accepted during physical-device use before this freeze.

Audited deployed main commit:

```text
3f57a7ba1ff355501c1835c9c312162c48165d82
```

## New Scale condition

MetricFlow adds the fourth Scale domain:

```text
Semantic Layer
```

Current domains:

```text
Lakehouse
Compute Engines
Modeling Engineering
Semantic Layer
```

This does not create a new UI mode.

## Domain grouping

PASS

`ScalePage` continues to derive:

```text
Domain
→ Training Theme
→ Scenario
```

from `content/scale-navigation-v1.yaml`.

The Semantic Layer domain adds three vertical themes / scenarios and does not create horizontal-width pressure.

## Domain filter

PASS

The page still activates its domain filter only when:

```text
groups.length > 1
```

With four domains, the same Bottom Sheet path is reused.

No horizontal tab row or chip carousel is introduced.

## 390px layout

PASS AT STATIC IMPLEMENTATION LEVEL

The frozen mobile design continues to use the existing shared page padding and normal vertical lists.

The fourth domain adds one more Bottom Sheet choice and one more vertically stacked domain group; it does not change card width or reading width.

## Bottom navigation

PASS

The frozen V1.9 contract remains:

```css
.bottom-nav {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
```

Adding a Scale domain does not add a public tab.

Public navigation remains:

```text
Learn
Interview
Scale
```

## Reading directory / one-hand interaction

PASS

MetricFlow Learn reuses the accepted shared reading system:

```text
floating directory control on the left
vertical drag only
right-side drawer
44px directory items
Safe Area handling
```

V1.0.5 / V1.0.6 introduce no reading-navigation CSS.

## Light / Dark

PASS

The application still uses the shared ThemeProvider and pre-hydration theme resolution established in V0.9.7.

The final visual signal system is now green in both modes.

### Light

```text
warm off-white / white
neutral dark ink
muted forest-green signal
very pale green emphasis surface
```

### Dark

```text
graphite canvas
soft neutral ink
sage / evergreen signal
restrained green tint on emphasis surfaces
```

The previously accepted Dark Surface Restraint remains in the cascade before the green signal overrides.

## Green signal palette

PASS

The shared signal tokens are:

```text
Light
--color-signal        #5ea37f
--color-signal-strong #2f6f52
--color-signal-soft   #edf6f0

Dark
--color-signal        #78c49c
--color-signal-strong #97d8b4
--color-signal-soft   #16261e
```

V1.0.2.2 also removed the visible legacy blue Quick Answer literals.

## Reduced Motion

PASS

The Continue Learning flow effect retains its `prefers-reduced-motion` shutdown behavior.

MetricFlow adds no new animation.

## Result

No V1.0.6 UI patch is justified.

Reopen the shared UI only for a verified physical-device / interaction bug, not merely because MetricFlow is a new topic.
