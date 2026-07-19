"use client";

import type { MapCategory } from "@/lib/types";

interface CategoryTabsProps {
  categories: MapCategory[];
  selectedCategoryId: string | null;
  onSelect: (categoryId: string | null) => void;
}

export default function CategoryTabs({
  categories,
  selectedCategoryId,
  onSelect,
}: CategoryTabsProps) {
  return (
    <div className="tab-group" role="tablist" aria-label="会場で絞り込み">
      <button
        type="button"
        role="tab"
        className="tab"
        aria-selected={selectedCategoryId === null}
        onClick={() => onSelect(null)}
      >
        すべて
      </button>
      {categories.map((cat) => {
        const active = selectedCategoryId === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            role="tab"
            className="tab"
            style={{ ["--tab-color" as string]: cat.color }}
            aria-selected={active}
            onClick={() => onSelect(cat.id)}
          >
            <span className="dot" style={{ background: cat.color }} />
            {cat.icon ? `${cat.icon} ` : ""}
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
