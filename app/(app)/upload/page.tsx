import { PayslipUpload } from "@/components/upload/payslip-upload";

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Upload Payslip</h1>
        <p className="text-sm text-slate-500">
          Upload a PDF or image payslip to extract payroll data
        </p>
      </div>
      <PayslipUpload />
    </div>
  );
}
