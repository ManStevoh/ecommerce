"use client";

import { useState } from "react";
import { useThemeOverride } from "@/providers/theme-override-provider";
import { THEME_PRESETS, LAYOUT_VARIANTS, type ThemePresetSlug, type LayoutVariant } from "@nexora/themes";
import { Palette, Layout, RotateCcw, Check, Sparkles, X, Settings } from "lucide-react";

export function ThemeSwitcherWidget() {
  const { themePreset, layoutVariant, setOverride } = useThemeOverride();
  const [isOpen, setIsOpen] = useState(false);

  // Fallback definitions of the current tenant defaults if no overrides exist
  const activeTheme = themePreset || "luxury";
  const activeLayout = layoutVariant || "classic";

  const handleThemeChange = (slug: ThemePresetSlug) => {
    setOverride(layoutVariant, slug);
  };

  const handleLayoutChange = (slug: LayoutVariant) => {
    setOverride(slug, themePreset);
  };

  const handleReset = () => {
    setOverride(null, null);
  };

  return (
    <div className="fixed bottom-6 left-6 z-[9999] font-sans antialiased">
      {/* Toggle Floating Action Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200/80 bg-white/90 shadow-lg shadow-zinc-200/40 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-theme-accent/30 hover:bg-white active:scale-95 dark:border-zinc-800/80 dark:bg-zinc-900/90 dark:shadow-black/40"
          title="Customize Theme & Layout"
        >
          <div className="relative">
            <Palette className="h-5.5 w-5.5 text-zinc-600 transition-transform duration-500 group-hover:rotate-12 dark:text-zinc-300" />
            <span className="absolute -right-1 -top-1 flex h-2 w-2 rounded-full bg-theme-accent animate-ping" />
            <span className="absolute -right-1 -top-1 flex h-2 w-2 rounded-full bg-theme-accent" />
          </div>
        </button>
      )}

      {/* Expanded Customize Panel */}
      {isOpen && (
        <div className="w-80 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/95 shadow-2xl shadow-zinc-300/50 backdrop-blur-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 dark:border-zinc-800/80 dark:bg-zinc-950/95 dark:shadow-black/50">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50 px-4 py-3 dark:border-zinc-900 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-theme-accent animate-pulse" />
              <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                Theme Studio
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {(themePreset || layoutVariant) && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 transition dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                  title="Reset to default settings"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 transition dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="max-h-[380px] overflow-y-auto p-4 space-y-5">
            
            {/* Section 1: Themes */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5" /> Theme Presets
              </label>
              
              <div className="grid grid-cols-2 gap-2">
                {THEME_PRESETS.map((preset) => {
                  const isActive = activeTheme === preset.slug;
                  return (
                    <button
                      key={preset.slug}
                      type="button"
                      onClick={() => handleThemeChange(preset.slug as ThemePresetSlug)}
                      className={`flex items-center gap-2 rounded-xl border p-2 text-left transition-all hover:scale-[1.02] ${
                        isActive
                          ? "border-theme-accent bg-zinc-50 ring-1 ring-theme-accent/30 dark:bg-zinc-900"
                          : "border-zinc-100 hover:border-zinc-200 bg-white dark:border-zinc-900 dark:bg-zinc-900/40"
                      }`}
                    >
                      {/* Color circles */}
                      <div className="flex shrink-0 -space-x-1.5">
                        <span
                          className="h-4.5 w-4.5 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: preset.primaryColor }}
                        />
                        <span
                          className="h-4.5 w-4.5 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: preset.accentColor }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                          {preset.name}
                        </p>
                      </div>
                      {isActive && (
                        <Check className="h-3 w-3 shrink-0 text-theme-accent font-bold" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Layouts */}
            <div className="space-y-2 border-t border-zinc-100 pt-4 dark:border-zinc-900">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                <Layout className="h-3.5 w-3.5" /> Layout Structures
              </label>
              
              <div className="space-y-1.5">
                {LAYOUT_VARIANTS.map((layout) => {
                  const isActive = activeLayout === layout.slug;
                  return (
                    <button
                      key={layout.slug}
                      type="button"
                      onClick={() => handleLayoutChange(layout.slug as LayoutVariant)}
                      className={`flex w-full items-center justify-between rounded-xl border p-2.5 text-left transition-all ${
                        isActive
                          ? "border-theme-accent bg-zinc-50 ring-1 ring-theme-accent/30 dark:bg-zinc-900"
                          : "border-zinc-100 hover:border-zinc-200 bg-white dark:border-zinc-900 dark:bg-zinc-900/40"
                      }`}
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                          {layout.name}
                        </p>
                        <p className="truncate text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                          {layout.description}
                        </p>
                      </div>
                      {isActive && (
                        <Check className="h-3.5 w-3.5 shrink-0 text-theme-accent" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Footer status info */}
          <div className="bg-zinc-50/80 px-4 py-2 text-center text-[10px] text-zinc-400 border-t border-zinc-100 dark:bg-zinc-900/80 dark:border-zinc-900 dark:text-zinc-500">
            Changes apply instantly on the fly
          </div>
        </div>
      )}
    </div>
  );
}
