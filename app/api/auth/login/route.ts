import { NextResponse } from "next/server";
import {
  createSessionToken,
  getSessionCookieName,
  getSessionMaxAge,
} from "@/lib/auth";
import { getEmployeeById } from "@/lib/storage";
import { appendAuditLog } from "@/lib/storage";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const employeeId = body.employeeId as string | undefined;

  if (!employeeId) {
    return NextResponse.json(
      { error: "employeeId is required" },
      { status: 400 }
    );
  }

  const employee = await getEmployeeById(employeeId);
  if (!employee) {
    return NextResponse.json(
      { error: "Invalid employee credentials" },
      { status: 401 }
    );
  }

  const token = await createSessionToken(employee.id);

  await appendAuditLog({
    employeeId: employee.id,
    action: "LOGIN",
    metadata: { email: employee.email },
  });

  const response = NextResponse.json({
    user: {
      userId: employee.id,
      name: employee.name,
      email: employee.email,
    },
  });

  response.cookies.set(getSessionCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: getSessionMaxAge(),
    path: "/",
  });

  return response;
}
