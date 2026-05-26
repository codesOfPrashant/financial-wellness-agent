import type { ChecklistItem, Declaration, PayrollSummary } from "@/types";

export function buildProofChecklist(
  declaration: Declaration | undefined,
  payroll: PayrollSummary | undefined
): ChecklistItem[] {
  const items: ChecklistItem[] = [];

  if (!declaration) {
    items.push({
      id: "decl_missing",
      category: "declaration",
      title: "Tax declaration not found",
      description:
        "Submit your annual tax investment declaration to HR to enable accurate TDS.",
      status: "missing",
    });
    return items;
  }

  declaration.pendingProofs.forEach((proof, i) => {
    items.push({
      id: `pending_${i}`,
      category: proof.toLowerCase().includes("reimburs")
        ? "reimbursement"
        : "investment",
      title: proof,
      description: "Proof document pending submission to HR/Payroll.",
      status: "pending",
      dueDate: "2026-06-30",
    });
  });

  if (declaration.section80C < 150000) {
    const gap = 150000 - declaration.section80C;
    items.push({
      id: "80c_gap",
      category: "investment",
      title: "80C declaration headroom available",
      description: `You can still declare up to ₹${gap.toLocaleString("en-IN")} more under Section 80C to maximize deductions.`,
      status: "pending",
    });
  }

  if (payroll && payroll.reimbursements > 0) {
    const hasReimbProof = declaration.submittedProofs.some((p) =>
      p.toLowerCase().includes("reimburs")
    );
    if (!hasReimbProof) {
      items.push({
        id: "reimb_proof",
        category: "reimbursement",
        title: "Reimbursement bills",
        description: `₹${payroll.reimbursements.toLocaleString("en-IN")} reimbursements on latest payslip — ensure bills are submitted.`,
        status: "missing",
        dueDate: "2026-06-15",
      });
    }
  }

  declaration.submittedProofs.forEach((proof, i) => {
    items.push({
      id: `submitted_${i}`,
      category: "investment",
      title: proof,
      description: "Proof submitted and under verification.",
      status: "submitted",
    });
  });

  return items;
}
