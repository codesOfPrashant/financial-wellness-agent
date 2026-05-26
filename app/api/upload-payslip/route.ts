import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { unauthorizedResponse } from "@/lib/authorization";
import {
  appendAuditLog,
  savePayslip,
  upsertPayrollSummary,
} from "@/lib/storage";
import {
  extractPayslipData,
  validateOcrPayload,
} from "@/services/ocr.service";
import { buildPayrollSummaryFromPayslip } from "@/services/payroll.service";
import type { PayslipRecord } from "@/types";

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) return unauthorizedResponse();

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const ocrResult = await extractPayslipData(session.userId, file.name);

  if (!ocrResult.success || !ocrResult.data) {
    return NextResponse.json(
      { error: ocrResult.error ?? "OCR extraction failed" },
      { status: 422 }
    );
  }

  const record: PayslipRecord = {
    id: `ps_${session.userId}_${Date.now()}`,
    uploadedAt: new Date().toISOString(),
    ...ocrResult.data,
  };

  const validationErrors = validateOcrPayload(record);
  if (validationErrors.length > 0) {
    return NextResponse.json(
      { error: "Invalid OCR output", details: validationErrors },
      { status: 422 }
    );
  }

  await savePayslip(record);
  await upsertPayrollSummary(buildPayrollSummaryFromPayslip(record));

  await appendAuditLog({
    employeeId: session.userId,
    action: "PAYSLIP_UPLOAD",
    metadata: {
      payslipId: record.id,
      month: record.month,
      fileName: record.fileName,
    },
  });

  return NextResponse.json({
    payslip: record,
    ocr: {
      delayMs: ocrResult.processingDelayMs,
    },
  });
}
