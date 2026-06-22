"use client";

import React, { createContext, useContext, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { resolveTheme, type ResolvedTheme, type ThemePresetSlug, type LayoutVariant } from "@nexora/themes";
import type { TenantTheme } from "@/lib/tenant";

type ThemeOverrideContextType = {
  themePreset: ThemePresetSlug | null;
  layoutVariant: LayoutVariant | null;
  resolvedTheme: ResolvedTheme | null;
  setOverride: (layout: LayoutVariant | null, theme: ThemePresetSlug | null) => void;
};

const ThemeOverrideContext = createContext<ThemeOverrideContextType>({
  themePreset: null,
  layoutVariant: null,
  resolvedTheme: null,
  setOverride: () => {},
});

export function useThemeOverride() {
  return useContext(ThemeOverrideContext);
}

function ThemeOverrideInner({
  serverTheme,
  children,
}: {
  serverTheme: TenantTheme;
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const themeQuery = searchParams.get("theme");
  const layoutQuery = searchParams.get("layout");

  // Determine active theme preset
  let activeThemePreset: ThemePresetSlug | null = null;
  if (themeQuery) {
    activeThemePreset = themeQuery as ThemePresetSlug;
  }

  // Determine active layout variant
  let activeLayoutVariant: LayoutVariant | null = null;
  if (layoutQuery) {
    activeLayoutVariant = layoutQuery as LayoutVariant;
  }

  // Resolve theme settings combining server settings and client query overrides
  let resolvedTheme: ResolvedTheme | null = null;
  if (activeThemePreset || activeLayoutVariant) {
    const combinedSettings = {
      ...serverTheme,
      themePreset: activeThemePreset || serverTheme.themePreset,
      layoutVariant: activeLayoutVariant || serverTheme.layoutVariant,
    };
    
    // Set colors from presets if the preset is updated
    if (activeThemePreset) {
      // Import/access theme presets client side safely
      const { getThemePreset } = require("@nexora/themes");
      const preset = getThemePreset(activeThemePreset);
      if (preset) {
        combinedSettings.primaryColor = preset.primaryColor;
        combinedSettings.secondaryColor = preset.secondaryColor;
        combinedSettings.accentColor = preset.accentColor;
        combinedSettings.fontFamily = preset.fontFamily;
        
        combinedSettings.customColors = {
          backgroundColor: preset.backgroundColor,
          textColor: preset.textColor,
          surfaceColor: preset.surfaceColor,
          borderColor: preset.borderColor,
          mutedColor: preset.mutedColor,
        };
      }
    }

    resolvedTheme = resolveTheme(combinedSettings as any);
  }

  const setOverride = (layout: LayoutVariant | null, theme: ThemePresetSlug | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (layout) {
      params.set("layout", layout);
    } else {
      params.delete("layout");
    }
    if (theme) {
      params.set("theme", theme);
    } else {
      params.delete("theme");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <ThemeOverrideContext.Provider
      value={{
        themePreset: activeThemePreset,
        layoutVariant: activeLayoutVariant,
        resolvedTheme,
        setOverride,
      }}
    >
      {children}
    </ThemeOverrideContext.Provider>
  );
}

export function ThemeOverrideProvider({
  serverTheme,
  children,
}: {
  serverTheme: TenantTheme;
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<>{children}</>}>
      <ThemeOverrideInner serverTheme={serverTheme}>
        {children}
      </ThemeOverrideInner>
    </Suspense>
  );
}
