export interface GeocodeResult {
  title: string;
  lat: number;
  lng: number;
}

interface GsiAddressSearchFeature {
  geometry: { coordinates: [number, number] };
  properties: { title: string };
}

// 国土地理院の住所検索API。APIキー不要、商用利用可（要出典表示）。
// https://msearch.gsi.go.jp/address-search/AddressSearch?q=<query>
export async function searchAddress(query: string): Promise<GeocodeResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const url = `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(trimmed)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`GSI住所検索に失敗しました (status ${res.status})`);
  }

  const data: GsiAddressSearchFeature[] = await res.json();
  return data.map((feature) => ({
    title: feature.properties.title,
    lng: feature.geometry.coordinates[0],
    lat: feature.geometry.coordinates[1],
  }));
}
