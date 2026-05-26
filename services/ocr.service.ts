import type { EmployeeId, PayslipRecord } from "@/types";

const PAYSLIP_TEMPLATES: Record<
  string,
  Omit<PayslipRecord, "id" | "employeeId" | "fileName" | "uploadedAt">
> = {
  emp_101: {
    month: "May 2026",
    basicSalary: 50000,
    hra: 20000,
    specialAllowance: 15000,
    lta: 0,
    pf: 1800,
    professionalTax: 200,
    tds: 5100,
    reimbursements: 2800,
    grossPay: 87800,
    netPay: 75700,
    ytdGross: 453300,
    ytdTax: 24500,
  },
  emp_102: {
    month: "May 2026",
    basicSalary: 65000,
    hra: 26000,
    specialAllowance: 20000,
    lta: 0,
    pf: 2340,
    professionalTax: 200,
    tds: 7600,
    reimbursements: 3200,
    grossPay: 114540,
    netPay: 101200,
    ytdGross: 593400,
    ytdTax: 36700,
  },
};

export interface OcrResult {
  success: boolean;
  data?: Omit<PayslipRecord, "id" | "uploadedAt">;
  error?: string;
  processingDelayMs: number;
}

export interface OcrValidationError {
  field: string;
  message: string;
}

export function validateOcrPayload(
  data: Partial<PayslipRecord>
): OcrValidationError[] {
  const errors: OcrValidationError[] = [];
  const requiredNumeric = [
    "basicSalary",
    "hra",
    "pf",
    "tds",
    "grossPay",
    "netPay",
  ] as const;

  for (const field of requiredNumeric) {
    const val = data[field];
    if (val === undefined || val === null || Number.isNaN(Number(val))) {
      errors.push({ field, message: `Missing or invalid ${field}` });
    }
  }

  if (data.grossPay != null && data.netPay != null && data.netPay > data.grossPay) {
    errors.push({
      field: "netPay",
      message: "Net pay cannot exceed gross pay",
    });
  }

  return errors;
}

export async function extractPayslipData(
  employeeId: EmployeeId,
  fileName: string
): Promise<OcrResult> {
  const processingDelayMs = 800 + Math.floor(Math.random() * 400);
  await new Promise((r) => setTimeout(r, processingDelayMs));

  const ext = fileName.split(".").pop()?.toLowerCase();
  if (!ext || !["pdf", "png", "jpg", "jpeg", "webp"].includes(ext)) {
    return {
      success: false,
      error: "Unsupported file type. Upload PDF or image (PNG/JPG).",
      processingDelayMs,
    };
  }

  const template = PAYSLIP_TEMPLATES[employeeId];
  if (!template) {
    return {
      success: false,
      error: "No payslip template configured for this employee.",
      processingDelayMs,
    };
  }

  return {
    success: true,
    data: {
      employeeId,
      fileName,
      ...template,
    },
    processingDelayMs,
  };
}
