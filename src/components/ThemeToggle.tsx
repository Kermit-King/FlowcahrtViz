"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const THEME_CYCLE = ["light", "dark", "system"] as const;
type ThemeChoice = (typeof THEME_CYCLE)[number];

const subscribeNoop = () => () => {};

/** False during SSR/hydration, true after - prevents theme-icon mismatch. */
function useMounted(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  const current: ThemeChoice =
    mounted && theme && (THEME_CYCLE as readonly string[]).includes(theme)
      ? (theme as ThemeChoice)
      : "system";
  const next =
    THEME_CYCLE[(THEME_CYCLE.indexOf(current) + 1) % THEME_CYCLE.length];
  const Icon = current === "light" ? Sun : current === "dark" ? Moon : Monitor;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(next)}
      aria-label={
        mounted
          ? `Color theme: ${current}. Switch to ${next}`
          : "Toggle color theme"
      }
      title={
        mounted ? `Theme: ${current} — switch to ${next}` : "Toggle theme"
      }
    >
      {mounted ? (
        <Icon />
      ) : (
        <span className="size-4" aria-hidden="true" />
      )}
    </Button>
  );
}
