"use client";

import { useState, useTransition } from "react";
import type { MapCategory, Pin } from "@/lib/types";
import { createPin, updatePin, deletePin } from "@/lib/actions/pins";

interface PinFormProps {
  mapId: string;
  categories: MapCategory[];
  /** New pin: only lat/lng known. Existing pin: full Pin record. */
  target: { mode: "create"; lat: number; lng: number } | { mode: "edit"; pin: Pin };
  onClose: () => void;
  onAddCategory: () => void;
}

const EMOJI_CHOICES = ["📍", "🏮", "🍽️", "🎤", "🚻", "🚑", "🧸", "🎁", "🧯", "📦"];

export default function PinForm({ mapId, categories, target, onClose, onAddCategory }: PinFormProps) {
  const existing = target.mode === "edit" ? target.pin : null;
  const [title, setTitle] = useState(existing?.title ?? "");
  const [emoji, setEmoji] = useState(existing?.emoji ?? "📍");
  const [categoryId, setCategoryId] = useState<string | null>(
    existing?.category_id ?? categories[0]?.id ?? null
  );
  const [placeNote, setPlaceNote] = useState(existing?.place_note ?? "");
  const [date, setDate] = useState(existing?.date ?? "");
  const [timeLabel, setTimeLabel] = useState(existing?.time_label ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const status = existing?.status ?? "active";
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    if (!title.trim()) {
      setError("名前を入力してください。");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        if (target.mode === "create") {
          await createPin({
            mapId,
            categoryId,
            title: title.trim(),
            emoji,
            lat: target.lat,
            lng: target.lng,
            description,
            placeNote,
            date,
            timeLabel,
          });
        } else {
          await updatePin({
            pinId: target.pin.id,
            mapId,
            categoryId,
            title: title.trim(),
            emoji,
            description,
            placeNote,
            date,
            timeLabel,
            status,
          });
        }
        onClose();
      } catch {
        setError("保存に失敗しました。もう一度お試しください。");
      }
    });
  }

  function handleDelete() {
    if (target.mode !== "edit") return;
    startTransition(async () => {
      try {
        await deletePin(target.pin.id, mapId);
        onClose();
      } catch {
        setError("削除に失敗しました。");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 dark:bg-neutral-900 sm:rounded-2xl">
        <h3 className="text-base font-bold">
          {target.mode === "create" ? "ピンを追加" : "ピンを編集"}
        </h3>

        <div className="mt-4 flex flex-col gap-3">
          <div className="flex gap-2">
            {EMOJI_CHOICES.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={
                  "h-9 w-9 rounded-full border text-lg " +
                  (emoji === e
                    ? "border-neutral-900 bg-neutral-100 dark:border-white dark:bg-neutral-800"
                    : "border-neutral-300 dark:border-neutral-700")
                }
              >
                {e}
              </button>
            ))}
          </div>

          <label className="flex flex-col gap-1 text-sm font-medium">
            名前
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例：たこ焼き屋台"
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-normal dark:border-neutral-700 dark:bg-neutral-950"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium">
            カテゴリ
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(c.id)}
                  className="rounded-full border px-3 py-1 text-xs font-semibold"
                  style={{
                    borderColor: c.color,
                    background: categoryId === c.id ? c.color : "transparent",
                    color: categoryId === c.id ? "#fff" : c.color,
                  }}
                >
                  {c.icon} {c.label}
                </button>
              ))}
              <button
                type="button"
                onClick={onAddCategory}
                className="rounded-full border border-dashed border-neutral-400 px-3 py-1 text-xs font-semibold text-neutral-500"
              >
                + カテゴリを追加
              </button>
            </div>
          </label>

          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
              日付
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-normal dark:border-neutral-700 dark:bg-neutral-950"
              />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
              時間帯
              <input
                value={timeLabel}
                onChange={(e) => setTimeLabel(e.target.value)}
                placeholder="17:00〜20:00"
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-normal dark:border-neutral-700 dark:bg-neutral-950"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm font-medium">
            場所メモ
            <input
              value={placeNote}
              onChange={(e) => setPlaceNote(e.target.value)}
              placeholder="例：駅前ロータリー"
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-normal dark:border-neutral-700 dark:bg-neutral-950"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium">
            説明
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-normal dark:border-neutral-700 dark:bg-neutral-950"
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="mt-5 flex items-center justify-between">
          {target.mode === "edit" ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={pending}
              className="text-sm font-semibold text-red-600 disabled:opacity-40"
            >
              削除
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="px-3 py-2 text-sm text-neutral-500">
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={pending}
              className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40 dark:bg-white dark:text-neutral-900"
            >
              {pending ? "保存中…" : "保存"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
