import { describe, it, expect } from "vitest";
import { buildProofChecklist } from "@/services/checklist.service";
import {
  PRIYA_DECLARATION,
  PRIYA_PAYROLL_SUMMARY,
  RAHUL_DECLARATION,
  RAHUL_APRIL_PAYSLIP,
} from "./fixtures/payroll-scenarios";
import { buildPayrollSummaryFromPayslip } from "@/services/payroll.service";

describe("proof checklist — FY end scenarios", () => {
  describe("Priya — pending proofs before June deadline", () => {
    it("lists PPF, health insurance, and rent agreement as pending", () => {
      const items = buildProofChecklist(
        PRIYA_DECLARATION,
        PRIYA_PAYROLL_SUMMARY
      );

      const pending = items.filter((i) => i.status === "pending");
      expect(pending.some((i) => i.title.includes("PPF"))).toBe(true);
      expect(pending.some((i) => i.title.includes("Health insurance"))).toBe(
        true
      );
      expect(pending.some((i) => i.title.includes("Rent agreement"))).toBe(
        true
      );
    });

    it("flags 80C headroom (₹50k declared, ₹1L limit)", () => {
      const items = buildProofChecklist(
        PRIYA_DECLARATION,
        PRIYA_PAYROLL_SUMMARY
      );
      const gap = items.find((i) => i.id === "80c_gap");
      expect(gap?.description).toMatch(/1,00,000/);
    });

    it("asks for reimbursement bills when payslip has ₹3,000 reimb but no proof", () => {
      const items = buildProofChecklist(
        PRIYA_DECLARATION,
        PRIYA_PAYROLL_SUMMARY
      );
      const reimb = items.find((i) => i.id === "reimb_proof");
      expect(reimb?.status).toBe("missing");
      expect(reimb?.description).toMatch(/3,000/);
    });

    it("shows ELSS and EPF as submitted", () => {
      const items = buildProofChecklist(
        PRIYA_DECLARATION,
        PRIYA_PAYROLL_SUMMARY
      );
      const submitted = items.filter((i) => i.status === "submitted");
      expect(submitted.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Rahul — mostly compliant, LTA proof pending", () => {
    it("shows ₹50,000 80C headroom when ₹1,00,000 of ₹1.5L limit used", () => {
      const payroll = buildPayrollSummaryFromPayslip(RAHUL_APRIL_PAYSLIP);
      const items = buildProofChecklist(RAHUL_DECLARATION, payroll);
      const gap = items.find((i) => i.id === "80c_gap");
      expect(gap?.description).toMatch(/50,000/);
    });

    it("still has home loan and LTA tickets pending", () => {
      const payroll = buildPayrollSummaryFromPayslip(RAHUL_APRIL_PAYSLIP);
      const items = buildProofChecklist(RAHUL_DECLARATION, payroll);
      const titles = items.map((i) => i.title).join(" ");
      expect(titles).toMatch(/Home loan/i);
      expect(titles).toMatch(/LTA travel/i);
    });
  });

  describe("employee with no declaration submitted", () => {
    it("returns single urgent item to submit tax declaration", () => {
      const items = buildProofChecklist(undefined, PRIYA_PAYROLL_SUMMARY);
      expect(items).toHaveLength(1);
      expect(items[0].id).toBe("decl_missing");
      expect(items[0].status).toBe("missing");
    });
  });
});
