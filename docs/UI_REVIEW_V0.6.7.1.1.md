# V0.6.7.1.1 One-Hand Reading Interaction

## Why

The first Reading Directory solved discoverability but still assumed top-right reach.

On large mobile screens, especially one-handed use, a fixed top-right action and top-right close button are high-friction.

The second problem is cross-tab navigation. Large related-content blocks at the bottom are structurally correct but arrive too late in the reading flow.

## 1. Directory Interaction

New pattern:

```text
Right-edge floating control
        ↓
Right-side Reading Drawer
        ↓
Progress + Current Section + H2/H3 tree
```

The control:

- is vertically draggable;
- stays docked to the right edge;
- remembers its vertical position in localStorage;
- toggles the drawer.

The drawer closes by:

- tapping the exposed left scrim;
- swiping right;
- tapping the floating control again;
- tapping the bottom close action;
- pressing Escape on keyboard.

Directory item dividers are removed.

Hierarchy now comes from:

```text
H2 weight
H3 indentation
spacing
active soft-blue background
```

## 2. Contextual Relations

Cross-tab relations move from large end-of-article sections into the context where they are useful.

Examples:

```text
高并发为什么会出现 Retry Storm
  Scale · 100 个 Writer 并发提交
  Interview · 高并发 / 容错相关题
```

```text
为什么小 Data File 会一路放大成本
  Scale · 10 秒级提交后的文件膨胀
```

Relationship source of truth:

```text
content/mappings/iceberg-section-relations-v0.6.7.1.yaml
```

A relation means:

```text
useful together in this context
```

It does not mean:

```text
high interview frequency
real project experience
```

## 3. Interview

Interview detail moves related Learn / Scale links near the question header.

The large related blocks at the very bottom are removed.

## 4. Scope

This milestone intentionally does not redesign:

- Learn home;
- Interview discovery;
- Scale list;
- typography tokens;
- color system.

Those remain for V0.6.7.2 Three-Tab Page Polish.
