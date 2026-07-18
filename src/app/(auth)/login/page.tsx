"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { requestMagicLink, type RequestMagicLinkState } from "../actions";

const initialState: RequestMagicLinkState = { status: "idle" };

function LoginForm() {
  const searchParams = useSearchParams();
  const hasAuthError = searchParams.get("error") === "auth";
  const [state, action, pending] = useActionState(requestMagicLink, initialState);

  return (
    <>
      {hasAuthError && state.status === "idle" && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
          ログインリンクの有効期限が切れているか、既に使用されています。
          お手数ですが、直近に届いたメールのリンクをお使いいただくか、もう一度お送りください。
        </p>
      )}

      {state.status === "sent" ? (
        <p className="rounded-lg border border-green-600/30 bg-green-600/10 p-4 text-sm">
          {state.message}
        </p>
      ) : (
        <form action={action} className="flex flex-col gap-3">
          <label htmlFor="email" className="text-sm font-medium">
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
          {state.status === "error" && <p className="text-sm text-red-600">{state.message}</p>}
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
          >
            {pending ? "送信中…" : "ログインリンクを送る"}
          </button>
        </form>
      )}
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-6">
      <div>
        <h1 className="text-xl font-bold">主催者ログイン</h1>
        <p className="mt-2 text-sm text-neutral-500">
          メールアドレスを入力すると、ログイン用のリンクをお送りします。パスワードは不要です。
        </p>
      </div>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
