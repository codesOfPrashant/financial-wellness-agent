import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { unauthorizedResponse } from "@/lib/authorization";
import {
  getDeclarationByEmployee,
  getPayrollByEmployee,
} from "@/lib/storage";
import { buildProofChecklist } from "@/services/checklist.service";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return unauthorizedResponse();

  const [declaration, payroll] = await Promise.all([
    getDeclarationByEmployee(session.userId),
    getPayrollByEmployee(session.userId),
  ]);

  const checklist = buildProofChecklist(declaration, payroll);

  return NextResponse.json({ checklist, declaration });
}
