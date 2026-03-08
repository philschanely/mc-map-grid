"use client";

import { useState } from "react";
import { subIndexInBucket } from "@/lib/coordinates";
import type { Log } from "../types";

const MINI_MAP_SIZE = 128;

function subToBlock(sub: number, bucket: number): number {
  return 128 * bucket - 64 + sub;
}

type MiniMapProps = {
  selectedCell: { xBucket: number; yBucket: number };
  logs: Log[];
  selectedLogId?: string | null;
  onCellClick?: (blockX: number, blockY: number, log?: Log) => void;
};

export function MiniMap({
  selectedCell,
  logs,
  selectedLogId = null,
  onCellClick,
}: MiniMapProps) {
  const [hoveredCell, setHoveredCell] = useState<{
    subX: number;
    subY: number;
  } | null>(null);

  const logsInCell = logs.filter(
    (log) =>
      log.xBucket === selectedCell.xBucket &&
      log.yBucket === selectedCell.yBucket,
  );

  const logPositions = new Map<string, { subX: number; subY: number }>();
  for (const log of logsInCell) {
    const subX = subIndexInBucket(log.x, selectedCell.xBucket);
    const subY = subIndexInBucket(log.y, selectedCell.yBucket);
    logPositions.set(log._id ?? `${log.x}-${log.y}`, { subX, subY });
  }

  const selectedLogPos = selectedLogId
    ? logPositions.get(selectedLogId)
    : undefined;

  const displayCoords = hoveredCell
    ? {
        x: subToBlock(hoveredCell.subX, selectedCell.xBucket),
        y: subToBlock(hoveredCell.subY, selectedCell.yBucket),
      }
    : selectedLogPos
      ? {
          x: subToBlock(selectedLogPos.subX, selectedCell.xBucket),
          y: subToBlock(selectedLogPos.subY, selectedCell.yBucket),
        }
    : null;

  return (
    <div className="flex shrink-0 flex-col">
    <div
      className="inline-grid shrink-0"
      style={{
        gridTemplateColumns: `repeat(${MINI_MAP_SIZE}, 3px)`,
        gridTemplateRows: `repeat(${MINI_MAP_SIZE}, 3px)`,
        gap: 0,
      }}
      role="img"
      aria-label="Mini map of coordinate grid"
    >
      {Array.from({ length: MINI_MAP_SIZE * MINI_MAP_SIZE }, (_, i) => {
        const row = Math.floor(i / MINI_MAP_SIZE);
        const col = i % MINI_MAP_SIZE;
        const logAtCell = logsInCell.find(
          (l) =>
            subIndexInBucket(l.x, selectedCell.xBucket) === col &&
            subIndexInBucket(l.y, selectedCell.yBucket) === row,
        );
        const hasLog = logAtCell !== undefined;
        const isSelectedLog =
          selectedLogPos !== undefined &&
          selectedLogPos.subX === col &&
          selectedLogPos.subY === row;

        const handleClick = () => {
          if (!onCellClick) return;
          const blockX = subToBlock(col, selectedCell.xBucket);
          const blockY = subToBlock(row, selectedCell.yBucket);
          onCellClick(blockX, blockY, logAtCell);
        };

        return (
          <div
            key={`${row},${col}`}
            role={onCellClick ? "button" : undefined}
            tabIndex={onCellClick ? 0 : undefined}
            onClick={onCellClick ? handleClick : undefined}
            onKeyDown={
              onCellClick
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleClick();
                    }
                  }
                : undefined
            }
            onMouseEnter={() => setHoveredCell({ subX: col, subY: row })}
            onMouseLeave={() => setHoveredCell(null)}
            className={`transition-colors ${
              onCellClick ? "cursor-pointer " : ""
            }${
              isSelectedLog
                ? "relative z-10 rounded-sm bg-black ring-2 ring-blue-500 ring-offset-2 dark:bg-black dark:ring-blue-400"
                : hasLog
                  ? "bg-zinc-500 dark:bg-zinc-600 hover:relative hover:z-10 hover:rounded-sm hover:ring-2 hover:ring-zinc-400 hover:ring-offset-2 dark:hover:ring-zinc-500"
                  : "bg-zinc-200 dark:bg-zinc-700 hover:relative hover:z-10 hover:rounded-sm hover:ring-2 hover:ring-zinc-400 hover:ring-offset-2 dark:hover:ring-zinc-500"
            }`}
            style={{ width: 3, height: 3 }}
          />
        );
      })}
    </div>
    <div className="mt-1 flex h-5 items-center justify-center rounded bg-zinc-100 px-2 text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
      {displayCoords ? (
        <>X: {displayCoords.x}, Y: {displayCoords.y}</>
      ) : (
        <span className="text-zinc-400 dark:text-zinc-500">—</span>
      )}
    </div>
    </div>
  );
}
