'use client';



import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Store } from 'lucide-react';

import {

  Button,

  Card,

  CardContent,

  CardHeader,

  CardTitle,

  Input,

  Label,

  Alert,

  AlertDescription,

} from '@nexora/ui';

import { loginStoreOwner } from '@/lib/auth';



export default function LoginPage() {

  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [needsMfa, setNeedsMfa] = useState(false);

  const [credentials, setCredentials] = useState({ email: '', password: '' });



  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {

    e.preventDefault();

    setLoading(true);

    setError(null);

    const form = new FormData(e.currentTarget);

    const email = form.get('email') as string;

    const password = form.get('password') as string;

    const mfaCode = form.get('mfaCode') as string;



    try {

      await loginStoreOwner(email, password, mfaCode || undefined);

      router.replace('/');

    } catch (err) {

      const message = err instanceof Error ? err.message : 'Login failed';

      if (message === 'MFA_REQUIRED') {

        setNeedsMfa(true);

        setCredentials({ email, password });

        setError('Enter your authenticator code');

      } else {

        setError(message);

      }

    } finally {

      setLoading(false);

    }

  }



  return (

    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-100 via-white to-indigo-50 px-4">

      <Card className="w-full max-w-md border-zinc-200/80 shadow-lg">

        <CardHeader className="space-y-3 text-center">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50">

            <Store className="h-6 w-6 text-indigo-600" />

          </div>

          <CardTitle>Store admin login</CardTitle>

          <p className="text-sm text-zinc-500">

            Sign in to manage orders, products, and settings

          </p>

        </CardHeader>

        <CardContent>

          <form onSubmit={onSubmit} className="space-y-4">

            <div>

              <Label htmlFor="email">Email</Label>

              <Input

                id="email"

                name="email"

                type="email"

                placeholder="owner@freshfish.demo"

                defaultValue={credentials.email || 'owner@freshfish.demo'}

                required

                readOnly={needsMfa}

                className="mt-1.5"

              />

            </div>

            <div>

              <Label htmlFor="password">Password</Label>

              <Input

                id="password"

                name="password"

                type="password"

                placeholder="••••••••"

                required

                readOnly={needsMfa}

                className="mt-1.5"

              />

            </div>

            {needsMfa && (

              <div>

                <Label htmlFor="mfaCode">Authenticator code</Label>

                <Input

                  id="mfaCode"

                  name="mfaCode"

                  placeholder="6-digit code"

                  inputMode="numeric"

                  autoComplete="one-time-code"

                  required

                  className="mt-1.5"

                />

              </div>

            )}

            {error && (

              <Alert variant="destructive">

                <AlertDescription>{error}</AlertDescription>

              </Alert>

            )}

            <Button type="submit" className="w-full" disabled={loading}>

              {loading ? 'Signing in…' : needsMfa ? 'Verify MFA' : 'Sign in'}

            </Button>

          </form>

          <p className="mt-4 text-center text-xs text-zinc-400">

            Demo: owner@freshfish.demo / Admin123!

          </p>

        </CardContent>

      </Card>

    </div>

  );

}

