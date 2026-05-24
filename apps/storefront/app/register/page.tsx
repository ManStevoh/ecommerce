'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '@nexora/ui';
import { registerStore } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      const result = await registerStore({
        email: form.get('email') as string,
        password: form.get('password') as string,
        firstName: form.get('firstName') as string,
        lastName: form.get('lastName') as string,
        storeName: form.get('storeName') as string,
      });
      localStorage.setItem('nexora_access_token', result.accessToken);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-16">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Open your store</CardTitle>
          <CardDescription>
            Create a Nexora Commerce store in minutes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <Input name="storeName" placeholder="Store name" required />
            <div className="grid grid-cols-2 gap-3">
              <Input name="firstName" placeholder="First name" required />
              <Input name="lastName" placeholder="Last name" required />
            </div>
            <Input name="email" type="email" placeholder="Email" required />
            <Input
              name="password"
              type="password"
              placeholder="Password"
              required
              minLength={8}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" variant="luxury" className="w-full" disabled={loading}>
              {loading ? 'Creating store…' : 'Create store'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-zinc-500">
            Already have a store?{' '}
            <Link href="/" className="text-amber-600 hover:underline">
              Back to shop
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
