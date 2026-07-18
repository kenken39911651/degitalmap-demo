"use client";

import { EVENT_TYPE_TEMPLATES } from "@/lib/templates";
import type { EventType } from "@/lib/types";

interface EventTypeStepProps {
  onSelect: (eventType: EventType) => void;
}

export default function EventTypeStep({ onSelect }: EventTypeStepProps) {
  return (
    <div>
      <h2 className="text-lg font-bold">どんなイベントのマップを作りますか？</h2>
      <p className="mt-1 text-sm text-neutral-500">
        選んだ種類に合わせて、最初からカテゴリを用意します。あとから自由に変更できます。
      </p>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {EVENT_TYPE_TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id)}
            className="flex items-start gap-3 rounded-xl border border-neutral-300 p-4 text-left hover:border-neutral-900 dark:border-neutral-700 dark:hover:border-white"
          >
            <span className="text-3xl">{t.emoji}</span>
            <span>
              <span className="block font-bold">{t.label}</span>
              <span className="mt-1 block text-xs text-neutral-500">{t.description}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
