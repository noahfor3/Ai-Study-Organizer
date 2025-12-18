import axios from "axios";
import logger from "../lib/logger";
import {
  asConfidencePct,
  getBrightnessCat,
  isLikelyFlare,
  calculateDistanceMiles,
} from "../lib/fireUtils";
import { FireLocation } from "../types/fire.types";

/**
 * Parse FIRMS CSV and filter to a radius around a center point.
 */
function parseFiresCSV_Nearby(
  csvText: string,
  centerLat: number,
  centerLon: number,
  radiusMiles: number,
  opts: { excludeFlares?: boolean; predictableOnly?: boolean } = {}
): FireLocation[] {
  const { excludeFlares = true, predictableOnly = false } = opts;

  try {
    const lines = csvText.trim().split("\n");
    if (lines.length < 2) return [];

    const dataLines = lines.slice(1);

    return dataLines
      .map((line) => {
        const cols = line.split(",");
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

        if (!Number.isFinite(distance) || distance > radiusMiles) return null;

        const hhmm = String(acq_time || "").padStart(4, "0");
        const iso = `${acq_date}T${hhmm.slice(0, 2)}:${hhmm.slice(2)}:00Z`;

        const brightnessCat = getBrightnessCat(brightness);
        const predictable = brightness >= 325 && confidencePct >= 50;

        if (
          excludeFlares &&
          isLikelyFlare({
            daynight,
            frp: frpVal,
            brightness,
            confidence: confidencePct,
          })
        ) {
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
          daynight: daynight as "D" | "N",
          brightnessCat,
          predictable,
          timestamp: new Date(iso),
          distanceFromCenter: parseFloat(distance.toFixed(2)),
        } as FireLocation;
      })
      .filter(Boolean) as FireLocation[];
  } catch (err: any) {
    logger.error("Error parsing FIRMS CSV (nearby):", err.message);
    return [];
  }
}

/**
 * Parse FIRMS CSV for a US bbox pull (no distanceFromCenter).
 */
function parseFiresCSV_US(
  csvText: string,
  opts: { excludeFlares?: boolean; predictableOnly?: boolean } = {}
): FireLocation[] {
  const { excludeFlares = true, predictableOnly = false } = opts;

  try {
    const lines = csvText.trim().split("\n");
    if (lines.length < 2) return [];

    const dataLines = lines.slice(1);

    return dataLines
      .map((line) => {
        const cols = line.split(",");
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

        const hhmm = String(acq_time || "").padStart(4, "0");
        const iso = `${acq_date}T${hhmm.slice(0, 2)}:${hhmm.slice(2)}:00Z`;

        const brightnessCat = getBrightnessCat(brightness);
        const predictable = brightness >= 325 && confidencePct >= 50;

        if (
          excludeFlares &&
          isLikelyFlare({
            daynight,
            frp: frpVal,
            brightness,
            confidence: confidencePct,
          })
        ) {
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
          daynight: daynight as "D" | "N",
          brightnessCat,
          predictable,
          timestamp: new Date(iso),
        } as FireLocation;
      })
      .filter(Boolean) as FireLocation[];
  } catch (err: any) {
    logger.error("Error parsing FIRMS CSV (US):", err.message);
    return [];
  }
}

/**
 * ZIP mode: fetch fires within radius miles of a point.
 */
export async function fetchNearbyFires(
  centerLat: number,
  centerLon: number,
  radiusMiles: number,
  opts: { excludeFlares?: boolean; predictableOnly?: boolean } = {},
  dataset: "VIIRS_SNPP_NRT" | "VIIRS_NOAA21_NRT" = "VIIRS_NOAA21_NRT",
  days: number = 2
): Promise<FireLocation[]> {
  const apiKey = process.env.NASA_API_KEY;
  if (!apiKey) throw new Error("NASA_API_KEY not configured");

  // quick bbox around point
  const radiusDegrees = radiusMiles / 69;
  const south = centerLat - radiusDegrees;
  const north = centerLat + radiusDegrees;
  const west = centerLon - radiusDegrees;
  const east = centerLon + radiusDegrees;

  logger.log(
    `Fetching FIRMS nearby (dataset=${dataset}, days=${days}) center=${centerLat},${centerLon} radius=${radiusMiles}mi`
  );

  const url =
    `https://firms.modaps.eosdis.nasa.gov/api/area/csv/` +
    `${apiKey}/${dataset}/` +
    `${west.toFixed(2)},${south.toFixed(2)},${east.toFixed(2)},${north.toFixed(2)}/${days}`;

  const { data: csvText } = await axios.get(url, {
    headers: { "User-Agent": "StudySafe-Lite (nearby)" },
    responseType: "text",
    timeout: 25000,
  });

  const fires = parseFiresCSV_Nearby(csvText, centerLat, centerLon, radiusMiles, opts);
  logger.log(`✓ Nearby fires fetched: ${fires.length}`);
  return fires;
}

/**
 * US mode: fetch fires across a US bbox (CONUS-ish).
 */
export async function fetchUSFires(
  opts: {
    excludeFlares?: boolean;
    predictableOnly?: boolean;
    days?: number; // keep small (1-2)
    dataset?: "VIIRS_SNPP_NRT" | "VIIRS_NOAA21_NRT";
  } = {}
): Promise<FireLocation[]> {
  const {
    excludeFlares = true,
    predictableOnly = false,
    days = 1,
    dataset = "VIIRS_SNPP_NRT",
  } = opts;

  const apiKey = process.env.NASA_API_KEY;
  if (!apiKey) throw new Error("NASA_API_KEY not configured");

  // US bounding box (roughly CONUS)
  const west = -125.0;
  const south = 24.0;
  const east = -66.0;
  const north = 50.0;

  logger.log(`Fetching FIRMS US bbox (dataset=${dataset}, days=${days})`);

  const url =
    `https://firms.modaps.eosdis.nasa.gov/api/area/csv/` +
    `${apiKey}/${dataset}/` +
    `${west},${south},${east},${north}/${days}`;

  const { data: csvText } = await axios.get(url, {
    responseType: "text",
    timeout: 60000,
    headers: { "User-Agent": "StudySafe-Lite (US)" },
  });

  const fires = parseFiresCSV_US(csvText, { excludeFlares, predictableOnly });
  logger.log(`✓ US fires fetched: ${fires.length}`);
  return fires;
}