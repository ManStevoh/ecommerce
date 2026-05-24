'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@nexora/ui';
import { disableMfa, enableMfa, setupMfa } from '@/lib/auth';

export default function SecurityPage() {
  const [setup, setSetup] = useState<{ secret: string; otpauthUrl: string } | null>(null);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSetup() {
    setLoading(true);
    setMessage(null);
    try {
      const data = await setupMfa();
      setSetup(data);
      setMessage('Scan the secret in your authenticator app, then enter a code to enable.');
    } catch {
      setMessage('MFA setup failed — sign in first.');
    } finally {
      setLoading(false);
    }
  }

  async function handleEnable() {
    setLoading(true);
    setMessage(null);
    try {
      await enableMfa(code);
      setMessage('MFA enabled successfully.');
      setSetup(null);
    } catch {
      setMessage('Invalid code — try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDisable() {
    setLoading(true);
    setMessage(null);
    try {
      await disableMfa();
      setMessage('MFA disabled.');
    } catch {
      setMessage('Failed to disable MFA.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href="/settings" className="text-sm text-indigo-600 hover:underline">
          ← Back to settings
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Security</h1>
        <p className="text-zinc-500">Two-factor authentication (TOTP)</p>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Multi-factor authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => void handleSetup()} disabled={loading}>
            Generate MFA secret
          </Button>
          {setup && (
            <div className="rounded-lg bg-zinc-100 p-3 text-sm dark:bg-zinc-800">
              <p className="font-mono break-all">{setup.secret}</p>
              <p className="mt-2 break-all text-xs text-zinc-500">{setup.otpauthUrl}</p>
            </div>
          )}
          <Input
            placeholder="6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <div className="flex gap-2">
            <Button onClick={() => void handleEnable()} disabled={loading || !code}>
              Enable MFA
            </Button>
            <Button variant="outline" onClick={() => void handleDisable()} disabled={loading}>
              Disable MFA
            </Button>
          </div>
          {message && <p className="text-sm text-zinc-600">{message}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
