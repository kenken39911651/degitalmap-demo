import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import GateForm from "./GateForm";

interface PageProps {
  searchParams: Promise<{ next?: string }>;
}

// リンクプレビュー(LINE/Slack/Xなど)は合言葉クッキーを持たずにアクセスしてくる
// ため、まず合言葉ページにリダイレクトされる。その際もURLの遷移先(next)から
// マップを特定し、プレビューにはマップ名を出す(中身はここでは見せない)。
async function findMapForNext(next: string | undefined) {
  if (!next) return null;
  const match = next.match(/^\/m\/([^/?]+)/);
  if (!match) return null;
  const slug = decodeURIComponent(match[1]);
  const supabase = await createClient();
  const { data } = await supabase
    .from("event_maps")
    .select("title, description")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return data;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { next } = await searchParams;
  const map = await findMapForNext(next);
  if (!map) return {};

  return {
    title: `${map.title} | デジタルマップ`,
    description: map.description ?? `${map.title}のイベントマップ`,
    openGraph: {
      title: map.title,
      description: map.description ?? undefined,
      type: "website",
    },
  };
}

export default async function GatePage({ searchParams }: PageProps) {
  const { next } = await searchParams;

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-6">
      <div>
        <h1 className="text-xl font-bold">テスト公開中</h1>
        <p className="mt-2 text-sm text-neutral-500">
          関係者向けのテスト段階です。合言葉を入力してください。
        </p>
      </div>
      <GateForm next={next ?? "/"} />
    </div>
  );
}
