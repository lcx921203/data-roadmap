# Green Signal Palette V1.0.2.1

## Goal

Change the global accent / signal family from blue to green in both Light and Dark modes,
so the product feels calmer and more eye-friendly during long reading sessions.

## Scope

This patch changes only the shared signal palette used by:

- active navigation state;
- progress bars;
- current-section highlight;
- floating directory chip;
- continue-learning focus surfaces;
- small interactive emphasis states.

## What stays unchanged

- page structure;
- typography;
- spacing;
- one-hand directory interaction;
- light / dark mode logic;
- knowledge content;
- multi-color technical diagrams.

## Palette

### Light

```text
--color-signal:        #5ea37f
--color-signal-strong: #2f6f52
--color-signal-soft:   #edf6f0
```

### Dark

```text
--color-signal:        #78c49c
--color-signal-strong: #97d8b4
--color-signal-soft:   #16261e
```

## Design intent

Do not use a highly saturated “app green”.
The chosen palette is intentionally muted, closer to sage / evergreen,
so it remains readable in both themes without producing a fluorescent feel.
