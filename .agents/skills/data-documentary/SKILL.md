---
name: data-documentary
description: Transform any data visualization into a multi-sensory, guided documentary tour featuring a segmented chapter scrubber, landmark entity spotlight cards, synthesized ambient audio, and choreographed ripple motion transitions.
---

# Data Documentary

## 1. Context (What is this skill for?)

Most interactive data visualizations are built for active explorers who already understand the schema and know where to look. Casual or first-time viewers often feel overwhelmed, scan the surface, and miss the profound narratives buried within the data.

The **Data Documentary** skill elevates any visualization into a **curated, cinematic story tour**. It acts like a documentary director, guiding the viewer through structured narrative chapters with:
- **Segmented Chapter Scrubber**: An edge-to-edge, frame-synchronized timeline bar where progress fills segment by segment and transitions exactly when the line completes.
- **Landmark Entity Spotlight Cards**: Mini-cards showcasing real flagship data records (with image thumbnails, metadata, and quick inspection triggers) directly within each chapter's narrative card.
- **Synesthetic Web Audio Score**: Ambient documentary soundscapes (dual oscillator low-pass chord drones) and harmonic chapter transition chimes rendered in real-time via the native Web Audio API (zero audio files needed).
- **Organic Spatial Ripple Motion**: Transitions that propagate outward in acoustic delay waves or chronological cascades rather than moving in rigid blocks.

This skill is **visualization-type agnostic**: it works seamlessly across scatter plots, timelines, radial vinyl charts, geographic maps, network graphs, or hierarchical treemaps.

---

## 2. Input (What does the skill expect to receive?)

1. **Target Visualization & Views**:
   - Reference to the visual container (SVG/Canvas/DOM).
   - Available layout archetypes or filter modes (e.g., Record mode, Timeline Wave, Galaxy Scatter).

2. **Analytical Insights & Landmark Entities**:
   - Key historical eras, statistical clusters, or provocative anomalies.
   - List of flagship records/entities per chapter (e.g., landmark films, key countries, record-breaking years) with metadata and thumbnail URLs.

3. **Audio & Sensory Profile**:
   - Soundscape preference: *(A) Warm Cinematic Drone + Harmonic Pentatonic Chimes*, *(B) Minimalist Tactile Clicks*, or *(C) Pure Silent Motion*.
   - Mute state defaults and accessibility overrides.

4. **Pacing Envelope**:
   - Target duration per chapter (typically 6.0s – 8.0s for brisk, engaging retention).

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
- Mini spotlight cards show 3 flagship records per chapter with poster thumbnails.
- *Best for:* Portfolio showpieces, data journalism stories, conference exhibits.

### Option C: The Interactive Self-Guided Exploration
- Chapters wait for user progression (or auto-advance on toggle).
- Includes expanded analytical breakdowns and deeper entity inspection modals.
- *Best for:* Educational walkthroughs and deep-dive analytical dashboards.

**Clarification Prompts:**
- *"Which pacing best fits your audience: Highlight Reel (35s) or Curated Exhibition (50s)?"*
- *"Would you like to enable the real-time Web Audio ambient drone and chapter transition bells?"*
- *"Which landmark entities in your dataset should be spotlighted as mini-cards during the tour?"*

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
2. **Gold Ambient Action Button (`#doc-play-btn`) & Sound Toggle (`#doc-sound-btn`)**: Prominent control bar with pulsing idle glow and mute control.
3. **Editorial Floating Callout Card (`#doc-callout`)**: Frosted-glass panel positioned dynamically in least-dense screen quadrants, featuring the narrative headline, analytical takeaway, metric badge, and interactive entity spotlight mini-cards.
4. **SVG Halo Aura Generator (`spotlightG`)**: Animated expanding shockwave rings (`.spotlight-pulse`) highlighting landmark dots on canvas.
5. **Web Audio Synthesizer (`DocAudioEngine`)**: Pure code-generated ambient synth drone and pentatonic transition chords.

---

## 5. Rules & Boundaries (Must Always / Must Never)

### MUST ALWAYS:
- **Synchronize scrubber progress 1:1 with chapter switches**: The progress fill within a chapter segment must reach exactly 100% at the precise moment the next chapter begins.
- **Require user gesture for audio**: The Web Audio context must initialize/resume only upon clicking the "Play Story" or sound button to adhere to browser autoplay policies.
- **Provide immediate keyboard interruptibility**: Pressing `Escape` or clicking `Pause` must instantly restore the visual state, clear audio drones, and reset filters.
- **Anchor spotlight cards in real data**: Mini cards must display verified records, real thumbnail URLs, and lead to deeper entity inspection.
- **Use lightweight stroke highlights over heavy filters**: Never apply SVG blur/glow filters to hundreds of data marks simultaneously; use lightweight stroke rings and CSS opacity to preserve 60 FPS.

### MUST NEVER:
- **Never auto-play on initial page load**: The visualization must load into standard exploratory mode first.
- **Never trap or block user interaction**: Clicking any spotlight mini-card or chapter dot must immediately respond and update view states.
- **Never obscure active data points**: Callout cards must dynamically shift to less-crowded viewport quadrants away from focused clusters.
- **Never rely on external audio asset files**: Soundscapes must be synthesized dynamically using native Web Audio oscillators to prevent 404s, CORS blocks, or network latency.
