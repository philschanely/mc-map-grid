"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import type { Log } from "../types";

type DeleteLogConfirmModalProps = {
  isOpen: boolean;
  log: Log | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
};

export function DeleteLogConfirmModal({
  isOpen,
  log,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteLogConfirmModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel className="mx-auto max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
          <DialogTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Delete log?
          </DialogTitle>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {log ? (
              <>
                This will permanently delete{" "}
                <span className="font-medium">
                  {log.description || `(${log.x}, ${log.z ?? "—"}, ${log.y})`}
                </span>
                .
              </>
            ) : (
              "This will permanently delete this log."
            )}
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60 dark:bg-red-500 dark:hover:bg-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
