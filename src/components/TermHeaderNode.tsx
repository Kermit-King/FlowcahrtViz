import { memo } from "react";
import { CheckCircle2 } from "lucide-react";

export interface TermHeaderData {
  year: number;
  term: number;
  termIndex: number; // 1-indexed overall (e.g. 1, 2, ... 12)
  totalTerms: number; // total overall terms (e.g. 12)
  totalCourses: number;
  totalUnits: number;
  passedUnits: number;
  passedCourses: number;
  width: number;
  height: number;
}

const TERM_NAMES: Record<number, string> = {
  1: "1st Term",
  2: "2nd Term",
  3: "3rd Term",
  4: "4th Term",
};

const YEAR_NAMES: Record<number, string> = {
  1: "1st Year",
  2: "2nd Year",
  3: "3rd Year",
  4: "4th Year",
  5: "5th Year",
};

export default memo(function TermHeaderNode({
  data,
}: {
  data: TermHeaderData;
}) {
  const termName = TERM_NAMES[data.term] || `Term ${data.term}`;
  const yearName = YEAR_NAMES[data.year] || `Year ${data.year}`;
  const isComplete = data.passedCourses === data.totalCourses && data.totalCourses > 0;
  const progressPercent = data.totalUnits > 0 ? Math.round((data.passedUnits / data.totalUnits) * 100) : 0;

  return (
    <div
      style={{ width: data.width, height: data.height }}
      className={`pointer-events-none select-none rounded-xl border bg-card p-3 shadow-xs transition-all ${
        isComplete
          ? "border-status-passed/60 bg-tint-passed/40"
          : "border-border/80"
      }`}
    >
      <div className="flex h-full flex-col justify-between">
        {/* Top row: Year & Term name + Ordinal Term Badge */}
        <div className="flex items-start justify-between gap-1.5">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading text-xs font-bold text-foreground">
                {yearName} • {termName}
              </span>
              {isComplete && (
                <CheckCircle2 className="size-3.5 text-status-passed" />
              )}
            </div>
            <p className="text-[10px] text-muted-foreground font-medium">
              {data.totalCourses} {data.totalCourses === 1 ? "course" : "courses"} • {data.totalUnits} {data.totalUnits === 1 ? "unit" : "units"}
            </p>
          </div>

          <span className="inline-flex shrink-0 items-center rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-primary shadow-2xs">
            Term {data.termIndex} of {data.totalTerms}
          </span>
        </div>

        {/* Bottom row: Progress bar & unit tally */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground">
            <span>
              {data.passedUnits} / {data.totalUnits} units passed
            </span>
            <span className="font-mono font-semibold">{progressPercent}%</span>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-status-passed transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
});
