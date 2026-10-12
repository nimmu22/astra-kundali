# Calculation and method choices

## Astronomy and time

Swiss Ephemeris **2.10.03**, through `@swisseph/browser` **1.4.0**. Explicit Moshier (4), speed (256) and sidereal (65536) flags. Every planet calculation verifies the returned backend bits. No external Swiss/JPL files, paid API or silent fallback. Supported civil dates 1900–2100, proleptic Gregorian calendar. Angles remain unrounded internally. A normalization correction preserves exact positive boundary angles without adding 360 first.

IANA timezone names and Temporal disambiguation resolve civil input to UTC. Reject non-existent DST times even if earlier/later is selected; reject repeated times unless the user chooses an occurrence. Historical rules come from platform Intl; the exact tzdb version is not exposed and is never fabricated. Location latitude/longitude and selected timezone are stored separately. GeoNames coordinates are city centroids, so manual override is supported.

Lahiri (Swiss sidereal mode 1), Raman (3), Krishnamurti old (5). Apparent ayanamsha from `getAyanamsaExUt(jd, 4)`. Geocentric apparent positions, mean or true north node, Ketu at Rahu +180°. Natal houses are whole-sign from the sidereal ascendant. KP study cusps use tropical Placidus minus the selected apparent ayanamsha; this is a named convention rather than a claim of all KP lineages. KP cusps withheld at |latitude| ≥66°. Unknown time uses local day start as an explicit reference, shows Moon day range, and withholds ascendant, houses, divisional selector and dasha timing.

## Vargas

Zero-based sign `s`, degree in sign `d`, segment `k=floor(N*d/30)`; sign results reduced modulo 12. Odd zodiac signs have even zero-based indexes. Selected references: [PyJHora charts at commit 48e57d29b47a3143519910a24866758116467485](https://github.com/naturalstupid/PyJHora/blob/48e57d29b47a3143519910a24866758116467485/src/jhora/horoscope/chart/charts.py).

| Division | Selected mapping |
|---|---|
| D1 | Original sidereal longitude |
| D2 | Two-sign Hora: odd Leo/Cancer, even Cancer/Leo |
| D3 / D4 | `s+4k` / `s+3k` |
| D7 | odd `s+k`, even `s+6+k`, forward |
| D9 | Element starts Aries/Capricorn/Libra/Cancer +k |
| D10 | odd `s+k`, even `s+8+k`, forward |
| D12 | `s+k` |
| D16 / D45 | Modality starts Aries/Leo/Sagittarius +k |
| D20 | Modality starts Aries/Sagittarius/Leo +k |
| D24 | odd Leo+k, even Cancer+k |
| D27 | Element starts Aries/Cancer/Libra/Capricorn +k |
| D30 | Unequal half-open sign segments; table below |
| D40 | odd Aries+k, even Libra+k |
| D60 | Natal-sign start `s+k`; alternatives are not substituted |

D30 odd segments: [0,5) Aries, [5,10) Aquarius, [10,18) Sagittarius, [18,25) Gemini, [25,30) Libra. Even segments: [0,5) Taurus, [5,12) Virgo, [12,20) Pisces, [20,25) Capricorn, [25,30) Scorpio. Boundaries belong to the segment beginning there. This resolves overlap in the upstream inclusive checks. Divisional degree is `(N*d)%30`, including D30 (upstream harmonic degree convention), rather than re-scaling unequal D30 segments. D60 and other high vargas require careful birth-time uncertainty review.

## Dasha, KP and Jaimini

Vimshottari starts from Moon's Nakshatra lord: Ketu7, Venus20, Sun6, Moon10, Mars7, Rahu18, Jupiter16, Saturn19, Mercury17 years. Fractional traversed Nakshatra backtracks the full Mahadasha start. UI includes birth balance, two cycles, and nested sub-periods proportional to 120 years. Year length is user-selected 365.25636, 365.25 or 360 days. KP star/sub/sub-sub intervals follow this same proportional sequence, with half-open boundaries.

Jaimini 7/8 Chara Karakas rank degree within sign, reversing Rahu's degree for the 8-planet choice; Ketu omitted, ties resolved by Swiss body ID. Rashi Drishti: movable to fixed except the adjacent fixed sign; fixed to movable except the adjacent movable sign; dual to the other dual signs. Arudha uses fixed seven-planet sign rulers, doubled inclusive-distance equivalent with self/seventh exception moved ten signs from computed Pada. Scorpio/Aquarius co-ruler strength selection is **not** implemented. Karakamsha is natal Atmakaraka's D9 sign. These are explicitly experimental traditional variants.

## Panchang and transits

Hindu geometric sunrise: Sun centre crossing true altitude zero, no refraction, Sun ecliptic latitude zero, observer elevation zero. It is not civil/almanac sunrise with upper limb/refraction. Root search scans each local civil day then bisects. Polar days lacking a complete pair withhold daily windows.

At sunrise: Tithi=floor((Moon−Sun mod360)/12), Nakshatra=floor(sidereal Moon/(40/3)), Yoga=floor((sidereal Moon+Sun mod360)/(40/3)), Karana=floor((Moon−Sun mod360)/6). Transition roots are bracketed hourly then bisected. Civil weekday controls common Rahu/Yamaganda/Gulika tables. Only daytime Hora/Choghadiya are shown; regional festivals, month naming and night windows are not implemented.

Transits compare current sidereal positions against natal positions/Moon. Solar return solves tropical Sun's return to its natal tropical longitude, then renders a chart at the natal location with the selected profile. It is not full Tajika annual prediction or relocated return; time output is to the second.

## Matching and interpretation

[PyJHora compatibility source, pinned commit](https://github.com/naturalstupid/PyJHora/blob/48e57d29b47a3143519910a24866758116467485/src/jhora/horoscope/match/compatibility.py): tables extracted into `src/data/matching-tables.json`, female row/male column. Varna1, Vasya2, Tara3, Yoni4, Graha Maitri5, Gana6, Bhakoot7, Nadi8. Raw score only; cancellations/Porutham unsupported.

Deliberate differences from that source: Vasya uses exact Moon degree for Sagittarius/Capricorn 15° split instead of a pada approximation. Tara uses inclusive star counts and favourable remainders 0,2,4,6,8. The upstream selected implementation uses a differing remainder condition; this app does not claim equivalence to every upstream score. Both choices need specialist review. Scores do not determine compatibility scientifically or offer a relationship verdict. Unknown birth times cannot enter matching.

Interpretation pairs original editorial zodiac reflection text with actual house-lord placements, occupants and current MD/AD/PD themes. These are conventional reflection prompts, not an individualized event forecast. Moon–Jupiter Kendra / Mars-house screens remain experimental. No paid remedy, fear claim, arbitrary strength score, wealth guarantee or AI-generated fate. Complete yoga strength/cancellation rules remain future work.

## Reading, Moon chart and additional screens (0.3)

The default report starts with original English/Hindi reflection descriptions of Lagna and Moon signs, explains the Nakshatra's role in birth Dasha, lists six life areas through their actual whole-sign house lords/occupants and shows current MD/AD/PD intervals. Dignity labels remain separate from Shadbala. The Moon chart uses natal Moon sign as the reference; it does not recalculate longitudes. Unknown-time sign/star readings explicitly use local day-start reference values; house connections, Dasha, Ashtakavarga and Saturn timeline are withheld.

Kaal Sarp is a geometric screen: seven Sun–Saturn planets strictly within either Rahu–Ketu semicircle. Exact conjunctions within 1e-7 degree of the axis are unresolved. No lineage-specific types, exceptions, harmful outcomes or remedy verdicts are inferred. Convention reference: https://www.astrosage.com/free/kaalsarp-yog.asp .

Sade Sati uses sidereal Saturn in the 12th, 1st and 2nd sign relative to natal Moon; Dhaiya uses the 4th/8th. Convention reference: https://www.astrosage.com/free/sade-sati-report.asp . The engine scans daily from birth through January 1 of birth year +101, capped at January 1, 2101, with 22 bisections for each sign change. It includes direct and retrograde re-entries. Table rows touching the coverage endpoints are explicitly clipped; they are not actual ingress/egress dates. It is a selected sign-based convention with the chart's ayanamsha, not an event forecast or independent almanac certification.

Ashtakavarga uses the unreduced Parashari offsets from PyJHora commit 48e57d29b47a3143519910a24866758116467485, with exact provenance/license in `src/data/ashtakavarga-tables.json`. Seven target rows are Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn; eight contributors include Lagna. Columns are Aries through Pisces. BAV row totals are 48,49,39,54,56,52,39; SAV total is337, excludes a separate Lagna target row. Prastara shows every contribution. No alternate reverse tables, Trikona/Ekadhipatya reductions or pindas are applied. The app and derived tables are AGPL-3.0-or-later; original copyright is retained.

## Explained evidence and the studio example

Original English/Hindi editorial explanations connect each whole-sign D1 house to
its actual lord placement, occupants and received Parashari graha drishti.
Planetary themes and practical house examples explain the notation; they do not
measure personality or forecast events. Nodes receive no invented sign ownership
or graha aspects. The dedicated house section covers all twelve houses; the six
life-area groups reuse the relevant house evidence.

MD, AD and PD each display their own natal placement and sign ownership. The
next-period table retains full intervals and can cross a major-period boundary.
Nakshatra progress is the Moon's arc within 13°20′; the remaining fraction explains
birth Dasha balance. Unknown birth time withholds house/period evidence.

The public studio tour uses a fictional 1 January 2000, 12:00 Jaipur chart,
26°55′N, 75°47′E, Lahiri/mean nodes. Its checked fixture is computed with the same
engine, not placeholder positions. Opening it recomputes in the worker and never
automatically saves it. The sample birth Panchang is not today's daily Panchang.
