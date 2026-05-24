import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@nexora/ui';

import type { LucideIcon } from 'lucide-react';



export function StatCard({

  title,

  value,

  change,

  icon: Icon,

  loading,

}: {

  title: string;

  value: string;

  change?: string;

  icon: LucideIcon;

  loading?: boolean;

}) {

  return (

    <Card className="border-zinc-200/80 bg-white shadow-sm">

      <CardHeader className="flex flex-row items-center justify-between pb-2">

        <CardTitle className="text-sm font-medium text-zinc-500">

          {title}

        </CardTitle>

        <div className="rounded-lg bg-indigo-50 p-2">

          <Icon className="h-4 w-4 text-indigo-600" />

        </div>

      </CardHeader>

      <CardContent>

        {loading ? (

          <Skeleton className="h-8 w-24" />

        ) : (

          <p className="text-2xl font-bold tracking-tight">{value}</p>

        )}

        {change && !loading && (

          <p className="mt-1 text-xs text-zinc-500">{change}</p>

        )}

      </CardContent>

    </Card>

  );

}

