import { NextResponse } from "next/server";

import { zipCodeToCoordinates } from "@/services/geocoding.service";
import { fetchNearbyFires } from "@/services/nasa-firms.service";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const zipCode = searchParams.get("zipCode")?.trim();
    const radiusMilesRaw = searchParams.get("radiusMiles") ?? "100";
    const excludeFlares = (searchParams.get("excludeFlares") ?? "true") === "true";
    const predictableOnly = (searchParams.get("predictableOnly") ?? "false") === "true";

    if (!zipCode) {
      return NextResponse.json({ error: "zipCode is required (e.g., 91730)" }, { status: 400 });
    }

    const radiusMiles = Number(radiusMilesRaw);
    if (!Number.isFinite(radiusMiles) || radiusMiles <= 0 || radiusMiles > 500) {
      return NextResponse.json(
        { error: "radiusMiles must be a number between 1 and 500" },
        { status: 400 }
      );
    }

    // ✅ Your geocoder returns { latitude, longitude }
    const geo = await zipCodeToCoordinates(zipCode);
    const centerLat = geo.latitude;
    const centerLon = geo.longitude;

    const fires = await fetchNearbyFires(centerLat, centerLon, radiusMiles, {
      excludeFlares,
      predictableOnly,
    });

    // ✅ Return a structured payload for the UI + map
    return NextResponse.json(
      {
        center: {
          latitude: centerLat,
          longitude: centerLon,
          zipCode,
          city: geo.city,
          state: geo.state,
          country: geo.country,
        },
        radiusMiles,
        opts: { excludeFlares, predictableOnly },
        fires,
        count: fires.length,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}