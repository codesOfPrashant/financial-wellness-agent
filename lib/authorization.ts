import { NextResponse } from "next/server";
import type { SessionUser } from "@/types";

export function unauthorizedResponse(message = "Unauthorized"): NextResponse {
  return NextResponse.json({ error: message, code: "UNAUTHORIZED" }, { status: 401 });
}

export function forbiddenResponse(message = "Forbidden"): NextResponse {
  return NextResponse.json({ error: message, code: "FORBIDDEN" }, { status: 403 });
}

export function notFoundResponse(message = "Not found"): NextResponse {
  return NextResponse.json({ error: message, code: "NOT_FOUND" }, { status: 404 });
}

export function assertOwnership(
  session: SessionUser,
  recordEmployeeId: string
): boolean {
  return session.userId === recordEmployeeId;
}

export function requireOwnership(
  session: SessionUser,
  recordEmployeeId: string
): NextResponse | null {
  if (!assertOwnership(session, recordEmployeeId)) {
    return forbiddenResponse(
      "You do not have permission to access this resource."
    );
  }
  return null;
}
