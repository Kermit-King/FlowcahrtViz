import { useEffect, useState } from "react";
import GWACalculator from "@/components/GWACalculator";
import { useCourseStore } from "@/store/courseStore";
import { getCurriculumStats } from "@/lib/graphUtils";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Calculator,
  CheckCircle2,
  ChevronDown,
  Columns3,
  GraduationCap,
  Lightbulb,
  Move,
  PanelLeftClose,
  Search,
} from "lucide-react";

const kbdClass =
  "rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]";

interface DashboardRailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const YEAR_NAMES = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "6th Year"];
const TERM_NAMES = ["1st Term", "2nd Term", "3rd Term", "4th Term"];

export default function DashboardRail({
  open,
  onOpenChange,
}: DashboardRailProps) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeTab, setActiveTab] = useState<"simulator" | "terms" | "courses">("simulator");
  const [searchQuery, setSearchQuery] = useState("");
  const courses = useCourseStore((state) => state.courses);
  const updateCourseStatus = useCourseStore((state) => state.updateCourseStatus);

  const stats = getCurriculumStats(courses);

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
          fixed bottom-0 left-0 top-16 z-50 w-[88vw] max-w-88 border-r border-border shadow-xl
          ${open ? "translate-x-0" : "-translate-x-full"}
          /* Desktop Docked Sidebar */
          lg:static lg:top-auto lg:bottom-auto lg:left-auto lg:z-10 lg:shadow-none lg:translate-x-0
          ${
            isDesktop
              ? open
                ? "lg:w-88 lg:border-r lg:border-border lg:opacity-100"
                : "lg:w-0 lg:border-r-0 lg:opacity-0 lg:overflow-hidden"
              : ""
          }
        `}
      >
        {/* Sidebar Header */}
        <div className="flex h-13 shrink-0 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <GraduationCap className="size-4" />
            </div>
            <span className="font-heading text-sm font-semibold tracking-tight text-foreground">
              Curriculum Dashboard
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
          <div className="flex bg-muted/60 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("simulator")}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${activeTab === 'simulator' ? 'bg-card text-foreground shadow-xs font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Simulator
            </button>
            <button
              onClick={() => setActiveTab("terms")}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${activeTab === 'terms' ? 'bg-card text-foreground shadow-xs font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Terms ({stats.totalTerms})
            </button>
            <button
              onClick={() => setActiveTab("courses")}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${activeTab === 'courses' ? 'bg-card text-foreground shadow-xs font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
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
                  Navigation &amp; Canvas guide
                  <ChevronDown className="ml-auto size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <ul className="mt-3 list-disc space-y-2 pl-4 text-xs leading-relaxed text-muted-foreground">
                  <li>
                    <strong className="text-foreground">Click and drag anywhere on canvas</strong> to pan smoothly across the entire flowchart.
                  </li>
                  <li>
                    Switch to <strong className="font-semibold text-primary">By Terms</strong> to see structured flowchart columns grouped by Academic Year and Term with headers and counters.
                  </li>
                  <li>
                    Switch to <strong className="font-semibold text-foreground">By Prereq Flow</strong> to see the topological dependency DAG.
                  </li>
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
                    downstream subjects.
                  </li>
                  <li>
                    Press <kbd className={kbdClass}>F</kbd> or the fit button in canvas controls to bring the whole map into view.
                  </li>
                  <li>
                    Scroll with mouse wheel or trackpad to zoom in and out.
                  </li>
                </ul>
              </details>
            </>
          ) : activeTab === "terms" ? (
            /* Dedicated Terms & Years Breakdown */
            <div className="flex flex-col gap-3.5">
              <div className="rounded-xl border border-primary/25 bg-primary/5 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Curriculum Structure</span>
                  <span className="font-mono text-xs font-bold text-primary">
                    {stats.totalYears} Years • {stats.totalTerms} Terms
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Total of {stats.totalCourses} courses ({stats.totalUnits} units) across {stats.totalTerms} sequential terms.
                </p>
              </div>

              {stats.years.map((yearStat) => (
                <div key={yearStat.year} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-2xs">
                  {/* Year Header */}
                  <div className="flex items-center justify-between border-b border-border/70 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex size-5.5 items-center justify-center rounded-md bg-primary text-[10px] font-bold text-primary-foreground font-mono">
                        Y{yearStat.year}
                      </span>
                      <span className="font-heading text-xs font-bold uppercase tracking-tight text-foreground">
                        {YEAR_NAMES[yearStat.year - 1] || `Year ${yearStat.year}`}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {yearStat.totalUnits} Units • {yearStat.terms.length} Terms
                    </span>
                  </div>

                  {/* Term List */}
                  <div className="flex flex-col gap-2 pt-1">
                    {yearStat.terms.map((termStat) => {
                      const isComplete = termStat.passedCourses === termStat.totalCourses && termStat.totalCourses > 0;
                      return (
                        <div
                          key={`${termStat.year}-${termStat.term}`}
                          className={`flex flex-col gap-1.5 rounded-lg border p-2.5 transition-colors ${
                            isComplete
                              ? "border-status-passed/40 bg-tint-passed/30"
                              : "border-border/60 bg-muted/30 hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-foreground">
                                {TERM_NAMES[termStat.term - 1] || `Term ${termStat.term}`}
                              </span>
                              {isComplete && (
                                <CheckCircle2 className="size-3.5 text-status-passed" />
                              )}
                            </div>
                            <span className="inline-flex rounded border border-border bg-background px-1.5 py-px font-mono text-[10px] font-medium text-muted-foreground">
                              Term {termStat.termIndex} of {stats.totalTerms}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>{termStat.totalCourses} courses • {termStat.totalUnits} units</span>
                            <span>{termStat.passedUnits}/{termStat.totalUnits} units passed</span>
                          </div>

                          {/* Quick course chips */}
                          <div className="flex flex-wrap gap-1 pt-1">
                            {termStat.courses.map((course) => (
                              <span
                                key={course.code}
                                className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-mono font-medium border ${
                                  course.status === "passed"
                                    ? "bg-tint-passed text-status-passed border-status-passed/30"
                                    : course.status === "failed"
                                    ? "bg-tint-failed text-status-failed border-status-failed/30"
                                    : course.status === "blocked"
                                    ? "bg-tint-blocked text-status-blocked border-status-blocked/30"
                                    : "bg-background text-foreground/80 border-border"
                                }`}
                              >
                                {course.code}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Courses Search & Quick Status Modifier */
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search courses by code or title..."
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
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold">{course.code}</span>
                          <span className="text-xs text-muted-foreground line-clamp-1" title={course.title}>{course.title}</span>
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1 rounded">
                          Y{course.year}T{course.term}
                        </span>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => updateCourseStatus(course.code, "passed")}
                          className={`flex-1 rounded py-1 text-[10px] font-medium border transition-colors ${course.status === 'passed' ? 'bg-status-passed/20 border-status-passed text-status-passed' : 'border-border bg-background text-muted-foreground hover:bg-muted'}`}
                        >
                          Passed
                        </button>
                        <button
                          onClick={() => updateCourseStatus(course.code, "failed")}
                          className={`flex-1 rounded py-1 text-[10px] font-medium border transition-colors ${course.status === 'failed' ? 'bg-status-failed/20 border-status-failed text-status-failed' : 'border-border bg-background text-muted-foreground hover:bg-muted'}`}
                        >
                          Failed
                        </button>
                        <button
                          onClick={() => updateCourseStatus(course.code, "pending")}
                          className={`flex-1 rounded py-1 text-[10px] font-medium border transition-colors ${course.status === 'pending' ? 'bg-status-pending/20 border-status-pending text-foreground' : 'border-border bg-background text-muted-foreground hover:bg-muted'}`}
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
