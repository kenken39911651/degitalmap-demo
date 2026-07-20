import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const SITE_GATE_COOKIE = "site_gate";

// テスト段階のみ使う簡易ゲート。Cookieには平文パスワードではなくハッシュ値を
// 保存する(Edge/Node両方で動くWeb Crypto APIを使用)。
export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function expectedGateValue(): Promise<string | null> {
  const password = process.env.SITE_ACCESS_PASSWORD;
  if (!password) return null; // 未設定ならゲート自体を無効化
  return hashPassword(password);
}

// 公開マップは主催者側で「合言葉なしで公開」を選べる。Cookieを持たない
// 来場者やリンクプレビューボットのために、プロキシ側でセッション不要の
// 匿名クライアントで直接確認する。
export async function isMapPubliclyAccessible(slug: string): Promise<boolean> {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("event_maps")
    .select("require_site_password")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return data?.require_site_password === false;
}
