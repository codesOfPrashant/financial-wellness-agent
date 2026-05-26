export type EmployeeId = "emp_101" | "emp_102" | string;

export interface Employee {
  id: EmployeeId;
  name: string;
  email: string;
  department: string;
  designation: string;
}

export interface PayslipRecord {
  id: string;
  employeeId: EmployeeId;
  month: string;
  fileName: string;
  uploadedAt: string;
  basicSalary: number;
  hra: number;
  specialAllowance: number;
  lta?: number;
  pf: number;
  professionalTax: number;
  tds: number;
  reimbursements: number;
  grossPay: number;
  netPay: number;
  ytdGross: number;
  ytdTax: number;
}

export interface PayrollSummary {
  employeeId: EmployeeId;
  latestMonth: string;
  basicSalary: number;
  hra: number;
  specialAllowance: number;
  lta: number;
  pf: number;
  professionalTax: number;
  tds: number;
  reimbursements: number;
  grossPay: number;
  netPay: number;
  ytdGross: number;
  ytdTax: number;
  totalDeductions: number;
}

export interface Declaration {
  employeeId: EmployeeId;
  section80C: number;
  section80D: number;
  hraDeclared: number;
  ltaDeclared: number;
  pendingProofs: string[];
  submittedProofs: string[];
}

export interface SessionUser {
  userId: EmployeeId;
  name: string;
  email: string;
}

export interface TaxSimulationInput {
  additional80C: number;
  additional80D?: number;
}

export interface TaxSimulationResult {
  currentDeclared80C: number;
  additionalInvestment: number;
  estimatedTaxableIncomeReduction: number;
  estimatedTaxSavings: number;
  assumptions: string[];
  disclaimer: string;
}

export interface ChecklistItem {
  id: string;
  category: "investment" | "reimbursement" | "declaration";
  title: string;
  description: string;
  status: "missing" | "pending" | "submitted";
  dueDate?: string;
}

export interface AiAskRequest {
  question: string;
  payslipId?: string;
}

export interface AiAskResponse {
  answer: string;
  sources: string[];
  grounded: boolean;
  usedLocalFallback: boolean;
}

export interface AuditLogEntry {
  id: string;
  employeeId: EmployeeId;
  action: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface ApiError {
  error: string;
  code?: string;
}
