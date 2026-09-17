---
name: theme-polarity-harmonizer
description: Transform data visualizations with a seamless Light/Dark polarity system that dynamically rebalances chromatic contrast, optical weight, emissive glow vs. ink-reflectance shaders, and WCAG AAA accessibility.
---

# Theme Polarity Harmonizer

## 1. Context (What is this skill for?)

Switching a data visualization between **Dark Mode** and **Light Mode** is not a simple matter of inverting `#000` and `#FFF`. When naive background inversion occurs:
- **Emissive dots disappear or glare**: Bright neon dots designed to glow on black become washed out, unreadable, or cause optical vibration on white.
- **Physical metaphors break**: Deep space grids or vinyl grooves look like muddy gray smudges on light backgrounds.
- **Visual hierarchy collapses**: Low-contrast neutrals that look subtle in dark mode become invisible or muddy in light mode.

The **Theme Polarity Harmonizer** skill establishes a **dual-state optical system** for data visualizations:
1. **Dark Polarity (Emissive Space)**: Deep obsidian/void canvas, emissive luminous glows, low-saturation contextual field with high-chroma narrative sparks.
2. **Light Polarity (Reflective Archival Ink)**: Warm museum alabaster/parchment canvas, rich ink-density marks with optical boundary containment, soft diffuse elevation shadows, and crisp letterpress typography.

---

## 2. Input (What does the skill expect to receive?)

1. **Target Visualization Engine**:
   - Canvas/SVG marks (dots, lines, concentric rings, text, axes).
   - DOM UI elements (navigation bars, filters, modal cards, tooltips).
2. **Data-to-Color Encodings**:
   - Categorical dimensions (genres, categories) and continuous metrics (ratings, dates).
3. **Physical Metaphor / Canvas Archetype**:
   - e.g. Vinyl record, chronological soundwave, galaxy scatter, geographic map.

---

## 3. Choices & Clarifications (How does it collaborate with the user?)

The skill provides **2 foundational design states**:

### Dark Polarity (Emissive / Cinematic)
- **Canvas:** Deep Obsidian (`#0A0A0A`)
- **Panels & Overlays:** Frosted Smoked Glass (`rgba(14, 14, 14, 0.92)`)
- **Marks:** Luminous emissive particles with subtle drop-shadow halos.
- **Typography:** High-luminance crisp white (`#F0F0F0`) and muted slate (`#AAAAAA`).

### Light Polarity (Reflective / Archival Editorial)
- **Canvas:** Warm Museum Alabaster (`#F7F5F0`)
- **Panels & Overlays:** Frosted White Silk (`rgba(255, 255, 255, 0.90)`)
- **Marks:** Rich ink pigments adjusted in OKLCH for equal perceived contrast against light paper.
- **Typography:** Deep Carbon Black (`#141414`) and rich charcoal (`#555555`).

---

## 4. Output Format (What should the result be?)

### 4a. CSS Polarity Tokens
```css
:root {
  --bg: #0A0A0A;
  --panel: rgba(14, 14, 14, 0.90);
  --border: #222222;
  --hi: #F0F0F0;
  --mid: #AAAAAA;
  --lo: #666666;
  --accent: #D4A853;
  --card-bg: rgba(14, 14, 14, 0.94);
  --shadow-elevation: 0 16px 40px rgba(0, 0, 0, 0.7);
}

[data-theme="light"] {
  --bg: #F7F5F0;
  --panel: rgba(255, 255, 255, 0.92);
  --border: #E0DDD5;
  --hi: #141414;
  --mid: #555555;
  --lo: #888888;
  --accent: #B38628;
  --card-bg: rgba(255, 255, 255, 0.95);
  --shadow-elevation: 0 16px 40px rgba(0, 0, 0, 0.12);
}
```

### 4b. Dynamic SVG Gradient & Mark Recalibration
When toggled, the harmonizer:
- Morph SVG radial gradients (e.g. vinyl grooves from dark graphite to tactile warm paper disc).
- Adjusts mark colors smoothly via D3 transitions.
- Toggles icon state (`☀️ LIGHT` $\leftrightarrow$ `🌙 DARK`).
- Persists user preference in `localStorage`.

---

## 5. Rules & Boundaries (Must Always / Must Never)

### MUST ALWAYS:
- **Calibrate mark lightness independently per theme**: Yellows and pastels that work on dark backgrounds must be deepened into rich ochres and sages on light backgrounds to preserve WCAG contrast.
- **Switch physical textures appropriately**: Dark modes use glowing radial gradients and halo rings; light modes use subtle diffuse drop-shadows and crisp vector strokes.
- **Persist state across sessions**: Store the theme mode in `localStorage` and initialize cleanly on first render.
- **Provide smooth transitions**: Avoid sudden, blinding flashes of white; transition background and mark colors smoothly ($300\text{ms}–450\text{ms}$).

### MUST NEVER:
- **Never simply invert RGB values**: A simple `invert(100%)` turns warm golds into muddy blues and degrades visual harmony.
- **Never leave light mode typography washed out**: Main text must have at least 7:1 contrast ratio against the light canvas.
