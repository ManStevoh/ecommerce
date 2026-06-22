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
  fetchLayoutVariants,
  fetchThemePresets,
  fetchThemeSettings,
  updateThemeSettings,
  type LayoutVariantSummary,
  type ThemePresetSummary,
} from "@/lib/settings-api";

export default function BrandingPage() {
  const [presets, setPresets] = useState<ThemePresetSummary[]>([]);
  const [layouts, setLayouts] = useState<LayoutVariantSummary[]>([]);
  const [selectedPreset, setSelectedPreset] = useState("luxury");
  const [layoutVariant, setLayoutVariant] = useState("classic");
  const [primaryColor, setPrimaryColor] = useState("#0f172a");
  const [secondaryColor, setSecondaryColor] = useState("#64748b");
  const [accentColor, setAccentColor] = useState("#3b82f6");
  const [fontFamily, setFontFamily] = useState("Inter, sans-serif");
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">("system");
  const [customCss, setCustomCss] = useState("");

  // Custom Colors - Light Mode
  const [backgroundColor, setBackgroundColor] = useState("#fafafa");
  const [textColor, setTextColor] = useState("#18181b");
  const [surfaceColor, setSurfaceColor] = useState("rgba(255,255,255,0.72)");
  const [borderColor, setBorderColor] = useState("rgba(120,113,108,0.25)");
  const [mutedColor, setMutedColor] = useState("#71717a");

  // Custom Colors - Dark Mode
  const [darkBackgroundColor, setDarkBackgroundColor] = useState("#09090b");
  const [darkTextColor, setDarkTextColor] = useState("#fafafa");
  const [darkSurfaceColor, setDarkSurfaceColor] = useState("rgba(18,18,22,0.72)");
  const [darkBorderColor, setDarkBorderColor] = useState("rgba(255,255,255,0.08)");
  const [darkMutedColor, setDarkMutedColor] = useState("#a1a1aa");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [theme, presetList, layoutList] = await Promise.all([
        fetchThemeSettings(),
        fetchThemePresets(),
        fetchLayoutVariants(),
      ]);
      setPresets(presetList);
      setLayouts(layoutList);
      if (theme) {
        setSelectedPreset(theme.themePreset ?? "luxury");
        setLayoutVariant(theme.layoutVariant ?? "classic");
        setPrimaryColor(theme.primaryColor);
        setSecondaryColor(theme.secondaryColor);
        setAccentColor(theme.accentColor);
        setFontFamily(theme.fontFamily);
        setLogoUrl(theme.logoUrl ?? "");
        setFaviconUrl(theme.faviconUrl ?? "");
        setDarkMode(theme.darkMode);
        setCustomCss(theme.customCss ?? "");

        const cc = theme.customColors ?? {};
        if (cc.themeMode) setThemeMode(cc.themeMode as any);
        if (cc.backgroundColor) setBackgroundColor(cc.backgroundColor);
        if (cc.textColor) setTextColor(cc.textColor);
        if (cc.surfaceColor) setSurfaceColor(cc.surfaceColor);
        if (cc.borderColor) setBorderColor(cc.borderColor);
        if (cc.mutedColor) setMutedColor(cc.mutedColor);

        if (cc.darkBackgroundColor) setDarkBackgroundColor(cc.darkBackgroundColor);
        if (cc.darkTextColor) setDarkTextColor(cc.darkTextColor);
        if (cc.darkSurfaceColor) setDarkSurfaceColor(cc.darkSurfaceColor);
        if (cc.darkBorderColor) setDarkBorderColor(cc.darkBorderColor);
        if (cc.darkMutedColor) setDarkMutedColor(cc.darkMutedColor);
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
    if (preset.defaultLayoutVariant) {
      setLayoutVariant(preset.defaultLayoutVariant);
    }

    // Load defaults from preset if available
    if (preset.backgroundColor) setBackgroundColor(preset.backgroundColor);
    if (preset.textColor) setTextColor(preset.textColor);
    if (preset.surfaceColor) setSurfaceColor(preset.surfaceColor);
    if (preset.borderColor) setBorderColor(preset.borderColor);
    if (preset.mutedColor) setMutedColor(preset.mutedColor);
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      await updateThemeSettings({
        themePreset: selectedPreset,
        layoutVariant,
        primaryColor,
        secondaryColor,
        accentColor,
        fontFamily,
        logoUrl: logoUrl || undefined,
        faviconUrl: faviconUrl || undefined,
        darkMode,
        customCss: customCss || undefined,
        customColors: {
          themeMode,
          backgroundColor,
          textColor,
          surfaceColor,
          borderColor,
          mutedColor,
          darkBackgroundColor,
          darkTextColor,
          darkSurfaceColor,
          darkBorderColor,
          darkMutedColor,
        },
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
        title="Theme Customize"
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

      <Card className="mb-6 border-zinc-200/80 bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Storefront layout</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {layouts.map((layout) => (
              <button
                key={layout.slug}
                type="button"
                onClick={() => setLayoutVariant(layout.slug)}
                className={`rounded-xl border p-4 text-left transition ${
                  layoutVariant === layout.slug
                    ? "border-indigo-500 ring-2 ring-indigo-200"
                    : "border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <p className="font-medium text-zinc-900">{layout.name}</p>
                <p className="mt-1 text-xs text-zinc-500">{layout.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid max-w-4xl gap-6 lg:grid-cols-2">
        <Card className="border-zinc-200/80 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Theme Colors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <p className="text-zinc-500">Loading…</p>
            ) : (
              <>
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-zinc-900 border-b pb-1.5 dark:text-white">Brand Colors</h3>
                  <ColorField label="Primary" value={primaryColor} onChange={setPrimaryColor} />
                  <ColorField label="Secondary" value={secondaryColor} onChange={setSecondaryColor} />
                  <ColorField label="Accent" value={accentColor} onChange={setAccentColor} />
                  <div>
                    <Label htmlFor="font">Font Family</Label>
                    <Input id="font" value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="theme-mode">Theme Mode Enforcement</Label>
                    <select
                      id="theme-mode"
                      value={themeMode}
                      onChange={(e) => setThemeMode(e.target.value as any)}
                      className="mt-1.5 flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                    >
                      <option value="system">System Auto (Light Default / Dark on Device Request)</option>
                      <option value="light">Enforce Light Mode (Always Light)</option>
                      <option value="dark">Enforce Dark Mode (Always Dark)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-zinc-900 border-b pb-1.5 dark:text-white">Light Mode overrides</h3>
                  <ColorField label="Background" value={backgroundColor} onChange={setBackgroundColor} />
                  <ColorField label="Text Color" value={textColor} onChange={setTextColor} />
                  <ColorField label="Surface (Cards)" value={surfaceColor} onChange={setSurfaceColor} />
                  <ColorField label="Borders" value={borderColor} onChange={setBorderColor} />
                  <ColorField label="Muted Text" value={mutedColor} onChange={setMutedColor} />
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-zinc-900 border-b pb-1.5 dark:text-white">Dark Mode overrides</h3>
                  <ColorField label="Background" value={darkBackgroundColor} onChange={setDarkBackgroundColor} />
                  <ColorField label="Text Color" value={darkTextColor} onChange={setDarkTextColor} />
                  <ColorField label="Surface (Cards)" value={darkSurfaceColor} onChange={setDarkSurfaceColor} />
                  <ColorField label="Borders" value={darkBorderColor} onChange={setDarkBorderColor} />
                  <ColorField label="Muted Text" value={darkMutedColor} onChange={setDarkMutedColor} />
                </div>
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
        {saving ? "Saving…" : "Save Theme Customizations"}
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
