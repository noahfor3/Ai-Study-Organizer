"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const WildfireMap = dynamic(
  () => import("@/components/wildfire-map").then((m) => m.WildfireMap),
  { ssr: false }
);

type FirePoint = {
  latitude: number;
  longitude: number;
  brightness?: number;
  frp?: number;
  confidence?: number | string;
  timestamp?: string | Date;
  brightnessCat?: string;
};

type USFiresResponse = {
  mode: "us";
  bbox: { west: number; south: number; east: number; north: number };
  dataset: string;
  days: number;
  opts: { excludeFlares: boolean; predictableOnly: boolean };
  fires: FirePoint[];
  count: number;
  center: { latitude: number; longitude: number };
  zoom: number;
  cachedAt: string;
};

export default function WildfiresUSPage() {
  const [excludeFlares, setExcludeFlares] = useState(true);
  const [predictableOnly, setPredictableOnly] = useState(false);
  const [days, setDays] = useState(1);
  const [dataset, setDataset] = useState<"VIIRS_SNPP_NRT" | "VIIRS_NOAA21_NRT">("VIIRS_SNPP_NRT");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<USFiresResponse | null>(null);

  async function loadUS() {
    setLoading(true);
    setError(null);

    try {
      const qs = new URLSearchParams({
        excludeFlares: String(excludeFlares),
        predictableOnly: String(predictableOnly),
        days: String(days),
        dataset,
      });

      const res = await fetch(`/api/fires/us?${qs.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Request failed");

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
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">US Wildfire Map</h1>
          <p className="text-sm opacity-70">
            View FIRMS detections across the US. Click markers for details.
          </p>
        </div>
        <Link className="underline text-sm opacity-80" href="/wildfires">
          ZIP search mode
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 items-end">
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

        <div className="space-y-1">
          <label className="text-sm">Days</label>
          <input
            type="number"
            className="border rounded px-3 py-2 bg-transparent w-24"
            min={1}
            max={2}
            value={days}
            onChange={(e) => setDays(Math.max(1, Math.min(2, Number(e.target.value))))}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm">Dataset</label>
          <select
            className="border rounded px-3 py-2 bg-transparent"
            value={dataset}
            onChange={(e) => setDataset(e.target.value as any)}
          >
            <option value="VIIRS_SNPP_NRT">VIIRS SNPP NRT</option>
            <option value="VIIRS_NOAA21_NRT">VIIRS NOAA-21 NRT</option>
          </select>
        </div>

        <button className="border rounded px-4 py-2" onClick={loadUS} disabled={loading}>
          {loading ? "Loading..." : "Load US Fires"}
        </button>
      </div>

      {error && <div className="text-red-400 text-sm">{error}</div>}

      {data && (
        <div className="space-y-3">
          <div className="text-sm">
            <b>Detections:</b> {data.count}{" "}
            <span className="opacity-70">
              (cached: {new Date(data.cachedAt).toLocaleString()})
            </span>
          </div>

          <WildfireMap
            center={data.center}
            radiusMiles={0}
            fires={data.fires}
            showRadius={false}
            zoom={data.zoom}
          />
        </div>
      )}
    </div>
  );
}