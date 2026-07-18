"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { EventMap } from "@/lib/types";
import { duplicateMap } from "@/lib/actions/maps";
import { getTemplate } from "@/lib/templates";

export default function MapCard({ map }: { map: EventMap }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const template = getTemplate(map.event_type);

  function handleDuplicate() {
    startTransition(async () => {
      const { mapId } = await duplicateMap(map.id);
      router.push(`/admin/maps/${mapId}/edit`);
    });
  }

  return (
    <div className="rounded-xl border border-neutral-300 p-4 dark:border-neutral-700">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs text-neutral-500">
            {template.emoji} {template.label}
          </span>
          <h3 className="font-bold">{map.title}</h3>
        </div>
        <span
          className={
            "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold " +
            (map.status === "published"
              ? "bg-green-600/15 text-green-700 dark:text-green-400"
              : "bg-neutral-500/15 text-neutral-500")
          }
        >
          {map.status === "published" ? "公開中" : "下書き"}
        </span>
      </div>

      {map.event_date_start && (
        <p className="mt-1 text-xs text-neutral-500">開催日: {map.event_date_start}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link
          href={`/admin/maps/${map.id}/edit`}
          className="rounded-lg border border-neutral-300 px-3 py-1.5 font-semibold dark:border-neutral-700"
        >
          編集
        </Link>
        {map.status === "published" && (
          <Link
            href={`/m/${map.slug}`}
            target="_blank"
            className="rounded-lg border border-neutral-300 px-3 py-1.5 font-semibold dark:border-neutral-700"
          >
            表示
          </Link>
        )}
        <button
          type="button"
          onClick={handleDuplicate}
          disabled={pending}
          className="rounded-lg border border-neutral-300 px-3 py-1.5 font-semibold disabled:opacity-40 dark:border-neutral-700"
        >
          {pending ? "複製中…" : "複製"}
        </button>
      </div>
    </div>
  );
}
