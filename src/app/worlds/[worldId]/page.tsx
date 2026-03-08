"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { bucketCoordinateFromString } from "@/lib/coordinates";
import type { Log } from "./types";
import {
  CoordinateForm,
  LogsList,
  MapGrid,
} from "./components";
import { useCreateLog, useWorldData, useWorldGrid } from "./hooks";

export default function WorldPage() {
  const params = useParams();
  const worldId = typeof params.worldId === "string" ? params.worldId : "";
  const { data: session, status } = useSession();

  const { world, worldError, logs, setLogs } = useWorldData(worldId, session);
  const {
    saveLog,
    isSaving,
    error,
  } = useCreateLog(worldId, logs, setLogs);
  const {
    gridRange,
    selectedCell,
    setSelectedCell,
    flashingCell,
    gridScrollRef,
    scrollToCell,
    goToCell,
    cellSize,
    gap,
  } = useWorldGrid(world);

  const [description, setDescription] = useState("");
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const [z, setZ] = useState("");
  const [editingLog, setEditingLog] = useState<Log | null>(null);

  const handleLogClick = (log: Log) => {
    setEditingLog(log);
    setDescription(log.description ?? "");
    setX(String(log.x));
    setY(String(log.y));
    setZ(log.z != null ? String(log.z) : "");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const clearForm = () => {
      setDescription("");
      setX("");
      setY("");
      setZ("");
      setEditingLog(null);
    };
    saveLog(
      event,
      { description, x, y, z },
      editingLog?._id ?? null,
      clearForm,
    );
  };

  const handleGoToCoordinates = () => {
    const xBucket = bucketCoordinateFromString(x);
    const zBucket = bucketCoordinateFromString(z);
    if (xBucket !== null && zBucket !== null) {
      goToCell({ xBucket, yBucket: zBucket });
    }
  };

  if (status === "loading" || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="flex w-full max-w-2xl flex-col items-center gap-8 rounded-2xl bg-white px-8 py-10 shadow-sm dark:bg-zinc-950">
          {status === "loading" ? (
            <p className="text-sm text-zinc-500">Loading...</p>
          ) : (
            <p className="text-sm text-zinc-500">
              Sign in to view this world.{" "}
              <Link href="/" className="underline">
                Go to dashboard
              </Link>
            </p>
          )}
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
            href="/"
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
      <header className="flex shrink-0 flex-col gap-2 border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            ← Back
          </Link>
          <h1 className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-50">
            {world.name}
          </h1>
          <div className="w-12" aria-hidden />
        </div>
        <CoordinateForm
          description={description}
          setDescription={setDescription}
          x={x}
          setX={setX}
          y={y}
          setY={setY}
          z={z}
          setZ={setZ}
          onSubmit={handleSubmit}
          onGoToCoordinates={handleGoToCoordinates}
          isSaving={isSaving}
          error={error}
          variant="bar"
        />
      </header>

      <main className="min-h-0 flex-1 overflow-hidden p-4">
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
      </main>

      <footer className="flex h-40 shrink-0 flex-col gap-2 overflow-hidden border-t border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <LogsList
          logs={logs}
          selectedCell={selectedCell}
          onClearSelection={() => setSelectedCell(null)}
          onLogClick={handleLogClick}
          editingLogId={editingLog?._id ?? null}
          variant="bar"
        />
      </footer>
    </div>
  );
}
