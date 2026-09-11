# V0.6.7.1 Reading & Navigation Foundation

## Scope

This milestone changes the reading/navigation foundation only.

It does not redesign every Learn / Interview / Scale screen yet.

## Changes

### 1. Reading Directory

Knowledge Detail and Scale Detail no longer use the horizontal Quick Navigation rail.

They use:

```text
TopBar Directory Action
→ Bottom Sheet
→ Reading Progress
→ Current Section
→ H2 / H3 Tree
```

The interaction is inspired by long-form article TOC patterns, but keeps DataRoadmap's calm editorial visual language.

### 2. Learn continuation priority

Knowledge Detail now orders the end of the article as:

```text
Previous / Next
→ Related Scale
→ Related Interview
```

The user's main learning sequence is not interrupted by cross-tab recommendations.

### 3. Metadata grammar

Knowledge descriptive badges become:

```text
Iceberg · L5 · 深度掌握
```

Scale training tags also use the same plain metadata line.

### 4. Bottom navigation separation

Bottom Navigation uses:

- solid Raised Surface;
- stronger top hairline;
- no blur dependency;
- no heavy shadow;
- extra content breathing space;
- quiet active indicator.

### 5. Design System V1.7

The design contract is synchronized with the actual three-tab product.

Projects are removed from public UI rules.

Horizontal Quick Navigation is deprecated for long reading pages.

## Next

V0.6.7.2 reviews each top-level experience separately:

```text
Learn
Interview
Scale
```

Focus:

- landing/list hierarchy;
- spacing;
- title hierarchy;
- discovery controls;
- scenario/question rows;
- visual consistency.
