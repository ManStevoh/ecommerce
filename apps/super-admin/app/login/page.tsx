'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@nexora/ui';
import { loginAdmin, saveSession } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      const data = await loginAdmin(
        form.get('email') as string,
        form.get('password') as string,
      );
      saveSession(data.accessToken, data.refreshToken, data.user);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900">
        <CardHeader>
          <CardTitle className="text-slate-50">Platform admin</CardTitle>
          <p className="text-sm text-slate-400">
            Sign in to manage tenants and subscriptions
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              name="email"
              type="email"
              placeholder="Email"
              defaultValue="admin@nexora.cloud"
              className="border-slate-700 bg-slate-950 text-slate-50"
              required
            />
            <Input
              name="password"
              type="password"
              placeholder="Password"
              className="border-slate-700 bg-slate-950 text-slate-50"
              required
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-500"
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-slate-500">
            Demo: admin@nexora.cloud / Admin123!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
