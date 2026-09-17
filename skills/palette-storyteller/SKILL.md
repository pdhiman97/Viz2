---
name: palette-storyteller
description: Transform generic, rainbow-scattered charts into semantically harmonized, perceptually balanced editorial color palettes engineered in OKLCH space with strict 80/20 visual hierarchy.
---

# Palette Storyteller

## 1. Context (What is this skill for?)

Most data visualizations suffer from **chromatic chaos**: they assign arbitrary categorical colors from standard libraries (e.g., `d3.schemeCategory10` or random rainbow hues). This produces high cognitive fatigue, poor contrast, zero emotional resonance, and visual competition where every data point screams for attention simultaneously.

The **Palette Storyteller** skill engineers **semantic, editorial color systems** tailored to the data’s subject matter, emotional tone, and narrative hierarchy. Built on perceptual color science (OKLCH color space), it guarantees:
- **The 80/20 Visual Hierarchy Rule**: 80% of data marks live in elegant, low-chroma contextual tones; 20% of critical narrative highlights ignite in high-chroma editorial accents.
- **Perceptual Lightness Uniformity**: Eliminates deceptive visual weight where certain hues (like pure yellow or cyan) appear artificially larger or closer than darker hues of identical value.
- **Semantic Domain Resonance**: Colors evoke the subject matter (e.g., *Golden Age Cinema*, *Deep Space Observatory*, *Criterion Letterpress*, *Cyber Telemetry*).
- **Accessibility Guarantee**: Verified WCAG AAA contrast ratios for typography and AA+ for interactive data marks against dark or light canvases.

---

## 2. Input (What does the skill expect to receive?)

The skill accepts any combination of:
1. **Target Visualization & Domain**:
   - Subject matter (e.g., cinema history, financial volatility, climate anomalies, biomedical data).
   - Data dimensions mapped to color (e.g., categorical genres, continuous ratings, chronological eras, sentiment).
2. **Canvas Background Polarity**:
   - Dark mode (Obsidian / Midnight), Light mode (Alabaster / Ivory), or Adaptive.
3. **Narrative Focus & Editorial Mood**:
   - Primary editorial message (e.g., celebrating peak excellence, warning of risk, tracing historical evolution).
   - Desired aesthetic tone (e.g., *Luxe Criterion*, *Neon Cyberpunk*, *Archival Print*, *Nordic Minimalist*).

---

## 3. Choices & Clarifications (How does it collaborate with the user?)

The skill presents the user with **3 distinct palette archetypes**:

### Option A: The Golden Age & 35mm Film Palette (Luxe Editorial / Nostalgic)
- **Canvas:** Deep Obsidian (`oklch(14% 0.01 260)`)
- **Contextual Base:** Warm Charcoal & Sepia Smoke (`oklch(38% 0.02 65)`)
- **Accents:** 24k Gold (`oklch(82% 0.16 85)`), Terracotta Crimson (`oklch(62% 0.19 32)`), Amber Glow (`oklch(75% 0.14 70)`)
- *Best for:* Historical retrospectives, cinema, culture, prestige awards.

### Option B: The Electric Cyber-Telemetry Palette (Futuristic / High-Contrast)
- **Canvas:** Midnight Void (`oklch(10% 0.02 280)`)
- **Contextual Base:** Deep Slate & Desaturated Indigo (`oklch(32% 0.04 260)`)
- **Accents:** Phosphor Cyan (`oklch(84% 0.18 200)`), Electric Magenta (`oklch(72% 0.24 340)`), Radiant Violet (`oklch(68% 0.22 300)`)
- *Best for:* Modern tech, sci-fi, algorithmic networks, real-time telemetry.

### Option C: The Criterion Vintage Letterpress (Archival / Monochromatic Punch)
- **Canvas:** Warm Aged Alabaster (`oklch(96% 0.01 80)`) or Dark Inkplate (`oklch(16% 0.005 60)`)
- **Contextual Base:** Cool Bone & Silvered Graphite (`oklch(45% 0.01 240)`)
- **Accents:** Vermilion Red (`oklch(60% 0.22 28)`), Prussian Blue (`oklch(48% 0.16 245)`), Ochre Gold (`oklch(78% 0.15 88)`)
- *Best for:* Data journalism, long-form investigative essays, print-ready reports.

---

## 4. Output Format (What should the result be?)

The skill outputs a complete, production-ready color architecture:

### 4a. CSS Design Token Architecture
```css
:root[data-palette="golden-age"] {
  --color-canvas: oklch(13% 0.01 260);
  --color-surface-glass: rgba(26, 24, 20, 0.75);
  --color-border-subtle: rgba(212, 168, 83, 0.15);

  /* 80% Contextual marks */
  --color-mark-neutral: oklch(42% 0.02 70);
  --color-mark-dim: rgba(255, 255, 255, 0.06);

  /* 20% Semantic narrative accents */
  --color-accent-primary: #D4A853;  /* 24k Gold */
  --color-accent-secondary: #E07A5F;/* Terracotta */
  --color-accent-tertiary: #81B29A; /* Vintage Sage */
  --color-accent-highlight: #F4F1DE;/* Starlight */
}
```

### 4b. Dynamic D3 Color Mapping
```javascript
const PALETTES = {
  'golden-age': {
    name: '35mm Golden Age',
    genres: {
      Drama: '#D4A853',
      Crime: '#C86D51',
      Action: '#E07A5F',
      Adventure: '#3D5A80',
      Comedy: '#F2CC8F',
      'Sci-Fi': '#98C1D9',
      Animation: '#81B29A',
      Biography: '#B8A388',
      Other: '#706B65'
    }
  },
  ...
};
```

### 4c. Interactive Palette Switcher Component
A sleek, accessible toolbar toggle allowing the viewer to audition different narrative palettes in real time without refreshing the page.

---

## 5. Rules & Boundaries (Must Always / Must Never)

### MUST ALWAYS:
- **Enforce the 80/20 Hierarchy**: Never color every single category in maximum saturation. Ground non-focal categories in harmonized neutrals so story anchors shine.
- **Maintain Perceptual Uniformity**: Use OKLCH / CIELAB lightness balancing so no data mark draws accidental emphasis purely due to hue physics.
- **Test Colorblind Accessibility**: Ensure essential categorical contrasts remain distinguishable under Deuteranopia, Protanopia, and Tritanopia simulations.
- **Harmonize Mark Glows with Canvas**: Accents on dark canvases must have tuned emissive dropshadows (`filter: drop-shadow(...)`); accents on light canvases must have crisp vector boundaries.

### MUST NEVER:
- **Never use unadjusted rainbow spectra**: Avoid standard rainbow hue sweeps (`hsl(0..360, 100%, 50%)`) which distort relative values and create severe visual vibration.
- **Never rely on color as the sole differentiator**: Always pair color with secondary visual channels (size, border weight, position, or tooltips) for critical insights.
- **Never use low-contrast text on accent backgrounds**: Ensure rating tags and metric badges meet at least a 4.5:1 contrast ratio.
