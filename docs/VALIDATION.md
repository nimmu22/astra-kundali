# Validation record

Release 0.3.0 · checked 11 October 2026 (task date).

## Executed

Twelve Node test groups pass. They cover invalid/leap dates, historical Kolkata offset, Julian-day conversion, DST gaps/repeated times, 23/25-hour civil days, varga boundaries, Vimshottari balance/nesting, KP boundaries, Rashi Drishti/Vasya splits, the J2000 integration anchor, node types, unknown-time suppression, polar sunrise behavior, solar-return root convergence, 729 synthetic matching pairs, and import validation/tampered-result rejection.

`pnpm validate` passes 200 synthetic birth cases and 1,000 synthetic Panchang days across seven locations, both hemispheres, years 1900–2099, three ayanamshas and alternating mean/true nodes. Reference: `pyswisseph==2.10.3.2`, Swiss Ephemeris 2.10.03. Tests check planet longitude/speed, sidereal ascendant, Placidus cusp convention, apparent ayanamsha, Hindu rise/set events, Panchang classifications and all four transition times.

| Quantity | Maximum measured difference |
|---|---:|
| Planet longitude | 5.48 × 10⁻⁹ degrees |
| Planet speed | 4.57 × 10⁻⁸ degrees/day |
| Ascendant | 6.06 × 10⁻¹¹ degrees |
| KP-convention cusp | 1.71 × 10⁻¹³ degrees |
| Ayanamsha | 0 degrees |
| Sunrise/sunset | 0.00174 seconds |
| Panchang transition | 0.000524 seconds |

Tolerance: 10⁻⁶ degrees for angular positions, 10⁻⁶ degrees/day for speed, 2 seconds for sunrise/sunset and 0.1 seconds for transitions. See machine-readable summary and cases in `tests/fixtures/`.

These differences measure **agreement between two bindings of the same engine**. They do not describe absolute astronomical accuracy. Moshier is deliberately selected; DE431/DE441 data-file accuracy is not claimed. Examples are synthetic regression fixtures, not certified classical example charts. Varga/Jaimini/KP/matching checks verify the stated implementation choices, not every lineage or cancellation rule.

New checks exercise all five structured detail sections in English/Hindi, dignity boundaries, 12-house occupancy, planetary aspects, full PIN row counts, village search and Hindi name aliases.

Additional static checks pass: English/Hindi React server rendering; nine planet labels in each North/South/East SVG; visual inspection of all three rendered SVG geometries; production precache inventory contains every WASM, worker, font and core location asset it references; India shards are deliberately on-demand. These checks do not verify browser interactions.

## New 0.3 checks

- All 203 Ashtakavarga reference charts match the extracted pinned original PyJHora `get_ashtaka_varga` function, cell-for-cell for BAV, SAV and contributor matrices. Included regression tests retain golden SAV vectors, totals and rotation invariance. This is agreement with the selected table convention, not a review of every classical variant.
- Saturn timeline segments are contiguous; each direct and retrograde boundary is checked at one second before/after through a 2000–2101 horizon. Supported-range clipping, invalid dates and unknown-time withholding are checked. The 100-year scan took about one second in Node. The root checks share the app engine; no independent almanac agreement is claimed.
- New personal reading, MD/AD/PD context, Kaal Sarp geometry, Saturn timeline and Ashtakavarga render in English/Hindi without NaN or undefined text. Unknown-time reports withhold dependent modules. Dasha interval boundaries, birth balance and Kaal Sarp axis/wrap cases pass.
- Technical engine/backend metadata is available in optional Advanced Settings; it is excluded from the personal report.

## Required before calling this production-verified

- Browser UI flows: create/save/reopen/delete, two-chart matching, Hindi/light/dark, manual location, backup import and export.
- Desktop/phone screenshots at 360/390/768/1440 pixels; SVG labels with unusually crowded charts; keyboard and screen-reader interaction.
- First install, update waiting/activation, loss of connectivity, offline cold reload, offline WASM initialization, cached location pack search, HTML download and font availability.
- Print-dialog PDF pagination and Devanagari output on Chromium, Safari and Firefox.
- IndexedDB transactional import, quota failures and interrupted calculations in actual browsers.
- Independent astronomical/reference datasets and specialist traditional-rule review.

Browser QA was unavailable in the managed build environment. No browser or live offline success is claimed. TypeScript, Node calculations, production build, static package and SSR checks were used instead; the source includes this limitation for reviewers.
