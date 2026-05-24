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
  Label,
  Textarea,
} from "@nexora/ui";
import {
  fetchThemeSettings,
  updateThemeSettings,
} from "@/lib/settings-api";

export default function BrandingPage() {
  const [primaryColor, setPrimaryColor] = useState("#0f172a");
  const [secondaryColor, setSecondaryColor] = useState("#64748b");
  const [accentColor, setAccentColor] = useState("#3b82f6");
  const [fontFamily, setFontFamily] = useState("Inter, sans-serif");
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [customCss, setCustomCss] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const theme = await fetchThemeSettings();
      if (theme) {
        setPrimaryColor(theme.primaryColor);
        setSecondaryColor(theme.secondaryColor);
        setAccentColor(theme.accentColor);
        setFontFamily(theme.fontFamily);
        setLogoUrl(theme.logoUrl ?? "");
        setFaviconUrl(theme.faviconUrl ?? "");
        setDarkMode(theme.darkMode);
        setCustomCss(theme.customCss ?? "");
      }
      setLoading(false);
    }
    void load();
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      await updateThemeSettings({
        primaryColor,
        secondaryColor,
        accentColor,
        fontFamily,
        logoUrl: logoUrl || undefined,
        faviconUrl: faviconUrl || undefined,
        darkMode,
        customCss: customCss || undefined,
      });
      setMessage("Theme settings saved.");
    } catch {
      setMessage("Failed to save theme settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href="/settings" className="text-sm text-indigo-600 hover:underline">
          ← Back to settings
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Branding & Theme</h1>
        <p className="text-zinc-500">
          Colors and typography applied to your storefront
        </p>
      </div>

      <div className="grid max-w-4xl gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Theme Colors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-zinc-500">Loading…</p>
            ) : (
              <>
                <ColorField label="Primary" value={primaryColor} onChange={setPrimaryColor} />
                <ColorField label="Secondary" value={secondaryColor} onChange={setSecondaryColor} />
                <ColorField label="Accent" value={accentColor} onChange={setAccentColor} />
                <div>
                  <label className="mb-1 block text-sm font-medium">Font Family</label>
                  <Input value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                  />
                  Default to dark mode on storefront
                </label>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assets & Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Logo URL</label>
              <Input
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://cdn.example.com/logo.png"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Favicon URL</label>
              <Input value={faviconUrl} onChange={(e) => setFaviconUrl(e.target.value)} />
            </div>
            <div
              className="rounded-lg border p-6"
              style={{ backgroundColor: primaryColor, color: "#fff", fontFamily }}
            >
              <p className="text-lg font-semibold" style={{ color: accentColor }}>
                Preview heading
              </p>
              <p style={{ color: secondaryColor }}>Secondary text sample</p>
            </div>
            <div>
              <Label htmlFor="custom-css">Custom CSS</Label>
              <Textarea
                id="custom-css"
                value={customCss}
                onChange={(e) => setCustomCss(e.target.value)}
                placeholder=".hero { border-radius: 1rem; }"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {message && (
        <p className={`mt-4 ${message.includes("Failed") ? "text-red-600" : "text-green-600"}`}>
          {message}
        </p>
      )}

      <Button className="mt-6" onClick={() => void handleSave()} disabled={saving || loading}>
        {saving ? "Saving…" : "Save Branding"}
      </Button>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-14 cursor-pointer rounded border"
      />
      <div className="flex-1">
        <label className="mb-1 block text-sm font-medium">{label}</label>
        <Input value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}
