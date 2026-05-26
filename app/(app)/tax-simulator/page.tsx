import { TaxSimulatorForm } from "@/components/tax/tax-simulator-form";

export default function TaxSimulatorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tax Saving Simulator</h1>
        <p className="text-sm text-slate-500">
          Simplified estimator — not full tax law compliance
        </p>
      </div>
      <TaxSimulatorForm />
    </div>
  );
}
