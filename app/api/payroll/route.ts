import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { unauthorizedResponse } from "@/lib/authorization";
import { getPayrollByEmployee } from "@/lib/storage";
import {
  comparePayslips,
  getDeductionBreakdown,
  getEarningsBreakdown,
} from "@/services/payroll.service";
import { getPayslipsByEmployee } from "@/lib/storage";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return unauthorizedResponse();

  const payroll = await getPayrollByEmployee(session.userId);
  const payslips = await getPayslipsByEmployee(session.userId);
  const comparison = comparePayslips(payslips);

  if (!payroll) {
    return NextResponse.json({
      payroll: null,
      earnings: [],
      deductions: [],
      comparison: null,
    });
  }

  return NextResponse.json({
    payroll,
    earnings: getEarningsBreakdown(payroll),
    deductions: getDeductionBreakdown(payroll),
    comparison,
  });
}
