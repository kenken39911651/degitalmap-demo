import type maplibregl from "maplibre-gl";

function maptilerKey(): string {
  return process.env.NEXT_PUBLIC_MAPTILER_KEY ?? "";
}

export function styleUrlFor(basemap: "std" | "photo"): string {
  const key = maptilerKey();
  const style = basemap === "photo" ? "satellite" : "basic-v2";
  return `https://api.maptiler.com/maps/${style}/style.json?key=${key}`;
}

// MapTilerの既定スタイルはラベルがname:en(英語)優先になっているため、
// name:ja -> name(現地表記) -> name:en の優先順に切り替える。
const LABEL_LAYER_IDS = [
  "Continent labels",
  "Country labels",
  "City labels",
  "Place labels",
  "Road labels",
  "Station labels",
  "Airport labels",
];

export function applyJapaneseLabels(map: maplibregl.Map) {
  for (const layerId of LABEL_LAYER_IDS) {
    try {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "text-field", [
          "coalesce",
          ["get", "name:ja"],
          ["get", "name"],
          ["get", "name:en"],
        ]);
      }
    } catch {
      // レイヤーが存在しない/対応していない場合は無視
    }
  }
}

// ブランドカラーで基図をうっすら着色する（basic-v2スタイルのみ対象。
// 衛星写真スタイルは実写画像のため着色しない）。MapTilerのスタイル内の
// レイヤーIDはバージョンで揺れがあるため、候補をいくつか試し、
// 存在しない/失敗するものは無視する。
export function applyBrandTint(map: maplibregl.Map, basemap: "std" | "photo", brandColor: string) {
  if (basemap !== "std") return;
  const tint = (opacity: number) => hexToRgba(brandColor, opacity);

  tryPaint(map, ["Water", "water"], "fill-color", tint(0.35));
  tryPaint(map, ["Background", "background"], "background-color", tint(0.04));
  tryPaint(map, ["Landcover", "landcover", "Landuse", "landuse"], "fill-color", tint(0.06));
}

type PaintProperty = Parameters<maplibregl.Map["setPaintProperty"]>[1];

function tryPaint(
  map: maplibregl.Map,
  candidateLayerIds: string[],
  property: string,
  value: string
) {
  for (const layerId of candidateLayerIds) {
    try {
      if (map.getLayer(layerId)) {
        map.setPaintProperty(layerId, property as PaintProperty, value);
        return;
      }
    } catch {
      // このレイヤーはこのプロパティに未対応 -> 次の候補へ
    }
  }
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// 西高屋デモのBasemapToggleControlと同じUI/挙動をMapLibre GL JS向けに再実装。
export class BasemapToggleControl implements maplibregl.IControl {
  private map?: maplibregl.Map;
  private container?: HTMLDivElement;
  private current: "std" | "photo";
  private brandColor: string;
  private onChange: (basemap: "std" | "photo") => void;

  constructor(initial: "std" | "photo", brandColor: string, onChange: (basemap: "std" | "photo") => void) {
    this.current = initial;
    this.brandColor = brandColor;
    this.onChange = onChange;
  }

  onAdd(map: maplibregl.Map): HTMLElement {
    this.map = map;
    const box = document.createElement("div");
    box.className = "basemap-toggle maplibregl-ctrl";
    box.innerHTML = `
      <button type="button" class="basemap-btn${this.current === "std" ? " is-active" : ""}" data-layer="standard">地図</button>
      <button type="button" class="basemap-btn${this.current === "photo" ? " is-active" : ""}" data-layer="aerial">航空写真</button>
    `;
    box.querySelectorAll<HTMLButtonElement>(".basemap-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const next = btn.dataset.layer === "aerial" ? "photo" : "std";
        if (next === this.current) return;
        this.current = next;
        box.querySelectorAll(".basemap-btn").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        const targetMap = this.map;
        if (targetMap) {
          targetMap.setStyle(styleUrlFor(next));
          targetMap.once("style.load", () => {
            applyBrandTint(targetMap, next, this.brandColor);
            applyJapaneseLabels(targetMap);
          });
        }
        this.onChange(next);
      });
    });
    this.container = box;
    return box;
  }

  onRemove(): void {
    this.container?.remove();
    this.map = undefined;
  }
}
