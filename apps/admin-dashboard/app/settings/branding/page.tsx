"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Button,
  Card,
  CardContent,
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
import { Check, Settings2, Zap } from "lucide-react";

// Only show these 3 curated modern themes
const CURATED_SLUGS = ["midnight", "sunset", "noir"];

// ─── Mini storefront preview ────────────────────────────────────────────────
function ThemePreview({ preset }: { preset: ThemePresetSummary }) {
  const bg = preset.backgroundColor ?? "#ffffff";
  const primary = preset.primaryColor;
  const accent = preset.accentColor;
  const muted = preset.mutedColor ?? "#888";
  const text = preset.textColor ?? "#111";

  return (
    <div className="h-44 w-full overflow-hidden select-none" style={{ backgroundColor: bg }}>
      {/* Navbar */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ backgroundColor: primary }}
      >
        <div style={{ width: 44, height: 7, borderRadius: 3, backgroundColor: accent }} />
        <div style={{ display: "flex", gap: 6 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{ width: 22, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.35)" }}
            />
          ))}
        </div>
        <div
          style={{ width: 22, height: 22, borderRadius: "50%", backgroundColor: accent, opacity: 0.9 }}
        />
      </div>

      {/* Hero */}
      <div
        className="px-3 py-3"
        style={{ background: `linear-gradient(135deg, ${primary}44 0%, ${accent}28 100%)` }}
      >
        <div style={{ width: 88, height: 8, borderRadius: 3, backgroundColor: text, opacity: 0.75, marginBottom: 7 }} />
        <div style={{ width: 120, height: 5, borderRadius: 2, backgroundColor: muted, opacity: 0.45, marginBottom: 11 }} />
        <div style={{ width: 54, height: 20, borderRadius: 7, backgroundColor: accent, boxShadow: `0 2px 8px ${accent}55` }} />
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-3 gap-1.5 px-3 py-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{ borderRadius: 7, overflow: "hidden", backgroundColor: bg, boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }}
          >
            <div style={{ height: 30, background: `linear-gradient(135deg, ${primary}66, ${accent}55)` }} />
            <div style={{ padding: "4px 5px 7px" }}>
              <div style={{ height: 4, borderRadius: 2, backgroundColor: muted, opacity: 0.38, marginBottom: 4 }} />
              <div style={{ height: 5, width: 30, borderRadius: 2, backgroundColor: accent, opacity: 0.9 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Inline color field ──────────────────────────────────────────────────────
function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const safeHex = value.startsWith("#") && value.length === 7 ? value : "#888888";
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={safeHex}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-10 shrink-0 cursor-pointer rounded border border-zinc-200"
      />
      <div className="min-w-0 flex-1">
        <span className="text-xs text-zinc-400">{label}</span>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-0.5 h-7 text-xs"
        />
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function BrandingPage() {
  const [allPresets, setAllPresets] = useState<ThemePresetSummary[]>([]);
  const [layouts, setLayouts] = useState<LayoutVariantSummary[]>([]);

  // Active / expanded state
  const [activePreset, setActivePreset] = useState("midnight");
  const [expandedPreset, setExpandedPreset] = useState<string | null>(null);

  // Customization state (shared, persisted on save)
  const [layoutVariant, setLayoutVariant] = useState("minimal");
  const [primaryColor, setPrimaryColor] = useState("#e2e8f0");
  const [secondaryColor, setSecondaryColor] = useState("#94a3b8");
  const [accentColor, setAccentColor] = useState("#818cf8");
  const [fontFamily, setFontFamily] = useState("Inter, sans-serif");
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [customCss, setCustomCss] = useState("");
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">("system");
  const [backgroundColor, setBackgroundColor] = useState("#020617");
  const [textColor, setTextColor] = useState("#f8fafc");
  const [surfaceColor, setSurfaceColor] = useState("rgba(15,23,42,0.85)");
  const [borderColor, setBorderColor] = useState("rgba(129,140,248,0.25)");
  const [mutedColor, setMutedColor] = useState("#94a3b8");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const curatedPresets = allPresets.filter((p) => CURATED_SLUGS.includes(p.slug));

  useEffect(() => {
    async function load() {
      const [theme, presetList, layoutList] = await Promise.all([
        fetchThemeSettings(),
        fetchThemePresets(),
        fetchLayoutVariants(),
      ]);
      setAllPresets(presetList);
      setLayouts(layoutList);
      if (theme) {
        setActivePreset(theme.themePreset ?? "midnight");
        setLayoutVariant(theme.layoutVariant ?? "minimal");
        setPrimaryColor(theme.primaryColor);
        setSecondaryColor(theme.secondaryColor);
        setAccentColor(theme.accentColor);
        setFontFamily(theme.fontFamily);
        setLogoUrl(theme.logoUrl ?? "");
        setFaviconUrl(theme.faviconUrl ?? "");
        setCustomCss(theme.customCss ?? "");
        const cc = theme.customColors ?? {};
        if (cc.themeMode) setThemeMode(cc.themeMode as "light" | "dark" | "system");
        if (cc.backgroundColor) setBackgroundColor(cc.backgroundColor);
        if (cc.textColor) setTextColor(cc.textColor);
        if (cc.surfaceColor) setSurfaceColor(cc.surfaceColor);
        if (cc.borderColor) setBorderColor(cc.borderColor);
        if (cc.mutedColor) setMutedColor(cc.mutedColor);
      }
      setLoading(false);
    }
    void load();
  }, []);

  function applyPresetDefaults(preset: ThemePresetSummary) {
    setPrimaryColor(preset.primaryColor);
    setSecondaryColor(preset.secondaryColor);
    setAccentColor(preset.accentColor);
    if (preset.defaultLayoutVariant) setLayoutVariant(preset.defaultLayoutVariant);
    if (preset.backgroundColor) setBackgroundColor(preset.backgroundColor);
    if (preset.textColor) setTextColor(preset.textColor);
    if (preset.surfaceColor) setSurfaceColor(preset.surfaceColor);
    if (preset.borderColor) setBorderColor(preset.borderColor);
    if (preset.mutedColor) setMutedColor(preset.mutedColor);
  }

  async function handleMakeActive(preset: ThemePresetSummary) {
    setActivating(preset.slug);
    setMessage(null);
    try {
      await updateThemeSettings({
        themePreset: preset.slug,
        layoutVariant: preset.defaultLayoutVariant ?? layoutVariant,
        primaryColor: preset.primaryColor,
        secondaryColor: preset.secondaryColor,
        accentColor: preset.accentColor,
        fontFamily,
        darkMode: preset.darkMode,
        customColors: {
          themeMode,
          backgroundColor: preset.backgroundColor ?? backgroundColor,
          textColor: preset.textColor ?? textColor,
          surfaceColor: preset.surfaceColor ?? surfaceColor,
          borderColor: preset.borderColor ?? borderColor,
          mutedColor: preset.mutedColor ?? mutedColor,
        },
      });
      setActivePreset(preset.slug);
      applyPresetDefaults(preset);
      setMessage({ text: `${preset.name} is now your active storefront theme.`, ok: true });
    } catch {
      setMessage({ text: "Failed to activate theme. Please try again.", ok: false });
    } finally {
      setActivating(null);
    }
  }

  async function handleSaveCustomization() {
    setSaving(true);
    setMessage(null);
    try {
      await updateThemeSettings({
        themePreset: activePreset,
        layoutVariant,
        primaryColor,
        secondaryColor,
        accentColor,
        fontFamily,
        logoUrl: logoUrl || undefined,
        faviconUrl: faviconUrl || undefined,
        customCss: customCss || undefined,
        customColors: {
          themeMode,
          backgroundColor,
          textColor,
          surfaceColor,
          borderColor,
          mutedColor,
        },
      });
      setMessage({ text: "Customizations saved. Refresh your storefront to see changes.", ok: true });
    } catch {
      setMessage({ text: "Failed to save customizations.", ok: false });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-page">
      <PageHeader
        title="Theme Customize"
        description="Pick a theme for your storefront and customize it to match your brand"
        action={
          <Link href="/settings">
            <Button variant="outline">Back to settings</Button>
          </Link>
        }
      />

      {/* ── Theme cards grid ── */}
      <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? [1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-2xl border border-zinc-100 bg-zinc-50"
              />
            ))
          : curatedPresets.map((preset) => {
              const isActive = activePreset === preset.slug;
              const isExpanded = expandedPreset === preset.slug;

              return (
                <div
                  key={preset.slug}
                  className={`overflow-hidden rounded-2xl border-2 transition-all duration-200 ${
                    isActive
                      ? "border-indigo-500 shadow-xl shadow-indigo-100/60"
                      : "border-zinc-200 hover:border-zinc-300 hover:shadow-md"
                  }`}
                >
                  {/* Active badge */}
                  {isActive && (
                    <div className="flex items-center gap-1.5 bg-indigo-500 px-4 py-1.5 text-xs font-semibold tracking-wide text-white">
                      <Check className="h-3 w-3" />
                      Active Theme
                    </div>
                  )}

                  {/* Preview thumbnail */}
                  <ThemePreview preset={preset} />

                  {/* Card footer */}
                  <div className="border-t border-zinc-100 bg-white px-4 py-4">
                    <p className="mb-0.5 font-semibold text-zinc-900">{preset.name}</p>
                    <p className="mb-3 text-xs leading-relaxed text-zinc-500 line-clamp-2">
                      {preset.description}
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedPreset(isExpanded ? null : preset.slug)
                        }
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                          isExpanded
                            ? "border-indigo-500 bg-indigo-500 text-white shadow-sm"
                            : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
                        }`}
                      >
                        <Settings2 className="h-3.5 w-3.5" />
                        Customize
                      </button>
                      {!isActive && (
                        <button
                          type="button"
                          onClick={() => void handleMakeActive(preset)}
                          disabled={activating === preset.slug}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border-0 bg-emerald-500 px-3 py-2 text-sm font-medium text-white transition-all hover:bg-emerald-600 disabled:opacity-60"
                        >
                          <Zap className="h-3.5 w-3.5" />
                          {activating === preset.slug ? "Activating…" : "Make Active"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ── Inline Customize Panel ── */}
                  {isExpanded && (
                    <div className="border-t border-zinc-100 bg-zinc-50/80 p-4 space-y-5">

                      {/* Layout */}
                      <div>
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                          Layout Structure
                        </p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {layouts.map((l) => (
                            <button
                              key={l.slug}
                              type="button"
                              onClick={() => setLayoutVariant(l.slug)}
                              className={`rounded-lg border px-3 py-2 text-left text-xs font-medium transition ${
                                layoutVariant === l.slug
                                  ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                                  : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                              }`}
                            >
                              {l.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Brand Colors */}
                      <div>
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                          Brand Colors
                        </p>
                        <div className="space-y-2">
                          <ColorField label="Primary" value={primaryColor} onChange={setPrimaryColor} />
                          <ColorField label="Accent" value={accentColor} onChange={setAccentColor} />
                          <ColorField label="Secondary" value={secondaryColor} onChange={setSecondaryColor} />
                        </div>
                      </div>

                      {/* Typography */}
                      <div>
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                          Typography
                        </p>
                        <Input
                          value={fontFamily}
                          onChange={(e) => setFontFamily(e.target.value)}
                          className="text-sm"
                          placeholder="Inter, sans-serif"
                        />
                      </div>

                      {/* Theme mode */}
                      <div>
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                          Theme Mode
                        </p>
                        <select
                          value={themeMode}
                          onChange={(e) =>
                            setThemeMode(e.target.value as "light" | "dark" | "system")
                          }
                          className="flex h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                        >
                          <option value="system">System (follows device)</option>
                          <option value="light">Always Light</option>
                          <option value="dark">Always Dark</option>
                        </select>
                      </div>

                      {/* Assets */}
                      <div>
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                          Assets
                        </p>
                        <div className="space-y-2">
                          <Input
                            value={logoUrl}
                            onChange={(e) => setLogoUrl(e.target.value)}
                            className="text-sm"
                            placeholder="Logo URL (https://...)"
                          />
                          <Input
                            value={faviconUrl}
                            onChange={(e) => setFaviconUrl(e.target.value)}
                            className="text-sm"
                            placeholder="Favicon URL (https://...)"
                          />
                        </div>
                      </div>

                      {/* Custom CSS */}
                      <div>
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                          Custom CSS
                        </p>
                        <Textarea
                          value={customCss}
                          onChange={(e) => setCustomCss(e.target.value)}
                          className="font-mono text-xs"
                          placeholder=".hero { border-radius: 1rem; }"
                          rows={3}
                        />
                      </div>

                      {/* Save */}
                      <button
                        type="button"
                        onClick={() => void handleSaveCustomization()}
                        disabled={saving}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-indigo-600 disabled:opacity-60"
                      >
                        {saving ? "Saving…" : "Save Customizations"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
      </div>

      {/* Status message */}
      {message && (
        <p
          className={`mt-2 rounded-lg px-4 py-2.5 text-sm font-medium ${
            message.ok
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
