# Spark Multi-Domain Mobile Audit V0.8.6

## Audit type

Static implementation audit against the already accepted mobile contract.

This is **not** a claim that V0.8.6 performed a new physical-device screenshot run.
The audit checks the current implementation after Spark activates the first real second Scale domain.

Audited main commit:

```text
01b3dd5710d4b82c1ad2810653d35625cb7ee1b3
```

## New condition under audit

Before Spark Scale integration, Scale had one public domain:

```text
Lakehouse
```

V0.8.5 adds:

```text
Compute Engines
```

so the previously dormant multi-domain path is now active for the first time.

## Domain grouping

PASS

`ScalePage` builds groups from:

```text
Domain
→ Training Theme
→ Scenario
```

With the current navigation file this resolves to:

```text
Lakehouse
→ 6 themes / 6 scenarios

Compute Engines
→ 3 themes / 3 scenarios
```

No unmapped Spark scenario is expected to fall into `Other / Uncategorized`.

## Domain filter activation

PASS

The UI renders the domain filter only when:

```ts
groups.length > 1
```

With two real domains the filter now appears as intended.

The control reuses the existing `.filter-control` contract:

```css
min-height: 44px;
```

which matches the frozen mobile touch-target token.

## 390px layout contract

PASS AT STATIC IMPLEMENTATION LEVEL

The mobile token remains:

```css
--page-padding-mobile: 20px;
```

At a 390px viewport the normal content width is therefore approximately:

```text
390 - 20 - 20 = 350px
```

The domain-filter row uses flex layout, while its text side has:

```css
min-width: 0;
```

so long metadata can shrink / wrap without forcing horizontal page overflow.

The filter itself is content-sized rather than fixed-width.

## Sticky domain context

PASS

Only multi-domain Scale pages receive sticky domain headers.

The original V1.8 rule referenced a nonexistent token:

```text
--page-padding
```

The frozen V1.9 final cascade corrects it to:

```text
--page-padding-mobile
```

and V1.9 is imported after the V1.8 Scale stylesheet.

Therefore the first real multi-domain activation does not reopen the old page-padding bug.

## Domain picker Bottom Sheet

PASS

The existing Bottom Sheet provides:

- modal dialog semantics;
- focus trapping;
- Escape close;
- backdrop close;
- body scroll lock;
- focus restoration.

The choice rows use:

```css
min-height: 52px;
```

and the sheet retains:

```css
padding-bottom: calc(24px + env(safe-area-inset-bottom));
```

so the new domain picker does not bypass the mobile touch / safe-area contract.

## Scale list readability

PASS

The second domain adds vertical content only.
Each theme remains a normal document-flow section and each scenario remains a row rather than a card grid.

Long English secondary labels and scenario summaries are allowed to wrap / clamp vertically instead of creating horizontal carousels.

## Scale detail reading

PASS

Spark reuses the same shared `ScaleDetailPage` already audited during the Trino freeze.
No Spark-specific fixed-width layout or new card grid is introduced.

## Learn reading / one-hand directory

PASS

Spark Knowledge uses the shared reading components and the already accepted one-hand navigation contract:

```text
left-edge floating 目录 control
→ right-side drawer
```

V0.8.5 and V0.8.6 introduce no reading-navigation CSS.

## Bottom navigation

PASS

The final V1.9 cascade still explicitly freezes:

```css
.bottom-nav {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
```

Spark does not introduce a fourth public tab.

## Result

No Spark-specific or multi-domain CSS patch is justified.

The correct action is to keep Design Contract V1.9 frozen and reopen UI only for a verified usability / interaction bug.
