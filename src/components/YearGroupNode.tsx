import { memo } from "react";

export interface YearGroupData {
  year: number;
  totalTerms: number;
  totalUnits: number;
  totalCourses: number;
  passedUnits: number;
  width: number;
  height: number;
}

const ORDINALS = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth"];

export default memo(function YearGroupNode({
  data,
}: {
  data: YearGroupData;
}) {
  const ordinal =
    ORDINALS[data.year - 1] || `Year ${data.year}`;

  return (
    <div
      style={{ width: data.width, height: data.height }}
      className="pointer-events-none select-none rounded-2xl border-2 border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 px-4 py-2.5 shadow-xs backdrop-blur-xs transition-all"
    >
      <div className="flex h-full items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary font-mono text-xs font-bold text-primary-foreground shadow-2xs">
            Y{data.year}
          </span>
          <div>
            <h3 className="font-heading text-sm font-bold tracking-tight text-foreground uppercase">
              {ordinal} Year
            </h3>
            <p className="text-[11px] font-medium text-muted-foreground">
              Academic Year {data.year} • {data.totalTerms}{" "}
              {data.totalTerms === 1 ? "Term" : "Terms"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md border border-border/80 bg-background/80 px-2.5 py-1 text-xs font-semibold tabular-nums text-foreground shadow-2xs">
            <span className="text-muted-foreground font-normal">Total:</span>{" "}
            {data.totalUnits} Units
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-border/80 bg-background/80 px-2.5 py-1 text-xs font-semibold tabular-nums text-foreground shadow-2xs">
            <span className="text-muted-foreground font-normal">Courses:</span>{" "}
            {data.totalCourses}
          </span>
        </div>
      </div>
    </div>
  );
});
