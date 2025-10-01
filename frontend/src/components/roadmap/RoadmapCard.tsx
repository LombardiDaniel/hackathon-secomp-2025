"use client";

import React from "react";
import type { RoadmapSummary } from "../../data/roadmaps";
import { formatRelativeDate } from "../../libs/date";

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US", { notation: "compact" }).format(value);

export interface RoadmapCardProps {
  summary: RoadmapSummary;
  onOpen?: (id: string) => void;
  actionLabel?: string;
  onActionClick?: (id: string) => void;
}

export const RoadmapCard: React.FC<RoadmapCardProps> = ({ summary, onOpen, actionLabel, onActionClick }) => {
  const handleOpen = () => {
    onOpen?.(summary.id);
  };

  const handleAction = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (onActionClick) {
      onActionClick(summary.id);
    }
  };
  const updatedLabel = summary.lastUpdated ? formatRelativeDate(summary.lastUpdated) : "recently";

  return (
    <button
      onClick={handleOpen}
      className="w-full text-left rounded-2xl bg-white/95 backdrop-blur shadow hover:shadow-lg transition border border-white/60 px-5 py-4 space-y-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-[var(--color-slate)]">{summary.title}</h3>
          <p className="mt-1 text-sm text-[var(--color-slate)]/70 line-clamp-2">{summary.description}</p>
        </div>
        <span className="inline-flex items-center justify-center gap-1 rounded-full bg-[var(--color-ocean)]/15 text-[var(--color-ocean)] text-xs font-semibold px-2.5 py-1">
          <span aria-hidden className="leading-none">▲</span>
          <span className="leading-none">{formatNumber(summary.upvotes)}</span>
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--color-slate)]/60">
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-sky)]/30 px-2 py-0.5">
          ⏱️ {summary.estimatedWeeks} weeks
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-sky)]/30 px-2 py-0.5">
          🔄 Updated {updatedLabel}
        </span>
        {summary.tags.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-[var(--color-mist)] px-2 py-0.5 text-[var(--color-slate)]/70"
          >
            #{tag}
          </span>
        ))}
      </div>
      {actionLabel && (
        <div className="flex justify-end">
          <span
            onClick={handleAction}
            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-ocean)] hover:text-[var(--color-slate)] cursor-pointer"
          >
            {actionLabel} →
          </span>
        </div>
      )}
    </button>
  );
};
