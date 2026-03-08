"use client";

import type { FormEvent } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Field,
  Input,
  Label,
} from "@headlessui/react";

type CreateWorldModalProps = {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isCreating: boolean;
  error: string | null;
};

export function CreateWorldModal({
  isOpen,
  onClose,
  name,
  setName,
  description,
  setDescription,
  onSubmit,
  isCreating,
  error,
}: CreateWorldModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel className="mx-auto max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
          <DialogTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Create a world
          </DialogTitle>

          <form
            onSubmit={onSubmit}
            className="mt-4 flex flex-col gap-4"
          >
            <Field className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Name
              </Label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="World name"
                className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none ring-0 transition-colors placeholder:text-zinc-400 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-400"
              />
            </Field>
            <Field className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Description
              </Label>
              <Input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none ring-0 transition-colors placeholder:text-zinc-400 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-400"
              />
            </Field>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {isCreating ? "Creating..." : "Create world"}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
