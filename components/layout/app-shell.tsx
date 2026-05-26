"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  MessageSquare,
  Calculator,
  LogOut,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload Payslip", icon: Upload },
  { href: "/assistant", label: "AI Assistant", icon: MessageSquare },
  { href: "/tax-simulator", label: "Tax Simulator", icon: Calculator },
];

interface AppShellProps {
  user: SessionUser;
  children: React.ReactNode;
}

export function AppShell({ user, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Financial Wellness AI
              </p>
              <p className="text-xs text-slate-500">Payroll Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{user.userId}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
        <nav className="hidden w-56 shrink-0 md:block">
          <ul className="space-y-1">
            {NAV.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    pathname === href
                      ? "bg-emerald-50 text-emerald-800"
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            Your payroll data is private to your employee account.
          </p>
        </nav>

        <main className="min-w-0 flex-1 pb-20 md:pb-6">{children}</main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 border-t bg-white md:hidden">
        <div className="flex justify-around py-2">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-1 text-xs",
                pathname === href ? "text-emerald-700" : "text-slate-500"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="max-w-[4rem] truncate">{label.split(" ")[0]}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
