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

