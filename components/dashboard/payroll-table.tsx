"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatINR } from "@/utils/format";

interface Line {
  label: string;
  amount: number;
  description?: string;
}

interface PayrollTableProps {
  title: string;
  lines: Line[];
}

export function PayrollTable({ title, lines }: PayrollTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Component</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.map((line) => (
              <TableRow key={line.label}>
                <TableCell>
                  <p className="font-medium">{line.label}</p>
                  {line.description && (
                    <p className="text-xs text-slate-500">{line.description}</p>
                  )}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatINR(line.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
