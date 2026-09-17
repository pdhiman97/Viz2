# IMDb Top 1000 — curated data dictionary

## Files

| File | Grain | Rows | Purpose |
| --- | --- | ---: | --- |
| `films.csv` | One selected-list film record | 1,000 | Primary record table for visual exploration. |
| `film_genres.csv` | One film–genre membership | 2,541 | Normalized genre relationships for filtering, grouping, and layout. |

Blank cells in the curated CSVs mean `null` / unknown; they do not mean zero or a negative value. Numeric values are written without display separators so they can be parsed as numbers. CSV itself carries no executable type schema; the types below are the intended contract.

## `films.csv`

| Field | Intended type | Definition / handling |
| --- | --- | --- |
| `record_id` | string | Stable local ID, `imdb-0001` through `imdb-1000`; based on source record order. |
| `source_record_number` | integer | One-based data-record position in the source, excluding its header. |
| `poster_url` | string | Source-supplied remote poster URL. It is structurally present for every row but has not been fetched, verified, or rights-cleared. |
| `title` | string | Source `Series_Title`; not unique. |
| `release_year_raw` | string | Source `Released_Year`, preserved for audit. |
| `release_year` | integer, nullable | Strict four-digit 1800–2099 release year. `Apollo 13` is null because its source value is `PG`; no external correction was made. |
| `certificate` | string, nullable | Source classification label, left unnormalized because systems and meanings are mixed. |
| `runtime_minutes` | integer | Source `Runtime` with the ` min` suffix removed. |
| `genre_raw` | string | Source comma-separated genre string; use `film_genres.csv` for relationship work. |
| `imdb_rating` | decimal | Source IMDb rating. It spans 7.6–9.3 in this selected list. |
| `overview` | string | Source plot overview. |
| `meta_score` | integer, nullable | Source score; no missing values were imputed. |
| `director` | string | Source director credit. |
| `star_1`–`star_4` | string | Four source-listed cast credits, kept in their supplied order. |
| `vote_count` | integer | Source `No_of_Votes`, with thousands separators removed. |
| `gross_amount` | integer, nullable | Source `Gross`, with thousands separators removed. Currency, market/territory, price basis, and inflation treatment are unknown, so it must not be labeled or compared as a normalized revenue measure. |

## `film_genres.csv`

| Field | Intended type | Definition / handling |
| --- | --- | --- |
| `record_id` | string | Foreign key to `films.csv`; all 1,000 film IDs are represented. |
| `genre_position` | integer | One-based position in the source genre string. |
| `genre_label` | string | Trimmed individual genre label. There are 21 distinct labels. |
