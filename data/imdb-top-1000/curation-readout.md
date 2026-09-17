# Curation readout — IMDb Top 1000

## Source and scope

Local working source: `imdb_top_1000.csv` (1,000 records × 16 fields). Original publisher, collection date, methodology, and license are not included. Treat this as a fixed selected-list snapshot, not a representative picture of cinema or a current IMDb ranking.

## Fitness

Best suited to a **hybrid, record-led cinematic exploration**: dense visual discovery with local detail reveal. Poster links, titles, years, people, genres, overviews, ratings, and votes support that form. Aggregate comparisons must remain scoped to this selected list.

## Completeness

| Field | Missing records | Note |
| --- | ---: | --- |
| `Certificate` | 101 (10.1%) | Mixed rating systems; absence must remain unknown. |
| `Meta_score` | 157 (15.7%) | Use available records only; do not impute. |
| `Gross` | 169 (16.9%) | Currency territory/adjustment is unspecified; avoid time comparisons. |

All other fields are populated. `Released_Year` has one malformed value: *Apollo 13* is `PG`, so chronology must either retain a null year or receive an externally verified correction.

## Known data characteristics and caveats

- Valid release years span 1920–2020 (999 rows), with a strong 2000s–2010s skew.
- IMDb ratings are compressed (7.6–9.3) because this is a ranked list.
- Genres are multi-valued; title alone is not an identity (`Drishyam` appears twice). A local ID and title-plus-year label are required.
- Poster URLs are optional material only until availability and rights are checked; every visual approach needs a no-poster fallback.

## Completed curation

The approved curation keeps the root-level source CSV unchanged and creates typed, analysis-ready tables under `data/imdb-top-1000/curated/`:

- `films.csv` — 1,000 records with deterministic `record_id`, parsed runtime/vote/gross values, retained nulls, and both raw and parsed release years.
- `film_genres.csv` — 2,541 ordered film–genre memberships across 21 labels.
- `data-dictionary.md`, `transformation-log.md`, and `curation-handoff.md` — schema, exact invariants, provenance limits, and downstream questions.

`Apollo 13` retains its source value `PG` in `release_year_raw` and has a null `release_year`; no external correction or enrichment was used. Poster URLs remain unverified optional material and require a local metadata-based fallback in every design direction.
