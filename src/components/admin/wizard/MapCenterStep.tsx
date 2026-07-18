"use client";

import { useState } from "react";
import MapCanvas from "@/components/map/MapCanvas";
import { searchAddress, type GeocodeResult } from "@/lib/geocode";

const BRAND_COLORS = ["#c0472e", "#2f7de0", "#2fa85a", "#e08a2f", "#a24fd6", "#26241f"];

interface MapCenterStepProps {
  initialLat: number;
  initialLng: number;
  onBack: () => void;
  onNext: (data: {
    lat: number;
    lng: number;
    basemap: "std" | "photo";
    brandColor: string;
  }) => void;
  pending?: boolean;
}

export default function MapCenterStep({
  initialLat,
  initialLng,
  onBack,
  onNext,
  pending,
}: MapCenterStepProps) {
  const [lat, setLat] = useState(initialLat);
  const [lng, setLng] = useState(initialLng);
  // 基図切替（標準/航空写真）はプレビュー内のボタンで見た目を確認できるが、
  // 保存される基図設定はv1では標準地図に固定する。
  const basemap: "std" | "photo" = "std";
  const [brandColor, setBrandColor] = useState(BRAND_COLORS[0]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const found = await searchAddress(query);
      setResults(found.slice(0, 5));
      if (found.length === 0) setError("見つかりませんでした。別のキーワードでお試しください。");
    } catch {
      setError("住所検索に失敗しました。");
    } finally {
      setSearching(false);
    }
  }

  function handleUseGeolocation() {
    if (!navigator.geolocation) {
      setError("この端末は現在地取得に対応していません。");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
      },
      () => setError("現在地を取得できませんでした。")
    );
  }

  return (
    <div>
      <h2 className="text-lg font-bold">マップの中心地点を決めましょう</h2>
      <p className="mt-1 text-sm text-neutral-500">
        住所・施設名で検索するか、地図を直接タップして中心地点を設定してください。
      </p>

      <div className="mt-4 flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="例：西高屋駅"
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold dark:border-neutral-700"
        >
          検索
        </button>
        <button
          type="button"
          onClick={handleUseGeolocation}
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold dark:border-neutral-700"
        >
          現在地
        </button>
      </div>

      {results.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => {
                  setLat(r.lat);
                  setLng(r.lng);
                  setResults([]);
                  setQuery(r.title);
                }}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-left text-sm hover:border-neutral-900 dark:border-neutral-800 dark:hover:border-white"
              >
                {r.title}
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-4 h-72 overflow-hidden rounded-xl border border-neutral-300 dark:border-neutral-700">
        <MapCanvas
          centerLat={lat}
          centerLng={lng}
          zoom={16}
          basemap={basemap}
          brandColor={brandColor}
          categories={[]}
          pins={[]}
          activeCategoryIds={new Set()}
          onMapClick={(clickedLat, clickedLng) => {
            setLat(clickedLat);
            setLng(clickedLng);
          }}
        />
      </div>
      <p className="mt-1 text-xs text-neutral-500">
        地図をタップすると中心地点を移動できます（{lat.toFixed(5)}, {lng.toFixed(5)}）
      </p>

      <div className="mt-4 flex items-center gap-3">
        <span className="text-sm font-medium">ブランドカラー</span>
        {BRAND_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setBrandColor(c)}
            aria-label={c}
            className="h-7 w-7 rounded-full border-2"
            style={{
              background: c,
              borderColor: brandColor === c ? "currentColor" : "transparent",
            }}
          />
        ))}
      </div>

      <div className="mt-8 flex justify-between">
        <button type="button" onClick={onBack} className="text-sm text-neutral-500">
          戻る
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => onNext({ lat, lng, basemap, brandColor })}
          className="rounded-lg bg-neutral-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-40 dark:bg-white dark:text-neutral-900"
        >
          {pending ? "保存中…" : "次へ：ピンを追加"}
        </button>
      </div>
    </div>
  );
}
