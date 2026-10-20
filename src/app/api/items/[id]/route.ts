import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

const updateSchema = z.object({ title: z.string().min(1).max(200).optional(), body: z.string().max(10000).optional() });

async function ownedItem(req: NextRequest, id: number) {
  const user = await getSessionUser(req.cookies.get("session")?.value);
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const item = await prisma.item.findUnique({ where: { id } });
  if (!item || item.userId !== user.id) return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  return { item };
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { error, item } = await ownedItem(req, Number(params.id));
  if (error) return error;
  return NextResponse.json({ item });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { error, item } = await ownedItem(req, Number(params.id));
  if (error) return error;
  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const updated = await prisma.item.update({ where: { id: item!.id }, data: parsed.data });
  return NextResponse.json({ item: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { error, item } = await ownedItem(req, Number(params.id));
  if (error) return error;
  await prisma.item.delete({ where: { id: item!.id } });
  return NextResponse.json({ ok: true });
}
