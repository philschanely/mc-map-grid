import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import { getWorldsCollection } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ worldId: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { worldId } = await params;

  if (!ObjectId.isValid(worldId)) {
    return NextResponse.json({ error: "Invalid world id" }, { status: 400 });
  }

  const collection = await getWorldsCollection();
  const doc = await collection.findOne({
    _id: new ObjectId(worldId),
    userId: session.user.id,
  });

  if (!doc) {
    return NextResponse.json({ error: "World not found" }, { status: 404 });
  }

  const d = doc as typeof doc & { _id: ObjectId; createdAt: Date };
  return NextResponse.json({
    ...d,
    _id: d._id.toString(),
    createdAt: d.createdAt?.toISOString?.() ?? new Date().toISOString(),
  });
}
