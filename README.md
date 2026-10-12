# ASTRA — Kundali Studio

A browser-local Indian astrology study app with real Swiss Ephemeris calculations, three chart layouts, a deliberate method registry, portable reports and no paid API. English/Hindi interface, light/dark themes, IndexedDB chart collection and static PWA packaging.

**Release:** 0.3.0. Core astronomical calculations are cross-checked; advanced traditional methods are experimental. This is an initial working release, not a claim that every Indian tradition has been implemented or certified. See [validation](docs/VALIDATION.md), [method choices](docs/METHODS.md) and [coverage](docs/COVERAGE.md).

## Run and build

Node 24 and pnpm 11.25.0 were used for this build. A Python 3 interpreter is also required for source archive packaging. No backend or secret key is required.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

```sh
pnpm check
pnpm test
pnpm build
```

`dist/` is a static deployment. Serve its root over HTTPS (or localhost for development), with `.wasm` served as `application/wasm`. The production build generates `sw.js` and `source.tar.xz`. The development server deliberately does not install a service worker. Preserve the pinned dependency lockfile.

The initial hosted preview is owner-private. For a public service, deploy the static output to a public HTTPS host and verify it from an anonymous session. Making the software free does not make hosting, domains or app-store accounts costless; host within a chosen provider's limits, allow optional donations, or self-host. All calculation features remain free without premium gating.

## Numerical regression suite

```sh
python3 -m pip install pyswisseph==2.10.3.2
pnpm validate
```

This regenerates 200 synthetic birth cases and 1,000 synthetic Panchang days, then checks them against Python Swiss Ephemeris 2.10.03. Both use the same upstream core: agreement is useful integration evidence, not independent astronomical certification. The actual results are in `tests/fixtures/numerical-summary.json`.

## App features

- Birthplace search: 549,024 Indian settlement records (cities, villages and neighbourhoods), 155,570 postal locality records across 19,238 PINs, and a worldwide city pack. Every listed locality for an exact PIN is returned. No population cutoff for India; district/state labels, Hindi aliases where supplied, state filtering and manual coordinate overrides. This snapshot is not certified coverage of every Indian village; postal coordinates are estimated.
- Civil-time validation, DST gap/fold handling, dates 1900–2100, explicit approximate/unknown birth time.
- Sun through Saturn, mean/true Rahu/Ketu; Lahiri, Raman and old Krishnamurti ayanamsha; whole-sign natal houses and named KP cusp convention.
- Animated cosmic interface, original ASTRA orbit logo, responsive layouts and reduced-motion support. Structured overview, full Graha data, 12-house lord/occupant tables, Parashari whole-sign aspects, independent dignity classifications, birth Panchang, naming syllables and inspectable condition screens.
- Reading-first English/Hindi report: Lagna/Moon reflection, six actual house-lord connections, birth Dasha balance and current MD/AD/PD themes. Moon-reference chart, sign-based Sade Sati/Dhaiya with retrograde re-entries, Kaal Sarp geometry, unreduced BAV/SAV/Prastara Ashtakavarga. Technical calculation metadata is optional in Advanced Settings.
- North, South and East SVG layouts; 16 selected varga variants; inspectable planetary precision and calculation passport.
- Vimshottari Mahadasha, Antardasha and Pratyantardasha; selectable year length.
- Panchang at Hindu geometric sunrise: Tithi, Nakshatra, Yoga, Karana, transition times, Rahu Kalam, Yamaganda, Gulika, daytime Hora/Choghadiya.
- Experimental raw Ashtakoota breakdown, Jaimini study tables, KP lord chains, current transits and a tropical solar-return explorer.
- Saved charts, JSON backup import/export, deduplication, recalculation of imported data, atomic batch import and local deletion.
- Browser Print / Save as PDF and downloadable standalone HTML Kundali report with embedded Latin/Devanagari fonts. Reports contain personal reading, D1/Moon/D9, birth factors, full planet details, all 12 houses, Mahadasha, 16-varga planetary matrix, condition notes, Saturn dates and Ashtakavarga; full regional matching/Panchang report templates remain future work.
- Versioned offline precache of the UI, WASM, fonts, worldwide cities and India manifest. India name/PIN shards load on demand and cache the last 128 used shards. Source archive is available online; it is excluded from the initial offline pack.

## Privacy and architecture

`BirthInput` is resolved to a canonical UTC instant by Temporal. A sequential Web Worker owns the stateful Swiss Ephemeris instance. Rules consume structured astronomical results. SVG/report renderers do not invent positions. Data is saved only when the user selects Save; IndexedDB lives in the current browser/origin. Export backups before clearing browser storage. Import files are validated, results recomputed, then committed as one batch.

The application sends no birth data to any service and includes no analytics, ads, AI model calls, login flow or paid key. Hosting may log normal asset requests and private-host authentication belongs to the hosting platform. Device storage is not encrypted by this app. The full India database is sharded to avoid downloading it at startup. Previously used searches may work offline after caching; unseen shards need a connection. Browser cache limits still apply.

The app makes numerical and traditional-rule outputs inspectable. Traditional interpretations are not scientifically established forecasts. Avoid deterministic claims and relationship verdicts when adding interpretation content.

## Sources, licence and roadmap

Application source: **AGPL-3.0-or-later**. Preserve upstream notices in [NOTICE.md](NOTICE.md) and the `vendor/` directory. Source and selected method references are included or pinned; GeoNames is separately attributed. Do not copy proprietary report text or scrape copyrighted texts to fill missing rule packs.

Next releases need actual browser/mobile/offline/print QA, independently sourced astronomical anchors, specialist review of traditional methods, and verified regional calendar packs. Shadbala, Ashtakavarga reductions/pindas, Porutham, conditional dashas, complete Tajika/KP/Prashna, Lal Kitab, Nadi, Pancha Pakshi and historical Siddhanta/Vakya modes are clearly marked research-required.

## Rebuild the India snapshot

Download GeoNames `export/dump/IN.zip` as `gazetteer.zip`, `export/zip/IN.zip` as `postal.zip`, plus `admin1CodesASCII.txt` and `admin2Codes.txt` as `admin1.txt` / `admin2.txt` into one directory. Run `python3 scripts/build-india-locations.py /path/to/downloads`. Current source archive includes the processed snapshot, source URLs, checksums and original readmes at `public/locations/`. Do not substitute a nearest settlement for a PIN locality: their coordinates have different precision.
