"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export interface RequestMagicLinkState {
  status: "idle" | "sent" | "error";
  message?: string;
}

export async function requestMagicLink(
  _prevState: RequestMagicLinkState,
  formData: FormData
): Promise<RequestMagicLinkState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email || !email.includes("@")) {
    return { status: "error", message: "メールアドレスを正しく入力してください。" };
  }

  const supabase = await createClient();
  const originHeader = (await headers()).get("origin");
  const origin = originHeader ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error("signInWithOtp failed:", origin, error.status, error.code, error.message);
    return { status: "error", message: "送信に失敗しました。時間をおいて再度お試しください。" };
  }

  return { status: "sent", message: `${email} 宛にログイン用リンクを送信しました。` };
}
