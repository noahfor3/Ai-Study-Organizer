"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { GlobeMethods } from "react-globe.gl";

type ReactGlobe = typeof import("react-globe.gl") extends { default: infer T } ? T : never;

import type { FirePoint } from "@/types/maps";

type Props = {
  fires: FirePoint[];
  center?: { latitude: number; longitude: number };
  heightPx?: number;
  autoRotate?: boolean;
};

type GlobePoint = {
  lat: number;
  lng: number;
  color: string;
  altitude: number;
  radius: number;
  fire: FirePoint;
};

const EARTH_TEXTURE = "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg";
const EARTH_BUMP = "https://unpkg.com/three-globe/example/img/earth-topology.png";

function normalizeBrightness(brightness?: number) {
  if (typeof brightness !== "number") return 0.15;
  const clamped = Math.min(Math.max(brightness, 290), 410);
  return (clamped - 290) / 120; // 0-1 range for visual scaling
}

function colorFromBrightness(brightness?: number) {
  if (typeof brightness !== "number") return "#38bdf8";
  if (brightness < 320) return "#38bdf8"; // calm (blue)
  if (brightness < 340) return "#22c55e"; // green
  if (brightness < 360) return "#f97316"; // orange
  if (brightness < 380) return "#f97316";
  return "#dc2626"; // severe
}

function formatTime(ts: FirePoint["timestamp"]) {
  if (!ts) return "—";
  const d = ts instanceof Date ? ts : new Date(ts);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

export function WildfireGlobe({ fires, center, heightPx = 420, autoRotate = true }: Props) {
  const [GlobeComponent, setGlobeComponent] = useState<ReactGlobe | null>(null);
  const globeRef = useRef<GlobeMethods | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const pointsData = useMemo<GlobePoint[]>(
    () =>
      fires.map((fire) => {
        const normalized = normalizeBrightness(fire.brightness);
        return {
          lat: fire.latitude,
          lng: fire.longitude,
          color: colorFromBrightness(fire.brightness),
          altitude: 0.02 + normalized * 0.18,
          radius: 0.2 + normalized * 0.9,
          fire,
        };
      }),
    [fires]
  );

  useEffect(() => {
    if (!globeRef.current) return;
    const controls = globeRef.current.controls?.();
    if (!controls) return;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 0.3;
  }, [autoRotate]);

  useEffect(() => {
    if (!globeRef.current) return;
    if (center) {
      globeRef.current.pointOfView(
        { lat: center.latitude, lng: center.longitude, altitude: 1.6 },
        1200
      );
      return;
    }

    if (!fires.length) return;
    globeRef.current.pointOfView(
      { lat: fires[0].latitude, lng: fires[0].longitude, altitude: 1.8 },
      1200
    );
  }, [center?.latitude, center?.longitude, fires]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof window === "undefined") return;

    const resize = () => {
      setDimensions({ width: el.clientWidth, height: el.clientHeight });
    };

    resize();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(resize);
      observer.observe(el);
      return () => observer.disconnect();
    }

    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [heightPx]);

  useEffect(() => {
    let mounted = true;
    void import("react-globe.gl").then((mod) => {
      if (!mounted) return;
      setGlobeComponent(() => mod.default);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative rounded-lg border border-white/5 bg-black/10"
      style={{ height: heightPx }}
    >
      {GlobeComponent ? (
        <GlobeComponent
          ref={globeRef}
          globeImageUrl={EARTH_TEXTURE}
          bumpImageUrl={EARTH_BUMP}
          backgroundColor="rgba(0,0,0,0)"
          width={dimensions.width || undefined}
          height={dimensions.height || undefined}
          pointAltitude={(d: GlobePoint) => d.altitude}
          pointRadius={(d: GlobePoint) => d.radius}
          pointColor={(d: GlobePoint) => d.color}
          pointLabel={(d: GlobePoint) => `
            <div style="font-size:12px;line-height:1.4">
              <div><strong>Brightness:</strong> ${d.fire.brightness ?? "—"} (${d.fire.brightnessCat ?? "—"})</div>
              <div><strong>FRP:</strong> ${d.fire.frp ?? "—"}</div>
              <div><strong>Confidence:</strong> ${d.fire.confidence ?? "—"}</div>
              ${
                typeof d.fire.distanceFromCenter === "number"
                  ? `<div><strong>Distance:</strong> ${d.fire.distanceFromCenter.toFixed(2)} mi</div>`
                  : ""
              }
              <div><strong>Time:</strong> ${formatTime(d.fire.timestamp)}</div>
            </div>
          `}
          pointsData={pointsData}
          atmosphereColor="rgba(255,140,0,0.35)"
          atmosphereAltitude={0.25}
          pointsTransitionDuration={400}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-sm opacity-70">
          Loading globe…
        </div>
      )}

      {fires.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm opacity-70">
          No detections available for the selected filters.
        </div>
      )}
    </div>
  );
}
