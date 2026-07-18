"use client";

import { useState, useTransition } from "react";
import { addCategory } from "@/lib/actions/categories";

const COLOR_CHOICES = ["#e2574c", "#e08a2f", "#2f7de0", "#2fa85a", "#a24fd6", "#6b7280"];

interface AddCategoryModalProps {
  mapId: string;
  onClose: () => void;
}

export default function AddCategoryModal({ mapId, onClose }: AddCategoryModalProps) {
  const [label, setLabel] = useState("");
  const [color, setColor] = useState(COLOR_CHOICES[0]);
  const [icon, setIcon] = useState("📍");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    if (!label.trim()) {
      setError("カテゴリ名を入力してください。");
      return;
    }
    startTransition(async () => {
      try {
        await addCategory({ mapId, label: label.trim(), color, icon });
        onClose();
      } catch {
        setError("追加に失敗しました。");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 dark:bg-neutral-900">
        <h3 className="text-base font-bold">カテゴリを追加</h3>
        <div className="mt-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium">
            カテゴリ名
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="例：飲食"
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-normal dark:border-neutral-700 dark:bg-neutral-950"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            アイコン（絵文字1文字）
            <input
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              maxLength={2}
              className="w-16 rounded-lg border border-neutral-300 px-3 py-2 text-center text-sm font-normal dark:border-neutral-700 dark:bg-neutral-950"
            />
          </label>
          <div className="flex gap-2">
            {COLOR_CHOICES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="h-7 w-7 rounded-full border-2"
                style={{ background: c, borderColor: color === c ? "currentColor" : "transparent" }}
              />
            ))}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-2 text-sm text-neutral-500">
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={pending}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40 dark:bg-white dark:text-neutral-900"
          >
            {pending ? "追加中…" : "追加"}
          </button>
        </div>
      </div>
    </div>
  );
}
