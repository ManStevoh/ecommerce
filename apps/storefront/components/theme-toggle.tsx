"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="h-8 w-14 rounded-full bg-zinc-100/80 dark:bg-zinc-800/80 animate-pulse" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex h-8 w-14 items-center rounded-full bg-zinc-100/80 p-1 transition-all duration-300 hover:bg-zinc-200/80 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent focus-visible:ring-offset-2"
      aria-label="Toggle theme"
    >
      {/* Slider pill */}
      <div
        className={`absolute h-6 w-6 rounded-full bg-white shadow-md transition-all duration-300 ease-out flex items-center justify-center dark:bg-zinc-950 ${
          isDark ? "translate-x-6" : "translate-x-0"
        }`}
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400/20" />
        ) : (
          <Sun className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20" />
        )}
      </div>
      <div className="flex w-full justify-between px-1.5 text-zinc-400 dark:text-zinc-600">
        <Sun className="h-3.5 w-3.5" />
        <Moon className="h-3.5 w-3.5" />
      </div>
    </button>
  );
}

