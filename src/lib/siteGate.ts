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
