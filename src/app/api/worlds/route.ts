import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import {
  getWorldsCollection,
  getLogsCollection,
  type WorldDocument,
} from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [worldsCollection, logsCollection] = await Promise.all([
    getWorldsCollection(),
    getLogsCollection(),
  ]);

  const docs = await worldsCollection
    .find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .toArray();

  const logCounts = await logsCollection
    .aggregate<{ _id: string; count: number }>([
      { $match: { userId: session.user.id } },
      { $group: { _id: "$worldId", count: { $sum: 1 } } },
    ])
    .toArray();

  const countByWorldId = new Map(
    logCounts.map((c) => [c._id, c.count]),
  );

  const serialized = docs.map((doc) => {
    const d = doc as WorldDocument & { _id?: ObjectId; createdAt: Date };
    const worldId = d._id?.toString();
    return {
      ...d,
      _id: worldId,
      createdAt: d.createdAt?.toISOString?.() ?? new Date().toISOString(),
      logCount: worldId ? (countByWorldId.get(worldId) ?? 0) : 0,
    };
  });

  return NextResponse.json(serialized, { status: 200 });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, description } = body as { name?: unknown; description?: unknown };

  if (typeof name !== "string" || name.trim() === "") {
    return NextResponse.json(
      { error: "name is required and must be a non-empty string" },
      { status: 400 },
    );
  }

  const descriptionStr =
    typeof description === "string" ? description : "";

  const doc: WorldDocument = {
    userId: session.user.id,
    name: name.trim(),
    description: descriptionStr.trim(),
    createdAt: new Date(),
  };

  const collection = await getWorldsCollection();
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
