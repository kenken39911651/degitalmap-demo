import type { StyleSpecification } from "maplibre-gl";

const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';

// MapTiler(要APIキー・有料)から、登録不要で無料のOpenStreetMap(OSM)タイルに
// 切り替えた。OSMはラスタタイル(画像)を配信する仕組みのため、MapTilerの
// ベクトルタイルで行っていた日本語ラベル優先表示やブランドカラーでの
// 地図着色、航空写真(衛星写真)モードは提供できない。
export function osmStyle(): StyleSpecification {
  return {
    version: 8,
    sources: {
      osm: {
        type: "raster",
        tiles: [
          "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
          "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
          "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
        ],
        tileSize: 256,
        attribution: OSM_ATTRIBUTION,
        maxzoom: 19,
      },
    },
    layers: [
      {
        id: "osm-tiles",
        type: "raster",
        source: "osm",
      },
    ],
  };
}
