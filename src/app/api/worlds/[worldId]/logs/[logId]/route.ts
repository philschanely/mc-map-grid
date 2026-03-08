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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ worldId: string; logId: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { worldId, logId } = await params;

  if (!ObjectId.isValid(logId)) {
    return NextResponse.json({ error: "Invalid log ID" }, { status: 400 });
  }

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

  if (zNumber !== null && Number.isNaN(zNumber)) {
    return NextResponse.json(
      { error: "z must be a valid number or null" },
      { status: 400 },
    );
  }

  const collection = await getLogsCollection();
  const result = await collection.findOneAndUpdate(
    {
      _id: new ObjectId(logId),
      worldId,
      userId: session.user.id,
    },
    {
      $set: {
        description: descriptionStr,
        x,
        y,
        z: zNumber,
        xBucket: bucketCoordinate(x),
        yBucket: bucketCoordinate(y),
        zBucket: zNumber === null ? null : bucketCoordinate(zNumber),
      },
    },
    { returnDocument: "after" },
  );

  if (!result) {
    return NextResponse.json({ error: "Log not found" }, { status: 404 });
  }

  const doc = result as LogDocument & { _id?: { toString(): string }; createdAt: Date };
  return NextResponse.json({
    ...doc,
    _id: doc._id?.toString?.(),
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : String(doc.createdAt),
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ worldId: string; logId: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { worldId, logId } = await params;

  if (!ObjectId.isValid(logId)) {
    return NextResponse.json({ error: "Invalid log ID" }, { status: 400 });
  }

  const world = await ensureWorldAccess(worldId, session.user.id);
  if (!world) {
    return NextResponse.json({ error: "World not found" }, { status: 404 });
  }

  const collection = await getLogsCollection();
  const result = await collection.deleteOne({
    _id: new ObjectId(logId),
    worldId,
    userId: session.user.id,
  });

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Log not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
