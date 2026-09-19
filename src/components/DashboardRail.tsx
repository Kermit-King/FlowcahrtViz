"use client";

import { useEffect, useState, useMemo } from "react";
import GWACalculator from "@/components/GWACalculator";
import { useCourseStore } from "@/store/courseStore";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  ChevronDown,
  Lightbulb,
  PanelLeftClose,
  Search,
  Activity,
  Plus,
  Edit2,
  Trash2,
} from "lucide-react";
import { analyzeBottlenecks } from "@/lib/graphUtils";

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
  const [activeTab, setActiveTab] = useState<"simulator" | "courses" | "analytics">("simulator");
  const [searchQuery, setSearchQuery] = useState("");
  const courses = useCourseStore((state) => state.courses);
  const updateCourseStatus = useCourseStore((state) => state.updateCourseStatus);
  const setFocusCourseId = useCourseStore((state) => state.setFocusCourseId);
  const openAddCourseModal = useCourseStore((state) => state.openAddCourseModal);
  const openEditCourseModal = useCourseStore((state) => state.openEditCourseModal);
  const deleteCourse = useCourseStore((state) => state.deleteCourse);

  const filteredCourses = useMemo(() => courses.filter((c) => 
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  ), [courses, searchQuery]);

  const { criticalPath, gatekeepers } = useMemo(() => analyzeBottlenecks(courses), [courses]);

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
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${activeTab === 'analytics' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Analytics
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
          ) : activeTab === "courses" ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={openAddCourseModal}
                  className="h-8.5 px-2.5 text-xs font-semibold gap-1 rounded-md shrink-0"
                >
                  <Plus className="size-3.5" />
                  <span className="hidden sm:inline">Add</span>
                </Button>
              </div>

              <div className="flex flex-col gap-2">
                {filteredCourses.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    No courses found matching &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  filteredCourses.map((course) => (
                    <div
                      key={course.code}
                      className="group flex flex-col gap-2 p-3 rounded-lg border border-border bg-card cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => setFocusCourseId(course.code)}
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold font-mono">{course.code}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              (Y{course.year}T{course.term} • {course.units}u)
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground line-clamp-1" title={course.title}>
                            {course.title}
                          </span>
                        </div>

                        {/* Inline Edit / Delete */}
                        <div
                          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => openEditCourseModal(course)}
                            title={`Edit ${course.code}`}
                            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
                          >
                            <Edit2 className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete course ${course.code}?`)) {
                                deleteCourse(course.code);
                              }
                            }}
                            title={`Delete ${course.code}`}
                            className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
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
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-semibold flex items-center gap-2"><Activity className="size-4 text-primary" /> Bottleneck Analyzer</h3>
                <p className="text-xs text-muted-foreground">Identify courses that unlock the most downstream prerequisites.</p>
              </div>
              
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Top Gatekeepers</h4>
                <div className="flex flex-col gap-2">
                  {gatekeepers.slice(0, 5).map((gk, idx) => (
                    <div key={gk.code} className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card cursor-pointer hover:border-primary/50" onClick={() => setFocusCourseId(gk.code)}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold">{idx + 1}. {gk.code}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Unlocks {gk.unlockedCount} ({gk.unlockedUnits}u)</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Critical Path (Longest Chain)</h4>
                <div className="flex flex-col gap-1 p-3 rounded-lg border border-border bg-muted/30">
                  {criticalPath.map((code, idx) => (
                    <div key={code} className="flex gap-2 text-xs" onClick={() => setFocusCourseId(code)}>
                      <span className="text-muted-foreground">{idx + 1}.</span>
                      <span className="font-mono font-semibold cursor-pointer hover:text-primary">{code}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
