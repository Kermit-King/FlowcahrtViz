import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCourseStore } from "@/store/courseStore";
import { Calculator, Award, CheckCircle, Percent } from "lucide-react";

export default function GWACalculator() {
  const courses = useCourseStore((state) => state.courses);

  const [currentAverage, setCurrentAverage] = useState<string>("2.0");
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

  // Calculate required GWA/GPA
  const avg = parseFloat(currentAverage) || 0;
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

  return (
    <Card className="w-full shadow-lg border-slate-200">
      <CardHeader className="pb-3 border-b border-slate-100">
        <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
          <Calculator className="w-5 h-5 text-blue-500" />
          Progress & GWA Simulator
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-4 flex flex-col gap-4">
        {/* Progress Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-slate-500 block mb-0.5">Completed Units</span>
            <span className="text-lg font-bold text-slate-800 flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              {passedUnits} / {totalUnits}
            </span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-slate-500 block mb-0.5">Completion Rate</span>
            <span className="text-lg font-bold text-slate-800 flex items-center gap-1">
              <Percent className="w-4 h-4 text-blue-500" />
              {completionRate.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Failed Courses indicator if any */}
        {failedUnits > 0 && (
          <div className="text-xs bg-red-50 text-red-700 border border-red-100 p-2.5 rounded-lg">
            ⚠️ You have <strong>{failedUnits} units</strong> of failed courses that you need to retake.
          </div>
        )}

        {/* GWA Scale Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setScale("lower")}
            className={`flex-1 text-center py-1 text-xs font-semibold rounded-md transition-all ${
              scale === "lower" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
            }`}
          >
            1.0 Scale (Lower is Better)
          </button>
          <button
            onClick={() => setScale("higher")}
            className={`flex-1 text-center py-1 text-xs font-semibold rounded-md transition-all ${
              scale === "higher" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
            }`}
          >
            4.0 Scale (Higher is Better)
          </button>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-600">
              Current Average Grade (Completed Units)
            </label>
            <Input
              type="number"
              step="0.01"
              value={currentAverage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentAverage(e.target.value)}
              placeholder="e.g. 2.0 or 3.5"
              className="h-9 text-sm"
              disabled={passedUnits === 0}
            />
            {passedUnits === 0 && (
              <span className="text-[10px] text-slate-400">
                Mark some courses as "Passed" on the graph first.
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-600">
              Target Graduation GWA/GPA
            </label>
            <Input
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
          <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500 font-medium">Required Remaining Avg:</span>
              <span className="text-lg font-extrabold text-blue-600">
                {requiredGWA !== null ? requiredGWA.toFixed(2) : "N/A"}
              </span>
            </div>
            <div
              className={`text-xs p-2.5 rounded-lg border flex items-start gap-1.5 ${
                statusType === "error"
                  ? "bg-red-50 text-red-700 border-red-100"
                  : statusType === "warning"
                  ? "bg-amber-50 text-amber-700 border-amber-100"
                  : "bg-green-50 text-green-700 border-green-100"
              }`}
            >
              <Award className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{statusMessage}</span>
            </div>
          </div>
        ) : remainingUnits === 0 && passedUnits > 0 ? (
          <div className="border-t border-slate-100 pt-3 text-xs text-center text-green-600 font-semibold bg-green-50/50 p-3 rounded-lg border border-green-100">
            🎉 Graduation complete! You achieved an average of {avg.toFixed(2)}.
          </div>
        ) : (
          <div className="border-t border-slate-100 pt-3 text-xs text-center text-slate-400">
            Mark some courses as "Passed" on the graph to start simulating.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
