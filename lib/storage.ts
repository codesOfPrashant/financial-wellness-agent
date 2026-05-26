import fs from "fs/promises";
import path from "path";
import type {
  AuditLogEntry,
  Declaration,
  Employee,
  PayslipRecord,
  PayrollSummary,
} from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");
const RUNTIME_DIR = path.join(DATA_DIR, "runtime");

type DataFile =
  | "employees"
  | "payslips"
  | "payroll"
  | "declarations"
  | "audit-logs";

async function ensureRuntimeDir(): Promise<void> {
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
}

async function readSeed<T>(file: DataFile): Promise<T> {
  const raw = await fs.readFile(path.join(DATA_DIR, `${file}.json`), "utf-8");
  return JSON.parse(raw) as T;
}

async function readRuntime<T>(file: DataFile): Promise<T | null> {
  try {
    const raw = await fs.readFile(
      path.join(RUNTIME_DIR, `${file}.json`),
      "utf-8"
    );
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeRuntime<T>(file: DataFile, data: T): Promise<void> {
  await ensureRuntimeDir();
  await fs.writeFile(
    path.join(RUNTIME_DIR, `${file}.json`),
    JSON.stringify(data, null, 2),
    "utf-8"
  );
}

async function readMerged<T>(file: DataFile): Promise<T> {
  const runtime = await readRuntime<T>(file);
  if (runtime) return runtime;
  return readSeed<T>(file);
}

export async function getEmployees(): Promise<Employee[]> {
  return readMerged<Employee[]>("employees");
}

export async function getEmployeeById(
  id: string
): Promise<Employee | undefined> {
  const employees = await getEmployees();
  return employees.find((e) => e.id === id);
}

export async function getPayslips(): Promise<PayslipRecord[]> {
  return readMerged<PayslipRecord[]>("payslips");
}

export async function getPayslipsByEmployee(
  employeeId: string
): Promise<PayslipRecord[]> {
  const payslips = await getPayslips();
  return payslips.filter((p) => p.employeeId === employeeId);
}

export async function getPayslipById(
  id: string
): Promise<PayslipRecord | undefined> {
  const payslips = await getPayslips();
  return payslips.find((p) => p.id === id);
}

export async function savePayslip(record: PayslipRecord): Promise<void> {
  const payslips = await getPayslips();
  payslips.push(record);
  await writeRuntime("payslips", payslips);
}

export async function getPayrollSummaries(): Promise<PayrollSummary[]> {
  return readMerged<PayrollSummary[]>("payroll");
}

export async function getPayrollByEmployee(
  employeeId: string
): Promise<PayrollSummary | undefined> {
  const payroll = await getPayrollSummaries();
  return payroll.find((p) => p.employeeId === employeeId);
}

export async function upsertPayrollSummary(
  summary: PayrollSummary
): Promise<void> {
  const payroll = await getPayrollSummaries();
  const idx = payroll.findIndex((p) => p.employeeId === summary.employeeId);
  if (idx >= 0) payroll[idx] = summary;
  else payroll.push(summary);
  await writeRuntime("payroll", payroll);
}

export async function getDeclarations(): Promise<Declaration[]> {
  return readMerged<Declaration[]>("declarations");
}

export async function getDeclarationByEmployee(
  employeeId: string
): Promise<Declaration | undefined> {
  const declarations = await getDeclarations();
  return declarations.find((d) => d.employeeId === employeeId);
}

export async function getAuditLogs(): Promise<AuditLogEntry[]> {
  const runtime = await readRuntime<AuditLogEntry[]>("audit-logs");
  return runtime ?? [];
}

export async function appendAuditLog(
  entry: Omit<AuditLogEntry, "id" | "timestamp">
): Promise<void> {
  const logs = await getAuditLogs();
  logs.push({
    ...entry,
    id: `audit_${Date.now()}`,
    timestamp: new Date().toISOString(),
  });
  await writeRuntime("audit-logs", logs);
}
