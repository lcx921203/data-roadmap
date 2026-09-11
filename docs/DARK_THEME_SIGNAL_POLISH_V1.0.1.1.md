# Dark Theme Signal Palette Polish V1.0.1.1

## Problem

The current dark-mode blue is readable, but visually too close to a bright
system-blue. On large black reading surfaces, it feels slightly sharp and
floating.

## Goal

Keep blue as the product's active / guided signal color, but shift it toward a
more muted and editorial indigo-slate blue.

## Scope

Changed only in dark mode:

- `--color-signal`
- `--color-signal-strong`
- `--color-signal-soft`
- selected small badge fill
- continue-learning card surface tuning

Not changed:

- light mode
- layout
- motion model
- interaction model
- content structure

## Token shift

Before:

```text
--color-signal:        #9eb2ff
--color-signal-strong: #b9c7ff
--color-signal-soft:   #1b2440
badge background:      #315ddc
```

After:

```text
--color-signal:        #8fa1e8
--color-signal-strong: #aeb9ef
--color-signal-soft:   #18203a
badge background:      #4a63b8
```

## Visual intent

Dark mode should feel:

```text
clean
quiet
high-end
reading-friendly
```

rather than glowing or overly technical.

## Guardrails

Still preserved:

- sufficient contrast
- obvious selected state
- same semantic color system
- same flow highlight logic
- no extra glow / no extra shadows
