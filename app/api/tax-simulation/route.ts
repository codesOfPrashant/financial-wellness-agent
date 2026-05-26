import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { unauthorizedResponse } from "@/lib/authorization";
import { getDeclarationByEmployee } from "@/lib/storage";
import { runTaxSimulation } from "@/services/tax.service";
import { appendAuditLog } from "@/lib/storage";

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) return unauthorizedResponse();

  const body = await request.json().catch(() => ({}));
  const additional80C = Number(body.additional80C ?? 0);
  const additional80D = body.additional80D != null ? Number(body.additional80D) : undefined;

  if (Number.isNaN(additional80C) || additional80C < 0) {
    return NextResponse.json(
      { error: "additional80C must be a non-negative number" },
      { status: 400 }
    );
  }

  const declaration = await getDeclarationByEmployee(session.userId);
  const result = runTaxSimulation(declaration, {
    additional80C,
    additional80D,
  });

  await appendAuditLog({
    employeeId: session.userId,
    action: "TAX_SIMULATION",
    metadata: { additional80C, estimatedTaxSavings: result.estimatedTaxSavings },
  });

  return NextResponse.json({ simulation: result, declaration });
}
