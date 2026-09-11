# V0.6.7.3 UI Conformance & Freeze

## Result

Iceberg V1 UI is ready to freeze.

This milestone does not redesign the product.

It verifies that the current UI follows the frozen product contract.

## 1. 390px Mobile Review

Status: PASS

The product remains mobile-first.

Key reading surfaces use:

- 20px page padding;
- 16px body text;
- quiet rows / dividers;
- no card wall;
- no heavy shadow.

## 2. iOS Safe Area

Status: PASS

`index.html` uses:

```html
viewport-fit=cover
```

TopBar, Bottom Navigation and Reading Drawer already use iOS Safe Area environment variables.

## 3. One-thumb Reach

Status: PASS

Reading Directory control:

- left edge;
- vertically draggable;
- persistent position;
- 44px+ touch target.

Drawer can close without reaching the top-right corner:

- tap backdrop;
- swipe right;
- tap floating control again.

## 4. Directory

Status: PASS

- current section uses soft blue + text state;
- H2 / H3 hierarchy uses weight / indentation / spacing;
- no row dividers;
- no footer close CTA;
- no dirty left seam.

## 5. Bottom Navigation

Status: PASS WITH CLEANUP

Public tabs are:

```text
Learn
Interview
Scale
```

A final CSS layer explicitly freezes the mobile grid to three columns.

Desktop label is also normalized from `Scale Lab` to `Scale`.

## 6. Scale Future Multi-domain Rule

Status: FIXED

The multi-domain Sticky Header CSS previously referenced:

```text
--page-padding
```

which is not a defined token.

It now uses:

```text
--page-padding-mobile
```

This bug was latent because the current product has only one published Scale domain.

## 7. Learn / Interview Scope

Status: PASS

V0.6.7.2.1 correctly restored the simpler presentation.

Continuity is not encoded as an artificial visual journey.

Learn uses:

- Continue Learning;
- Stage order;
- Previous / Next;
- Reading Directory.

Interview uses:

- Search;
- Technology;
- Filter.

## 8. Projects Frontstage

Status: PASS

Legacy `ProjectsPage.tsx` remains in source for now because the validation pipeline still knows about it.

But it is isolated:

- not in RouteKey;
- not imported by App;
- not in mobile navigation;
- not in desktop navigation.

Therefore it is not public product UI.

Deletion can happen later as repository cleanup, without reopening the UI design.

## 9. Design Contract

Status: FIXED

DESIGN.md previously contained stale historical wording such as:

- right-edge directory;
- footer close button;
- obsolete sticky / knowledge-spine experiments.

V1.9 removes those contradictions and becomes the single current design truth.

## Freeze Decision

```text
Iceberg Learn UI      FROZEN
Iceberg Interview UI  FROZEN
Iceberg Scale UI      FROZEN
Reading Navigation    FROZEN
Three-Tab Navigation  FROZEN
Design Contract V1.9  FROZEN
```

Next product work should select the next technology vertical and reuse this contract rather than redesign Iceberg again.
