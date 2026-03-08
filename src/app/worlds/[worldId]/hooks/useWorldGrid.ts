"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GridRange } from "../types";
import type { Log } from "../types";

const CELL_SIZE = 48;
const GAP = 4;
const SENTINEL_SIZE = 16;
const PADDING = 3;
const DEFAULT_EXTENT = 5;

function computeGridRange(logs: Log[]): GridRange {
  if (logs.length === 0) {
    return {
      minNs: -DEFAULT_EXTENT,
      maxNs: DEFAULT_EXTENT,
      minEw: -DEFAULT_EXTENT,
      maxEw: DEFAULT_EXTENT,
    };
  }

  const minEw = Math.min(...logs.map((l) => l.xBucket)) - PADDING;
  const maxEw = Math.max(...logs.map((l) => l.xBucket)) + PADDING;
  const minNs = Math.min(...logs.map((l) => l.yBucket)) - PADDING;
  const maxNs = Math.max(...logs.map((l) => l.yBucket)) + PADDING;

  return { minNs, maxNs, minEw, maxEw };
}

export function useWorldGrid(world: { _id: string } | null, logs: Log[]) {
  const gridRange = useMemo(() => computeGridRange(logs), [logs]);
  const [selectedCell, setSelectedCell] = useState<{
    xBucket: number;
    yBucket: number;
  } | null>(null);
  const [flashingCell, setFlashingCell] = useState<{
    xBucket: number;
    yBucket: number;
  } | null>(null);
  const gridScrollRef = useRef<HTMLDivElement>(null);

  const scrollToCell = useCallback(
    (cell: { xBucket: number; yBucket: number }) => {
      const el = gridScrollRef.current;
      if (!el) return;
      const inRange =
        cell.yBucket >= gridRange.minNs &&
        cell.yBucket <= gridRange.maxNs &&
        cell.xBucket >= gridRange.minEw &&
        cell.xBucket <= gridRange.maxEw;
      if (!inRange) return;
      const row = cell.yBucket - gridRange.minNs;
      const col = cell.xBucket - gridRange.minEw;
      const top = SENTINEL_SIZE + row * (CELL_SIZE + GAP);
      const left = SENTINEL_SIZE + col * (CELL_SIZE + GAP);
      el.scrollTo({
        top: Math.max(0, top - el.clientHeight / 2 + CELL_SIZE / 2),
        left: Math.max(0, left - el.clientWidth / 2 + CELL_SIZE / 2),
        behavior: "smooth",
      });
      setTimeout(() => {
        setFlashingCell(cell);
        setTimeout(() => setFlashingCell(null), 800);
      }, 400);
    },
    [gridRange],
  );

  const goToCell = useCallback(
    (cell: { xBucket: number; yBucket: number }) => {
      const inRange =
        cell.yBucket >= gridRange.minNs &&
        cell.yBucket <= gridRange.maxNs &&
        cell.xBucket >= gridRange.minEw &&
        cell.xBucket <= gridRange.maxEw;

      if (inRange) {
        scrollToCell(cell);
      }
    },
    [gridRange, scrollToCell],
  );

  useEffect(() => {
    const el = gridScrollRef.current;
    if (!el || !world) return;

    const originInRange =
      gridRange.minNs <= 0 &&
      gridRange.maxNs >= 0 &&
      gridRange.minEw <= 0 &&
      gridRange.maxEw >= 0;

    const row = originInRange
      ? 0 - gridRange.minNs
      : Math.floor((gridRange.minNs + gridRange.maxNs) / 2) - gridRange.minNs;
    const col = originInRange
      ? 0 - gridRange.minEw
      : Math.floor((gridRange.minEw + gridRange.maxEw) / 2) - gridRange.minEw;

    const top = SENTINEL_SIZE + row * (CELL_SIZE + GAP);
    const left = SENTINEL_SIZE + col * (CELL_SIZE + GAP);
    el.scrollTop = Math.max(0, top - el.clientHeight / 2 + CELL_SIZE / 2);
    el.scrollLeft = Math.max(0, left - el.clientWidth / 2 + CELL_SIZE / 2);
  }, [world, gridRange]);

  return {
    gridRange,
    selectedCell,
    setSelectedCell,
    flashingCell,
    gridScrollRef,
    scrollToCell,
    goToCell,
    cellSize: CELL_SIZE,
    gap: GAP,
  };
}
