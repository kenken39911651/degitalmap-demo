"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { MapCategory, Pin } from "@/lib/types";
import {
  applyBrandTint,
  applyJapaneseLabels,
  BasemapToggleControl,
  styleUrlFor,
} from "./maptilerBasemap";

export interface MapCanvasHandle {
  flyTo(lat: number, lng: number, zoom?: number): void;
  openPopup(pinId: string): void;
}

interface MapCanvasProps {
  centerLat: number;
  centerLng: number;
  zoom: number;
  basemap: "std" | "photo";
  brandColor?: string;
  centerLabel?: string;
  categories: MapCategory[];
  pins: Pin[];
  activeCategoryIds: Set<string>;
  onMarkerClick?: (pinId: string) => void;
  /** Admin mode: clicking the map drops a new pin at that location. */
  onMapClick?: (lat: number, lng: number) => void;
}

function escapeHtml(str: string) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  return `${d.getMonth() + 1}/${d.getDate()}(${days[d.getDay()]})`;
}

function makePinElement(color: string, cancelled: boolean) {
  const el = document.createElement("div");
  el.style.cssText = `
    background:${color}; width:26px; height:26px; border-radius:50% 50% 50% 0;
    transform: rotate(-45deg); border:2px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,0.3);
    opacity:${cancelled ? "0.45" : "1"}; cursor:pointer;
  `;
  return el;
}

function popupHtml(pin: Pin, category: MapCategory | undefined) {
  const cancelledBadge =
    pin.status === "cancelled"
      ? `<span class="popup-badge popup-badge--cancelled">中止</span>`
      : "";
  const titleStyle = pin.status === "cancelled" ? "text-decoration:line-through;" : "";
  const meta = [pin.date ? formatDate(pin.date) : null, pin.time_label]
    .filter(Boolean)
    .join("｜");
  return `
    <div class="popup-content">
      <div class="popup-title" style="${titleStyle}">${pin.emoji} ${escapeHtml(pin.title)} ${cancelledBadge}</div>
      ${meta ? `<div class="popup-meta">${escapeHtml(meta)}</div>` : ""}
      ${pin.place_note ? `<div class="popup-meta">📍 ${escapeHtml(pin.place_note)}</div>` : ""}
      ${pin.description ? `<div class="popup-desc">${escapeHtml(pin.description)}</div>` : ""}
      ${category ? `<div class="popup-meta">${escapeHtml(category.label)}</div>` : ""}
    </div>
  `;
}

const MapCanvas = forwardRef<MapCanvasHandle, MapCanvasProps>(function MapCanvas(
  {
    centerLat,
    centerLng,
    zoom,
    basemap,
    brandColor = "#c0472e",
    centerLabel,
    categories,
    pins,
    activeCategoryIds,
    onMarkerClick,
    onMapClick,
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const centerMarkerRef = useRef<maplibregl.Marker | null>(null);
  const markersRef = useRef<Record<string, maplibregl.Marker>>({});
  const onMarkerClickRef = useRef(onMarkerClick);
  const onMapClickRef = useRef(onMapClick);

  onMarkerClickRef.current = onMarkerClick;
  onMapClickRef.current = onMapClick;

  // Map init (once)
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleUrlFor(basemap),
      center: [centerLng, centerLat],
      zoom,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-left");
    map.addControl(
      new BasemapToggleControl(basemap, brandColor, () => {
        /* handled via re-render on parent state if needed */
      }),
      "top-right"
    );

    map.once("style.load", () => {
      applyBrandTint(map, basemap, brandColor);
      applyJapaneseLabels(map);
    });

    map.on("click", (e) => {
      onMapClickRef.current?.(e.lngLat.lat, e.lngLat.lng);
    });

    mapRef.current = map;

    // flexレイアウト内ではマウント時にコンテナの高さが未確定なことがあり、
    // その場合MapLibreのCanvasが白紙のまま固まる。サイズ変化を監視して
    // 都度resize()を呼び、レイアウト確定後も正しく描画されるようにする。
    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Center marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const el = document.createElement("div");
    el.style.cssText = `
      background:#2b2a26; color:#fff; border-radius:999px;
      width:34px; height:34px; display:flex; align-items:center; justify-content:center;
      font-size:16px; box-shadow:0 2px 8px rgba(0,0,0,0.35); border:2px solid #fff;
    `;
    el.textContent = "📍";

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([centerLng, centerLat])
      .addTo(map);

    if (centerLabel) {
      marker.setPopup(
        new maplibregl.Popup({ offset: 20 }).setHTML(
          `<div class="popup-content"><div class="popup-title">${escapeHtml(centerLabel)}</div></div>`
        )
      );
    }

    centerMarkerRef.current = marker;
    return () => {
      marker.remove();
    };
  }, [centerLat, centerLng, centerLabel]);

  // Pin markers, re-rendered when data/filter changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    function render() {
      Object.values(markersRef.current).forEach((m) => m.remove());
      markersRef.current = {};

      const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]));

      pins
        .filter((p) => p.status !== "hidden")
        .filter((p) => !p.category_id || activeCategoryIds.has(p.category_id))
        .forEach((pin) => {
          const category = pin.category_id ? categoryById[pin.category_id] : undefined;
          const color = category?.color ?? "#6b7280";
          const el = makePinElement(color, pin.status === "cancelled");
          const popup = new maplibregl.Popup({ offset: 24 }).setHTML(popupHtml(pin, category));
          const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
            .setLngLat([pin.lng, pin.lat])
            .setPopup(popup)
            .addTo(map!);
          // MapLibreの「マーカークリックでポップアップ開閉」は地図のclickイベント
          // 経由の間接的な仕組みで、確実に発火するとは限らない。自前のクリック
          // ハンドラで直接開閉する。
          el.addEventListener("click", (e) => {
            e.stopPropagation();
            if (!popup.isOpen()) marker.togglePopup();
            onMarkerClickRef.current?.(pin.id);
          });
          markersRef.current[pin.id] = marker;
        });
    }

    if (map.isStyleLoaded()) render();
    else map.once("style.load", render);
  }, [pins, categories, activeCategoryIds]);

  // Keep basemap/brand color in sync if changed from outside (e.g. wizard step)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    applyBrandTint(map, basemap, brandColor);
    applyJapaneseLabels(map);
  }, [basemap, brandColor]);

  useImperativeHandle(ref, () => ({
    flyTo(lat, lng, targetZoom = 17) {
      mapRef.current?.flyTo({ center: [lng, lat], zoom: targetZoom, duration: 600 });
    },
    openPopup(pinId) {
      // マーカー自体のクリックでは、MapLibre標準の挙動で既にポップアップが
      // 開いているため、ここでtogglePopup()すると閉じてしまう。既に開いて
      // いる場合は何もしない、閉じている場合だけ開く(冪等)。
      const marker = markersRef.current[pinId];
      if (marker && !marker.getPopup()?.isOpen()) {
        marker.togglePopup();
      }
    },
  }));

  return <div ref={containerRef} className="map-canvas" />;
});

export default MapCanvas;
