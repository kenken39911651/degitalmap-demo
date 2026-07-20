"use client";

import { useActionState } from "react";
import { unlockSite, type GateState } from "./actions";

const initialState: GateState = { status: "idle" };

export default function GateForm({ next }: { next: string }) {
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
