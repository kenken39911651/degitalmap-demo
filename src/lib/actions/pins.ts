"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PinStatus } from "@/lib/types";

export interface SessionInput {
  title: string;
  startTime?: string;
  endTime?: string;
  description?: string;
}

async function replaceSessions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  pinId: string,
  sessions: SessionInput[]
): Promise<void> {
  const { error: deleteError } = await supabase.from("pin_sessions").delete().eq("pin_id", pinId);
  if (deleteError) throw new Error("プログラムの更新に失敗しました");

  const rows = sessions
    .filter((s) => s.title.trim())
    .map((s, i) => ({
      pin_id: pinId,
      title: s.title.trim(),
      start_time: s.startTime || null,
      end_time: s.endTime || null,
      description: s.description || null,
      sort_order: i,
    }));

  if (rows.length === 0) return;

  const { error: insertError } = await supabase.from("pin_sessions").insert(rows);
  if (insertError) throw new Error("プログラムの保存に失敗しました");
}

interface CreatePinInput {
  mapId: string;
  categoryId: string | null;
  title: string;
  emoji: string;
  lat: number;
  lng: number;
  description?: string;
  placeNote?: string;
  date?: string;
  timeLabel?: string;
  sessions?: SessionInput[];
}

export async function createPin(input: CreatePinInput): Promise<{ pinId: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pins")
    .insert({
      map_id: input.mapId,
      category_id: input.categoryId,
      title: input.title,
      emoji: input.emoji || "📍",
      lat: input.lat,
      lng: input.lng,
      description: input.description || null,
      place_note: input.placeNote || null,
      date: input.date || null,
      time_label: input.timeLabel || null,
    })
    .select("id")
    .single();
  // RLS silently rejects writes to maps the caller doesn't own (0 rows
  // affected, no error) -- an explicit error here means something else broke.
  if (error || !data) throw new Error("ピンの追加に失敗しました");

  if (input.sessions && input.sessions.length > 0) {
    await replaceSessions(supabase, data.id as string, input.sessions);
  }

  revalidatePath(`/admin/maps/${input.mapId}`);
  return { pinId: data.id as string };
}

interface UpdatePinInput {
  pinId: string;
  mapId: string;
  categoryId: string | null;
  title: string;
  emoji: string;
  description?: string;
  placeNote?: string;
  date?: string;
  timeLabel?: string;
  status: PinStatus;
  sessions?: SessionInput[];
}

export async function updatePin(input: UpdatePinInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("pins")
    .update({
      category_id: input.categoryId,
      title: input.title,
      emoji: input.emoji || "📍",
      description: input.description || null,
      place_note: input.placeNote || null,
      date: input.date || null,
      time_label: input.timeLabel || null,
      status: input.status,
    })
    .eq("id", input.pinId);
  if (error) throw new Error("ピンの更新に失敗しました");

  await replaceSessions(supabase, input.pinId, input.sessions ?? []);

  revalidatePath(`/admin/maps/${input.mapId}`);
}

const NEXT_STATUS: Record<PinStatus, PinStatus> = {
  active: "cancelled",
  cancelled: "hidden",
  hidden: "active",
};

export async function cyclePinStatus(
  pinId: string,
  mapId: string,
  currentStatus: PinStatus
): Promise<PinStatus> {
  const supabase = await createClient();
  const nextStatus = NEXT_STATUS[currentStatus];
  const { error } = await supabase.from("pins").update({ status: nextStatus }).eq("id", pinId);
  if (error) throw new Error("ステータス更新に失敗しました");
  revalidatePath(`/admin/maps/${mapId}`);
  return nextStatus;
}

export async function deletePin(pinId: string, mapId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("pins").delete().eq("id", pinId);
  if (error) throw new Error("ピンの削除に失敗しました");
  revalidatePath(`/admin/maps/${mapId}`);
}
