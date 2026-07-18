"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { unlockSite, type GateState } from "./actions";

const initialState: GateState = { status: "idle" };

function GateForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const [state, action, pending] = useActionState(unlockSite, initialState);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="next" value={next} />
      <label htmlFor="password" className="text-sm font-medium">
        合言葉
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        autoFocus
        className="rounded-lg border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
      />
      {state.status === "error" && <p className="text-sm text-red-600">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
      >
        {pending ? "確認中…" : "入る"}
      </button>
    </form>
  );
}

export default function GatePage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-6">
      <div>
        <h1 className="text-xl font-bold">テスト公開中</h1>
        <p className="mt-2 text-sm text-neutral-500">
          関係者向けのテスト段階です。合言葉を入力してください。
        </p>
      </div>
      <Suspense fallback={null}>
        <GateForm />
      </Suspense>
    </div>
  );
}
