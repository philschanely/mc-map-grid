"use client";

import type { FormEvent } from "react";
import { Field, Input, Label } from "@headlessui/react";
import { bucketCoordinateFromString } from "@/lib/coordinates";
import { useCoordinateDisplay } from "../hooks";

type CoordinateFormProps = {
  description: string;
  setDescription: (v: string) => void;
  x: string;
  setX: (v: string) => void;
  y: string;
  setY: (v: string) => void;
  z: string;
  setZ: (v: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onGoToCoordinates?: () => void;
  isSaving: boolean;
  error: string | null;
  variant?: "default" | "bar";
};

export function CoordinateForm({
  description,
  setDescription,
  x,
  setX,
  y,
  setY,
  z,
  setZ,
  onSubmit,
  onGoToCoordinates,
  isSaving,
  error,
  variant = "default",
}: CoordinateFormProps) {
  const { xDisplay, yDisplay, zDisplay } = useCoordinateDisplay(x, y, z);

  if (variant === "bar") {
    return (
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex w-16 flex-col gap-1">
            <label className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
              X
            </label>
            <input
              type="number"
              required
              value={x}
              onChange={(e) => setX(e.target.value)}
              className="h-8 rounded border border-zinc-300 bg-white px-2 text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
            <span className="text-[10px] text-zinc-500">{xDisplay}</span>
          </div>
          <div className="flex w-16 flex-col gap-1">
            <label className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
              Z
            </label>
            <input
              type="number"
              value={z}
              onChange={(e) => setZ(e.target.value)}
              className="h-8 rounded border border-zinc-300 bg-white px-2 text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
            <span className="text-[10px] text-zinc-500">{zDisplay}</span>
          </div>
          <div className="flex w-16 flex-col gap-1">
            <label className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
              Y
            </label>
            <input
              type="number"
              required
              value={y}
              onChange={(e) => setY(e.target.value)}
              className="h-8 rounded border border-zinc-300 bg-white px-2 text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
            <span className="text-[10px] text-zinc-500">{yDisplay}</span>
          </div>
          <div className="flex w-full flex-col gap-1 md:min-w-0 md:max-w-[600px] md:flex-1">
            <label className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this location?"
              rows={2}
              className="min-h-[52px] w-full resize-y rounded border border-zinc-300 bg-white px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div className="flex w-full gap-2 md:w-auto md:contents">
            <button
              type="button"
              onClick={onGoToCoordinates}
              disabled={
                !onGoToCoordinates ||
                bucketCoordinateFromString(x) === null ||
                bucketCoordinateFromString(z) === null
              }
              className="h-8 shrink-0 rounded border border-zinc-300 bg-white px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              Go to
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="h-8 shrink-0 rounded bg-zinc-900 px-3 text-xs font-medium text-zinc-50 hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-4">
      <Field className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Label className="w-16 shrink-0 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            X
          </Label>
          <Input
            type="number"
            required
            value={x}
            onChange={(e) => setX(e.target.value)}
            className="h-10 flex-1 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none ring-0 transition-colors placeholder:text-zinc-400 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-400"
          />
          <p className="min-w-[56px] text-xs text-zinc-500 dark:text-zinc-400">
            {xDisplay}
          </p>
        </div>
      </Field>

      <Field className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Label className="w-16 shrink-0 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Z
          </Label>
          <Input
            type="number"
            value={z}
            onChange={(e) => setZ(e.target.value)}
            className="h-10 flex-1 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none ring-0 transition-colors placeholder:text-zinc-400 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-400"
          />
          <p className="min-w-[56px] text-xs text-zinc-500 dark:text-zinc-400">
            {zDisplay}
          </p>
        </div>
      </Field>

      <Field className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Label className="w-16 shrink-0 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Y
          </Label>
          <Input
            type="number"
            required
            value={y}
            onChange={(e) => setY(e.target.value)}
            className="h-10 flex-1 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none ring-0 transition-colors placeholder:text-zinc-400 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-400"
          />
          <p className="min-w-[56px] text-xs text-zinc-500 dark:text-zinc-400">
            {yDisplay}
          </p>
        </div>
      </Field>

      <Field className="flex max-w-[600px] flex-col gap-2">
        <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Description
        </Label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this location?"
          rows={3}
          className="w-full resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 transition-colors placeholder:text-zinc-400 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-400"
        />
      </Field>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="flex justify-end gap-2">
        {onGoToCoordinates && (
          <button
            type="button"
            onClick={onGoToCoordinates}
            disabled={
              bucketCoordinateFromString(x) === null ||
              bucketCoordinateFromString(z) === null
            }
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            Go to coordinates
          </button>
        )}
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isSaving ? "Saving..." : "Save log"}
        </button>
      </div>
    </form>
  );
}
