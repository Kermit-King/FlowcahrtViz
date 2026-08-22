"use client";

import { useEffect, useState } from "react";
import GWACalculator from "@/components/GWACalculator";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  ChevronDown,
  Lightbulb,
  PanelLeft,
  PanelLeftClose,
} from "lucide-react";

const kbdClass =
  "rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]";

interface DashboardRailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DashboardRail({
  open,
  onOpenChange,
}: DashboardRailProps) {
  const [isDesktop, setIsDesktop] = useState(false);

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
      if (event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  return (
    <>
      {/* Mobile Backdrop */}
      {open && !isDesktop && (
        <div
          aria-hidden="true"
          onClick={() => onOpenChange(false)}
          className="fixed inset-0 top-16 z-40 bg-foreground/20 backdrop-blur-xs transition-opacity duration-200 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        aria-label="Simulator & Canvas Tools"
        className={`
          flex flex-col bg-card shrink-0 transition-all duration-300 ease-in-out
          /* Mobile Drawer */
          fixed bottom-0 left-0 top-16 z-50 w-[85vw] max-w-80 border-r border-border shadow-xl
          ${open ? "translate-x-0" : "-translate-x-full"}
          /* Desktop Docked Sidebar */
          lg:static lg:top-auto lg:bottom-auto lg:left-auto lg:z-10 lg:shadow-none lg:translate-x-0
          ${
            isDesktop
              ? open
                ? "lg:w-84 lg:border-r lg:border-border lg:opacity-100"
                : "lg:w-0 lg:border-r-0 lg:opacity-0 lg:overflow-hidden"
              : ""
          }
        `}
      >
        {/* Sidebar Header */}
        <div className="flex h-13 shrink-0 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calculator className="size-4" />
            </div>
            <span className="font-heading text-sm font-semibold tracking-tight text-foreground">
              Degree Simulator
            </span>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onOpenChange(false)}
            aria-label="Close sidebar"
            title="Close sidebar"
            className="text-muted-foreground hover:text-foreground"
          >
            <PanelLeftClose className="size-4" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          <GWACalculator />

          {/* Canvas guide */}
          <details className="group rounded-xl border border-border bg-card p-4 shadow-xs">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-sm font-heading text-sm font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
              <Lightbulb className="size-4 text-primary" />
              Canvas guide
              <ChevronDown className="ml-auto size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <ul className="mt-3 list-disc space-y-2 pl-4 text-xs leading-relaxed text-muted-foreground">
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
                Connect courses by dragging from a node&apos;s handle to
                another&apos;s target handle.
              </li>
              <li>
                Select an edge and press{" "}
                <kbd className={kbdClass}>Backspace</kbd> or{" "}
                <kbd className={kbdClass}>Delete</kbd> to remove it.
              </li>
            </ul>
          </details>
        </div>
      </aside>
    </>
  );
}
