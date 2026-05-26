import {
  buildPayrollContextBlock,
  buildUserMessage,
} from "@/prompts/grounding";
import { GROUNDED_SYSTEM_PROMPT, REFUSAL_INSTRUCTION } from "@/prompts/system";
import type { AiAskResponse, Declaration, PayslipRecord, PayrollSummary } from "@/types";
import { comparePayslips } from "@/services/payroll.service";
import {
  getLlmWrapperConfig,
  queryLlmWrapper,
} from "@/services/llm-wrapper.service";

export interface AskAiParams {
  question: string;
  payroll: PayrollSummary | undefined;
  payslips: PayslipRecord[];
  declaration: Declaration | undefined;
  payslipId?: string;
}

export function sanitizeAiResponse(text: string): string {
  return text.trim();
}

export function buildGroundedPayrollAnswer(params: AskAiParams): AiAskResponse {
  const { question, payroll, payslips, declaration } = params;
  const q = question.toLowerCase();
  const sources: string[] = [];
  let answer = "";

  const latest = payslips.length
    ? [...payslips].sort((a, b) => a.month.localeCompare(b.month)).at(-1)
    : undefined;

  if (q.includes("pf") && (q.includes("what is") || q.includes("explain"))) {
    answer = `**Provident Fund (PF)** is a retirement savings scheme where both employee and employer contribute a portion of salary (typically 12% of basic, subject to wage ceiling).

Your latest PF deduction: **₹${payroll?.pf?.toLocaleString("en-IN") ?? "—"}** (${payroll?.latestMonth ?? "no payroll on file"}).`;
    if (payroll) sources.push(`payroll.${payroll.latestMonth}.pf`);
  } else if (q.includes("hra") || q.includes("house rent")) {
    const hra = payroll?.hra ?? latest?.hra;
    if (hra != null) {
      answer = `Your **HRA (House Rent Allowance)** for ${payroll?.latestMonth ?? latest?.month} is **₹${hra.toLocaleString("en-IN")}**.

HRA is a salary component that may be partially exempt from tax if you pay rent and meet declaration requirements. Your declared HRA: **₹${declaration?.hraDeclared?.toLocaleString("en-IN") ?? "not found"}** (annual declaration).`;
      sources.push("payroll.hra", "declarations.hraDeclared");
    } else {
      answer =
        "I could not find that information in the available payroll records.";
    }
  } else if (q.includes("deduction") || q.includes("tds") || q.includes("tax")) {
    if (!payroll) {
      answer =
        "I could not find that information in the available payroll records.";
    } else {
      answer = `**Deductions for ${payroll.latestMonth}:**
- PF: ₹${payroll.pf.toLocaleString("en-IN")}
- Professional Tax: ₹${payroll.professionalTax.toLocaleString("en-IN")}
- TDS: ₹${payroll.tds.toLocaleString("en-IN")}
- **Total deductions:** ₹${payroll.totalDeductions.toLocaleString("en-IN")}

**YTD tax deducted:** ₹${payroll.ytdTax.toLocaleString("en-IN")}`;
      sources.push("payroll.deductions", "payroll.ytdTax");
    }
  } else if (
    q.includes("lower") ||
    q.includes("less") ||
    (q.includes("why") && q.includes("salary"))
  ) {
    const comparison = comparePayslips(payslips);
    if (comparison) {
      answer = `Comparing **${comparison.previous.month}** vs **${comparison.current.month}**:

- Net pay change: **₹${comparison.netPayDelta.toLocaleString("en-IN")}** (${comparison.netPayDelta < 0 ? "decrease" : "increase"})
- Gross pay change: **₹${comparison.grossPayDelta.toLocaleString("en-IN")}**

**Possible reasons from your payslip data:**
${comparison.insights.map((i) => `- ${i}`).join("\n") || "- No significant component changes detected."}

_This is based only on uploaded payslip records._`;
      sources.push(
        `payslip.${comparison.previous.month}`,
        `payslip.${comparison.current.month}`
      );
    } else {
      answer =
        "I need at least two months of payslip data to compare salary changes. Upload additional payslips or check your dashboard.";
    }
  } else if (q.includes("reimburse")) {
    const reimb = payroll?.reimbursements ?? latest?.reimbursements;
    if (reimb != null) {
      answer = `**Reimbursements** on your ${payroll?.latestMonth ?? latest?.month} payslip: **₹${reimb.toLocaleString("en-IN")}**.

Ensure supporting bills are submitted to Payroll. Pending proofs: ${declaration?.pendingProofs?.filter((p) => p.toLowerCase().includes("reimburs")).join("; ") || "none listed"}.`;
      sources.push("payroll.reimbursements");
    } else {
      answer =
        "I could not find that information in the available payroll records.";
    }
  } else if (q.includes("net pay") || q.includes("take home")) {
    if (payroll) {
      answer = `Your **net pay** (take-home) for ${payroll.latestMonth} is **₹${payroll.netPay.toLocaleString("en-IN")}** (gross: ₹${payroll.grossPay.toLocaleString("en-IN")}).`;
      sources.push("payroll.netPay");
    } else {
      answer =
        "I could not find that information in the available payroll records.";
    }
  } else {
    answer = `I can help explain your payslip using the records on file.

**Available data:** ${payslips.length} payslip(s), latest month: ${payroll?.latestMonth ?? "N/A"}.

Try asking:
- "How much HRA did I receive?"
- "What deductions were applied?"
- "Why is my salary lower this month?"

_I could not find a specific answer to your question in the payroll records._`;
  }

  return {
    answer: sanitizeAiResponse(answer),
    sources,
    grounded: true,
    usedLocalFallback: true,
  };
}

export async function askPayrollAssistant(
  params: AskAiParams
): Promise<AiAskResponse> {
  const contextPayslips = params.payslipId
    ? params.payslips.filter((p) => p.id === params.payslipId)
    : params.payslips;

  const contextBlock = buildPayrollContextBlock(
    params.payroll,
    contextPayslips.length ? contextPayslips : params.payslips,
    params.declaration
  );

  const fullPrompt = `${GROUNDED_SYSTEM_PROMPT}\n\n${REFUSAL_INSTRUCTION}\n\n---\n\n${buildUserMessage(params.question, contextBlock)}`;

  if (getLlmWrapperConfig()) {
    try {
      const { text } = await queryLlmWrapper({
        prompt: fullPrompt,
        metadata: {
          traceId: `ask-${Date.now()}`,
          employeeId: params.payroll?.employeeId ?? "unknown",
        },
      });
      return {
        answer: sanitizeAiResponse(text),
        sources: params.payslips.map((p) => `payslip.${p.month}`),
        grounded: true,
        usedLocalFallback: false,
      };
    } catch (err) {
      console.error("[ai.service] LLM wrapper error:", err);
    }
  }

  return buildGroundedPayrollAnswer(params);
}
