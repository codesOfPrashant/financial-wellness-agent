import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import {
  forbiddenResponse,
  notFoundResponse,
  unauthorizedResponse,
} from "@/lib/authorization";
import {
  appendAuditLog,
  getDeclarationByEmployee,
  getPayrollByEmployee,
  getPayslipById,
  getPayslipsByEmployee,
} from "@/lib/storage";
import { askPayrollAssistant } from "@/services/ai.service";

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) return unauthorizedResponse();

  const body = await request.json().catch(() => ({}));
  const question = (body.question as string)?.trim();
  const payslipId = body.payslipId as string | undefined;

  if (!question) {
    return NextResponse.json(
      { error: "question is required" },
      { status: 400 }
    );
  }

  if (payslipId) {
    const payslip = await getPayslipById(payslipId);
    if (!payslip) return notFoundResponse("Payslip not found");
    if (payslip.employeeId !== session.userId) {
      return forbiddenResponse();
    }
  }

  const [payroll, payslips, declaration] = await Promise.all([
    getPayrollByEmployee(session.userId),
    getPayslipsByEmployee(session.userId),
    getDeclarationByEmployee(session.userId),
  ]);

  const result = await askPayrollAssistant({
    question,
    payroll,
    payslips,
    declaration,
    payslipId,
  });

  await appendAuditLog({
    employeeId: session.userId,
    action: "AI_QUERY",
    metadata: {
      questionLength: question.length,
      sources: result.sources,
      usedLocalFallback: result.usedLocalFallback,
    },
  });

  return NextResponse.json(result);
}
