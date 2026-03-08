"use client";

import type { Log } from "../types";
import { LogFormModal } from "./LogFormModal";
import { LogsList } from "./LogsList";

type LogsPanelProps = {
  logs: Log[];
  selectedCell: { xBucket: number; yBucket: number } | null;
  onClearSelection: () => void;
  onLogClick: (log: Log) => void;
  onLogSelect?: (log: Log) => void;
  onDeleteLog?: (log: Log) => void;
  onMiniMapCellClick?: (blockX: number, blockY: number, log?: Log) => void;
  editingLogId: string | null;
  selectedLogId?: string | null;
  onAddLog: () => void;
  isDeleting?: boolean;
  isPanelCollapsed: boolean;
  // LogFormModal props
  isLogModalOpen: boolean;
  onCloseLogModal: () => void;
  description: string;
  setDescription: (v: string) => void;
  x: string;
  setX: (v: string) => void;
  y: string;
  setY: (v: string) => void;
  z: string;
  setZ: (v: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isSaving: boolean;
  error: string | null;
  isEditing: boolean;
};

export function LogsPanel({
  logs,
  selectedCell,
  onClearSelection,
  onLogClick,
  onLogSelect,
  onDeleteLog,
  onMiniMapCellClick,
  editingLogId,
  selectedLogId = null,
  onAddLog,
  isDeleting = false,
  isPanelCollapsed,
  isLogModalOpen,
  onCloseLogModal,
  description,
  setDescription,
  x,
  setX,
  y,
  setY,
  z,
  setZ,
  onSubmit,
  isSaving,
  error,
  isEditing,
}: LogsPanelProps) {
  return (
    <>
      <aside
        className={`
          flex flex-col border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950
          md:min-h-0 md:flex-1 md:overflow-hidden md:border-l md:border-t-0 md:flex-none md:shrink-0
          ${isPanelCollapsed ? "md:w-10" : "md:w-[448px]"}
        `}
      >
        <div
          className={`flex flex-col p-3 md:min-h-0 md:flex-1 md:overflow-hidden ${isPanelCollapsed ? "md:hidden" : ""}`}
        >
          <LogsList
              logs={logs}
              selectedCell={selectedCell}
              onClearSelection={onClearSelection}
              onLogClick={onLogClick}
              onLogSelect={onLogSelect}
              onDeleteLog={onDeleteLog}
              onAddLog={onAddLog}
              onMiniMapCellClick={onMiniMapCellClick}
              editingLogId={editingLogId}
              selectedLogId={selectedLogId}
              isDeleting={isDeleting}
              variant="panel"
            />
        </div>
      </aside>

      <LogFormModal
        isOpen={isLogModalOpen}
        onClose={onCloseLogModal}
        description={description}
        setDescription={setDescription}
        x={x}
        setX={setX}
        y={y}
        setY={setY}
        z={z}
        setZ={setZ}
        onSubmit={onSubmit}
        isSaving={isSaving}
        error={error}
        isEditing={isEditing}
      />
    </>
  );
}
