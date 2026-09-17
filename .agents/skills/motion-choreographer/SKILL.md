---
name: motion-choreographer
description: Transform rigid, mechanical data visualization transitions into organic, fluid motion systems featuring spatial ripple delays, wave cascades, and interactive sonic pulses.
---

# Motion Choreographer

## 1. Context (What is this skill for?)
Default transitions in data visualizations are often mechanical and jarring: hundreds of SVG elements slide simultaneously in a rigid, robotic block. This creates visual noise, makes individual trajectories impossible to follow, and lacks tactile satisfaction.

The **Motion Choreographer** skill elevates data graphics by treating transitions as physics-inspired choreography. It computes spatial delay fields—such as concentric radial ripples, chronological wave cascades, and subtle elastic settle curves—ensuring that every state transition, filtering event, and cursor interaction feels alive, fluid, and perceptually clear.

---

## 2. Input (What does the skill expect to receive?)
1. **Target visualization elements**:
   - D3.js selections or DOM nodes (e.g., `dotsGroup.selectAll('.film-dot')`).
2. **Current and target states**:
   - Starting coordinates `[x0, y0]` and destination coordinates `[x1, y1]`.
   - Layout archetype (e.g., radial/polar, Cartesian timeline, scatter grid).
3. **Motion driver / Spatial origin**:
   - Center anchor `[cx, cy]` for radial ripples, or an axis dimension (e.g., `year` or `rating`) for directional wave cascades.
4. **Performance & timing envelope**:
   - Total animation budget (standard: 600ms – 1100ms).
   - Element count (e.g., 100 to 5,000 marks) to calibrate stagger intervals without frame drops.

---

## 3. Choices & Clarifications (How does it collaborate with the user?)
The skill presents the user with **3 distinct motion archetypes** and requests their preference:

1. **Option A: The Concentric Ripple Wave (Fluid Acoustic Propagation)**
   - *Behavior:* Staggers transition start times outward based on Euclidean distance from a central anchor or hovered point.
   - *Formula:* `delay = Math.hypot(x - cx, y - cy) * k`
   - *Best for:* Radial layouts, vinyl records, bubble rings, polar coordinates.
2. **Option B: The Directional Cascade (Chronological / Metric Domino)**
   - *Behavior:* Elements sweep into position sequentially along a meaningful data axis (e.g., earliest year to latest, or highest metric to lowest).
   - *Formula:* `delay = ((d.year - minYear) / (maxYear - minYear)) * maxStagger`
   - *Best for:* Timelines, rankings, distribution curves, bar charts.
3. **Option C: Kinetic Spring & Elastic Settle (Physical Mass & Inertia)**
   - *Behavior:* Elements move with physical weight, slightly overshooting their target position and oscillating to a gentle rest using custom cubic-bezier or `d3.easeBackOut`.
   - *Formula:* Custom easing with micro-stagger based on mark mass/radius.
   - *Best for:* Tactile dashboards, drag-and-drop interfaces, scatter matrices.

**Clarification Prompts:**
- *"Which motion archetype best matches your project’s narrative: Concentric Ripple, Directional Cascade, or Kinetic Spring?"*
- *"Would you like interactive micro-pulses (e.g., expanding soundwave shockwave rings when hovering or clicking marks)?"*

---

## 4. Output Format (What should the result be?)
The skill outputs production-ready transition configurations:
1. **D3 Transition Specification**:
   - Precise `.duration(ms)`, `.delay((d, i) => ...)`, and `.ease(d3.ease...)` code.
2. **Interactive Pulse Handlers**:
   - Lightweight SVG ripple shockwave generators (`circle` expanding with fading opacity).
3. **State Transition Router**:
   - Direction-aware transition logic that adjusts the stagger vector depending on which mode is being entered (e.g., radial outward for Record mode, left-to-right sweep for Timeline mode).
4. **Accessibility Override**:
   - Automatic fallback to zero-duration transitions when `window.matchMedia('(prefers-reduced-motion: reduce)')` is active.

---

## 5. Rules & Boundaries (Must Always / Must Never)

### MUST ALWAYS:
- **Enforce a strict total time budget**: The entire choreography (stagger + duration) must finish within **1100ms** so the visualization remains responsive and never delays exploration.
- **Maintain 60 FPS**: Keep stagger calculations to $O(1)$ arithmetic operations per element. Avoid heavy DOM re-measuring during transitions.
- **Support accessibility**: Always include a reduced-motion check to instantly set positions if the user has requested reduced motion.
- **Anchor motion in data dimensions**: The sequence of motion must convey meaning (e.g., older films leading into newer films, or central core expanding outward), never arbitrary randomness.

### MUST NEVER:
- **Never animate layout-triggering DOM styles**: Never animate `top`, `left`, `margin`, or `padding`. Always animate SVG `cx`, `cy`, `r`, `transform`, or CSS `opacity`.
- **Never trigger DOM reordering (`raise()`) mid-transition**: Moving elements in the DOM tree while transitions are running causes dropped frames and glitchy mouse event cancels.
- **Never block user interaction**: Ensure click and hover event listeners remain active and responsive while marks are in motion.
