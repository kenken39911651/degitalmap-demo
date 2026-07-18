import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="text-4xl">🗺️</span>
      <h1 className="text-2xl font-bold">イベントマップ作成SaaS</h1>
      <p className="max-w-md text-sm text-neutral-500">
        祭り・マルシェ・フリマ・防災訓練など、イベント会場のデジタルマップを誰でも簡単に作成・公開できます。
      </p>
      <Link
        href="/login"
        className="rounded-lg bg-neutral-900 px-6 py-3 text-sm font-semibold text-white dark:bg-white dark:text-neutral-900"
      >
        主催者としてはじめる
      </Link>
    </div>
  );
}
