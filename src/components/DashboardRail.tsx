"use client";

import { useEffect, useState } from "react";
import GWACalculator from "@/components/GWACalculator";
import { Button } from "@/components/ui/button";
import { ChevronDown, Lightbulb, PanelLeft, PanelLeftClose } from "lucide-react";

const kbdClass =
  "rounded border border-border bg-muted px-1 font-mono text-[10px]";

export default function DashboardRail() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [override, setOverride] = useState<boolean | null>(null);
  const open = override ?? isDesktop;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const apply = () => setIsDesktop(mediaQuery.matches);
    apply();
    mediaQuery.addEventListener("change", apply);
    return () => mediaQuery.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOverride(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={() => setOverride(!open)}
        aria-label={open ? "Collapse simulator panel" : "Open simulator panel"}
        aria-expanded={open}
        className={`absolute left-4 top-4 z-20 bg-card shadow-xs ${
          open && !isDesktop ? "hidden" : ""
        }`}
      >
        {open ? <PanelLeftClose /> : <PanelLeft />}
      </Button>

      {open && (
        <>
          <div
            aria-hidden="true"
            onClick={() => setOverride(false)}
            className="fixed inset-x-0 bottom-0 top-16 z-40 bg-foreground/25 motion-safe:animate-in motion-safe:fade-in duration-150 lg:hidden"
          />

          <aside
            className="fixed bottom-0 left-0 top-16 z-50 flex w-[85vw] max-w-80 flex-col gap-3 overflow-y-auto rounded-r-xl border-r border-border bg-card/95 p-4 shadow-xs motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-2 duration-200 lg:absolute lg:bottom-28 lg:left-4 lg:top-14 lg:z-10 lg:w-80 lg:max-w-none lg:rounded-xl lg:border"
          >
            <div className="flex items-center justify-between lg:hidden">
              <span className="text-xs font-medium text-muted-foreground">
                Simulator
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setOverride(false)}
                aria-label="Close simulator panel"
              >
                <PanelLeftClose />
              </Button>
            </div>

            <GWACalculator />

            <details className="group rounded-xl border border-border bg-card p-4 shadow-xs">
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-sm font-heading text-sm font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                <Lightbulb className="size-4 text-primary" />
                Canvas guide
                <ChevronDown className="ml-auto size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <ul className="mt-3 list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-muted-foreground">
                <li>
                  Mark courses as{" "}
                  <strong className="font-semibold text-status-passed">
                    Passed
                  </strong>{" "}
                  or{" "}
                  <strong className="font-semibold text-status-failed">
                    Failed
                  </strong>
                  ; failed prerequisites{" "}
                  <strong className="font-semibold text-status-blocked">
                    block
                  </strong>{" "}
                  everything downstream.
                </li>
                <li>
                  Press <kbd className={kbdClass}>F</kbd> or the fit button in
                  the canvas controls to bring the whole curriculum into view.
                </li>
                <li>
                  Switch between horizontal and vertical flow with the toggle at
                  the canvas top-right.
                </li>
                <li>
                  Drag nodes to rearrange them; Reset layout restores the
                  automatic Dagre arrangement.
                </li>
                <li>
                  Connect courses by dragging from a node&apos;s right handle to
                  another&apos;s left handle.
                </li>
                <li>
                  Select an edge and press{" "}
                  <kbd className={kbdClass}>Backspace</kbd> or{" "}
                  <kbd className={kbdClass}>Delete</kbd> to remove it.
                </li>
              </ul>
            </details>
          </aside>
        </>
      )}
    </>
  );
}
