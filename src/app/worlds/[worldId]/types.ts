export type World = {
  _id: string;
  name: string;
  description: string;
};

export type Log = {
  _id?: string;
  description?: string;
  x: number;
  y: number;
  z?: number | null;
  xBucket: number;
  yBucket: number;
  zBucket?: number | null;
  createdAt: string;
};

export type CellCoord = {
  xBucket: number;
  yBucket: number;
};

export type GridRange = {
  minNs: number;
  maxNs: number;
  minEw: number;
  maxEw: number;
};
