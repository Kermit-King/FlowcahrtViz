import { memo } from "react";
import { Handle, Position } from "reactflow";
import { Check, X, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useCourseStore } from "@/store/courseStore";
import { Course } from "@/lib/graphUtils";

export default memo(function CourseNode({ data }: { data: { course: Course } }) {
  const updateCourseStatus = useCourseStore((state) => state.updateCourseStatus);
  const course = data.course;

  const getStatusStyles = () => {
    switch (course.status) {
      case "passed":
        return "ring-0 border-status-passed/70 bg-tint-passed/70";
      case "failed":
        return "ring-0 border-status-failed/70 bg-tint-failed/70";
      case "blocked":
        return "ring-0 border-dashed border-status-blocked/70 bg-tint-blocked/60";
      default:
        return "ring-0 border-border bg-card hover:border-primary/50";
    }
  };

  const getBadgeStyles = () => {
    switch (course.status) {
      case "passed":
        return "bg-card/80 text-status-passed border-status-passed/30";
      case "failed":
        return "bg-card/80 text-status-failed border-status-failed/30";
      case "blocked":
        return "bg-card/80 text-status-blocked border-status-blocked/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <Card
      className={`w-[220px] rounded-xl border shadow-xs transition-colors duration-200 select-none group relative ${getStatusStyles()}`}
    >
      {/* Handles for React Flow connections */}
      <Handle
        type="target"
        position={Position.Left}
        className="!size-2.5 !rounded-full !border-2 !border-card !bg-muted-foreground/50 transition-colors hover:!bg-primary"
      />

      <CardContent className="flex h-[96px] flex-col justify-between p-3.5">
        <div>
          <div className="mb-1 flex items-center justify-between gap-1">
            <span className="font-mono text-xs font-semibold tracking-wider text-foreground">
              {course.code}
            </span>
            <span
              className={`rounded-full border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${getBadgeStyles()}`}
            >
              {course.status}
            </span>
          </div>
          <h4 className="text-xs font-medium leading-tight text-foreground line-clamp-2" title={course.title}>
            {course.title}
          </h4>
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-1.5">
          <span className="text-[10px] font-medium text-muted-foreground">
            {course.units} {course.units === 1 ? "Unit" : "Units"} • Y{course.year}T{course.term}
          </span>

          {/* Action buttons (Appear on hover or active status) */}
          <div className="flex items-center gap-1 opacity-80 transition-opacity group-hover:opacity-100">
            {course.status === "passed" || course.status === "failed" || course.status === "blocked" ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  updateCourseStatus(course.code, "pending");
                }}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                title="Reset Status"
                aria-label={`Reset ${course.code} status to pending`}
              >
                <RefreshCw className="size-3.5" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateCourseStatus(course.code, "passed");
                  }}
                  className="rounded-md p-1 text-status-passed transition-colors hover:bg-tint-passed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  title="Mark Passed"
                  aria-label={`Mark ${course.code} as passed`}
                >
                  <Check className="size-3.5 stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateCourseStatus(course.code, "failed");
                  }}
                  className="rounded-md p-1 text-status-failed transition-colors hover:bg-tint-failed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  title="Mark Failed"
                  aria-label={`Mark ${course.code} as failed`}
                >
                  <X className="size-3.5 stroke-[2.5]" />
                </button>
              </>
            )}
          </div>
        </div>
      </CardContent>

      <Handle
        type="source"
        position={Position.Right}
        className="!size-2.5 !rounded-full !border-2 !border-card !bg-muted-foreground/50 transition-colors hover:!bg-primary"
      />
    </Card>
  );
});
