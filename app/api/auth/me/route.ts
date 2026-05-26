import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { unauthorizedResponse } from "@/lib/authorization";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return unauthorizedResponse();
  return NextResponse.json({ user: session });
}
