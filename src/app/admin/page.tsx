import Link from "next/link";
import { getOrganizationMaps } from "@/lib/data";
import MapCard from "@/components/admin/MapCard";

export default async function AdminDashboardPage() {
  const maps = await getOrganizationMaps();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">マイマップ</h1>
        <Link
          href="/admin/maps/new"
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-neutral-900"
        >
          + 新しいマップを作成
        </Link>
      </div>

      {maps.length === 0 ? (
        <p className="mt-10 text-center text-sm text-neutral-500">
          まだマップがありません。「新しいマップを作成」から始めましょう。
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {maps.map((map) => (
            <MapCard key={map.id} map={map} />
          ))}
        </div>
      )}
    </div>
  );
}
