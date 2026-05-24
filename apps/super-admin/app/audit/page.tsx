'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@nexora/ui';
import { fetchAuditLogs } from '@/lib/api';

export default function AuditPage() {
  const { data: logs, isLoading, error } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: fetchAuditLogs,
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-50">Audit log</h1>
        <p className="text-slate-400">Platform activity and configuration changes</p>
      </div>

      <Card className="border-slate-800 bg-slate-900/80">
        <CardHeader>
          <CardTitle className="text-slate-50">Recent events</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-slate-500">Loading…</p>
          ) : error ? (
            <p className="text-red-400">Failed to load audit logs</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Time</th>
                  <th className="pb-3 pr-4 font-medium">Action</th>
                  <th className="pb-3 pr-4 font-medium">Resource</th>
                  <th className="pb-3 font-medium">User</th>
                </tr>
              </thead>
              <tbody>
                {logs?.map((log) => (
                  <tr key={log.id} className="border-b border-slate-800/50">
                    <td className="py-3 pr-4 text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 text-slate-200">{log.action}</td>
                    <td className="py-3 pr-4 text-slate-300">
                      {log.resource}
                      {log.resourceId ? ` / ${log.resourceId.slice(0, 8)}` : ''}
                    </td>
                    <td className="py-3 text-slate-400">
                      {log.user?.email ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
