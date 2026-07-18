"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hashPassword, expectedGateValue, SITE_GATE_COOKIE } from "@/lib/siteGate";

export interface GateState {
  status: "idle" | "error";
  message?: string;
}

export async function unlockSite(
  _prevState: GateState,
  formData: FormData
): Promise<GateState> {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  const expected = await expectedGateValue();
  if (!expected) {
    redirect(next); // ゲート未設定ならそのまま通す
  }

  const submitted = await hashPassword(password);
  if (submitted !== expected) {
    return { status: "error", message: "パスワードが違います。" };
  }

  const cookieStore = await cookies();
  cookieStore.set(SITE_GATE_COOKIE, submitted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30日
  });

  redirect(next);
}
