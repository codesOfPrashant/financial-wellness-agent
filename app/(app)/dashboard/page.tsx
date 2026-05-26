import { PayrollCards } from "@/components/dashboard/payroll-cards";
import { PayrollTable } from "@/components/dashboard/payroll-table";
import { ChecklistPanel } from "@/components/dashboard/checklist-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getSessionUser } from "@/lib/auth";
import { getPayrollByEmployee, getPayslipsByEmployee } from "@/lib/storage";
import {
  comparePayslips,
  getDeductionBreakdown,
  getEarningsBreakdown,
} from "@/services/payroll.service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatINR } from "@/utils/format";
import { TrendingDown } from "lucide-react";

export default async function DashboardPage() {
  const session = await getSessionUser();
  const payroll = session
    ? await getPayrollByEmployee(session.userId)
    : undefined;
  const payslips = session
    ? await getPayslipsByEmployee(session.userId)
    : [];
  const comparison = comparePayslips(payslips);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payroll Dashboard</h1>
        <p className="text-sm text-slate-500">
          {payroll
            ? `Latest payslip: ${payroll.latestMonth}`
            : "Upload a payslip to get started"}
        </p>
      </div>

      {payroll ? (
        <>
          <PayrollCards payroll={payroll} />
          <div className="grid gap-6 lg:grid-cols-2">
            <PayrollTable
              title="Earnings Breakdown"
              lines={getEarningsBreakdown(payroll)}
            />
            <PayrollTable
              title="Deductions"
              lines={getDeductionBreakdown(payroll)}
            />
          </div>
        </>
      ) : (
        <Alert>
          <AlertDescription>
            No payroll summary found. Upload a payslip from the Upload page.
          </AlertDescription>
        </Alert>
      )}

      {comparison && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingDown className="h-5 w-5 text-amber-700" />
              Month-over-Month Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>{comparison.previous.month}</strong> →{" "}
              <strong>{comparison.current.month}</strong>: Net pay change{" "}
              {formatINR(comparison.netPayDelta)}
            </p>
            <ul className="list-inside list-disc text-slate-700">
              {comparison.insights.map((insight, i) => (
                <li key={i}>{insight}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payslip History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Gross</TableHead>
                <TableHead className="text-right">Net</TableHead>
                <TableHead className="text-right">TDS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payslips.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.month}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatINR(p.grossPay)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatINR(p.netPay)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatINR(p.tds)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ChecklistPanel />
    </div>
  );
}
