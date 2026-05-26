import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import {
  forbiddenResponse,
  notFoundResponse,
  unauthorizedResponse,
} from "@/lib/authorization";
import { getPayslipById, getPayslipsByEmployee } from "@/lib/storage";

export async function GET(request: NextRequest) {
  const session = await getSessionUser();
  if (!session) return unauthorizedResponse();

  const id = request.nextUrl.searchParams.get("id");

  if (id) {
    const payslip = await getPayslipById(id);
    if (!payslip) return notFoundResponse("Payslip not found");
    if (payslip.employeeId !== session.userId) {
      return forbiddenResponse();
    }
    return NextResponse.json({ payslip });
  }

  const payslips = await getPayslipsByEmployee(session.userId);
  return NextResponse.json({ payslips });
}
