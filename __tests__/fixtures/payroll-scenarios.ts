import type {
  Declaration,
  PayslipRecord,
  PayrollSummary,
  SessionUser,
} from "@/types";

export const PRIYA: SessionUser = {
  userId: "emp_101",
  name: "Priya Sharma",
  email: "priya.sharma@company.com",
};

export const RAHUL: SessionUser = {
  userId: "emp_102",
  name: "Rahul Mehta",
  email: "rahul.mehta@company.com",
};

export const PRIYA_MARCH_PAYSLIP: PayslipRecord = {
  id: "ps_101_mar",
  employeeId: "emp_101",
  month: "March 2026",
  fileName: "payslip_march_2026.pdf",
  uploadedAt: "2026-03-31T10:00:00.000Z",
  basicSalary: 50000,
  hra: 20000,
  specialAllowance: 15000,
  lta: 5000,
  pf: 1800,
  professionalTax: 200,
  tds: 4800,
  reimbursements: 2500,
  grossPay: 92500,
  netPay: 83200,
  ytdGross: 277500,
  ytdTax: 14400,
};

export const PRIYA_APRIL_PAYSLIP: PayslipRecord = {
  id: "ps_101_apr",
  employeeId: "emp_101",
  month: "April 2026",
  fileName: "payslip_april_2026.pdf",
  uploadedAt: "2026-04-30T10:00:00.000Z",
  basicSalary: 50000,
  hra: 20000,
  specialAllowance: 15000,
  lta: 0,
  pf: 1800,
  professionalTax: 200,
  tds: 5000,
  reimbursements: 3000,
  grossPay: 88000,
  netPay: 76000,
  ytdGross: 365500,
  ytdTax: 19400,
};

export const PRIYA_PAYROLL_SUMMARY: PayrollSummary = {
  employeeId: "emp_101",
  latestMonth: "April 2026",
  basicSalary: 50000,
  hra: 20000,
  specialAllowance: 15000,
  lta: 0,
  pf: 1800,
  professionalTax: 200,
  tds: 5000,
  reimbursements: 3000,
  grossPay: 88000,
  netPay: 76000,
  ytdGross: 365500,
  ytdTax: 19400,
  totalDeductions: 7000,
};

export const PRIYA_DECLARATION: Declaration = {
  employeeId: "emp_101",
  section80C: 50000,
  section80D: 15000,
  hraDeclared: 240000,
  ltaDeclared: 50000,
  pendingProofs: [
    "PPF investment receipt (₹25,000)",
    "Health insurance premium proof (₹15,000)",
    "Rent agreement for HRA claim",
  ],
  submittedProofs: [
    "ELSS mutual fund statement (₹25,000)",
    "EPF contribution certificate",
  ],
};

export const RAHUL_APRIL_PAYSLIP: PayslipRecord = {
  id: "ps_102_apr",
  employeeId: "emp_102",
  month: "April 2026",
  fileName: "payslip_april_2026.pdf",
  uploadedAt: "2026-04-30T11:00:00.000Z",
  basicSalary: 65000,
  hra: 26000,
  specialAllowance: 20000,
  lta: 0,
  pf: 2340,
  professionalTax: 200,
  tds: 7500,
  reimbursements: 3500,
  grossPay: 114840,
  netPay: 101300,
  ytdGross: 478860,
  ytdTax: 29100,
};

export const RAHUL_DECLARATION: Declaration = {
  employeeId: "emp_102",
  section80C: 100000,
  section80D: 25000,
  hraDeclared: 312000,
  ltaDeclared: 80000,
  pendingProofs: [
    "Home loan principal repayment proof",
    "LTA travel tickets",
  ],
  submittedProofs: [
    "Life insurance premium receipt",
    "NPS contribution statement",
    "Medical reimbursement bills",
  ],
};

export const PRIYA_NET_PAY_DROP = PRIYA_MARCH_PAYSLIP.netPay - PRIYA_APRIL_PAYSLIP.netPay;
