import type { Declaration, TaxSimulationInput, TaxSimulationResult } from "@/types";

const SECTION_80C_LIMIT = 150000;
const DEFAULT_MARGINAL_RATE = 0.312;

export function runTaxSimulation(
  declaration: Declaration | undefined,
  input: TaxSimulationInput
): TaxSimulationResult {
  const currentDeclared80C = declaration?.section80C ?? 0;
  const additional = Math.max(0, input.additional80C);

  const remaining80CHeadroom = Math.max(
    0,
    SECTION_80C_LIMIT - currentDeclared80C
  );
  const deductible80C = Math.min(additional, remaining80CHeadroom);

  const additional80D = Math.max(0, input.additional80D ?? 0);
  const totalReduction = deductible80C + additional80D;
  const estimatedTaxSavings = Math.round(totalReduction * DEFAULT_MARGINAL_RATE);

  return {
    currentDeclared80C,
    additionalInvestment: additional,
    estimatedTaxableIncomeReduction: totalReduction,
    estimatedTaxSavings,
    assumptions: [
      `Section 80C annual limit assumed at ₹${SECTION_80C_LIMIT.toLocaleString("en-IN")}.`,
      `Only ₹${deductible80C.toLocaleString("en-IN")} of additional 80C qualifies due to remaining headroom.`,
      `Marginal tax rate assumed at ${(DEFAULT_MARGINAL_RATE * 100).toFixed(1)}% (simplified; actual rate depends on slab).`,
      "Old tax regime assumed; new regime rules not modeled.",
      additional80D > 0
        ? `Additional 80D of ₹${additional80D.toLocaleString("en-IN")} included at full value (simplified).`
        : "No additional 80D specified.",
    ],
    disclaimer:
      "Simplified estimate only. Consult a tax professional for actual planning. Not valid for compliance or filing.",
  };
}
