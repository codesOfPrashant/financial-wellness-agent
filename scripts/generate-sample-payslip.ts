import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs/promises";
import path from "path";

const fmt = (n: number) =>
  `INR ${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

async function main() {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const w = page.getWidth();
  let y = 780;

  const drawText = (
    text: string,
    x: number,
    size = 10,
    bold = false,
    color = rgb(0.1, 0.1, 0.1)
  ) => {
    page.drawText(text, {
      x,
      y,
      size,
      font: bold ? fontBold : font,
      color,
    });
  };

  const line = (yPos: number) => {
    page.drawLine({
      start: { x: 40, y: yPos },
      end: { x: w - 40, y: yPos },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    });
  };

  drawText("ACME TECHNOLOGIES PVT. LTD.", 40, 16, true, rgb(0.05, 0.35, 0.25));
  y -= 22;
  drawText("PAYSLIP — CONFIDENTIAL", 40, 11, true);
  y -= 18;
  drawText("Pay Period: May 2026  |  Pay Date: 31-May-2026", 40, 9);
  y -= 28;
  line(y);

  y -= 20;
  drawText("EMPLOYEE DETAILS", 40, 10, true);
  y -= 16;
  drawText("Name:          Priya Sharma", 40);
  y -= 14;
  drawText("Employee ID:   emp_101", 40);
  y -= 14;
  drawText("Department:    Engineering", 40);
  y -= 14;
  drawText("Designation:   Senior Software Engineer", 40);
  y -= 14;
  drawText("PAN:           ABCDE1234F", 40);
  y -= 24;
  line(y);

  y -= 22;
  drawText("EARNINGS", 40, 10, true);
  drawText("AMOUNT (INR)", w - 130, 10, true);

  const earnings: [string, number][] = [
    ["Basic Salary", 50000],
    ["House Rent Allowance (HRA)", 20000],
    ["Special Allowance", 15000],
    ["Leave Travel Allowance (LTA)", 0],
    ["Reimbursements", 2800],
  ];

  for (const [label, amt] of earnings) {
    y -= 16;
    drawText(label, 48);
    drawText(fmt(amt), w - 130);
  }

  y -= 18;
  line(y);
  y -= 16;
  drawText("Gross Pay", 40, 10, true);
  drawText(fmt(87800), w - 130, 10, true);

  y -= 28;
  drawText("DEDUCTIONS", 40, 10, true);
  drawText("AMOUNT (INR)", w - 130, 10, true);

  const deductions: [string, number][] = [
    ["Provident Fund (PF)", 1800],
    ["Professional Tax", 200],
    ["TDS (Income Tax)", 5100],
  ];

  for (const [label, amt] of deductions) {
    y -= 16;
    drawText(label, 48);
    drawText(fmt(amt), w - 130);
  }

  y -= 18;
  line(y);
  y -= 16;
  drawText("Total Deductions", 40, 10, true);
  drawText(fmt(7100), w - 130, 10, true);

  y -= 28;
  page.drawRectangle({
    x: 40,
    y: y - 36,
    width: w - 80,
    height: 44,
    color: rgb(0.93, 0.98, 0.95),
    borderColor: rgb(0.05, 0.45, 0.3),
    borderWidth: 1,
  });
  drawText("NET PAY (Take Home)", 52, 12, true, rgb(0.05, 0.35, 0.2));
  drawText(fmt(75700), w - 130, 14, true, rgb(0.05, 0.35, 0.2));

  y -= 70;
  drawText("YEAR-TO-DATE SUMMARY", 40, 10, true);
  y -= 16;
  drawText(`YTD Gross:  ${fmt(453300)}`, 48);
  y -= 14;
  drawText(`YTD Tax:    ${fmt(24500)}`, 48);

  const pdfBytes = await doc.save();
  const outPath = path.join(process.cwd(), "sample-payslip.pdf");
  await fs.writeFile(outPath, pdfBytes);
  console.log(`Created: ${outPath}`);
}

main().catch(console.error);
