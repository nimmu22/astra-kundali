// Adapted from the pinned PyJHora Parashari tables and get_ashtaka_varga.
// Copyright Open Astro Technologies; modified by Sundar Sundaresan.
// SPDX-License-Identifier: AGPL-3.0-or-later
import {mod, parts, type ChartResult} from '../domain';
import tables from '../data/ashtakavarga-tables.json';

/** Rows/contributors follow the classical order, not Swiss Ephemeris IDs. */
export const ASHTAKAVARGA_PLANET_IDS = [0, 1, 4, 2, 5, 3, 6] as const;
export const ASHTAKAVARGA_CONTRIBUTOR_IDS = [...ASHTAKAVARGA_PLANET_IDS, 'lagna'] as const;
export const ASHTAKAVARGA_SOURCE = tables.source;

export interface AshtakavargaResult {
  planetIds: typeof ASHTAKAVARGA_PLANET_IDS;
  contributorIds: typeof ASHTAKAVARGA_CONTRIBUTOR_IDS;
  /** Seven planetary BAV rows; columns 0..11 are Aries..Pisces. */
  bav: number[][];
  /** Sum of the seven unreduced BAV rows; total 337. */
  sav: number[];
  /** Prastara: target planet × eight contributors × twelve zodiac signs. */
  contributors: number[][][];
  source: typeof ASHTAKAVARGA_SOURCE;
}

/**
 * Calculate unreduced Parashari BAV/SAV from sidereal D1 signs.
 * Lagna is required even though a separate Lagna target row is excluded.
 * Birth-time-dependent results are withheld for unknown birth times.
 */
export function ashtakavarga(chart: ChartResult): AshtakavargaResult | null {
  if (chart.input.certainty === 'unknown' || chart.ascendant === null || !Number.isFinite(chart.ascendant)) return null;
  const planets = ASHTAKAVARGA_PLANET_IDS.map(id => chart.planets.find(planet => planet.id === id));
  if (planets.some(planet => !planet || !Number.isInteger(planet.sign) || planet.sign < 0 || planet.sign > 11)) return null;
  const signs = planets.map(planet => planet!.sign);
  signs.push(parts(chart.ascendant).sign);

  const contributors = tables.beneficOffsets.map(row => row.map((offsets, contributor) => {
    const points = Array<number>(12).fill(0);
    for (const offset of offsets) points[mod(signs[contributor] + offset - 1, 12)] = 1;
    return points;
  }));
  const bav = contributors.map(row => Array.from({length: 12}, (_, sign) => row.reduce((sum, points) => sum + points[sign], 0)));
  const sav = Array.from({length: 12}, (_, sign) => bav.reduce((sum, row) => sum + row[sign], 0));
  return {planetIds: ASHTAKAVARGA_PLANET_IDS, contributorIds: ASHTAKAVARGA_CONTRIBUTOR_IDS, bav, sav, contributors, source: ASHTAKAVARGA_SOURCE};
}
