---
name: data-documentary
description: Transform any data visualization into a guided, chapter-based documentary tour with an automated camera that pans and zooms through curated story moments, floating editorial callout cards, and a chapter scrubber bar—giving passive viewers an active, narrated experience.
---

# Data Documentary

## 1. Context (What is this skill for?)

Most interactive data visualizations are designed for active explorers—people who already know what to look for. But the majority of viewers arrive without context, scan the surface, and leave without discovering the most interesting insights buried in the data.

The **Data Documentary** skill solves this by adding a **"Play Story" mode** to any visualization: an automated guided tour that acts like a documentary film director, moving the viewport through curated story chapters in sequence. Each chapter highlights a specific cluster, time period, comparison, or anomaly with a floating editorial callout card and a coordinated visual focus state.

This skill is **visualization-type agnostic**: it works on scatter plots, timelines, radial charts, maps, bar charts, or any canvas-based graphic. The only requirement is that the visualization has identifiable regions of interest and supports viewport zoom/pan or visual focus states.

---

## 2. Input (What does the skill expect to receive?)

The skill accepts any combination of the following:

1. **The target visualization**:
   - A reference to the chart (HTML artifact, screenshot, live code, or description of chart type and layout).
   - The current view modes or states available (e.g., "three tabs: Vinyl Record, Timeline, Scatter Galaxy").

2. **The dataset summary or analytical findings**:
   - Key clusters, peaks, anomalies, comparisons, or time periods worth highlighting.
   - Optionally: pre-identified story chapters from a Data Analyst or Narrator skill.

3. **The story pacing preference** (or the skill will ask):
   - Total tour duration (e.g., 30s, 60s, 90s).
   - Number of chapters (3-6 recommended).
   - Whether the tour should auto-advance or wait for user input at each chapter.

4. **The editorial voice**:
   - Declarative ("Here is what happened"), Investigative ("Notice the anomaly here"), or Celebratory ("The highlights of the dataset").

---

## 3. Choices & Clarifications (How does it collaborate with the user?)

The skill must **always present 3 pacing options** before generating chapter content:

### Option A: Rapid Highlight Reel (approx. 30 seconds)
- 3 chapters, ~8 seconds each.
- One headline finding per chapter.
- Minimal text — callout cards show only a title and a stat.
- Best for: Social sharing, live presentations, quick demos.

### Option B: Deep Exhibition Tour (approx. 60 seconds)
- 5 chapters, ~10-12 seconds each.
- Each chapter includes a headline, one analytical sub-sentence, and a key data point.
- Smooth cinematic pacing with a short pause before advancing.
- Best for: Conference posters, portfolio showcases, data journalism articles.

### Option C: Interactive Self-Guided Tour
- 4-6 chapters; does not auto-advance — the user presses "Next Chapter" to proceed.
- Each callout card includes deeper context and a "Why this matters" note.
- The chapter scrubber bar is always visible and lets users jump freely.
- Best for: Classroom environments, museum installations, long-form editorial pieces.

**Clarification prompts:**
- "Which pacing option best fits how your audience will experience this visualization: Rapid, Deep, or Self-Guided?"
- "Should the tour loop continuously, or stop and return to the default state after the final chapter?"
- "Should I generate the chapter content from the dataset automatically, or do you have specific story beats to include?"

---

## 4. Output Format (What should the result be?)

The skill delivers a complete, production-ready documentary layer consisting of:

### 4a. Chapter Manifest (JSON-style data)
A structured list of chapters, each containing:
- id: Chapter identifier (e.g., "ch1")
- title: Short editorial headline (max 8 words)
- body: One analytical sentence (max 20 words)
- stat: The key data point or metric to highlight
- focusRegion: Coordinates or filter state the camera flies to
- duration: Milliseconds on screen before auto-advancing
- mode: Which chart view/tab to activate (if multi-mode)

### 4b. UI Components (HTML + CSS + JS)
- Play/Pause Button: Prominent but unobtrusive button (bottom-left by default) with a play/pause icon and "PLAY STORY" / "PAUSE" label.
- Chapter Scrubber Bar: A thin horizontal bar at the bottom showing chapter progress dots, clickable to jump to any chapter, with a live fill-progress animation during playback.
- Floating Editorial Callout Card: A frosted-glass panel that fades in at the start of each chapter and fades out before the next. Contains the title, body, stat, and chapter number badge. Positioned in the least-data-dense quadrant to avoid occluding data marks.
- Focus Dimming: Non-highlighted data marks dim to near-invisible during playback; the highlighted cluster stays at full opacity with a soft luminous halo.
- Reduced Motion Fallback: If prefers-reduced-motion is active, animated camera moves become instant cuts and callout cards appear without fade transitions.

### 4c. Integration Instructions
- Which existing function calls need wrapping or extending.
- Which DOM element to anchor the Play button and scrubber bar to.
- How to exit documentary mode cleanly (Escape key, clicking outside callout, or pressing Pause).

---

## 5. Rules & Boundaries (Must Always / Must Never)

### MUST ALWAYS:
- Ground every chapter in real data: Every callout card stat must reference an actual number, percentage, or named data point — never vague language like "many" or "most."
- Preserve user control: Escape key and Pause button must always interrupt documentary mode immediately and restore the previous state. Users must never feel trapped.
- Respect the existing design language: Callout card typography, color, and opacity must inherit from the visualization's existing CSS design tokens — the documentary layer must feel native, not bolted-on.
- Auto-detect safe card positions: The callout card must reposition to the least-cluttered screen quadrant for each chapter, placing it where it occludes the fewest data marks.
- Always include a chapter scrubber: Even in Rapid mode, the scrubber bar must be visible during playback so the viewer understands their position in the story.

### MUST NEVER:
- Never block the data: Callout cards must never fully cover the data marks being highlighted — always maintain at least 80px clearance from the nearest highlighted cluster.
- Never auto-play on page load: Documentary mode must only start when the user explicitly presses Play. The visualization must always be fully usable without entering documentary mode.
- Never run longer than 120 seconds total: Cap auto-advance at 120 seconds across all chapters.
- Never use generic chapter titles: Titles like "Chapter 1" or "The Data" are forbidden. Every title must state a specific finding, era, name, or metric.
- Never animate layout-triggering CSS properties: Camera movement must use SVG viewBox transitions, CSS transform scale/translate, or D3 zoom — never top, left, margin, or width animations that trigger browser reflow.
