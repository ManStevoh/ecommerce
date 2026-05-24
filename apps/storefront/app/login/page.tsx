'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '@nexora/ui';
import { getGoogleAuthUrl, loginCustomer } from '@/lib/api';
import { saveSession } from '@/lib/auth';

const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? '';
const OAUTH_STATE_KEY = 'nexora_oauth_state';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!TENANT_ID) {
      setError('Store not configured');
      return;
    }
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      const session = await loginCustomer(
        form.get('email') as string,
        form.get('password') as string,
        TENANT_ID,
      );
      saveSession(session);
      router.replace('/account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    setGoogleLoading(true);
    setError(null);
    try {
      const { url, state } = await getGoogleAuthUrl();
      sessionStorage.setItem(OAUTH_STATE_KEY, state);
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in unavailable');
      setGoogleLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-16">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Access your orders and wishlist</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <Input name="email" type="email" placeholder="Email" required />
            <Input name="password" type="password" placeholder="Password" required />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" variant="luxury" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-200 dark:border-zinc-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-zinc-500 dark:bg-zinc-950">Or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={googleLoading}
            onClick={() => void signInWithGoogle()}
          >
            {googleLoading ? 'Redirecting…' : 'Continue with Google'}
          </Button>

          <p className="mt-4 text-center text-sm text-zinc-500">
            <Link href="/support" className="text-amber-600 hover:underline">
              Need help?
            </Link>
            {' · '}
            <Link href="/" className="text-amber-600 hover:underline">
              Continue shopping
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
