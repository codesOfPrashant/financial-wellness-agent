"use client";

import { useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, FileText, Loader2, CheckCircle2 } from "lucide-react";
import type { PayslipRecord } from "@/types";
import { formatINR } from "@/utils/format";

export function PayslipUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PayslipRecord | null>(null);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }, []);

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload-payslip", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setResult(data.payslip);
      setFile(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Upload className="h-5 w-5" />
            Upload Payslip (PDF / Image)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-10 transition-colors hover:border-emerald-300"
          >
            <FileText className="mb-3 h-10 w-10 text-slate-400" />
            <p className="mb-2 text-sm text-slate-600">
              Drag & drop or click to select
            </p>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              className="text-sm"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file && (
              <p className="mt-2 text-xs text-emerald-700">
                Selected: {file.name}
              </p>
            )}
          </div>

          <p className="text-xs text-slate-500">
            Supported formats: PDF, PNG, JPG
          </p>

          <Button
            onClick={handleUpload}
            disabled={!file || loading}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Extracting…
              </>
            ) : (
              "Upload & Extract"
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Upload failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert className="border-emerald-200 bg-emerald-50">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <AlertTitle>Extraction complete — {result.month}</AlertTitle>
              <AlertDescription className="mt-2 space-y-1 text-sm">
                <p>Gross: {formatINR(result.grossPay)} → Net: {formatINR(result.netPay)}</p>
                <p className="text-xs text-slate-600">
                  Stored as {result.id}. View on Dashboard.
                </p>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
