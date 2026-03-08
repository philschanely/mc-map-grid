"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GridRange } from "../types";

const CELL_SIZE = 48;
const GAP = 4;
const SENTINEL_SIZE = 16;
const EXPAND_AMOUNT = 12;

export function useWorldGrid(world: { _id: string } | null) {
  const [gridRange, setGridRange] = useState<GridRange>({
    minNs: -4,
    maxNs: 4,
    minEw: -4,
    maxEw: 4,
  });
  const [selectedCell, setSelectedCell] = useState<{
    xBucket: number;
    yBucket: number;
  } | null>(null);
  const [flashingCell, setFlashingCell] = useState<{
    xBucket: number;
    yBucket: number;
  } | null>(null);
  const gridScrollRef = useRef<HTMLDivElement>(null);
  const lastExpandRef = useRef<Record<string, number>>({});
  const pendingGoToRef = useRef<{ xBucket: number; yBucket: number } | null>(
    null,
  );

  const expandGrid = useCallback((direction: "north" | "south" | "east" | "west") => {
    setGridRange((prev) => {
      switch (direction) {
        case "north":
          return { ...prev, minNs: prev.minNs - EXPAND_AMOUNT };
        case "south":
          return { ...prev, maxNs: prev.maxNs + EXPAND_AMOUNT };
        case "east":
          return { ...prev, maxEw: prev.maxEw + EXPAND_AMOUNT };
        case "west":
          return { ...prev, minEw: prev.minEw - EXPAND_AMOUNT };
        default:
          return prev;
      }
    });
  }, []);

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
        return;
      }

      pendingGoToRef.current = cell;
      const buffer = 2;
      setGridRange((prev) => ({
        minNs: Math.min(prev.minNs, cell.yBucket - buffer),
        maxNs: Math.max(prev.maxNs, cell.yBucket + buffer),
        minEw: Math.min(prev.minEw, cell.xBucket - buffer),
        maxEw: Math.max(prev.maxEw, cell.xBucket + buffer),
      }));
    },
    [gridRange, scrollToCell],
  );

  useEffect(() => {
    const pending = pendingGoToRef.current;
    if (!pending) return;

    const inRange =
      pending.yBucket >= gridRange.minNs &&
      pending.yBucket <= gridRange.maxNs &&
      pending.xBucket >= gridRange.minEw &&
      pending.xBucket <= gridRange.maxEw;

    if (inRange) {
      pendingGoToRef.current = null;
      scrollToCell(pending);
    }
  }, [gridRange, scrollToCell]);

  useEffect(() => {
    const el = gridScrollRef.current;
    if (!el || !world) return;

    const row = 0 - gridRange.minNs;
    const col = 0 - gridRange.minEw;
    const top = SENTINEL_SIZE + row * (CELL_SIZE + GAP);
    const left = SENTINEL_SIZE + col * (CELL_SIZE + GAP);
    el.scrollTop = Math.max(0, top - el.clientHeight / 2 + CELL_SIZE / 2);
    el.scrollLeft = Math.max(0, left - el.clientWidth / 2 + CELL_SIZE / 2);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run when world loads
  }, [world]);

  useEffect(() => {
    const el = gridScrollRef.current;
    if (!el) return;

    const ensureOverflow = () => {
      const { scrollHeight, clientHeight, scrollWidth, clientWidth } = el;
      const needsVertical = scrollHeight <= clientHeight;
      const needsHorizontal = scrollWidth <= clientWidth;
      if (needsVertical) expandGrid("south");
      if (needsHorizontal) expandGrid("east");
    };

    const raf = requestAnimationFrame(() => {
      ensureOverflow();
    });

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(ensureOverflow);
    });
    observer.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [world, expandGrid, gridRange]);

  useEffect(() => {
    const el = gridScrollRef.current;
    if (!el) return;

    const edgeThreshold = 100;
    const throttleMs = 200;

    const handleScroll = () => {
      const now = Date.now();
      const { scrollTop, scrollLeft, scrollHeight, clientHeight, scrollWidth, clientWidth } = el;
      const canExpandNorth = scrollHeight > clientHeight;
      const canExpandSouth = scrollHeight > clientHeight;
      const canExpandWest = scrollWidth > clientWidth;
      const canExpandEast = scrollWidth > clientWidth;

      if (canExpandNorth && scrollTop < edgeThreshold && (now - (lastExpandRef.current.north ?? 0)) > throttleMs) {
        lastExpandRef.current.north = now;
        expandGrid("north");
      }
      if (canExpandSouth && scrollTop + clientHeight > scrollHeight - edgeThreshold && (now - (lastExpandRef.current.south ?? 0)) > throttleMs) {
        lastExpandRef.current.south = now;
        expandGrid("south");
      }
      if (canExpandWest && scrollLeft < edgeThreshold && (now - (lastExpandRef.current.west ?? 0)) > throttleMs) {
        lastExpandRef.current.west = now;
        expandGrid("west");
      }
      if (canExpandEast && scrollLeft + clientWidth > scrollWidth - edgeThreshold && (now - (lastExpandRef.current.east ?? 0)) > throttleMs) {
        lastExpandRef.current.east = now;
        expandGrid("east");
      }
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [world, expandGrid]);

  return {
    gridRange,
    selectedCell,
    setSelectedCell,
    flashingCell,
    gridScrollRef,
    scrollToCell,
    goToCell,
    expandGrid,
    cellSize: CELL_SIZE,
    gap: GAP,
  };
}
