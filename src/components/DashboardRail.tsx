"use client";

import { useEffect, useState } from "react";
import GWACalculator from "@/components/GWACalculator";
import { useCourseStore } from "@/store/courseStore";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  ChevronDown,
  Lightbulb,
  PanelLeftClose,
  Search,
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
  const [activeTab, setActiveTab] = useState<"simulator" | "courses">("simulator");
  const [searchQuery, setSearchQuery] = useState("");
  const courses = useCourseStore((state) => state.courses);
  const updateCourseStatus = useCourseStore((state) => state.updateCourseStatus);

  const filteredCourses = courses.filter((c) => 
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

        {/* Tab Toggle */}
        <div className="p-3 border-b border-border">
          <div className="flex bg-muted/50 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("simulator")}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${activeTab === 'simulator' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Simulator
            </button>
            <button
              onClick={() => setActiveTab("courses")}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${activeTab === 'courses' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Courses
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          {activeTab === "simulator" ? (
            <>
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
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div className="flex flex-col gap-2">
                {filteredCourses.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    No courses found matching &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  filteredCourses.map((course) => (
                <div key={course.code} className="flex flex-col gap-2 p-3 rounded-lg border border-border bg-card">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">{course.code}</span>
                    <span className="text-xs text-muted-foreground line-clamp-1" title={course.title}>{course.title}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => updateCourseStatus(course.code, "passed")}
                      className={`flex-1 rounded py-1 text-[10px] font-medium border ${course.status === 'passed' ? 'bg-status-passed/20 border-status-passed text-status-passed' : 'border-border bg-background text-muted-foreground hover:bg-muted'}`}
                    >
                      Passed
                    </button>
                    <button
                      onClick={() => updateCourseStatus(course.code, "failed")}
                      className={`flex-1 rounded py-1 text-[10px] font-medium border ${course.status === 'failed' ? 'bg-status-failed/20 border-status-failed text-status-failed' : 'border-border bg-background text-muted-foreground hover:bg-muted'}`}
                    >
                      Failed
                    </button>
                    <button
                      onClick={() => updateCourseStatus(course.code, "pending")}
                      className={`flex-1 rounded py-1 text-[10px] font-medium border ${course.status === 'pending' ? 'bg-status-pending/20 border-status-pending text-foreground' : 'border-border bg-background text-muted-foreground hover:bg-muted'}`}
                    >
                      Pending
                    </button>
                  </div>
                </div>
              ))
            )}
            </div>
          </div>
          )}
        </div>
      </aside>
    </>
  );
}
