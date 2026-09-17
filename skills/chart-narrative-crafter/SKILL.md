---
name: chart-narrative-crafter
description: Transform static, descriptive chart titles and raw metrics into punchy, evidence-backed editorial headlines, analytical sub-decks, and contextual takeaways.
---

# Chart Narrative Crafter

## 1. Context (What is this skill for?)
Most data visualizations suffer from passive, generic labeling (e.g., *"IMDb Rating Distribution across Decades"* or *"Sales by Quarter"*). These describe *what* is plotted, but fail to tell the audience *why it matters* or *what pattern was uncovered*.

The **Chart Narrative Crafter** skill bridges the gap between raw data visualization and editorial data journalism. It audits an existing visualization, extracts key tensions, anomalies, or distributions from the underlying data, and synthesizes active, insight-driven headlines, analytical sub-decks, and view-specific micro-annotations.

---

## 2. Input (What does the skill expect to receive?)
The skill accepts any combination of the following:
1. **Visualization context or existing chart**:
   - Current title, subtitle, axis labels, or legend text.
   - Type of chart or view mode (e.g., radial scatter, chronological timeline, quadrant matrix).
2. **Dataset summary or analytical findings**:
   - Primary metric ranges, medians, peaks, and baselines (e.g., rating range: 7.6 to 9.3).
   - Key anomalies, outlier data points, or distribution skew (e.g., top 12 films above 9.0; 74% clustering between 7.6–8.1).
3. **Audience & tone preference**:
   - Target audience (e.g., casual consumer, executive, film enthusiast, academic).
   - Tone desired (e.g., punchy journalistic, investigative, minimalist constructivist, celebratory).

---

## 3. Choices & Clarifications (How does it collaborate with the user?)
The skill must **never assume a single editorial voice**. Instead, it presents the user with **3 distinct narrative postures** and requests their preference before implementation:

1. **Option A: The Evidence-Led Headline (Journalistic / Declarative)**
   - *Formula:* [Primary Finding / Verdict] + [Supporting Metric or Tension]
   - *Example:* *"A Century of Acclaim: The 1990s Dominate in Volume, but 1970s Masterpieces Hold the Highest Ground"*
2. **Option B: The Provocative Inquiry (Investigative / Narrative Hook)**
   - *Formula:* [Pivotal Question] + [Data Clue / Counter-Intuitive Trend]
   - *Example:* *"Has Cinema Peaked? Why Modern Classics Scatter Broadly While Golden-Age Films Cluster at the Apex"*
3. **Option C: The Minimalist Brutalist / Constructivist Moniker**
   - *Formula:* [Punchy Monolith] + [Precision Stat Decoder / Micro-Deck]
   - *Example:* *"ONE RECORD: 1,000 Films, 100 Years, 1 Consensus (★ 9.3 Peak to ★ 7.6 Baseline)"*

**Clarification Prompts:**
- *"Which tone best fits your artifact's audience: Declarative, Provocative, or Minimalist?"*
- *"Would you like static editorial copy, or a dynamic lead deck that updates as the user toggles modes and filters?"*

---

## 4. Output Format (What should the result be?)
The skill delivers a structured editorial kit:
1. **Primary Headline (`H1` / Chart Title)**: High-impact title (max 10–12 words).
2. **Analytical Sub-Deck (`H2` / Deckhead)**: 1–2 sentences summarizing the core takeaway or tension revealed by the data.
3. **View-Specific Micro-Annotations (Per Mode / Segment)**:
   - For view 1 / mode 1: One-sentence analytical focus.
   - For view 2 / mode 2: One-sentence analytical focus.
   - For view 3 / mode 3: One-sentence analytical focus.
4. **Interactive State Copy (Dynamic Filter Hooks)**: Template strings or conditional phrases for filtered subsets (e.g., when a genre, decade, or search query is selected).
5. **Colophon / Reader's Guide**: Concise decode key explaining symbol encodings and reading orientation.

---

## 5. Rules & Boundaries (Must Always / Must Never)

### MUST ALWAYS:
- **Anchor claims in real numbers**: Always back every headline claim with actual figures, percentages, or verified extremes from the data.
- **Answer the 'So What?'**: Shift the reader's cognitive load from reading axes to grasping the phenomenon.
- **Maintain brevity and visual hierarchy**: Keep headlines legible at a glance without overpowering the visual marks.
- **Gracefully adapt to filtered states**: If the visualization has interactive filters, ensure the narrative framing reflects the active subset rather than remaining static.

### MUST NEVER:
- **Never use passive axis summaries**: Avoid titles like *"Chart Showing Rating vs. Year"* or *"IMDb Data Breakdown"*.
- **Never use sensationalist clickbait**: Do not invent dramatic conclusions not supported by the underlying statistics.
- **Never clutter data marks**: Text must live in dedicated editorial zones or purposeful callout pins, never obscuring data dots or critical coordinate space.
- **Never use ambiguous superlatives**: Avoid vague words like *"extremely good"* or *"massive difference"*; specify the actual delta (e.g., *"12 of 1,000 films"* or *"+1.7 rating spread"*).
