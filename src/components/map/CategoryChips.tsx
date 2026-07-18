"use client";

import type { MapCategory } from "@/lib/types";

interface CategoryChipsProps {
  categories: MapCategory[];
  activeCategoryIds: Set<string>;
  onToggle: (categoryId: string) => void;
}

export default function CategoryChips({
  categories,
  activeCategoryIds,
  onToggle,
}: CategoryChipsProps) {
  return (
    <div className="chip-group">
      {categories.map((cat) => {
        const active = activeCategoryIds.has(cat.id);
        return (
          <button
            key={cat.id}
            type="button"
            className="chip"
            style={{ ["--chip-color" as string]: cat.color }}
            aria-pressed={active}
            onClick={() => onToggle(cat.id)}
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
