"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateOrganizationId } from "@/lib/data";

interface AddCategoryInput {
  mapId: string;
  label: string;
  color: string;
  icon?: string;
}

async function assertMapOwnership(mapId: string) {
  const orgId = await getOrCreateOrganizationId();
  const supabase = await createClient();
  const { data: map } = await supabase
    .from("event_maps")
    .select("id")
    .eq("id", mapId)
    .eq("organization_id", orgId)
    .maybeSingle();
  if (!map) throw new Error("マップが見つかりません");
  return supabase;
}

export async function addCategory(input: AddCategoryInput): Promise<void> {
  const supabase = await assertMapOwnership(input.mapId);

  const { count } = await supabase
    .from("map_categories")
    .select("id", { count: "exact", head: true })
    .eq("map_id", input.mapId);

  const { error } = await supabase.from("map_categories").insert({
    map_id: input.mapId,
    label: input.label,
    color: input.color,
    icon: input.icon || "📍",
    sort_order: count ?? 0,
  });

  if (error) throw new Error("カテゴリの追加に失敗しました");
  revalidatePath(`/admin/maps/${input.mapId}`);
}
