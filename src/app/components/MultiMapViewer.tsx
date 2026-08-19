"use client";

import { useEffect, useRef, useState } from "react";
import { Layers3, MapPin, Globe, Compass, Sparkles, Navigation } from "lucide-react";
import type { Seller } from "../data";

export type MapProvider = "google-road" | "google-sat" | "osm-free" | "carto-dark" | "carto-light" | "vector-svg";

interface MultiMapViewerProps {
  sellers: Seller[];
  selected: Seller;
  onSelect: (seller: Seller) => void;
}

const mapProviders: { id: MapProvider; name: string; tag: string; type: "google" | "free" | "custom" }[] = [
  { id: "osm-free", name: "OpenStreetMap", tag: "نقشه آزاد عمومی", type: "free" },
  { id: "google-road", name: "Google Maps (خیابان)", tag: "گوگل مپس جاده‌ای", type: "google" },
  { id: "google-sat", name: "Google Maps (ماهواره)", tag: "گوگل مپس ماهواره‌ای", type: "google" },
  { id: "carto-dark", name: "Carto Dark", tag: "نقشه تیره صنعتی", type: "free" },
  { id: "carto-light", name: "Carto Light", tag: "نقشه روشن صنعتی", type: "free" },
  { id: "vector-svg", name: "نقشه وکتور ایران", tag: "شماتیک اختصاصی", type: "custom" },
];

const tileUrls: Record<Exclude<MapProvider, "vector-svg">, { url: string; attribution: string }> = {
  "osm-free": {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  "google-road": {
    url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
    attribution: "&copy; Google Maps",
  },
  "google-sat": {
    url: "https://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}",
    attribution: "&copy; Google Maps Satellite",
  },
  "carto-dark": {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> & OpenStreetMap',
  },
  "carto-light": {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> & OpenStreetMap',
  },
};

export default function MultiMapViewer({ sellers, selected, onSelect }: MultiMapViewerProps) {
  const [provider, setProvider] = useState<MapProvider>("google-road");
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<Map<number, any>>(new Map());
  const tileLayerRef = useRef<any>(null);
  const [isLeafletReady, setIsLeafletReady] = useState(false);

  // Initialize Leaflet map client-side
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    async function initLeaflet() {
      try {
        const L = (await import("leaflet")).default;
        if (!isMounted || !mapContainerRef.current) return;

        if (!leafletMapRef.current) {
          // Centered on Iran (Tehran area center approx [34.5, 52.5])
          const map = L.map(mapContainerRef.current, {
            center: [34.8, 52.5],
            zoom: 6,
            zoomControl: false,
          });

          L.control.zoom({ position: "topleft" }).addTo(map);
          leafletMapRef.current = map;
        }

        const map = leafletMapRef.current;

        // Update tile layer if provider is not vector-svg
        if (provider !== "vector-svg") {
          const config = tileUrls[provider];
          if (tileLayerRef.current) {
            map.removeLayer(tileLayerRef.current);
          }
          const layer = L.tileLayer(config.url, {
            attribution: config.attribution,
            maxZoom: 19,
            subdomains: "abc",
          });
          layer.addTo(map);
          tileLayerRef.current = layer;
        }

        // Clear existing markers
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current.clear();

        // Add markers for current sellers if non-vector
        if (provider !== "vector-svg") {
          sellers.forEach((seller) => {
            const color = seller.type === "industrial" ? "#d6584d" : seller.type === "household" ? "#3977a8" : "#7a61a1";
            const isActive = selected?.id === seller.id;

            const iconHtml = `<div class="custom-marker-pin ${isActive ? "active" : ""}" style="background-color: ${color}">
              <div class="custom-marker-inner"></div>
            </div>`;

            const customIcon = L.divIcon({
              className: "custom-bldc-marker",
              html: iconHtml,
              iconSize: [28, 28],
              iconAnchor: [14, 28],
              popupAnchor: [0, -28],
            });

            const marker = L.marker([seller.lat, seller.lng], { icon: customIcon }).addTo(map);

            const popupContent = `
              <div style="font-family: Tahoma, sans-serif; text-align: right; padding: 2px;">
                <div style="font-weight: 800; font-size: 13px; color: #1e2b35;">${seller.name}</div>
                <div style="font-size: 11px; color: #64748b; margin-top: 2px;">📍 ${seller.city} · ${seller.zone}</div>
                <div style="font-size: 11px; color: #0284c7; font-weight: 700; margin-top: 4px;">⚡ ${seller.power} | ${seller.voltage}</div>
                <div style="font-size: 10px; background: #f1f5f9; padding: 3px 6px; border-radius: 6px; margin-top: 6px; display: inline-block;">
                  امتیاز فنی: <b>${seller.score}/100</b>
                </div>
              </div>
            `;

            marker.bindPopup(popupContent);
            marker.on("click", () => {
              onSelect(seller);
            });

            markersRef.current.set(seller.id, marker);
          });
        }

        setIsLeafletReady(true);
      } catch (err) {
        console.error("Leaflet init error:", err);
      }
    }

    initLeaflet();

    return () => {
      isMounted = false;
    };
  }, [provider, sellers]);

  // Pan to selected seller when selection or provider changes
  useEffect(() => {
    if (!leafletMapRef.current || provider === "vector-svg" || !selected) return;
    const map = leafletMapRef.current;
    map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom(), 8), {
      duration: 1.2,
    });

    // Open active marker popup
    const marker = markersRef.current.get(selected.id);
    if (marker) {
      marker.openPopup();
    }
  }, [selected, provider]);

  return (
    <div className="relative h-full min-h-[520px] w-full overflow-hidden rounded-2xl border border-[#dce2e1] bg-[#1a232e] shadow-sm">
      {/* Top Map Layer Selector Bar */}
      <div className="absolute top-3 right-3 left-3 z-[400] flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/20 bg-[#0f1722]/88 p-2 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-1.5 px-2 text-[11px] font-black text-white">
          <Layers3 size={16} className="text-[#3ed0a2]" />
          <span className="hidden sm:inline">انتخاب نقشه:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {mapProviders.map((p) => {
            const active = provider === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setProvider(p.id)}
                className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[10px] font-extrabold transition ${
                  active
                    ? p.type === "google"
                      ? "bg-[#ea4335] text-white shadow-md"
                      : p.type === "free"
                      ? "bg-[#2563eb] text-white shadow-md"
                      : "bg-[#10b981] text-white shadow-md"
                    : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
                }`}
                title={p.tag}
              >
                {p.type === "google" && <Globe size={13} />}
                {p.type === "free" && <Compass size={13} />}
                {p.type === "custom" && <Navigation size={13} />}
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Leaflet Dynamic Tile Map View */}
      <div
        ref={mapContainerRef}
        className={`h-full w-full transition-opacity duration-300 ${
          provider === "vector-svg" ? "pointer-events-none absolute opacity-0" : "relative opacity-100"
        }`}
      />

      {/* Custom Iranian Industrial Vector SVG Map View */}
      {provider === "vector-svg" && (
        <div className="relative h-full w-full">
          <IranVectorMap sellers={sellers} selected={selected} onSelect={onSelect} />
        </div>
      )}

      {/* Map Information Badge Footer */}
      <div className="absolute bottom-3 right-3 z-[400] flex items-center gap-2.5 rounded-xl border border-white/20 bg-[#0f1722]/90 px-3 py-2 text-[10px] text-white/90 shadow-xl backdrop-blur-md">
        <span className="flex items-center gap-1.5 font-bold">
          <MapPin size={13} className="text-[#38bdf8]" />
          {sellers.length} مرکز فروش و مونتاژ
        </span>
        <span className="h-3 w-px bg-white/20" />
        <span className="hidden sm:inline text-white/70">
          پشتیبانی از Google Maps، OpenStreetMap و نقشه صنعتی ایران
        </span>
      </div>
    </div>
  );
}

function IranVectorMap({ sellers: data, selected, onSelect }: { sellers: Seller[]; selected: Seller; onSelect: (s: Seller) => void }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,.8),transparent_36%),linear-gradient(145deg,#d8e5e0,#cbdad5)]">
      <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet" aria-label="نقشه شماتیک خوشه‌های BLDC ایران">
        <defs>
          <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M 8 0 L 0 0 0 8" fill="none" stroke="#7f9d94" strokeWidth=".12" opacity=".25" />
          </pattern>
          <filter id="shadow">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity=".18" />
          </filter>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />
        <path
          d="M11 24 L20 18 29 19 35 14 43 18 49 16 57 21 68 21 75 27 85 30 89 38 84 44 89 50 85 59 88 69 81 75 74 84 62 88 54 84 44 87 37 80 29 78 25 69 17 64 18 55 12 48 15 40 9 34Z"
          fill="#f8faf9"
          stroke="#8da69e"
          strokeWidth=".65"
          filter="url(#shadow)"
        />
        <path d="M23 31 Q42 39 50 57 T77 74 M39 20 Q43 42 42 63 T55 85 M15 48 Q35 52 57 49 T87 50" fill="none" stroke="#b9c9c4" strokeWidth=".35" strokeDasharray="1.2 1.2" opacity=".8" />
        <g fill="#8fa59e" fontSize="2.1" fontFamily="sans-serif" textAnchor="middle">
          <text x="54" y="51">تهران</text>
          <text x="22" y="26">تبریز</text>
          <text x="49" y="76">اصفهان</text>
          <text x="78" y="40">مشهد</text>
          <text x="60" y="79">یزد</text>
          <text x="40" y="43">قزوین</text>
        </g>
        {data.map((seller) => {
          const color = seller.type === "industrial" ? "#d6584d" : seller.type === "household" ? "#3977a8" : "#7a61a1";
          const active = selected.id === seller.id;
          return (
            <g key={seller.id} onClick={() => onSelect(seller)} className="cursor-pointer" role="button" aria-label={seller.name}>
              {active && (
                <circle cx={seller.mapX} cy={seller.mapY} r="4.2" fill={color} opacity=".17">
                  <animate attributeName="r" values="3.5;5;3.5" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <path
                d={`M${seller.mapX} ${seller.mapY + 2.8} C${seller.mapX - 3.4} ${seller.mapY - .5},${seller.mapX - 2.4} ${
                  seller.mapY - 4
                },${seller.mapX} ${seller.mapY - 4} C${seller.mapX + 2.4} ${seller.mapY - 4},${seller.mapX + 3.4} ${
                  seller.mapY - .5
                },${seller.mapX} ${seller.mapY + 2.8}Z`}
                fill={color}
                stroke="white"
                strokeWidth={active ? ".75" : ".45"}
                filter="url(#shadow)"
              />
              <circle cx={seller.mapX} cy={seller.mapY - 1.2} r=".8" fill="white" />
              {active && (
                <g>
                  <rect x={seller.mapX - 8} y={seller.mapY + 4} width="16" height="4.4" rx="1.4" fill="#203c34" />
                  <text x={seller.mapX} y={seller.mapY + 7} fill="white" fontSize="1.8" textAnchor="middle" fontWeight="700">
                    {seller.shortName} · {seller.city}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
