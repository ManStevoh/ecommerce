import { Card, CardContent, CardHeader, CardTitle } from "@nexora/ui";
import type { LucideIcon } from "lucide-react";

export function PlatformStat({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="border-slate-800 bg-slate-900/80">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-violet-400" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-slate-50">{value}</p>
        {subtitle && (
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
