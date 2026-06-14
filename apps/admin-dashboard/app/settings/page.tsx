"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from "@nexora/ui";
import {
  fetchCurrentTenant,
  fetchStoreSettings,
  updateStoreSettings,
} from "@/lib/settings-api";

export default function SettingsPage() {
  const [storeName, setStoreName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("UTC");
  const [locale, setLocale] = useState("en");
  const [contactEmail, setContactEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [taxRate, setTaxRate] = useState("0");
  const [shippingEnabled, setShippingEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const noTenant = !process.env.NEXT_PUBLIC_TENANT_ID;

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [tenant, settings] = await Promise.all([
        fetchCurrentTenant(),
        fetchStoreSettings(),
      ]);
      if (tenant?.name) setStoreName(tenant.name);
      if (settings) {
        setCurrency(settings.currency);
        setTimezone(settings.timezone);
        setLocale(settings.locale);
        setContactEmail(settings.contactEmail ?? "");
        setSupportPhone(settings.supportPhone ?? "");
        setTaxEnabled(settings.taxEnabled);
        setTaxRate(String(settings.taxRate));
        setShippingEnabled(settings.shippingEnabled);
      }
      setLoading(false);
    }
    void load();
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      await updateStoreSettings({
        currency,
        timezone,
        locale,
        contactEmail: contactEmail || undefined,
        supportPhone: supportPhone || undefined,
        taxEnabled,
        taxRate: parseFloat(taxRate) || 0,
        shippingEnabled,
      });
      setMessage("Store settings saved.");
    } catch {
      setMessage("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-zinc-500">Configure your store preferences</p>
        {noTenant && (
          <p className="mt-1 text-sm text-amber-600">
            Set NEXT_PUBLIC_TENANT_ID in .env.local
          </p>
        )}
      </div>

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-zinc-500">Loading…</p>
            ) : (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Store Name
                  </label>
                  <Input value={storeName} readOnly />
                  <p className="mt-1 text-xs text-zinc-500">
                    Store name is managed at the tenant level during provisioning.
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Support Email
                  </label>
                  <Input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Support Phone
                  </label>
                  <Input
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Currency
                  </label>
                  <Input
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Timezone
                    </label>
                    <Input
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Locale
                    </label>
                    <Input
                      value={locale}
                      onChange={(e) => setLocale(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={taxEnabled}
                      onChange={(e) => setTaxEnabled(e.target.checked)}
                    />
                    Tax enabled
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={shippingEnabled}
                      onChange={(e) => setShippingEnabled(e.target.checked)}
                    />
                    Shipping enabled
                  </label>
                </div>
                {taxEnabled && (
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Tax Rate (%)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Connection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                API Base URL
              </label>
              <Input
                defaultValue={
                  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"
                }
                readOnly
              />
            </div>
            <p className="text-sm text-zinc-500">
              Set NEXT_PUBLIC_API_URL to override the default API endpoint.
            </p>
          </CardContent>
        </Card>

        {message && (
          <p
            className={
              message.includes("Failed") ? "text-red-600" : "text-green-600"
            }
          >
            {message}
          </p>
        )}

        <Button onClick={() => void handleSave()} disabled={saving || loading}>
          {saving ? "Saving…" : "Save Changes"}
        </Button>

        <p className="text-sm text-zinc-500">
          Customize storefront colors and logo on the{" "}
          <Link href="/settings/branding" className="text-indigo-600 hover:underline">
            Branding page
          </Link>
          . Manage coupons, campaigns, and segments in{" "}
          <Link href="/marketing" className="text-indigo-600 hover:underline">
            Marketing
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
