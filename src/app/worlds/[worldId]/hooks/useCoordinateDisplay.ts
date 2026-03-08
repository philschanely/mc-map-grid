"use client";

import { bucketCoordinateFromString } from "@/lib/coordinates";

export function useCoordinateDisplay(x: string, y: string, z: string) {
  const xValue = bucketCoordinateFromString(x);
  const yValue = bucketCoordinateFromString(y);
  const zValue = bucketCoordinateFromString(z);

  const xDirection = (() => {
    if (x.trim() === "") return null;
    const n = Number(x);
    if (Number.isNaN(n) || n === 0) return null;
    return n > 0 ? "E" : "W";
  })();

  const yDirection = (() => {
    if (y.trim() === "") return null;
    const n = Number(y);
    if (Number.isNaN(n) || n === 0) return null;
    return n > 0 ? "S" : "N";
  })();

  const xDisplay =
    xValue === null ? "" : `${xDirection ? `${xDirection} ` : ""}${xValue}`;
  const yDisplay =
    yValue === null ? "" : `${yDirection ? `${yDirection} ` : ""}${yValue}`;
  const zDisplay = zValue === null ? "" : `${zValue}`;

  return { xDisplay, yDisplay, zDisplay };
}
