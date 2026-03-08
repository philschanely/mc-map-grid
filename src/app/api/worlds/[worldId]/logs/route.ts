import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import { bucketCoordinate } from "@/lib/coordinates";
import {
  getWorldsCollection,
  getLogsCollection,
  type LogDocument,
} from "@/lib/db";

async function ensureWorldAccess(worldId: string, userId: string) {
  if (!ObjectId.isValid(worldId)) return null;
  const worlds = await getWorldsCollection();
  const world = await worlds.findOne({
    _id: new ObjectId(worldId),
    userId,
  });
  return world;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ worldId: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { worldId } = await params;

  const world = await ensureWorldAccess(worldId, session.user.id);
  if (!world) {
    return NextResponse.json({ error: "World not found" }, { status: 404 });
  }

  const collection = await getLogsCollection();
  const docs = await collection
    .find({ worldId, userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  const serialized = docs.map((doc) => {
    const d = doc as LogDocument & { _id?: { toString(): string } };
    return {
      ...d,
      _id: d._id?.toString?.(),
      createdAt:
        d.createdAt instanceof Date
          ? d.createdAt.toISOString()
          : String(d.createdAt),
    };
  });

  return NextResponse.json(serialized, { status: 200 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ worldId: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { worldId } = await params;

  const world = await ensureWorldAccess(worldId, session.user.id);
  if (!world) {
    return NextResponse.json({ error: "World not found" }, { status: 404 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { description, x, y, z } = body as {
    description?: unknown;
    x?: unknown;
    y?: unknown;
    z?: unknown;
  };

  if (typeof x !== "number" || typeof y !== "number") {
    return NextResponse.json(
      { error: "x and y must be numbers" },
      { status: 400 },
    );
  }

  const descriptionStr =
    typeof description === "string" ? description.trim() : "";
  const zNumber = typeof z === "number" ? z : null;

  const doc: LogDocument = {
    userId: session.user.id,
    worldId,
    description: descriptionStr,
    x,
    y,
    z: zNumber,
    xBucket: bucketCoordinate(x),
    yBucket: bucketCoordinate(y),
    zBucket: zNumber === null ? null : bucketCoordinate(zNumber),
    createdAt: new Date(),
  };

  const collection = await getLogsCollection();
  const result = await collection.insertOne(doc);

  return NextResponse.json(
    {
      ...doc,
      _id: result.insertedId.toString(),
      createdAt: doc.createdAt.toISOString(),
    },
    { status: 201 },
  );
}
