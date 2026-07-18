"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface ShareSectionProps {
  url: string;
  title: string;
}

export default function ShareSection({ url, title }: ShareSectionProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(url, { width: 220, margin: 1 }).then(setQrDataUrl).catch(() => {});
  }, [url]);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const lineShareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`;
  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;

  return (
    <div className="rounded-xl border border-neutral-300 p-5 dark:border-neutral-700">
      <h3 className="text-sm font-bold">公開されました🎉</h3>

      <div className="mt-3 flex items-center gap-2">
        <input
          readOnly
          value={url}
          className="flex-1 truncate rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-950"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded-lg border border-neutral-300 px-3 py-2 text-xs font-semibold dark:border-neutral-700"
        >
          {copied ? "コピー済み" : "コピー"}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        {qrDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrDataUrl} alt="QRコード" width={110} height={110} className="rounded-lg border border-neutral-200 dark:border-neutral-800" />
        )}
        <div className="flex flex-col gap-2 text-sm">
          <a
            href={lineShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-neutral-300 px-4 py-2 text-center font-semibold dark:border-neutral-700"
          >
            LINEで共有
          </a>
          <a
            href={xShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-neutral-300 px-4 py-2 text-center font-semibold dark:border-neutral-700"
          >
            Xで共有
          </a>
        </div>
      </div>
    </div>
  );
}
