import { MongoClient, type Db, type Collection } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri) {
  throw new Error("MONGODB_URI is not set");
}

if (!dbName) {
  throw new Error("MONGODB_DB is not set");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}

export interface WorldDocument {
  userId: string;
  name: string;
  description: string;
  createdAt: Date;
}

export interface LogDocument {
  userId: string;
  worldId: string;
  description: string;
  x: number;
  y: number;
  z?: number | null;
  xBucket: number;
  yBucket: number;
  zBucket?: number | null;
  createdAt: Date;
  meta?: Record<string, unknown>;
}

export async function getWorldsCollection(): Promise<
  Collection<WorldDocument>
> {
  const db = await getDb();
  return db.collection<WorldDocument>("worlds");
}

export async function getLogsCollection(): Promise<Collection<LogDocument>> {
  const db = await getDb();
  return db.collection<LogDocument>("logs");
}

