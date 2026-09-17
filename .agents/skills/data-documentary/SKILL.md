---
name: data-documentary
description: Transform any data visualization into an automated, chapter-based documentary tour featuring a segmented timeline scrubber, on-canvas landmark leader pins, fluid particle cascade transitions, and true pause/resume controls.
---

# Data Documentary

## 1. Context (What is this skill for?)

Most interactive data visualizations are built for active explorers who already understand the schema and know where to look. Casual or first-time viewers often feel overwhelmed, scan the surface, and miss the profound narratives buried within the data.

The **Data Documentary** skill elevates any visualization into a **curated, cinematic story tour**. It acts like a documentary director, guiding the viewer through structured narrative chapters with:
- **Segmented Chapter Scrubber**: An edge-to-edge timeline bar where progress fills segment by segment and transitions exactly when the line completes.
- **True Pause/Resume & Dedicated Stop**: Pause freezes progress in-flight and keeps visual focus steady; resume continues seamlessly; stop resets to baseline.
- **Fluid Particle Cascade Flight**: During layout and mode shifts, all data marks illuminate and stream across the viewport with organic spatial ripple delays, transforming chart shifts into visible particle choreography.
- **On-Canvas Landmark Leader Pins**: Delicate floating flags (`[ ★ 9.3 · Film Title ]`) with dotted leader lines anchored directly to highlighted entities on the canvas.
- **Stacked High-Visibility Landmark Cards**: Full movie titles, poster thumbnails, years, directors, and gold rating badges with zero ugly truncation.

This skill is **visualization-type agnostic**: it works seamlessly across scatter plots, timelines, radial vinyl charts, geographic maps, network graphs, or hierarchical treemaps.

---

## 2. Input (What does the skill expect to receive?)

1. **Target Visualization & Views**:
   - Reference to the visual container (SVG/Canvas/DOM).
   - Available layout archetypes or filter modes (e.g., Record mode, Timeline Wave, Galaxy Scatter).

2. **Analytical Insights & Landmark Entities**:
   - Key historical eras, statistical clusters, or provocative anomalies.
   - List of flagship records/entities per chapter (e.g., landmark films, key countries, record-breaking years) with metadata and thumbnail URLs.

3. **Pacing Envelope**:
   - Target duration per chapter (typically 6.5s – 8.0s for brisk, engaging retention).

---

## 3. Choices & Clarifications (How does it collaborate with the user?)

The skill presents the user with **3 distinct narrative postures**:

### Option A: The Fast-Paced Highlight Reel (≈ 30–40 seconds)
- 4–5 compact chapters, 6s each.
- Focuses strictly on the highest peaks and greatest anomalies.
- Mini spotlight cards show 2 flagship entities per chapter.
- *Best for:* Quick demos, social sharing, presentation openers.

### Option B: The Curated Exhibition Tour (≈ 50–60 seconds)
- 6–7 chapters, 7s–8s each.
- Explores origins, golden eras, paradigm shifts, global expansions, and final analytical epilogues.
- Mini spotlight cards show 3 flagship records per chapter with poster thumbnails and leader pins.
- *Best for:* Portfolio showpieces, data journalism stories, conference exhibits.

### Option C: The Interactive Self-Guided Exploration
- Chapters wait for user progression (or auto-advance on toggle).
- Includes expanded analytical breakdowns and deeper entity inspection modals.
- *Best for:* Educational walkthroughs and deep-dive analytical dashboards.

---

## 4. Output Format (What should the result be?)

The skill delivers a complete, production-grade documentary engine:

### 4a. Chapter Manifest (`DOC_CHAPTERS`)
```javascript
[
  {
    id: "ch1",
    badge: "CHAPTER 1 OF 6 · ORIGINS",
    title: "The Silent Pioneers",
    body: "Only 17 films from the 1920s–30s survive in the Top 1000 — yet they invented the visual grammar of cinema.",
    stat: "★ AVG 8.1 · 1920s–30s · 17 FILMS",
    mode: "record",
    decadeFilter: "1920",
    spotlightFilms: ["imdb-0127", "imdb-0053", "imdb-0052"],
    duration: 7000
  },
  ...
]
```

### 4b. UI Scaffolding & Components
1. **Segmented Scrubber Bar (`#doc-scrubber`)**: $N$ equal track segments with animated `scaleX(0 → 1)` progress fills perfectly synchronized to chapter boundaries.
2. **Controls (`#doc-controls-wrap`)**: Gold action button with true `▶ PLAY / ⏸ PAUSE / ▶ RESUME` states and a dedicated `⏹ STOP` button.
3. **Editorial Floating Callout Card (`#doc-callout`)**: Frosted-glass panel positioned in a non-occluding safe quadrant, featuring the narrative headline, analytical takeaway, metric badge, and stacked movie spotlight mini-cards.
4. **SVG Leader Pins & Focal Auras (`spotlightG`)**: Floating on-canvas flags with dotted lines and expanding pulse halos.
5. **Fluid Particle Cascade**: Staggered D3 named transitions with `.doc-moving` illumination.

---

## 5. Rules & Boundaries (Must Always / Must Never)

### MUST ALWAYS:
- **Synchronize scrubber progress 1:1 with chapter switches**: The progress fill within a chapter segment must reach exactly 100% at the precise moment the next chapter begins.
- **Keep mode transitions visible**: During layout changes, illuminate traveling marks so viewers clearly perceive the data transformation between coordinate spaces.
- **Provide true pause & stop interruptibility**: Pausing must freeze timers and progress fills in place without resetting state; stopping or pressing `Escape` must cleanly restore the baseline.
- **Anchor spotlight cards in real data**: Mini cards must display verified records, real thumbnail URLs, and lead to deeper entity inspection.
- **Position cards in guaranteed safe zones**: Never occlude active data clusters with editorial cards.

### MUST NEVER:
- **Never snap or cut mode transitions instantly**: All coordinate changes must glide smoothly with easing curves.
- **Never truncate entity titles unnecessarily**: Use stacked layouts with ample breathing room so names and metrics remain fully legible.
- **Never auto-play on initial page load**: The visualization must load into standard exploratory mode first.
