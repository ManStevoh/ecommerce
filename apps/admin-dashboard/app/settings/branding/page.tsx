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
  PageHeader,
  Textarea,
} from "@nexora/ui";
import {
  fetchThemePresets,
  fetchThemeSettings,
  updateThemeSettings,
  type ThemePresetSummary,
} from "@/lib/settings-api";

export default function BrandingPage() {
  const [presets, setPresets] = useState<ThemePresetSummary[]>([]);
  const [selectedPreset, setSelectedPreset] = useState("luxury");
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
      const [theme, presetList] = await Promise.all([
        fetchThemeSettings(),
        fetchThemePresets(),
      ]);
      setPresets(presetList);
      if (theme) {
        setSelectedPreset(theme.themePreset ?? "luxury");
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

  function applyPreset(slug: string) {
    const preset = presets.find((p) => p.slug === slug);
    if (!preset) return;
    setSelectedPreset(slug);
    setPrimaryColor(preset.primaryColor);
    setSecondaryColor(preset.secondaryColor);
    setAccentColor(preset.accentColor);
    setDarkMode(preset.darkMode);
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      await updateThemeSettings({
        themePreset: selectedPreset,
        primaryColor,
        secondaryColor,
        accentColor,
        fontFamily,
        logoUrl: logoUrl || undefined,
        faviconUrl: faviconUrl || undefined,
        darkMode,
        customCss: customCss || undefined,
      });
      setMessage("Theme settings saved. Refresh your storefront to see changes.");
    } catch {
      setMessage("Failed to save theme settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-page">
      <PageHeader
        title="Branding & Theme"
        description="Choose from 11 storefront themes or customize colors and typography"
        action={
          <Link href="/settings">
            <Button variant="outline">Back to settings</Button>
          </Link>
        }
      />

      <Card className="mb-6 border-zinc-200/80 bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Storefront themes ({presets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-zinc-500">Loading themes…</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {presets.map((preset) => (
                <button
                  key={preset.slug}
                  type="button"
                  onClick={() => applyPreset(preset.slug)}
                  className={`rounded-xl border p-4 text-left transition ${
                    selectedPreset === preset.slug
                      ? "border-indigo-500 ring-2 ring-indigo-200"
                      : "border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <div
                    className="mb-3 h-16 rounded-lg"
                    style={{
                      background: `linear-gradient(135deg, ${preset.primaryColor}, ${preset.accentColor})`,
                    }}
                  />
                  <p className="font-medium text-zinc-900">{preset.name}</p>
                  <p className="mt-1 text-xs text-zinc-500 line-clamp-2">
                    {preset.description}
                  </p>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid max-w-4xl gap-6 lg:grid-cols-2">
        <Card className="border-zinc-200/80 bg-white shadow-sm">
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
                  <Label htmlFor="font">Font Family</Label>
                  <Input id="font" value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="mt-1.5" />
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

        <Card className="border-zinc-200/80 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Assets & Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="logo">Logo URL</Label>
              <Input id="logo" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className="mt-1.5" placeholder="https://cdn.example.com/logo.png" />
            </div>
            <div>
              <Label htmlFor="favicon">Favicon URL</Label>
              <Input id="favicon" value={faviconUrl} onChange={(e) => setFaviconUrl(e.target.value)} className="mt-1.5" />
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
                className="mt-1.5"
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
        <Label className="mb-1 block">{label}</Label>
        <Input value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}
