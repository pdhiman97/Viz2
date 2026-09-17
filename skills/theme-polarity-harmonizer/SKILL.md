---
name: theme-polarity-harmonizer
description: Transform data visualizations with a seamless Light/Dark polarity system that dynamically rebalances chromatic contrast, optical weight, emissive glow vs. ink-reflectance shaders, and WCAG AAA accessibility.
---

# Theme Polarity Harmonizer

## 1. Context (What is this skill for?)

Switching a data visualization between **Dark Mode** and **Light Mode** is one of the most failure-prone challenges in data engineering and design. When naive background inversion or basic palette flipping occurs:
- **Emissive dots disappear or muddy**: Neon particles designed for black backgrounds lose chromatic saturation or get occluded by heavy dark border strokes.
- **Physical canvas metaphors break**: Concentric vinyl grooves, space grids, or soundwave axes look like muddy cardboard smudges.
- **Typography & lines become harsh or unreadable**: Text swings between unreadable low-contrast washouts or harsh, jarring `#000000` pitch-black blocks that destroy visual hierarchy.
- **Overlay cards get trapped in inverted dark boxes**: Child modal elements, floating tooltips, and documentary cards retain dark container backgrounds with dark text.

The **Theme Polarity Harmonizer** establishes a **dual-state optical and accessibility system** grounded in **WCAG 2.2 AAA contrast standards**, optical weight balancing, and perceptual color science (OKLCH).

---

## 2. Accessibility & Optical Standards (WCAG 2.2 AAA Integration)

| Element Type | Light Polarity Rule | Dark Polarity Rule | WCAG Target |
| :--- | :--- | :--- | :--- |
| **Primary Titles & Headings** | Dark Charcoal Grey (`#2D3748`) on `#FAFAFA` | Crisp White (`#F0F0F0`) on `#0A0A0A` | **$\ge 9.5:1$ (Exceeds AAA 7:1)** |
| **Body & Narrative Copy** | Refined Slate Grey (`#4A5568`) | Warm Alabaster (`#CCCCCC`) | **$\ge 7.2:1$ (Exceeds AAA 7:1)** |
| **Secondary Labels & Meta** | Soft Dark Grey (`#718096`) | Neutral Slate (`#AAAAAA`) | **$\ge 4.8:1$ (Exceeds AA 4.5:1)** |
| **Narrative Accents & Badges**| Deep Amber Gold (`#B45309` / `#D97706`) | 24k Gold (`#D4A853`) | **$\ge 4.8:1$ (Exceeds AA 4.5:1)** |
| **Data Marks / Dots ($< 8\text{px}$)** | Pure High-Chroma Saturated Jewel Tones (No muddy dark stroke) | Luminous Emissive Pigments with subtle glow | **High Chromatic Contrast** |
| **Constellation & Guide Lines**| Delicate Slate Filaments (`#64748B`, $1.1\text{px}$, `dasharray: 3 3`) | Subtle Luminous Filaments (`rgba(255,255,255,0.65)`, $1.1\text{px}$) | **Subtle & Non-Occluding** |

---

## 3. Input (What does the skill expect to receive?)

1. **Target Visualization & DOM Architecture**:
   - SVG/Canvas marks (data dots, axis guides, connecting threads, radial tracks).
   - DOM UI panels (navigation bars, search boxes, filter drawers, floating callout cards, modals, tooltips).
2. **Data-to-Color Encodings**:
   - Categorical dimensions (genres, eras, categories) and continuous metrics (ratings, dates).
3. **Physical Metaphor / Canvas Archetype**:
   - e.g. Vinyl record, chronological soundwave, galaxy scatter, geographic map.

---

## 4. Design States & Palette Architecture

### Dark Polarity (Emissive Space)
- **Canvas:** Deep Obsidian (`#0A0A0A`)
- **Vinyl Disc:** Radial graphite gradient (`#1B1B1B` $\rightarrow$ `#111111` $\rightarrow$ `#080808`)
- **Panels & Overlays:** Frosted Smoked Glass (`rgba(14, 14, 14, 0.94)`)
- **Marks:** Luminous emissive particles with subtle drop-shadow halos.

### Light Polarity (Luminous Porcelain & Saturated Jewel Tones)
- **Canvas:** Clean, luminous Slate White (`#FAFAFA`)
- **Vinyl Disc:** Luminous Porcelain Pearl gradient (`#FFFFFF` $\rightarrow$ `#F8FAFC` $\rightarrow$ `#F1F5F9`) with delicate slate grooves (`rgba(15, 23, 42, 0.06)`)
- **Panels & Overlays:** Pure White Frosted Glass (`#FFFFFF` with `#E2E8F0` border and soft shadow `0 20px 48px rgba(15, 23, 42, 0.12)`)
- **Marks:** High-chroma saturated pigments:
  - *1920s–30s:* Vivid Amber Orange (`#EA580C`)
  - *1940s–50s:* Vivid Deep Teal (`#0D9488`)
  - *1960s–70s:* Vivid Rose Crimson (`#E11D48`)
  - *1980s–90s:* Electric Royal Violet (`#7C3AED`)
  - *2000s–10s:* Electric Blue (`#0284C7`)
  - *2020s:* Vivid Emerald Jade (`#059669`)

---

## 5. Implementation Rules & Boundaries

### MUST ALWAYS:
- **Verify WCAG 2.2 AAA Contrast**: Ensure all primary and body text meets or exceeds 7:1 contrast against light and dark backgrounds.
- **Preserve Full Dot Saturation on Light Backgrounds**: Do not apply heavy dark border strokes on small dots ($< 6\text{px}$), which diminish perceived color area.
- **Keep Connecting Lines Delicate & Elegant**: Constellation threads and link arcs must remain subtle filaments ($1.0\text{px}–1.2\text{px}$, dashed), never heavy, thick black cables.
- **Ensure Full Container Cascading**: Floating cards (`#doc-callout-inner`, `#tooltip`, `.film-card`) must update their background, borders, and typography simultaneously with theme changes.
- **Persist State**: Store the active theme in `localStorage` and initialize synchronously on page load.

### MUST NEVER:
- **Never use pitch black (`#000000`) or harsh near-black (`#0F172A`) for text**: Use refined dark charcoal / slate grey (`#2D3748` / `#4A5568`) to avoid optical harshness, visual fatigue, and unnatural contrast.
- **Never use desaturated/pastel colors on white canvases**: Pale pastels disappear against light backgrounds; use high-saturation jewel tones.
- **Never allow dark card backgrounds with dark text**: Always audit card children (`.doc-spotlight-card`, `p`, `h1`, badges) under light polarity.
