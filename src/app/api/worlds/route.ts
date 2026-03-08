import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import { getWorldsCollection, type WorldDocument } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const collection = await getWorldsCollection();
  const docs = await collection
    .find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .toArray();

  const serialized = docs.map((doc) => {
    const d = doc as WorldDocument & { _id?: ObjectId; createdAt: Date };
    return {
      ...d,
      _id: d._id?.toString(),
      createdAt: d.createdAt?.toISOString?.() ?? new Date().toISOString(),
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
