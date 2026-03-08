"use client";

import type { FormEvent } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { CoordinateForm } from "./CoordinateForm";

type LogFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  description: string;
  setDescription: (v: string) => void;
  x: string;
  setX: (v: string) => void;
  y: string;
  setY: (v: string) => void;
  z: string;
  setZ: (v: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isSaving: boolean;
  error: string | null;
  isEditing?: boolean;
};

export function LogFormModal({
  isOpen,
  onClose,
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
  isEditing = false,
}: LogFormModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel className="relative mx-auto max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 rounded p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden
            >
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-2.72 2.72a.75.75 0 101.06 1.06L10 11.06l2.72 2.72a.75.75 0 101.06-1.06L11.06 10l2.72-2.72a.75.75 0 00-1.06-1.06L10 8.94 7.28 6.22z" />
            </svg>
          </button>
          <DialogTitle className="pr-8 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {isEditing ? "Edit log" : "Add log"}
          </DialogTitle>

          <div className="mt-4">
            <CoordinateForm
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
              variant="default"
            />
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
