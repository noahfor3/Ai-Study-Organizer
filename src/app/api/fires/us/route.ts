import { NextResponse } from "next/server";
import { fetchUSFires } from "@/services/nasa-firms.service";

export const runtime = "nodejs";

// Simple in-memory cache (per server process)
declare global {
  // eslint-disable-next-line no-var
  var __firesUSCache: { key: string; ts: number; payload: any } | undefined;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const excludeFlares = (searchParams.get("excludeFlares") ?? "true") === "true";
    const predictableOnly = (searchParams.get("predictableOnly") ?? "false") === "true";

    const daysRaw = searchParams.get("days") ?? "1";
    const days = Math.max(1, Math.min(2, Number(daysRaw))); // keep bounded

    const datasetRaw = (searchParams.get("dataset") ?? "VIIRS_SNPP_NRT").toUpperCase();
    const dataset =
      datasetRaw === "VIIRS_NOAA21_NRT" ? "VIIRS_NOAA21_NRT" : "VIIRS_SNPP_NRT";

    const cacheKey = JSON.stringify({ excludeFlares, predictableOnly, days, dataset });

    const now = Date.now();
    const ttlMs = 5 * 60 * 1000; // 5 minutes

    if (globalThis.__firesUSCache?.key === cacheKey) {
      if (now - globalThis.__firesUSCache.ts < ttlMs) {
        return NextResponse.json(globalThis.__firesUSCache.payload, { status: 200 });
      }
    }

    const fires = await fetchUSFires({ excludeFlares, predictableOnly, days, dataset });

    const payload = {
      mode: "us",
      bbox: { west: -125.0, south: 24.0, east: -66.0, north: 50.0 },
      dataset,
      days,
      opts: { excludeFlares, predictableOnly },
      fires,
      count: fires.length,
      // Map defaults
      center: { latitude: 38, longitude: -98 },
      zoom: 4,
      cachedAt: new Date().toISOString(),
    };

    globalThis.__firesUSCache = { key: cacheKey, ts: now, payload };

    return NextResponse.json(payload, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}