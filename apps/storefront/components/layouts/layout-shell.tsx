"use client";

import type { LayoutVariant } from "@nexora/themes";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AnnouncementBar } from "@/components/announcement-bar";
import { useThemeOverride } from "@/providers/theme-override-provider";
import { ThemeSwitcherWidget } from "../theme-switcher-widget";

const MAIN_CLASS: Record<LayoutVariant, string> = {
  classic: "mx-auto max-w-[1600px] px-6 py-8",
  editorial: "mx-auto max-w-6xl px-8 py-10",
  minimal: "mx-auto max-w-5xl px-4 py-6",
  modern: "mx-auto max-w-[1400px] px-8 py-12",
};

type Props = {
  layoutVariant: LayoutVariant;
  tenantName: string;
  logoUrl?: string | null;
  children: React.ReactNode;
};

export function LayoutShell({
  layoutVariant: serverLayoutVariant,
  tenantName,
  logoUrl,
  children,
}: Props) {
  const { layoutVariant: overrideLayoutVariant } = useThemeOverride();
  const activeLayout = overrideLayoutVariant || serverLayoutVariant;

  return (
    <>
      <AnnouncementBar />
      <Header
        tenantName={tenantName}
        logoUrl={logoUrl}
        variant={activeLayout}
      />
      <main className={MAIN_CLASS[activeLayout]} data-layout={activeLayout}>
        {children}
      </main>
      <Footer tenantName={tenantName} variant={activeLayout} />
      <ThemeSwitcherWidget />
    </>
  );
}

