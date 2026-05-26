import type { Declaration, PayslipRecord, PayrollSummary } from "@/types";

export function buildPayrollContextBlock(
  payroll: PayrollSummary | undefined,
  payslips: PayslipRecord[],
  declaration: Declaration | undefined
): string {
  const sections: string[] = [];

  if (payroll) {
    sections.push(`## Latest Payroll Summary (${payroll.latestMonth})
\`\`\`json
${JSON.stringify(payroll, null, 2)}
\`\`\``);
  } else {
    sections.push("## Latest Payroll Summary\nNo payroll summary available.");
  }

  if (payslips.length > 0) {
    sections.push(`## Payslip Records (${payslips.length} months)
\`\`\`json
${JSON.stringify(payslips, null, 2)}
\`\`\``);
  } else {
    sections.push("## Payslip Records\nNo payslips on file.");
  }

  if (declaration) {
    sections.push(`## Tax Declarations & Proof Status
\`\`\`json
${JSON.stringify(declaration, null, 2)}
\`\`\``);
  }

  return sections.join("\n\n");
}

export function buildUserMessage(question: string, contextBlock: string): string {
  return `${contextBlock}

---

Employee question: ${question}

Answer using ONLY the payroll data above. Cite specific field names and values when possible.`;
}
