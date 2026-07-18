"use client";

import { useState } from "react";

interface BasicInfoStepProps {
  onBack: () => void;
  onNext: (data: {
    title: string;
    description: string;
    eventDateStart: string;
    eventDateEnd: string;
  }) => void;
}

export default function BasicInfoStep({ onBack, onNext }: BasicInfoStepProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDateStart, setEventDateStart] = useState("");
  const [eventDateEnd, setEventDateEnd] = useState("");

  return (
    <div>
      <h2 className="text-lg font-bold">基本情報を入力してください</h2>
      <div className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          マップのタイトル
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例：高屋夏まつり2026"
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-normal dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          説明（任意）
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-normal dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>

        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
            開催日（開始）
            <input
              type="date"
              value={eventDateStart}
              onChange={(e) => setEventDateStart(e.target.value)}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-normal dark:border-neutral-700 dark:bg-neutral-900"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
            開催日（終了・任意）
            <input
              type="date"
              value={eventDateEnd}
              onChange={(e) => setEventDateEnd(e.target.value)}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-normal dark:border-neutral-700 dark:bg-neutral-900"
            />
          </label>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button type="button" onClick={onBack} className="text-sm text-neutral-500">
          戻る
        </button>
        <button
          type="button"
          disabled={!title.trim()}
          onClick={() => onNext({ title: title.trim(), description, eventDateStart, eventDateEnd })}
          className="rounded-lg bg-neutral-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-40 dark:bg-white dark:text-neutral-900"
        >
          次へ
        </button>
      </div>
    </div>
  );
}
