"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CreditCard,
  BarChart3,
  Shield,
  Wallet,
  ScrollText,
} from "lucide-react";
import { cn } from "@nexora/ui";

const navItems = [
  { href: "/", label: "Tenants", icon: Building2 },
  { href: "/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/payments", label: "Payment Gateway", icon: Wallet },
  { href: "/audit", label: "Audit log", icon: ScrollText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r border-slate-800 bg-slate-900">
      <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-6">
        <Shield className="h-5 w-5 text-violet-400" />
        <span className="font-semibold tracking-tight">Nexora Platform</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-violet-500/20 text-violet-300"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
