import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  buildGroundedPayrollAnswer,
  askPayrollAssistant,
} from "@/services/ai.service";
import { buildPayrollContextBlock } from "@/prompts/grounding";
import {
  PRIYA_APRIL_PAYSLIP,
  PRIYA_DECLARATION,
  PRIYA_MARCH_PAYSLIP,
  PRIYA_PAYROLL_SUMMARY,
} from "./fixtures/payroll-scenarios";

describe("AI grounding — employee Q&A scenarios", () => {
  const baseParams = {
    payroll: PRIYA_PAYROLL_SUMMARY,
    payslips: [PRIYA_MARCH_PAYSLIP, PRIYA_APRIL_PAYSLIP],
    declaration: PRIYA_DECLARATION,
  };

  describe("buildGroundedPayrollAnswer (rule-based)", () => {
    it("answers HRA question with exact April amount from payroll", () => {
      const { answer, sources } = buildGroundedPayrollAnswer({
        ...baseParams,
        question: "How much HRA did I receive?",
      });

      expect(answer).toContain("20,000");
      expect(answer).toContain("April 2026");
      expect(sources).toContain("payroll.hra");
    });

    it("explains why salary is lower using March vs April comparison", () => {
      const { answer, sources } = buildGroundedPayrollAnswer({
        ...baseParams,
        question: "Why is my salary lower this month?",
      });

      expect(answer).toContain("March 2026");
      expect(answer).toContain("April 2026");
      expect(answer).toMatch(/7,200|7200/);
      expect(sources).toContain("payslip.March 2026");
      expect(answer).toMatch(/LTA|TDS/i);
    });

    it("lists all deductions including TDS for tax query", () => {
      const { answer } = buildGroundedPayrollAnswer({
        ...baseParams,
        question: "How much tax was deducted?",
      });

      expect(answer).toContain("5,000");
      expect(answer).toContain("TDS");
      expect(answer).toContain("19,400");
    });

    it("refuses to invent data when payroll is missing", () => {
      const { answer } = buildGroundedPayrollAnswer({
        question: "What is my net pay?",
        payroll: undefined,
        payslips: [],
        declaration: undefined,
      });

      expect(answer).toMatch(
        /could not find that information in the available payroll records/i
      );
    });

    it("needs two payslips for salary comparison question", () => {
      const { answer } = buildGroundedPayrollAnswer({
        ...baseParams,
        payslips: [PRIYA_APRIL_PAYSLIP],
        question: "Why is my salary lower this month?",
      });

      expect(answer).toMatch(/at least two months/i);
    });
  });

  describe("prompt grounding payload", () => {
    it("embeds full payslip JSON for LLM context", () => {
      const block = buildPayrollContextBlock(
        PRIYA_PAYROLL_SUMMARY,
        [PRIYA_APRIL_PAYSLIP],
        PRIYA_DECLARATION
      );

      expect(block).toContain("April 2026");
      expect(block).toContain('"netPay": 76000');
      expect(block).toContain("pendingProofs");
      expect(block).toContain("PPF investment receipt");
    });
  });

  describe("askPayrollAssistant without external API keys", () => {
    const envBackup = { ...process.env };

    beforeEach(() => {
      vi.stubEnv("LLM_WRAPPER_API_TOKEN", "");
    });

    afterEach(() => {
      process.env = { ...envBackup };
      vi.unstubAllEnvs();
    });

    it("uses rule-based path when no LLM keys configured", async () => {
      const result = await askPayrollAssistant({
        ...baseParams,
        question: "What is PF?",
      });

      expect(result.grounded).toBe(true);
      expect(result.usedLocalFallback).toBe(true);
      expect(result.answer).toContain("1,800");
    });
  });
});
