import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getMapForEditing } from "@/lib/data";
import MapPreviewPanel from "@/components/admin/MapPreviewPanel";

interface PageProps {
  params: Promise<{ mapId: string }>;
}

export default async function PreviewMapPage({ params }: PageProps) {
  const { mapId } = await params;
  const result = await getMapForEditing(mapId);
  if (!result) notFound();

  const originHeader = (await headers()).get("origin");
  const siteUrl = originHeader ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return (
    <MapPreviewPanel
      map={result.map}
      categories={result.categories}
      pins={result.pins}
      siteUrl={siteUrl}
    />
  );
}
