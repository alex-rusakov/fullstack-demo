import { NextRequest, NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  await destroySession(req.cookies.get("session")?.value);
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("session");
  return res;
}
