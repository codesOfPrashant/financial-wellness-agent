import { describe, it, expect } from "vitest";
import { runTaxSimulation } from "@/services/tax.service";
import {
  PRIYA_DECLARATION,
  RAHUL_DECLARATION,
} from "./fixtures/payroll-scenarios";

describe("tax simulation — real employee scenarios", () => {
  describe("Priya plans additional ELSS before proof deadline", () => {
    it("estimates savings on ₹1,00,000 additional 80C (₹50k already declared)", () => {
      const result = runTaxSimulation(PRIYA_DECLARATION, {
        additional80C: 100000,
      });

      expect(result.currentDeclared80C).toBe(50000);
      expect(result.additionalInvestment).toBe(100000);
      expect(result.estimatedTaxableIncomeReduction).toBe(100000);
      expect(result.estimatedTaxSavings).toBe(31200);
      expect(result.assumptions.some((a) => /1,?50,?000/.test(a))).toBe(true);
      expect(result.disclaimer).toMatch(/not valid for compliance|compliance or filing/i);
    });

    it("caps deduction when she tries to invest ₹1,50,000 more (only ₹1L headroom left)", () => {
      const result = runTaxSimulation(PRIYA_DECLARATION, {
        additional80C: 150000,
      });

      expect(result.estimatedTaxableIncomeReduction).toBe(100000);
      expect(result.estimatedTaxSavings).toBe(31200);
    });
  });

  describe("Rahul already declared ₹1,00,000 under 80C", () => {
    it("allows only ₹50,000 more toward 80C limit", () => {
      const result = runTaxSimulation(RAHUL_DECLARATION, {
        additional80C: 100000,
      });

      expect(result.currentDeclared80C).toBe(100000);
      expect(result.estimatedTaxableIncomeReduction).toBe(50000);
      expect(result.estimatedTaxSavings).toBe(15600);
    });

    it("includes health insurance top-up under 80D in estimate", () => {
      const result = runTaxSimulation(RAHUL_DECLARATION, {
        additional80C: 0,
        additional80D: 10000,
      });

      expect(result.estimatedTaxableIncomeReduction).toBe(10000);
      expect(result.estimatedTaxSavings).toBe(3120);
    });
  });

  describe("new joiner with no declaration on file", () => {
    it("treats current 80C as zero and projects full additional investment", () => {
      const result = runTaxSimulation(undefined, { additional80C: 50000 });

      expect(result.currentDeclared80C).toBe(0);
      expect(result.estimatedTaxableIncomeReduction).toBe(50000);
      expect(result.estimatedTaxSavings).toBe(15600);
    });
  });

  describe("edge cases", () => {
    it("handles zero additional investment", () => {
      const result = runTaxSimulation(PRIYA_DECLARATION, { additional80C: 0 });
      expect(result.estimatedTaxSavings).toBe(0);
    });

    it("ignores negative additional investment", () => {
      const result = runTaxSimulation(PRIYA_DECLARATION, {
        additional80C: -50000,
      });
      expect(result.additionalInvestment).toBe(0);
      expect(result.estimatedTaxSavings).toBe(0);
    });
  });
});
