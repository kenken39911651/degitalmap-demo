"use client";

interface VenueTabsProps {
  venues: string[];
  selectedVenue: string | null;
  onSelect: (venue: string | null) => void;
}

export default function VenueTabs({ venues, selectedVenue, onSelect }: VenueTabsProps) {
  if (venues.length === 0) return null;

  return (
    <div className="tab-group" role="tablist" aria-label="会場で絞り込み">
      <button
        type="button"
        role="tab"
        className="tab"
        aria-selected={selectedVenue === null}
        onClick={() => onSelect(null)}
      >
        すべて
      </button>
      {venues.map((venue) => (
        <button
          key={venue}
          type="button"
          role="tab"
          className="tab"
          aria-selected={selectedVenue === venue}
          onClick={() => onSelect(venue)}
        >
          {venue}
        </button>
      ))}
    </div>
  );
}
