import { describe, it, expect } from "vitest";
import {
  buildPayrollSummaryFromPayslip,
  comparePayslips,
  getDeductionBreakdown,
  getEarningsBreakdown,
} from "@/services/payroll.service";
import {
  PRIYA_APRIL_PAYSLIP,
  PRIYA_MARCH_PAYSLIP,
  PRIYA_NET_PAY_DROP,
  PRIYA_PAYROLL_SUMMARY,
} from "./fixtures/payroll-scenarios";

describe("payroll — month-over-month & breakdown scenarios", () => {
  describe("Why is my salary lower this month? (Priya, March → April)", () => {
    it("detects ₹7,200 net pay decrease", () => {
      const comparison = comparePayslips([
        PRIYA_MARCH_PAYSLIP,
        PRIYA_APRIL_PAYSLIP,
      ]);

      expect(comparison).not.toBeNull();
      expect(comparison!.netPayDelta).toBe(-PRIYA_NET_PAY_DROP);
      expect(comparison!.netPayDelta).toBe(-7200);
    });

    it("explains LTA removal and higher TDS in insights", () => {
      const comparison = comparePayslips([
        PRIYA_MARCH_PAYSLIP,
        PRIYA_APRIL_PAYSLIP,
      ])!;

      const joined = comparison.insights.join(" ");
      expect(joined).toMatch(/Net pay decreased/i);
      expect(joined).toMatch(/LTA/i);
      expect(joined).toMatch(/TDS/i);
    });

    it("returns null when employee has only one payslip (new upload)", () => {
      expect(comparePayslips([PRIYA_APRIL_PAYSLIP])).toBeNull();
    });
  });

  describe("dashboard earnings & deductions", () => {
    it("lists all salary components for April payslip", () => {
      const earnings = getEarningsBreakdown(PRIYA_PAYROLL_SUMMARY);
      expect(earnings.find((e) => e.label === "HRA")?.amount).toBe(20000);
      expect(earnings.find((e) => e.label === "Reimbursements")?.amount).toBe(
        3000
      );
    });

    it("sums PF + PT + TDS as total deductions on dashboard", () => {
      const deductions = getDeductionBreakdown(PRIYA_PAYROLL_SUMMARY);
      const total = deductions.reduce((s, d) => s + d.amount, 0);
      expect(total).toBe(PRIYA_PAYROLL_SUMMARY.totalDeductions);
      expect(total).toBe(7000);
    });
  });

  describe("after payslip upload updates summary", () => {
    it("builds payroll summary from latest extracted payslip", () => {
      const summary = buildPayrollSummaryFromPayslip(PRIYA_APRIL_PAYSLIP);
      expect(summary.latestMonth).toBe("April 2026");
      expect(summary.netPay).toBe(76000);
      expect(summary.totalDeductions).toBe(7000);
    });
  });
});
