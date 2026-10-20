import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

const createSchema = z.object({ title: z.string().min(1).max(200), body: z.string().max(10000).default("") });

export async function GET() {
  const user = await getSessionUser(undefined); // placeholder — see middleware for cookie forwarding
  const items = await prisma.item.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  return NextResponse.json({ items, user });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const user = await getSessionUser(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const item = await prisma.item.create({ data: { ...parsed.data, userId: user.id } });
  return NextResponse.json({ item }, { status: 201 });
}
