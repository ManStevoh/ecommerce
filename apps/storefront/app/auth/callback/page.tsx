'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@nexora/ui';
import { completeGoogleOAuth } from '@/lib/api';
import { saveSession } from '@/lib/auth';
import { LoadingBlock } from '@/components/page-shell';

const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? '';
const OAUTH_STATE_KEY = 'nexora_oauth_state';

function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const storedState = sessionStorage.getItem(OAUTH_STATE_KEY);

    if (!code || !state || !TENANT_ID) {
      setError('Invalid sign-in response');
      return;
    }

    if (storedState && storedState !== state) {
      setError('Sign-in session expired. Please try again.');
      return;
    }

    void completeGoogleOAuth(code, state, TENANT_ID)
      .then((session) => {
        sessionStorage.removeItem(OAUTH_STATE_KEY);
        saveSession(session);
        router.replace('/account');
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Google sign-in failed');
      });
  }, [router, searchParams]);

  if (error) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Sign-in failed</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login">
            <Button variant="luxury">Back to sign in</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Signing you in</CardTitle>
        <CardDescription>Completing Google authentication…</CardDescription>
      </CardHeader>
      <CardContent>
        <LoadingBlock rows={2} />
      </CardContent>
    </Card>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="mx-auto max-w-md py-16">
      <Suspense
        fallback={
          <Card className="glass-card">
            <CardContent className="py-8">
              <LoadingBlock rows={2} />
            </CardContent>
          </Card>
        }
      >
        <CallbackInner />
      </Suspense>
    </div>
  );
}
