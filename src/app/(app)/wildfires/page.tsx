"use client";

import Link from "next/link";
import { useState } from "react";
import dynamic from "next/dynamic";

import type { FirePoint } from "@/types/maps";

// Leaflet + Globe must be client-only (no SSR)
const WildfireMap = dynamic(
  () => import("@/components/wildfire-map").then((m) => m.WildfireMap),
  { ssr: false }
);
const WildfireGlobe = dynamic(
  () => import("@/components/wildfire-globe").then((m) => m.WildfireGlobe),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] items-center justify-center rounded-lg border border-white/5 text-sm opacity-70">
        Loading 3D globe…
      </div>
    ),
  }
);

type NearbyFiresResponse = {
  center: {
    latitude: number;
    longitude: number;
    zipCode?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  radiusMiles: number;
  opts: { excludeFlares: boolean; predictableOnly: boolean };
  fires: FirePoint[];
  count: number;
};

export default function WildfiresPage() {
  const [zipCode, setZipCode] = useState("91730");
  const [radiusMiles, setRadiusMiles] = useState(100);
  const [excludeFlares, setExcludeFlares] = useState(true);
  const [predictableOnly, setPredictableOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"map" | "globe">("map");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<NearbyFiresResponse | null>(null);

  async function onSearch() {
    setLoading(true);
    setError(null);

    try {
      const qs = new URLSearchParams({
        zipCode,
        radiusMiles: String(radiusMiles),
        excludeFlares: String(excludeFlares),
        predictableOnly: String(predictableOnly),
      });

      const res = await fetch(`/api/fires/nearby?${qs.toString()}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error ?? "Request failed");
      }

      setData(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Wildfires Near You</h1>
          <p className="text-sm opacity-70">
            Enter a ZIP code to fetch NASA FIRMS (VIIRS) detections and visualize them on a map.
          </p>
        </div>

        <Link className="underline text-sm opacity-80" href="/wildfires-us">
          View US-wide map
        </Link>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1">
          <label className="text-sm">ZIP Code</label>
          <input
            className="border rounded px-3 py-2 bg-transparent"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder="91730"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm">Radius (miles)</label>
          <input
            type="number"
            className="border rounded px-3 py-2 bg-transparent w-32"
            min={1}
            max={500}
            value={radiusMiles}
            onChange={(e) => setRadiusMiles(Number(e.target.value))}
          />
        </div>

        <label className="flex gap-2 items-center text-sm">
          <input
            type="checkbox"
            checked={excludeFlares}
            onChange={(e) => setExcludeFlares(e.target.checked)}
          />
          Exclude gas flares
        </label>

        <label className="flex gap-2 items-center text-sm">
          <input
            type="checkbox"
            checked={predictableOnly}
            onChange={(e) => setPredictableOnly(e.target.checked)}
          />
          Predictable only
        </label>

        <button
          className="border rounded px-4 py-2"
          onClick={onSearch}
          disabled={loading}
        >
          {loading ? "Loading..." : "Search"}
        </button>
      </div>

      {/* Error */}
      {error && <div className="text-red-400 text-sm">{error}</div>}

      {/* Results */}
      {data && (
        <div className="space-y-3">
          <div className="text-sm">
            <b>Location:</b>{" "}
            {data.center.city ? `${data.center.city}, ` : ""}
            {data.center.state ? `${data.center.state} ` : ""}
            {data.center.zipCode ?? ""}
            <span className="opacity-70">
              {" "}
              (radius: {data.radiusMiles} mi, detections: {data.count})
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-medium">Map View</div>
            <div className="flex gap-2 rounded-full border border-white/10 p-1 text-sm">
              <button
                className={`rounded-full px-4 py-1 transition ${
                  viewMode === "map" ? "bg-white/90 text-black" : "opacity-70 hover:opacity-100"
                }`}
                onClick={() => setViewMode("map")}
              >
                2D Map
              </button>
              <button
                className={`rounded-full px-4 py-1 transition ${
                  viewMode === "globe" ? "bg-white/90 text-black" : "opacity-70 hover:opacity-100"
                }`}
                onClick={() => setViewMode("globe")}
              >
                3D Globe
              </button>
            </div>
          </div>

          {viewMode === "map" ? (
            <WildfireMap
              center={{ latitude: data.center.latitude, longitude: data.center.longitude }}
              radiusMiles={data.radiusMiles}
              fires={data.fires}
            />
          ) : (
            <WildfireGlobe
              center={{ latitude: data.center.latitude, longitude: data.center.longitude }}
              fires={data.fires}
            />
          )}

          {/* Optional: Simple list below map */}
          <div className="border rounded p-3">
            <div className="text-sm font-medium mb-2">Detections</div>
            <div className="text-sm opacity-80">
              {data.fires.length === 0
                ? "No detections found in this radius."
                : data.fires.slice(0, 10).map((f) => (
                    <div
                      key={`${f.latitude}-${f.longitude}-${String(f.timestamp ?? "")}`}
                      className="py-1 border-b last:border-b-0"
                    >
                      <b>{f.brightnessCat ?? "—"}</b> | Brightness: {f.brightness ?? "—"} | FRP:{" "}
                      {f.frp ?? "—"} | Distance:{" "}
                      {typeof f.distanceFromCenter === "number"
                        ? `${f.distanceFromCenter.toFixed(2)} mi`
                        : "—"}
                    </div>
                  ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
