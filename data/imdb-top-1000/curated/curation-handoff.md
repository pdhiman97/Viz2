# Data Curator handoff — IMDb Top 1000

## Artifact fit

**Likely artifact mode:** hybrid record-by-record exploration. The data is rich enough for an artistic, interaction-led film field with local reveals, and also supports restrained aggregate comparisons within this selected 1,000-record snapshot.

## Profile

- 1,000 source records; 16 source fields; no exact duplicate records.
- `record_id` is the required identity: title alone is not unique (`Drishyam` occurs twice, in 2013 and 2015).
- Valid parsed years: 999 records, 1920–2020; one null is deliberately retained for *Apollo 13*.
- Runtime: 45–321 minutes; IMDb rating: 7.6–9.3; vote count: 25,088–2,343,110.
- Meta score: 843 present / 157 null, range 28–100. Gross: 831 present / 169 null, range 1,305–936,662,225.
- Certificates: 899 present across 16 unnormalized labels; 101 null. Directors: 548 distinct source labels. The four cast columns contain 2,709 distinct source labels.
- Genres: 2,541 film–genre links across 21 labels. Most frequent labels: Drama (724 films), Comedy (233), Crime (209), Adventure (196), and Action (189).

## Caveats that must travel downstream

- This is an unknown-provenance local snapshot of an IMDb Top 1000-style selected list, not a representative sample of cinema and not evidence of current IMDb rankings.
- Ratings are range-compressed by the selected-list design. Do not frame small differences as strong quality distinctions.
- `gross_amount` has unknown currency, territory, timeframe, and inflation basis. It is unsuitable for cross-era financial comparisons or labels such as “worldwide gross.”
- `certificate` mixes classifications from different systems and is not a safe age-rating comparison without a documented normalization decision.
- `meta_score`, `gross_amount`, and `release_year` nulls must remain visible as unavailable, never zero-filled.
- Poster URLs are supplied for 1,000/1,000 records and are syntactically HTTP(S), but their availability, content accuracy, usage rights, and cross-origin behavior are **unverified**. Treat every poster as an optional enhancement, not a required visual encoding. Supply a typographic/color fallback card or abstract glyph generated from local metadata; lazy-load images and keep the field’s visual layout intact if an image fails.

## Downstream record-handling constraints

- A record-by-record exploration must keep all 1,000 records reachable and inspectable through its designed visual system. Progressive reveal, clustering, virtualization, or navigation are acceptable; silently dropping records or showing a collection count that exceeds the reachable set is not.
- Use `record_id` as the interaction key. A displayed title should be paired with the parsed year where available; use an explicit unknown-year treatment for *Apollo 13* rather than merging or misplacing it in a chronological view. `Drishyam` is a known duplicate title.
- Null `meta_score`, `gross_amount`, and `release_year` values need an unavailable state wherever those fields control placement, selection, or comparison. They must not become zero, an implied minimum, or an unlabelled omission.
- Poster success and failure must produce equally usable records. The local metadata fallback should preserve identity and interaction affordance without claiming that an unavailable image is missing data from the film record itself.

## Recommended analytical questions

1. Which genre combinations recur across decades, and where do the selected-list records form bridges between genre worlds?
2. How do vote counts, IMDb rating, and meta score align—or pull apart—within this curated list, with missing meta scores made explicit?
3. What director and four-credit cast constellations emerge from repeated people rather than from headline ranking alone?
4. How does runtime create different temporal “shapes” across eras and genre memberships without treating duration as quality?
5. What does the field lose when poster images are unavailable, and can title, year, rating, and genre sustain the exploration on their own?

## Deliverables

- `films.csv` — typed primary record table.
- `film_genres.csv` — normalized genre relation table.
- `data-dictionary.md` — schema contract.
- `transformation-log.md` — auditable source-to-output mapping and invariants.
