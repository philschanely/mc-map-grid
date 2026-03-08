"use client";

import { useState } from "react";
import type { Log } from "../types";
import { DeleteLogConfirmModal } from "./DeleteLogConfirmModal";
import { MiniMap } from "./MiniMap";

type LogsListProps = {
  logs: Log[];
  selectedCell: { xBucket: number; yBucket: number } | null;
  onClearSelection: () => void;
  onLogClick?: (log: Log) => void;
  onLogSelect?: (log: Log) => void;
  onDeleteLog?: (log: Log) => void;
  onAddLog?: () => void;
  onMiniMapCellClick?: (blockX: number, blockY: number, log?: Log) => void;
  editingLogId?: string | null;
  selectedLogId?: string | null;
  isDeleting?: boolean;
  variant?: "default" | "bar" | "panel";
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
  onLogSelect,
  onDeleteLog,
  onAddLog,
  onMiniMapCellClick,
  editingLogId,
  selectedLogId = null,
  isDeleting = false,
  variant = "default",
}: LogsListProps) {
  const [logToDelete, setLogToDelete] = useState<Log | null>(null);
  const isBar = variant === "bar";
  const isPanel = variant === "panel";

  return (
    <div
      className={`flex w-full flex-col gap-2 ${isBar ? "min-h-0 flex-1" : isPanel ? "md:min-h-0 md:flex-1" : ""}`}
    >
      <div className="flex shrink-0 items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {selectedCell && (
            <button
              type="button"
              onClick={onClearSelection}
              aria-label="Show all logs"
              className="shrink-0 rounded p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
                aria-hidden
              >
                <path
                  fillRule="evenodd"
                  d="M11.78 5.22a.75.75 0 010 1.06L8.06 10l3.72 3.72a.75.75 0 11-1.06 1.06L6.5 10l4.22-4.22a.75.75 0 010-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
          <h2 className="min-w-0 truncate text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            {selectedCell
              ? formatCellName(selectedCell)
              : "All Logs"}
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {onAddLog && (
            <button
              type="button"
              onClick={onAddLog}
              className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-50 transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Add log
            </button>
          )}
        </div>
      </div>
      {selectedCell && (
        <div className="flex shrink-0 justify-center overflow-x-auto">
          <div className="shrink-0 rounded-md border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-800 dark:bg-zinc-900">
            <MiniMap
              selectedCell={selectedCell}
              logs={logs}
              selectedLogId={selectedLogId}
              onCellClick={onMiniMapCellClick}
            />
          </div>
        </div>
      )}
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
              <ul
                className={`flex gap-2 rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-900 ${
                  isBar
                    ? "min-h-0 flex-1 flex-wrap overflow-y-auto"
                    : isPanel
                      ? "flex-col md:min-h-0 md:flex-1 md:overflow-y-auto"
                      : "max-h-96 flex-wrap overflow-y-auto"
                }`}
              >
                {displayLogs.map((log) => (
                  <li
                    key={
                      log._id ??
                      `${log.x}-${log.y}-${log.z}-${log.createdAt}`
                    }
                    role={onLogSelect ? "button" : undefined}
                    tabIndex={onLogSelect ? 0 : undefined}
                    onClick={
                      onLogSelect
                        ? (e) => {
                            if (
                              (e.target as HTMLElement).closest("button") == null
                            ) {
                              onLogSelect(log);
                            }
                          }
                        : undefined
                    }
                    onKeyDown={
                      onLogSelect
                        ? (e) => {
                            if (
                              (e.target as HTMLElement).closest("button") ==
                                null &&
                              (e.key === "Enter" || e.key === " ")
                            ) {
                              e.preventDefault();
                              onLogSelect(log);
                            }
                          }
                        : undefined
                    }
                    className={`flex shrink-0 flex-col gap-1 rounded-md border p-3 transition-colors dark:border-zinc-700 ${
                      isPanel ? "max-w-none" : "max-w-[240px]"
                    } ${
                      onLogSelect ? "cursor-pointer" : ""
                    } ${
                      editingLogId === log._id
                        ? "border-amber-500 bg-amber-50 ring-2 ring-amber-500/50 dark:bg-amber-900/20"
                        : selectedLogId === log._id
                          ? "border-blue-400 bg-blue-50/50 ring-2 ring-blue-400/50 dark:border-blue-500 dark:bg-blue-900/20 dark:ring-blue-500/50"
                          : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 text-[10px] text-zinc-500 dark:text-zinc-500">
                      <div className="flex shrink-0 items-center gap-1">
                        {onLogClick && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onLogClick(log);
                            }}
                            aria-label="Edit log"
                            className="rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600 dark:hover:text-zinc-200"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="h-3.5 w-3.5"
                              aria-hidden
                            >
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.828.828-2.828-2.828.828-.828zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                        )}
                        <span>
                          {log.x}, {log.z ?? "—"}, {log.y}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <span>
                          {new Date(log.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {onDeleteLog && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLogToDelete(log);
                            }}
                            aria-label="Delete log"
                            className="rounded p-1 text-zinc-500 transition-colors hover:bg-red-100 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="h-3.5 w-3.5"
                              aria-hidden
                            >
                              <path
                                fillRule="evenodd"
                                d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.518.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    <span className="font-medium text-zinc-800 dark:text-zinc-100">
                      {log.description ?? "—"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p
                className={`rounded-md border border-zinc-200 bg-zinc-50 px-4 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 ${
                  isBar || isPanel ? "py-4" : "py-6"
                }`}
              >
                {selectedCell
                  ? "No logs in this cell."
                  : "No logs yet. Add one with the form above."}
              </p>
            );
          })()}
      {onDeleteLog && (
        <DeleteLogConfirmModal
          isOpen={logToDelete !== null}
          log={logToDelete}
          onClose={() => setLogToDelete(null)}
          onConfirm={() => {
            if (logToDelete?._id) {
              onDeleteLog(logToDelete);
              setLogToDelete(null);
            }
          }}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
