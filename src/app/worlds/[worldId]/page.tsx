"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type { Log } from "./types";
import { LogsPanel, MapGrid } from "./components";
import { useCreateLog, useDeleteLog, useWorldData, useWorldGrid } from "./hooks";

export default function WorldPage() {
  const params = useParams();
  const router = useRouter();
  const worldId = typeof params.worldId === "string" ? params.worldId : "";
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  const { world, worldError, logs, setLogs } = useWorldData(worldId, session);
  const {
    saveLog,
    isSaving,
    error,
  } = useCreateLog(worldId, logs, setLogs);
  const { deleteLog, isDeleting } = useDeleteLog(worldId, setLogs);
  const {
    gridRange,
    selectedCell,
    setSelectedCell,
    flashingCell,
    gridScrollRef,
    scrollToCell,
    cellSize,
    gap,
  } = useWorldGrid(world, logs);

  const [description, setDescription] = useState("");
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const [z, setZ] = useState("");
  const [editingLog, setEditingLog] = useState<Log | null>(null);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  const handleLogSelect = (log: Log) => {
    const cell = { xBucket: log.xBucket, yBucket: log.yBucket };
    setSelectedCell(cell);
    scrollToCell(cell);
    setSelectedLogId(log._id ?? null);
  };

  const handleLogClick = (log: Log) => {
    setEditingLog(log);
    setDescription(log.description ?? "");
    setX(String(log.x));
    setY(String(log.y));
    setZ(log.z != null ? String(log.z) : "");
    setIsLogModalOpen(true);
  };

  const handleAddLog = () => {
    setEditingLog(null);
    setDescription("");
    setX("");
    setY("");
    setZ("");
    setIsLogModalOpen(true);
  };

  const handleMiniMapCellClick = (
    blockX: number,
    blockY: number,
    log?: Log,
  ) => {
    if (log) {
      handleLogSelect(log);
    } else {
      setEditingLog(null);
      setDescription("");
      setX(String(blockX));
      setY(String(blockY));
      setZ("");
      setIsLogModalOpen(true);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const clearForm = () => {
      setDescription("");
      setX("");
      setY("");
      setZ("");
      setEditingLog(null);
      setIsLogModalOpen(false);
    };
    saveLog(
      event,
      { description, x, y, z },
      editingLog?._id ?? null,
      clearForm,
    );
  };

  if (status === "loading" || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="flex w-full max-w-2xl flex-col items-center gap-8 rounded-2xl bg-white px-8 py-10 shadow-sm dark:bg-zinc-950">
          <p className="text-sm text-zinc-500">Loading...</p>
        </main>
      </div>
    );
  }

  if (worldError || (!world && worldId)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="flex w-full max-w-2xl flex-col items-center gap-8 rounded-2xl bg-white px-8 py-10 shadow-sm dark:bg-zinc-950">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {worldError ?? "Loading..."}
          </p>
          <Link
            href="/worlds"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Back to worlds
          </Link>
        </main>
      </div>
    );
  }

  if (!world) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <Link
          href="/worlds"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← Back
        </Link>
        <h1 className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-50">
          {world.name}
        </h1>
        <button
          type="button"
          onClick={() => setIsPanelCollapsed((c) => !c)}
          aria-label={isPanelCollapsed ? "Expand logs panel" : "Collapse logs panel"}
          className="hidden rounded p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 md:block"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`h-5 w-5 transition-transform ${isPanelCollapsed ? "rotate-180" : ""}`}
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.06l-4.5 4.25a.75.75 0 01-1.06-.02z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </header>

      <main className="flex min-h-0 flex-1 flex-col overflow-auto md:overflow-hidden md:flex-row">
        <div className="flex h-[66vh] min-h-0 shrink-0 flex-col overflow-hidden p-4 md:h-full md:min-w-0 md:flex-1">
          <div className="min-h-0 flex-1">
            <MapGrid
              gridRange={gridRange}
              logs={logs}
              selectedCell={selectedCell}
              setSelectedCell={setSelectedCell}
              flashingCell={flashingCell}
              gridScrollRef={gridScrollRef}
              scrollToCell={scrollToCell}
              cellSize={cellSize}
              gap={gap}
            />
          </div>
        </div>
        <LogsPanel
          logs={logs}
          selectedCell={selectedCell}
          onClearSelection={() => {
            setSelectedCell(null);
            setSelectedLogId(null);
          }}
          onLogClick={handleLogClick}
          onLogSelect={handleLogSelect}
          editingLogId={editingLog?._id ?? null}
          selectedLogId={selectedLogId}
          onDeleteLog={(log) => {
            if (log._id) {
              deleteLog(log._id);
              if (editingLog?._id === log._id) {
                setIsLogModalOpen(false);
                setEditingLog(null);
              }
            }
          }}
          onAddLog={handleAddLog}
          onMiniMapCellClick={handleMiniMapCellClick}
          isDeleting={isDeleting}
          isPanelCollapsed={isPanelCollapsed}
          isLogModalOpen={isLogModalOpen}
          onCloseLogModal={() => {
            setIsLogModalOpen(false);
            setEditingLog(null);
          }}
          description={description}
          setDescription={setDescription}
          x={x}
          setX={setX}
          y={y}
          setY={setY}
          z={z}
          setZ={setZ}
          onSubmit={handleSubmit}
          isSaving={isSaving}
          error={error}
          isEditing={editingLog !== null}
        />
      </main>
    </div>
  );
}
