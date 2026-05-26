export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function monthSortKey(month: string): number {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const [name, year] = month.split(" ");
  const idx = months.indexOf(name);
  return parseInt(year ?? "0", 10) * 100 + (idx >= 0 ? idx : 0);
}
