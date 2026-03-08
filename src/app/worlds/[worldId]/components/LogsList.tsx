"use client";

import type { Log } from "../types";

type LogsListProps = {
  logs: Log[];
  selectedCell: { xBucket: number; yBucket: number } | null;
  onClearSelection: () => void;
  onLogClick?: (log: Log) => void;
  editingLogId?: string | null;
  variant?: "default" | "bar";
};

function formatCellName(cell: { xBucket: number; yBucket: number }) {
  const nsLabel =
    cell.yBucket === 0
      ? "0"
      : cell.yBucket > 0
        ? `S${cell.yBucket}`
        : `N${Math.abs(cell.yBucket)}`;
  const ewLabel =
    cell.xBucket === 0
      ? "0"
      : cell.xBucket > 0
        ? `E${cell.xBucket}`
        : `W${Math.abs(cell.xBucket)}`;
  return `${nsLabel}-${ewLabel}`;
}

export function LogsList({
  logs,
  selectedCell,
  onClearSelection,
  onLogClick,
  editingLogId,
  variant = "default",
}: LogsListProps) {
  const isBar = variant === "bar";

  return (
    <div className={`flex w-full flex-col gap-2 ${isBar ? "min-h-0 flex-1" : ""}`}>
      <div className="flex shrink-0 items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          {selectedCell
            ? `Selected logs (${formatCellName(selectedCell)})`
            : "Logs"}
        </h2>
        {selectedCell && (
          <button
            type="button"
            onClick={onClearSelection}
            className="text-xs font-medium text-zinc-600 underline hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            Show all
          </button>
        )}
      </div>
      {(() => {
        const displayLogs =
          selectedCell === null
            ? logs
            : logs.filter(
                (log) =>
                  log.xBucket === selectedCell.xBucket &&
                  log.yBucket === selectedCell.yBucket,
              );
        return displayLogs.length > 0 ? (
              <ul className={`flex flex-wrap gap-2 overflow-y-auto rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-900 ${isBar ? "min-h-0 flex-1" : "max-h-96"}`}>
                {displayLogs.map((log) => (
                  <li
                    key={
                      log._id ??
                      `${log.x}-${log.y}-${log.z}-${log.createdAt}`
                    }
                    role={onLogClick ? "button" : undefined}
                    tabIndex={onLogClick ? 0 : undefined}
                    onClick={onLogClick ? () => onLogClick(log) : undefined}
                    onKeyDown={
                      onLogClick
                        ? (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              onLogClick(log);
                            }
                          }
                        : undefined
                    }
                    className={`flex max-w-[240px] shrink-0 flex-col gap-1 rounded-md border p-3 transition-colors dark:border-zinc-700 ${
                      editingLogId === log._id
                        ? "border-amber-500 bg-amber-50 ring-2 ring-amber-500/50 dark:bg-amber-900/20"
                        : "cursor-pointer border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
                    }`}
                  >
                    <span className="font-medium text-zinc-800 dark:text-zinc-100">
                      {log.description ?? "—"}
                    </span>
                    <span className="text-zinc-500 dark:text-zinc-500">
                      X: {log.x}, Z: {log.z ?? "—"}, Y: {log.y}
                    </span>
                    <span className="text-zinc-500 dark:text-zinc-500">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`rounded-md border border-zinc-200 bg-zinc-50 px-4 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 ${isBar ? "py-4" : "py-6"}`}>
                {selectedCell
                  ? "No logs in this cell."
                  : "No logs yet. Add one with the form above."}
              </p>
            );
          })()}
    </div>
  );
}
