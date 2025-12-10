"use client";

import { useEffect, useMemo, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

type FirePoint = {
  latitude: number;
  longitude: number;
  brightness?: number;
  frp?: number;
  confidence?: number | string;
  distanceFromCenter?: number;
  timestamp?: string | Date;
  brightnessCat?: string;
};

type Props = {
  center: { latitude: number; longitude: number };
  radiusMiles?: number; // optional for US-wide mode
  fires: FirePoint[];
  zoom?: number;
  heightPx?: number;
  showRadiusCircle?: boolean;
};

function formatTime(ts: FirePoint["timestamp"]) {
  if (!ts) return "—";
  const d = ts instanceof Date ? ts : new Date(ts);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

export function WildfireMap({
  center,
  radiusMiles,
  fires,
  zoom = 9,
  heightPx = 420,
  showRadiusCircle = true,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  const radiusMeters = useMemo(() => {
    if (!radiusMiles || radiusMiles <= 0) return 0;
    return radiusMiles * 1609.34;
  }, [radiusMiles]);

  // Fix default marker icons (Next/Turbopack)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const DefaultIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (L.Marker.prototype as any).options.icon = DefaultIcon;
  }, []);

  // Create map once (and HARD clean container to avoid "already initialized")
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // If Fast Refresh / dev-mode left Leaflet metadata behind, clear it
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyEl = el as any;
    if (anyEl._leaflet_id) {
      try {
        delete anyEl._leaflet_id;
      } catch {
        // ignore
      }
    }
    // Also clear children (Leaflet injects panes)
    el.innerHTML = "";

    const map = L.map(el, {
      zoomControl: true,
      attributionControl: true,
    }).setView([center.latitude, center.longitude], zoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    const markers = L.layerGroup().addTo(map);

    mapRef.current = map;
    markersRef.current = markers;

    // initial circle (optional)
    if (showRadiusCircle && radiusMeters > 0) {
      circleRef.current = L.circle([center.latitude, center.longitude], {
        radius: radiusMeters,
      }).addTo(map);
    }

    return () => {
      // Full cleanup
      try {
        markers.clearLayers();
      } catch {
        // ignore
      }

      try {
        map.remove();
      } catch {
        // ignore
      } finally {
        mapRef.current = null;
        markersRef.current = null;
        circleRef.current = null;
      }
    };
    // IMPORTANT: create map only once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update view when center/zoom changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setView([center.latitude, center.longitude], zoom, { animate: false });
  }, [center.latitude, center.longitude, zoom]);

  // Update / toggle circle
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // remove existing circle if any
    if (circleRef.current) {
      try {
        circleRef.current.remove();
      } catch {
        // ignore
      }
      circleRef.current = null;
    }

    if (showRadiusCircle && radiusMeters > 0) {
      circleRef.current = L.circle([center.latitude, center.longitude], {
        radius: radiusMeters,
      }).addTo(map);
    }
  }, [center.latitude, center.longitude, radiusMeters, showRadiusCircle]);

  // Update markers when fires change
  useEffect(() => {
    const markers = markersRef.current;
    if (!markers) return;

    markers.clearLayers();

    for (const f of fires) {
      const popupHtml = `
        <div style="font-size:12px; line-height:1.35">
          <div><b>Brightness:</b> ${f.brightness ?? "—"} (${f.brightnessCat ?? "—"})</div>
          <div><b>FRP:</b> ${f.frp ?? "—"}</div>
          <div><b>Confidence:</b> ${String(f.confidence ?? "—")}</div>
          ${
            typeof f.distanceFromCenter === "number"
              ? `<div><b>Distance:</b> ${f.distanceFromCenter.toFixed(2)} mi</div>`
              : ""
          }
          <div><b>Time:</b> ${formatTime(f.timestamp)}</div>
        </div>
      `;

      L.marker([f.latitude, f.longitude]).bindPopup(popupHtml).addTo(markers);
    }
  }, [fires]);

  return <div ref={containerRef} style={{ height: heightPx, width: "100%" }} />;
}