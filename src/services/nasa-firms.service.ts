import axios from 'axios';
import logger from '../lib/logger';
import {
  asConfidencePct,
  getBrightnessCat,
  isLikelyFlare,
  calculateDistanceMiles,
} from '../lib/fireUtils';
import { FireLocation } from '../types/fire.types';

function parseFiresCSV(
  csvText: string,
  centerLat: number,
  centerLon: number,
  radiusMiles: number,
  opts: { excludeFlares?: boolean; predictableOnly?: boolean } = {}
): FireLocation[] {
  const { excludeFlares = true, predictableOnly = false } = opts;

  try {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const dataLines = lines.slice(1);

    const fires = dataLines
      .map((line) => {
        const cols = line.split(',');
        if (cols.length < 14) return null;

        const [
          lat,
          lon,
          bright_ti4,
          scan,
          track,
          acq_date,
          acq_time,
          satellite,
          instrument,
          confidence,
          version,
          bright_ti5,
          frp,
          daynight,
        ] = cols;

        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        const brightness = parseFloat(bright_ti4);
        const frpVal = parseFloat(frp);
        const confidencePct = asConfidencePct(confidence);

        const distance = calculateDistanceMiles(
          centerLat,
          centerLon,
          latitude,
          longitude
        );

        if (distance > radiusMiles) return null;

        const hhmm = String(acq_time || '').padStart(4, '0');
        const iso = `${acq_date}T${hhmm.slice(0, 2)}:${hhmm.slice(
          2
        )}:00Z`;

        const brightnessCat = getBrightnessCat(brightness);
        const predictable = brightness >= 325 && confidencePct >= 50;

        if (excludeFlares && isLikelyFlare({
          daynight,
          frp: frpVal,
          brightness,
          confidence: confidencePct,
        })) {
          return null;
        }

        if (predictableOnly && !predictable) return null;

        return {
          latitude,
          longitude,
          brightness,
          confidence: confidencePct,
          satellite,
          instrument,
          frp: frpVal,
          daynight: daynight as 'D' | 'N',
          brightnessCat,
          predictable,
          timestamp: new Date(iso),
          distanceFromCenter: parseFloat(distance.toFixed(2)),
        };
      })
      .filter(Boolean) as FireLocation[];

    return fires;
  } catch (err: any) {
    logger.error('Error parsing FIRMS CSV:', err.message);
    return [];
  }
}

export async function fetchNearbyFires(
  centerLat: number,
  centerLon: number,
  radiusMiles: number,
  opts: { excludeFlares?: boolean; predictableOnly?: boolean } = {}
): Promise<FireLocation[]> {
  try {
    const apiKey = process.env.NASA_API_KEY;
    if (!apiKey) {
      throw new Error('NASA_API_KEY not configured');
    }

    const radiusDegrees = radiusMiles / 69;
    const south = centerLat - radiusDegrees;
    const north = centerLat + radiusDegrees;
    const west = centerLon - radiusDegrees;
    const east = centerLon + radiusDegrees;

    const url =
      `https://firms.modaps.eosdis.nasa.gov/api/area/csv/` +
      `${apiKey}/VIIRS_NOAA21_NRT/` +
      `${west.toFixed(2)},${south.toFixed(2)},${east.toFixed(
        2
      )},${north.toFixed(2)}/2`;

    logger.log(
      `Fetching FIRMS data for ${centerLat}, ${centerLon} (radius: ${radiusMiles} mi)`
    );

    const { data: csvText } = await axios.get(url, {
      headers: {
        'User-Agent': 'StudySafe-Lite-API (fire-education)',
      },
      responseType: 'text',
      timeout: 20000,
    });

    const fires = parseFiresCSV(
      csvText,
      centerLat,
      centerLon,
      radiusMiles,
      opts
    );

    logger.log(`✓ Fetched ${fires.length} fires within ${radiusMiles} miles`);

    return fires;
  } catch (err: any) {
    logger.error('NASA FIRMS API error:', err.message);
    throw err;
  }
}