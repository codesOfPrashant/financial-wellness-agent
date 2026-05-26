"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatINR } from "@/utils/format";
import type { TaxSimulationResult } from "@/types";
import { Calculator, Loader2, Info } from "lucide-react";

export function TaxSimulatorForm() {
  const [additional80C, setAdditional80C] = useState("100000");
  const [additional80D, setAdditional80D] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TaxSimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runSimulation(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/tax-simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          additional80C: Number(additional80C),
          additional80D: additional80D ? Number(additional80D) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Simulation failed");
      setResult(data.simulation);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Simulation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calculator className="h-5 w-5" />
            Tax Saving Estimator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={runSimulation} className="space-y-4">
            <div>
              <Label htmlFor="80c">Additional 80C Investment (₹)</Label>
              <Input
                id="80c"
                type="number"
                min={0}
                value={additional80C}
                onChange={(e) => setAdditional80C(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="80d">Additional 80D (optional, ₹)</Label>
              <Input
                id="80d"
                type="number"
                min={0}
                value={additional80D}
                onChange={(e) => setAdditional80D(e.target.value)}
                className="mt-1"
                placeholder="0"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculating…
                </>
              ) : (
                "Run Simulation"
              )}
            </Button>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-base">Estimated Outcome</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-600">Current Declared 80C</dt>
                <dd className="font-mono font-semibold">
                  {formatINR(result.currentDeclared80C)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Additional Investment</dt>
                <dd className="font-mono font-semibold">
                  {formatINR(result.additionalInvestment)}
                </dd>
              </div>
              <div className="flex justify-between border-t pt-3">
                <dt className="text-slate-600">Taxable Income Reduction</dt>
                <dd className="font-mono font-semibold text-emerald-700">
                  {formatINR(result.estimatedTaxableIncomeReduction)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Estimated Tax Savings</dt>
                <dd className="font-mono text-lg font-bold text-emerald-700">
                  {formatINR(result.estimatedTaxSavings)}
                </dd>
              </div>
            </dl>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Assumptions</AlertTitle>
              <AlertDescription>
                <ul className="mt-2 list-inside list-disc text-xs">
                  {result.assumptions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
                <p className="mt-3 text-xs font-medium text-amber-800">
                  {result.disclaimer}
                </p>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
