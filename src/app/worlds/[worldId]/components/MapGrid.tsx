"use client";

import type { Log } from "../types";
import type { GridRange } from "../types";

type MapGridProps = {
  gridRange: GridRange;
  logs: Log[];
  selectedCell: { xBucket: number; yBucket: number } | null;
  setSelectedCell: (cell: { xBucket: number; yBucket: number } | null) => void;
  flashingCell: { xBucket: number; yBucket: number } | null;
  gridScrollRef: React.RefObject<HTMLDivElement | null>;
  scrollToCell: (cell: { xBucket: number; yBucket: number }) => void;
  cellSize: number;
  gap: number;
};

export function MapGrid({
  gridRange,
  logs,
  selectedCell,
  setSelectedCell,
  flashingCell,
  gridScrollRef,
  scrollToCell,
  cellSize,
  gap,
}: MapGridProps) {
  const cols = gridRange.maxEw - gridRange.minEw + 1;
  const rows = gridRange.maxNs - gridRange.minNs + 1;

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-2">
      <div className="flex shrink-0 items-center gap-2">
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          Map grid
        </h2>
        <button
          type="button"
          onClick={() => scrollToCell({ xBucket: 0, yBucket: 0 })}
          className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
        >
          Origin
        </button>
        <button
          type="button"
          onClick={() => selectedCell && scrollToCell(selectedCell)}
          disabled={!selectedCell}
          className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
        >
          Selected
        </button>
      </div>
      <div
        ref={gridScrollRef}
        className="min-h-0 flex-1 overflow-auto rounded-md border border-zinc-200 dark:border-zinc-800"
      >
        <div className="h-4 w-full shrink-0" aria-hidden />
        <div className="flex">
          <div className="h-4 w-4 shrink-0" aria-hidden />
          <div
            className="inline-grid shrink-0"
            style={{
              gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
              gap,
            }}
          >
            {Array.from({ length: rows * cols }, (_, i) => {
              const row = Math.floor(i / cols);
              const col = i % cols;
              const nsValue = gridRange.minNs + row;
              const ewValue = gridRange.minEw + col;
              const nsLabel =
                nsValue === 0
                  ? "0"
                  : nsValue > 0
                    ? `S${nsValue}`
                    : `N${Math.abs(nsValue)}`;
              const ewLabel =
                ewValue === 0
                  ? "0"
                  : ewValue > 0
                    ? `E${ewValue}`
                    : `W${Math.abs(ewValue)}`;
              const logCount = logs.filter(
                (log) => log.xBucket === ewValue && log.yBucket === nsValue,
              ).length;
              const hasLog = logCount > 0;
              const isSelected =
                selectedCell?.xBucket === ewValue &&
                selectedCell?.yBucket === nsValue;
              const isZeroCell = nsValue === 0 || ewValue === 0;
              const isFlashing =
                flashingCell?.xBucket === ewValue &&
                flashingCell?.yBucket === nsValue;

              return (
                <button
                  key={`${nsValue},${ewValue}`}
                  type="button"
                  onClick={() =>
                    setSelectedCell(
                      isSelected ? null : { xBucket: ewValue, yBucket: nsValue },
                    )
                  }
                  className={`relative flex flex-col items-center justify-center overflow-hidden rounded px-0.5 py-0.5 text-center transition-colors ${
                    isZeroCell ? "border-2" : "border"
                  } ${
                    isSelected
                      ? "ring-2 ring-amber-500 ring-offset-1 dark:ring-offset-zinc-950"
                      : ""
                  } ${
                    hasLog
                      ? "border-amber-500 bg-amber-100 text-amber-900 hover:bg-amber-200 dark:border-amber-400 dark:bg-amber-900/40 dark:text-amber-100 dark:hover:bg-amber-900/60"
                      : "border-zinc-200 bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                  style={{ width: cellSize, height: cellSize }}
                >
                  {isFlashing && (
                    <span
                      className="cell-shimmer absolute inset-0 bg-amber-300/70 dark:bg-amber-400/50"
                      aria-hidden
                    />
                  )}
                  <span className="relative text-[7px] font-mono leading-none">
                    {nsLabel}-{ewLabel}
                  </span>
                  {hasLog && (
                    <span className="relative mt-0.5 text-[8px] font-semibold">
                      {logCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="h-4 w-4 shrink-0" aria-hidden />
        </div>
        <div className="h-4 w-full shrink-0" aria-hidden />
      </div>
    </div>
  );
}
