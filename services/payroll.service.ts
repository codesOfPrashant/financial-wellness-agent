import type { PayslipRecord, PayrollSummary } from "@/types";
import { monthSortKey } from "@/utils/format";

export function buildPayrollSummaryFromPayslip(
  payslip: PayslipRecord
): PayrollSummary {
  const totalDeductions =
    payslip.pf + payslip.professionalTax + payslip.tds;

  return {
    employeeId: payslip.employeeId,
    latestMonth: payslip.month,
    basicSalary: payslip.basicSalary,
    hra: payslip.hra,
    specialAllowance: payslip.specialAllowance,
    lta: payslip.lta ?? 0,
    pf: payslip.pf,
    professionalTax: payslip.professionalTax,
    tds: payslip.tds,
    reimbursements: payslip.reimbursements,
    grossPay: payslip.grossPay,
    netPay: payslip.netPay,
    ytdGross: payslip.ytdGross,
    ytdTax: payslip.ytdTax,
    totalDeductions,
  };
}

export interface DeductionLine {
  label: string;
  amount: number;
  description: string;
}

export function getDeductionBreakdown(
  payroll: PayrollSummary
): DeductionLine[] {
  return [
    {
      label: "Provident Fund (PF)",
      amount: payroll.pf,
      description:
        "Employee contribution to EPF, typically 12% of basic (capped). Deducted pre-tax from salary.",
    },
    {
      label: "Professional Tax",
      amount: payroll.professionalTax,
      description: "State-mandated tax on employment income.",
    },
    {
      label: "TDS (Tax Deducted at Source)",
      amount: payroll.tds,
      description:
        "Income tax withheld by employer based on declared investments and projected annual income.",
    },
  ];
}

export interface EarningLine {
  label: string;
  amount: number;
}

export function getEarningsBreakdown(payroll: PayrollSummary): EarningLine[] {
  return [
    { label: "Basic Salary", amount: payroll.basicSalary },
    { label: "HRA", amount: payroll.hra },
    { label: "Special Allowance", amount: payroll.specialAllowance },
    { label: "LTA", amount: payroll.lta },
    { label: "Reimbursements", amount: payroll.reimbursements },
  ];
}

export interface PayslipComparison {
  previous: PayslipRecord;
  current: PayslipRecord;
  netPayDelta: number;
  grossPayDelta: number;
  insights: string[];
}

export function comparePayslips(
  payslips: PayslipRecord[]
): PayslipComparison | null {
  if (payslips.length < 2) return null;

  const sorted = [...payslips].sort(
    (a, b) => monthSortKey(a.month) - monthSortKey(b.month)
  );
  const previous = sorted[sorted.length - 2];
  const current = sorted[sorted.length - 1];

  const netPayDelta = current.netPay - previous.netPay;
  const grossPayDelta = current.grossPay - previous.grossPay;
  const insights: string[] = [];

  if (netPayDelta < 0) {
    insights.push(
      `Net pay decreased by ₹${Math.abs(netPayDelta).toLocaleString("en-IN")} compared to ${previous.month}.`
    );
  } else if (netPayDelta > 0) {
    insights.push(
      `Net pay increased by ₹${netPayDelta.toLocaleString("en-IN")} compared to ${previous.month}.`
    );
  }

  const tdsDelta = current.tds - previous.tds;
  if (tdsDelta !== 0) {
    insights.push(
      `TDS changed by ₹${Math.abs(tdsDelta).toLocaleString("en-IN")} (${tdsDelta > 0 ? "higher" : "lower"} withholding).`
    );
  }

  const ltaPrev = previous.lta ?? 0;
  const ltaCurr = current.lta ?? 0;
  if (ltaPrev > 0 && ltaCurr === 0) {
    insights.push(
      "LTA was paid in the previous month but not in the current month — this may reduce gross pay."
    );
  }

  const reimbDelta = current.reimbursements - previous.reimbursements;
  if (reimbDelta !== 0) {
    insights.push(
      `Reimbursements changed by ₹${Math.abs(reimbDelta).toLocaleString("en-IN")}.`
    );
  }

  return { previous, current, netPayDelta, grossPayDelta, insights };
}
