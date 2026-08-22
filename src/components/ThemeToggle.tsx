"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  const isDark = resolvedTheme === "dark";
  const next = isDark ? "light" : "dark";
  const Icon = isDark ? Sun : Moon;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(next)}
      aria-label={
        mounted ? `Color theme: ${isDark ? "dark" : "light"}. Switch to ${next}` : "Toggle color theme"
      }
      title={mounted ? `Theme: ${isDark ? "dark" : "light"} — switch to ${next}` : "Toggle theme"}
    >
      {mounted ? (
        <Icon />
      ) : (
        <span className="size-4" aria-hidden="true" />
      )}
    </Button>
  );
}
