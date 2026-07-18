export type EventType = "matsuri" | "marche" | "frima" | "bousai" | "other";
export type MapStatus = "draft" | "published";
export type PinStatus = "active" | "cancelled" | "hidden";
export type Basemap = "std" | "photo";

export interface EventMap {
  id: string;
  organization_id: string;
  slug: string;
  title: string;
  event_type: EventType;
  description: string | null;
  center_lat: number;
  center_lng: number;
  default_zoom: number;
  basemap: Basemap;
  brand_color: string;
  status: MapStatus;
  event_date_start: string | null;
  event_date_end: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MapCategory {
  id: string;
  map_id: string;
  label: string;
  color: string;
  icon: string | null;
  sort_order: number;
}

export interface Pin {
  id: string;
  map_id: string;
  category_id: string | null;
  title: string;
  emoji: string;
  lat: number;
  lng: number;
  description: string | null;
  place_note: string | null;
  date: string | null;
  time_label: string | null;
  photo_url: string | null;
  status: PinStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  created_at: string;
}
