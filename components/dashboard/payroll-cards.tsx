"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatINR } from "@/utils/format";
import type { PayrollSummary } from "@/types";
import { TrendingDown, TrendingUp, Wallet, Receipt } from "lucide-react";

interface PayrollCardsProps {
  payroll: PayrollSummary;
}

export function PayrollCards({ payroll }: PayrollCardsProps) {
  const cards = [
    {
      title: "Gross Pay",
      value: formatINR(payroll.grossPay),
      sub: payroll.latestMonth,
      icon: Wallet,
      color: "text-blue-600",
    },
    {
      title: "Net Pay",
      value: formatINR(payroll.netPay),
      sub: "Take-home",
      icon: TrendingUp,
      color: "text-emerald-600",
    },
    {
      title: "Total Deductions",
      value: formatINR(payroll.totalDeductions),
      sub: "PF + PT + TDS",
      icon: TrendingDown,
      color: "text-rose-600",
    },
    {
      title: "YTD Gross",
      value: formatINR(payroll.ytdGross),
      sub: `Tax YTD: ${formatINR(payroll.ytdTax)}`,
      icon: Receipt,
      color: "text-violet-600",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {c.title}
            </CardTitle>
            <c.icon className={`h-4 w-4 ${c.color}`} />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900">{c.value}</p>
            <p className="text-xs text-slate-500">{c.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
