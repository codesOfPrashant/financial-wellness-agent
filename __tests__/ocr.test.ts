import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  extractPayslipData,
  validateOcrPayload,
} from "@/services/ocr.service";
import { PRIYA_APRIL_PAYSLIP } from "./fixtures/payroll-scenarios";

describe("OCR — payslip upload scenarios", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("validateOcrPayload", () => {
    it("rejects HR-upload with corrupted/missing OCR fields", () => {
      const errors = validateOcrPayload({ employeeId: "emp_101" });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.field === "basicSalary")).toBe(true);
      expect(errors.some((e) => e.field === "tds")).toBe(true);
    });

    it("rejects impossible payroll math (net pay > gross)", () => {
      const errors = validateOcrPayload({
        basicSalary: 50000,
        hra: 20000,
        pf: 1800,
        tds: 5000,
        grossPay: 50000,
        netPay: 60000,
      });
      expect(errors.some((e) => e.field === "netPay")).toBe(true);
    });

    it("accepts Priya April 2026 payslip extraction shape", () => {
      const errors = validateOcrPayload({
        basicSalary: PRIYA_APRIL_PAYSLIP.basicSalary,
        hra: PRIYA_APRIL_PAYSLIP.hra,
        pf: PRIYA_APRIL_PAYSLIP.pf,
        tds: PRIYA_APRIL_PAYSLIP.tds,
        grossPay: PRIYA_APRIL_PAYSLIP.grossPay,
        netPay: PRIYA_APRIL_PAYSLIP.netPay,
      });
      expect(errors).toHaveLength(0);
    });
  });

  describe("extractPayslipData", () => {
    it("extracts May 2026 template when Priya uploads sample-payslip.pdf", async () => {
      const promise = extractPayslipData("emp_101", "sample-payslip.pdf");
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.data?.employeeId).toBe("emp_101");
      expect(result.data?.month).toBe("May 2026");
      expect(result.data?.netPay).toBe(75700);
      expect(result.data?.fileName).toBe("sample-payslip.pdf");
    });

    it("accepts mobile photo payslip (JPEG)", async () => {
      const promise = extractPayslipData("emp_101", "payslip_photo.jpeg");
      await vi.runAllTimersAsync();
      const result = await promise;
      expect(result.success).toBe(true);
    });

    it("rejects Word document upload (.docx)", async () => {
      const promise = extractPayslipData("emp_101", "payslip.docx");
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Unsupported file type/i);
    });

    it("returns different template for Rahul vs Priya (same filename)", async () => {
      const priyaPromise = extractPayslipData("emp_101", "payslip.pdf");
      const rahulPromise = extractPayslipData("emp_102", "payslip.pdf");
      await vi.runAllTimersAsync();
      const [priya, rahul] = await Promise.all([priyaPromise, rahulPromise]);

      expect(priya.data?.basicSalary).toBe(50000);
      expect(rahul.data?.basicSalary).toBe(65000);
      expect(priya.data?.netPay).not.toBe(rahul.data?.netPay);
    });
  });
});
