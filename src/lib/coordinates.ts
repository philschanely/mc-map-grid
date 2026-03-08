export function bucketCoordinate(n: number): number {
  if (Number.isNaN(n)) {
    throw new Error("bucketCoordinate received NaN");
  }

  if (n > 0) {
    return Math.floor((n + 64) / 128);
  }

  if (n < 0) {
    return Math.ceil((n - 64) / 128);
  }

  return 0;
}

export function bucketCoordinateFromString(value: string): number | null {
  if (value.trim() === "") return null;

  const n = Number(value);
  if (Number.isNaN(n)) return null;

  return bucketCoordinate(n);
}

/** Block index 0-127 within a bucket. Bucket b spans 128*b-64 to 128*b-64+127. */
export function subIndexInBucket(blockCoord: number, bucket: number): number {
  const start = 128 * bucket - 64;
  const sub = blockCoord - start;
  return Math.max(0, Math.min(127, Math.floor(sub)));
}

