import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCourseStore } from "@/store/courseStore";
import {
  Award,
  Calculator,
  CheckCircle,
  PartyPopper,
  Percent,
  TriangleAlert,
} from "lucide-react";

const STATUS_MESSAGE_STYLES = {
  error: "border-status-failed/30 bg-tint-failed text-status-failed",
  warning: "border-status-blocked/30 bg-tint-blocked text-status-blocked",
  success: "border-status-passed/30 bg-tint-passed text-status-passed",
  info: "border-border bg-muted text-muted-foreground",
} as const;

const HONORS_THRESHOLDS = {
  lower: [
    { label: "Summa Cum Laude", max: 1.2 },
    { label: "Magna Cum Laude", max: 1.45 },
    { label: "Cum Laude", max: 1.75 },
  ],
  higher: [
    { label: "Summa Cum Laude", min: 3.8 },
    { label: "Magna Cum Laude", min: 3.5 },
    { label: "Cum Laude", min: 3.2 },
  ],
};

export default function GWACalculator() {
  const courses = useCourseStore((state) => state.courses);
  const updateCourseGrade = useCourseStore((state) => state.updateCourseGrade);

  const [manualAverage, setManualAverage] = useState<string>("2.0");
  const [targetGWA, setTargetGWA] = useState<string>("1.75");
  const [scale, setScale] = useState<"lower" | "higher">("lower"); // lower is better (1.0 best, 3.0 pass) vs higher is better (4.0 best)

  // Calculate units
  const passedCourses = courses.filter((c) => c.status === "passed");
  const failedCourses = courses.filter((c) => c.status === "failed");
  const remainingCourses = courses.filter((c) => c.status === "pending" || c.status === "blocked");

  const passedUnits = passedCourses.reduce((sum, c) => sum + c.units, 0);
  const failedUnits = failedCourses.reduce((sum, c) => sum + c.units, 0);
  const remainingUnits = remainingCourses.reduce((sum, c) => sum + c.units, 0);
  const totalUnits = passedUnits + remainingUnits; // total degree units (excluding currently failed ones that need retake)

  const completionRate = totalUnits > 0 ? (passedUnits / totalUnits) * 100 : 0;

  // Calculate actual GWA based on individual grades
  let totalGradeUnits = 0;
  let gradedUnits = 0;
  passedCourses.forEach((c) => {
    if (c.grade !== undefined && c.grade > 0) {
      totalGradeUnits += c.grade * c.units;
      gradedUnits += c.units;
    }
  });
  
  const calculatedAvg = gradedUnits > 0 ? totalGradeUnits / gradedUnits : 0;
  const avg = calculatedAvg > 0 ? calculatedAvg : (parseFloat(manualAverage) || 0);
  const target = parseFloat(targetGWA) || 0;

  let requiredGWA: number | null = null;
  let statusMessage = "";
  let statusType: "success" | "warning" | "error" | "info" = "info";

  if (avg > 0 && target > 0 && remainingUnits > 0 && totalUnits > 0) {
    // Math: (avg * passedUnits + req * remainingUnits) / totalUnits = target
    // req * remainingUnits = target * totalUnits - avg * passedUnits
    // req = (target * totalUnits - avg * passedUnits) / remainingUnits
    requiredGWA = (target * totalUnits - avg * passedUnits) / remainingUnits;

    // Check if achievable based on the scale
    if (scale === "lower") {
      // Scale: 1.0 is best, 3.0 is pass, 5.0 is fail
      if (requiredGWA < 1.0) {
        statusMessage = "Impossible: Target GWA requires remaining grades better than 1.0.";
        statusType = "error";
      } else if (requiredGWA > 3.0) {
        statusMessage = "Easy: You only need to pass remaining subjects (average > 3.0).";
        statusType = "success";
      } else {
        statusMessage = `Achievable: You need an average of ${requiredGWA.toFixed(2)} in remaining courses.`;
        statusType = "warning";
      }
    } else {
      // Scale: 4.0 is best, 1.0/2.0 is pass, 0.0 is fail
      if (requiredGWA > 4.0) {
        statusMessage = "Impossible: Target GPA requires remaining grades better than 4.0.";
        statusType = "error";
      } else if (requiredGWA < 2.0) {
        statusMessage = "Easy: You only need to maintain basic passing grades.";
        statusType = "success";
      } else {
        statusMessage = `Achievable: You need an average GPA of ${requiredGWA.toFixed(2)} in remaining courses.`;
        statusType = "warning";
      }
    }
  }

  const getHonorsLabel = (grade: number) => {
    if (grade <= 0) return null;
    if (scale === "lower") {
      for (const t of HONORS_THRESHOLDS.lower) if (grade <= t.max) return t.label;
    } else {
      for (const t of HONORS_THRESHOLDS.higher) if (grade >= t.min) return t.label;
    }
    return null;
  };
  const currentHonors = getHonorsLabel(avg);

  return (
    <Card className="w-full border border-border shadow-xs ring-0">
      <CardHeader className="border-b border-border pb-3">
        <CardTitle className="flex items-center gap-2 font-heading text-base font-semibold tracking-tight">
          <Calculator className="size-4 text-primary" />
          Progress &amp; GWA Simulator
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 pt-4">
        {/* Progress Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg border border-border bg-muted p-2.5">
            <span className="mb-0.5 block text-muted-foreground">Completed Units</span>
            <span className="flex items-center gap-1 text-lg font-bold tabular-nums">
              <CheckCircle className="size-4 text-status-passed" />
              {passedUnits} / {totalUnits}
            </span>
          </div>
          <div className="rounded-lg border border-border bg-muted p-2.5">
            <span className="mb-0.5 block text-muted-foreground">Completion Rate</span>
            <span className="flex items-center gap-1 text-lg font-bold tabular-nums">
              <Percent className="size-4 text-primary" />
              {completionRate.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Failed Courses indicator if any */}
        {failedUnits > 0 && (
          <div className="flex items-start gap-1.5 rounded-lg border border-status-failed/30 bg-tint-failed p-2.5 text-xs text-status-failed">
            <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
            <span>
              You have <strong>{failedUnits} units</strong> of failed courses
              that you need to retake.
            </span>
          </div>
        )}

        {/* GWA Scale Toggle */}
        <div
          role="group"
          aria-label="Grading scale"
          className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1"
        >
          <button
            type="button"
            onClick={() => setScale("lower")}
            aria-pressed={scale === "lower"}
            className={`rounded-md px-2 py-1.5 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              scale === "lower"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            1.0 Scale (Lower is Better)
          </button>
          <button
            type="button"
            onClick={() => setScale("higher")}
            aria-pressed={scale === "higher"}
            className={`rounded-md px-2 py-1.5 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              scale === "higher"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            4.0 Scale (Higher is Better)
          </button>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-muted-foreground flex justify-between">
              <span>Current Average Grade</span>
              {calculatedAvg > 0 && <span className="text-primary font-mono">{calculatedAvg.toFixed(3)}</span>}
            </label>
            
            {passedCourses.length > 0 ? (
              <details className="group rounded-md border border-border bg-card shadow-xs [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between p-2 text-xs font-medium outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <span>Enter per-course grades ({gradedUnits}/{passedUnits} units graded)</span>
                  <span className="text-[10px] text-muted-foreground group-open:hidden">Expand to enter</span>
                </summary>
                <div className="flex max-h-48 flex-col gap-2 overflow-y-auto border-t border-border p-2">
                  {passedCourses.map((c) => (
                    <div key={c.code} className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono w-20 truncate" title={c.title}>{c.code}</span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Grade"
                        value={c.grade || ""}
                        onChange={(e) => updateCourseGrade(c.code, parseFloat(e.target.value) || undefined)}
                        className="h-6 w-20 px-2 text-[10px]"
                      />
                    </div>
                  ))}
                </div>
              </details>
            ) : null}

            {calculatedAvg === 0 && (
              <>
                <Input
                  id="current-average"
                  type="number"
                  step="0.01"
                  value={manualAverage}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setManualAverage(e.target.value)}
                  placeholder="Or enter overall average"
                  className="h-8 text-xs"
                  disabled={passedUnits === 0}
                />
                {passedUnits === 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    Mark some courses as &quot;Passed&quot; on the graph first.
                  </span>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="target-gwa" className="text-xs font-medium text-muted-foreground">
              Target Graduation GWA/GPA
            </label>
            <Input
              id="target-gwa"
              type="number"
              step="0.01"
              value={targetGWA}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetGWA(e.target.value)}
              placeholder="e.g. 1.75 or 3.7"
              className="h-9 text-sm"
            />
          </div>
        </div>

        {/* Calculation Result */}
        {passedUnits > 0 && remainingUnits > 0 ? (
          <div className="flex flex-col gap-2 border-t border-border pt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-medium text-muted-foreground">Required Remaining Avg:</span>
              <span className="font-heading text-2xl font-semibold tabular-nums text-primary">
                {requiredGWA !== null ? requiredGWA.toFixed(2) : "N/A"}
              </span>
            </div>
            {currentHonors && (
              <div className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 p-2 text-xs text-primary">
                <Award className="size-3.5" />
                <span>On track for <strong>{currentHonors}</strong></span>
              </div>
            )}
            <div
              className={`flex items-start gap-1.5 rounded-lg border p-2.5 text-xs ${STATUS_MESSAGE_STYLES[statusType]}`}
            >
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          </div>
        ) : remainingUnits === 0 && passedUnits > 0 ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center gap-1.5 rounded-lg border border-status-passed/30 bg-tint-passed p-3 text-center text-xs font-semibold text-status-passed">
              <PartyPopper className="size-4 shrink-0" />
              Graduation complete! Final GWA: {avg.toFixed(2)}.
            </div>
            {currentHonors && (
              <div className="flex items-center justify-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 p-2 text-xs text-primary font-semibold">
                <Award className="size-4" />
                {currentHonors}
              </div>
            )}
          </div>
        ) : (
          <div className="border-t border-border pt-3 text-center text-xs text-muted-foreground">
            Mark some courses as &quot;Passed&quot; on the graph to start simulating.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
