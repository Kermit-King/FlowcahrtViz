"use client";

import { useState, useEffect } from "react";
import { useCourseStore } from "@/store/courseStore";
import { Button } from "@/components/ui/button";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Ban,
  Check,
  Code,
  Download,
  Edit2,
  GraduationCap,
  HelpCircle,
  LayoutGrid,
  Move,
  Network,
  Plus,
  RotateCcw,
  Sparkles,
  Table,
  Upload,
  Workflow,
  X,
} from "lucide-react";

interface TourStep {
  title: string;
  badge: string;
  description: string;
  tips: string[];
  renderGraphic: () => React.ReactNode;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Interactive Degree Prerequisite Map",
    badge: "1. The Big Picture",
    description:
      "FlowchartViz turns your entire academic curriculum into a live directed graph. Every course, credit weight, and prerequisite is charted into an interactive visual roadmap.",
    tips: [
      "Follow arrows from left to right to see foundational courses leading to advanced subjects.",
      "Click any course to spotlight its complete prerequisite chain and future unlocked courses.",
    ],
    renderGraphic: () => (
      <div className="flex items-center justify-center gap-3 p-4 rounded-xl border border-border/80 bg-muted/40">
        <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-card border border-border shadow-xs text-center">
          <span className="font-mono text-xs font-bold text-foreground">MATH 21</span>
          <span className="text-[10px] text-muted-foreground">Pre-Calculus</span>
        </div>
        <ArrowRight className="size-4 text-primary animate-pulse" />
        <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-card border border-border shadow-xs text-center">
          <span className="font-mono text-xs font-bold text-foreground">MATH 22</span>
          <span className="text-[10px] text-muted-foreground">Calculus I</span>
        </div>
        <ArrowRight className="size-4 text-primary animate-pulse" />
        <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-card border border-primary/50 bg-primary/5 shadow-xs text-center">
          <span className="font-mono text-xs font-bold text-primary">CS 130</span>
          <span className="text-[10px] text-primary font-medium">Algorithms</span>
        </div>
      </div>
    ),
  },
  {
    title: "Grade Simulation & Prerequisite Propagation",
    badge: "2. Course Cards",
    description:
      "Simulate your academic standing in real time by marking courses as Passed or Failed. The flowchart automatically detects downstream blocks.",
    tips: [
      "Click ✓ Passed to unlock eligible future courses.",
      "Click ✕ Failed to see which downstream subjects are blocked.",
      "Hover over any card and click the ✏️ pencil icon to edit or adjust its details.",
    ],
    renderGraphic: () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl border border-border/80 bg-muted/40">
        <div className="p-3 rounded-xl border border-status-passed/60 bg-tint-passed/40 flex flex-col justify-between gap-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold">CS 101</span>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-status-passed bg-tint-passed px-1.5 py-0.5 rounded-full">
              <Check className="size-3 stroke-[3]" /> Passed
            </span>
          </div>
          <span className="text-xs text-muted-foreground">Unlocks next semester</span>
        </div>
        <div className="p-3 rounded-xl border border-dashed border-status-blocked/60 bg-tint-blocked/40 flex flex-col justify-between gap-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold">CS 102</span>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-status-blocked bg-tint-blocked px-1.5 py-0.5 rounded-full">
              <Ban className="size-3" /> Blocked
            </span>
          </div>
          <span className="text-xs text-muted-foreground">Prereq not yet cleared</span>
        </div>
      </div>
    ),
  },
  {
    title: "Canvas Navigation & Dragging",
    badge: "3. Canvas Controls",
    description:
      "Move freely around your degree canvas just like a design tool (Figma / Miro).",
    tips: [
      "Click & drag the background to pan anywhere.",
      "Scroll with your trackpad or mousewheel to zoom in and out.",
      "Press F on your keyboard at any time to center and fit all courses on screen.",
      "Drag from the connection dots on a course node to link prerequisites visually.",
    ],
    renderGraphic: () => (
      <div className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border border-border/80 bg-muted/40 text-center">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-card border border-border shadow-xs text-foreground">
            <Move className="size-4.5 text-primary" />
          </span>
          <span className="text-xs font-medium text-foreground">Click + Drag Canvas to Pan</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Shortcuts:</span>
          <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground shadow-2xs">F</kbd>
          <span>Fit View</span>
          <span>•</span>
          <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground shadow-2xs">Shift + Drag</kbd>
          <span>Select Box</span>
        </div>
      </div>
    ),
  },
  {
    title: "Arrangement & Layout Modes",
    badge: "4. View Options",
    description:
      "Switch between different ways of viewing your academic journey using the top-right toolbar.",
    tips: [
      "Flow Mode (Workflow icon): Organizes courses organically by prerequisite relationships.",
      "Terms Mode (Table icon): Arranges courses into neat semester columns matching your official PDF.",
      "Horizontal vs. Vertical: Toggle layout direction to fit your screen orientation.",
    ],
    renderGraphic: () => (
      <div className="flex flex-col gap-2.5 p-3 rounded-xl border border-border/80 bg-muted/40">
        <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border shadow-2xs text-xs">
          <div className="flex items-center gap-2">
            <Workflow className="size-4 text-primary" />
            <span className="font-semibold text-foreground">Flow Mode</span>
          </div>
          <span className="text-[11px] text-muted-foreground">Graph DAG view</span>
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border shadow-2xs text-xs">
          <div className="flex items-center gap-2">
            <Table className="size-4 text-status-passed" />
            <span className="font-semibold text-foreground">Terms Mode</span>
          </div>
          <span className="text-[11px] text-muted-foreground">Semester-by-semester columns</span>
        </div>
      </div>
    ),
  },
  {
    title: "Toolbar Tools: Export, Backup & Reset",
    badge: "5. Toolbar Guide",
    description:
      "Here is exactly what the action buttons on the top-right floating toolbar do:",
    tips: [
      "↓ Download Icon: Exports a high-resolution PNG image of your flowchart to save or share.",
      "<> Code Icon: Exports a raw JSON data backup file of all courses & grades.",
      "↑ Upload Icon: Uploads / imports a previously saved JSON curriculum file.",
      "⊞ Grid Icon: Resets all course positions back to the tidy automatic layout.",
      "↺ Red Arrow: Resets all Passed / Failed grades back to Pending.",
    ],
    renderGraphic: () => (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-xl border border-border/80 bg-muted/40 text-xs">
        <div className="p-2 rounded-lg bg-card border border-border shadow-2xs flex flex-col gap-1">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <Download className="size-3.5 text-primary" />
            <span>Export PNG</span>
          </div>
          <span className="text-[10px] text-muted-foreground">Save as picture</span>
        </div>

        <div className="p-2 rounded-lg bg-card border border-border shadow-2xs flex flex-col gap-1">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <Code className="size-3.5 text-primary" />
            <span>Export JSON</span>
          </div>
          <span className="text-[10px] text-muted-foreground">Backup data file</span>
        </div>

        <div className="p-2 rounded-lg bg-card border border-border shadow-2xs flex flex-col gap-1">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <Upload className="size-3.5 text-primary" />
            <span>Import JSON</span>
          </div>
          <span className="text-[10px] text-muted-foreground">Restore backup</span>
        </div>

        <div className="p-2 rounded-lg bg-card border border-border shadow-2xs flex flex-col gap-1">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <LayoutGrid className="size-3.5 text-foreground" />
            <span>Reset Layout</span>
          </div>
          <span className="text-[10px] text-muted-foreground">Auto-align nodes</span>
        </div>

        <div className="p-2 rounded-lg bg-card border border-border shadow-2xs flex flex-col gap-1 col-span-2 sm:col-span-2">
          <div className="flex items-center gap-1.5 font-semibold text-destructive">
            <RotateCcw className="size-3.5 text-destructive" />
            <span>Reset Statuses</span>
          </div>
          <span className="text-[10px] text-muted-foreground">Clears grades back to pending</span>
        </div>
      </div>
    ),
  },
];

export default function OnboardingTour() {
  const isOpen = useCourseStore((state) => state.tourOpen);
  const closeTour = useCourseStore((state) => state.closeTour);
  const [currentStep, setCurrentStep] = useState(0);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeTour();
      } else if (e.key === "ArrowRight") {
        setCurrentStep((prev) => Math.min(prev + 1, TOUR_STEPS.length - 1));
      } else if (e.key === "ArrowLeft") {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeTour]);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const isLastStep = currentStep === TOUR_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="FlowchartViz Interactive Tutorial"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-border/80 bg-card p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              <Sparkles className="size-3" />
              {step.badge}
            </span>
            <span className="text-xs font-mono text-muted-foreground">
              {currentStep + 1} of {TOUR_STEPS.length}
            </span>
          </div>

          <button
            type="button"
            onClick={closeTour}
            aria-label="Close tutorial"
            className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Visual Graphic */}
        <div className="w-full">
          {step.renderGraphic()}
        </div>

        {/* Content */}
        <div className="space-y-2.5">
          <h3 className="font-heading text-lg sm:text-xl font-semibold tracking-tight text-foreground">
            {step.title}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {step.description}
          </p>

          <ul className="space-y-1.5 pt-1 text-xs text-foreground/90">
            {step.tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer with Controls */}
        <div className="flex items-center justify-between border-t border-border/60 pt-4">
          <button
            type="button"
            onClick={closeTour}
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Skip Tutorial
          </button>

          {/* Dots */}
          <div className="flex items-center gap-1.5" role="tablist">
            {TOUR_STEPS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStep(idx)}
                aria-label={`Go to step ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  idx === currentStep
                    ? "w-6 bg-primary"
                    : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                }`}
              />
            ))}
          </div>

          {/* Nav Buttons */}
          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="h-8 px-2.5 text-xs gap-1"
              >
                <ArrowLeft className="size-3.5" />
                Back
              </Button>
            )}

            <Button
              type="button"
              size="sm"
              onClick={() => {
                if (isLastStep) {
                  closeTour();
                } else {
                  setCurrentStep((prev) => prev + 1);
                }
              }}
              className="h-8 px-3 text-xs font-semibold gap-1"
            >
              {isLastStep ? (
                <>
                  <Check className="size-3.5" />
                  Got it!
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="size-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
