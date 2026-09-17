# IMDb Top 1000 — transformation log

## Source

- Input: repository-local `imdb_top_1000.csv`, a 1,000-record × 16-field CSV.
- Input SHA-256: `22061a1dfb302c672d9bc4e8ddefc290fd8d9e871b96643009033a8df52231f1`.
- Source provenance, collection date, methodology, license, and poster-image rights are not supplied. The source file was read only and remains unchanged at the repository root.

## Mechanical transformations

| Source field | Curated field(s) | Operation | Semantic change? |
| --- | --- | --- | --- |
| source row order | `record_id`, `source_record_number` | Added deterministic local identifiers, from one-based source data-record order. | No. |
| `Poster_Link` | `poster_url` | Renamed only. | No. |
| `Series_Title` | `title` | Renamed only. | No. |
| `Released_Year` | `release_year_raw`, `release_year` | Preserved raw text; parsed strict four-digit 1800–2099 values to integer-formatted values. The sole invalid value, `Apollo 13` = `PG`, becomes null in `release_year`. | No correction or imputation. |
| `Certificate` | `certificate` | Renamed; blanks stay null and labels remain unnormalized. | No. |
| `Runtime` | `runtime_minutes` | Removed the uniform ` min` suffix and parsed the remaining positive integer. | No. |
| `Genre` | `genre_raw`, `film_genres.csv` | Preserved raw string and split comma-separated labels into ordered relation rows after whitespace trimming. | No. |
| `IMDB_Rating` | `imdb_rating` | Parsed numeric value. | No. |
| `Overview`, `Director`, `Star1`–`Star4` | corresponding text fields | Renamed only. | No. |
| `Meta_score` | `meta_score` | Parsed integer when present; blanks stay null. | No imputation. |
| `No_of_Votes` | `vote_count` | Removed thousands separators and parsed integer. | No. |
| `Gross` | `gross_amount` | Removed thousands separators and parsed integer when present; blanks stay null. | No currency or inflation interpretation. |

## Output checks

- `films.csv`: 1,000 data rows, 19 fields; its 1,000 `record_id` values are unique.
- `film_genres.csv`: 2,541 data rows, 3 fields; 21 genre labels; every film has at least one genre relation.
- Genre memberships per film: 105 films have one, 249 have two, and 646 have three (1,000 total).
- One and only one parsed release year is null: `imdb-0967` / *Apollo 13* / raw value `PG`.
- Curated output SHA-256: `films.csv` `749c1ea9fd733d09d9ceadcdad6ff670682065e07ca2134b4fb6aebe8e7e238c`; `film_genres.csv` `ce802a14040326b7477824d8023daf5589a5918fb202f12db47ee9d9c8717f63`.
