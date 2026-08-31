import { memo } from "react";
import { Handle, Position } from "reactflow";
import { Ban, Check, Circle, RefreshCw, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useCourseStore } from "@/store/courseStore";
import { Course } from "@/lib/graphUtils";

type CourseStatus = Course["status"];

const CARD_STYLES: Record<CourseStatus, string> = {
  passed: "border-status-passed/60 bg-tint-passed/50",
  failed: "border-status-failed/60 bg-tint-failed/50",
  blocked: "border-dashed border-status-blocked/60 bg-tint-blocked/50",
  pending: "border-border bg-card hover:border-primary/50",
};

const EDGE_STYLES: Record<CourseStatus, string> = {
  passed: "bg-status-passed",
  failed: "bg-status-failed",
  blocked: "bg-status-blocked",
  pending: "",
};

const CHIP_STYLES: Record<CourseStatus, string> = {
  passed: "bg-tint-passed text-status-passed ring-status-passed/30 hover:ring-status-passed/60",
  failed: "bg-tint-failed text-status-failed ring-status-failed/30 hover:ring-status-failed/60",
  blocked: "bg-tint-blocked text-status-blocked ring-status-blocked/30 hover:ring-status-blocked/60",
  pending: "",
};

const STATUS_ICON: Record<CourseStatus, typeof Check> = {
  passed: Check,
  failed: X,
  blocked: Ban,
  pending: Circle,
};

const ACTION_TRANSITION =
  "transition-[background-color,border-color,color,box-shadow,transform] duration-150";

export default memo(function CourseNode({ data, selected }: { data: { course: Course }; selected?: boolean }) {
  const updateCourseStatus = useCourseStore((state) => state.updateCourseStatus);
  const layoutDirection = useCourseStore((state) => state.layoutDirection);
  const isVertical = layoutDirection === "TB";
  const course = data.course;
  const status = course.status;
  const isSet = status !== "pending";
  const StatusIcon = STATUS_ICON[status];

  const handleReset = (e: { stopPropagation(): void }) => {
    e.stopPropagation();
    updateCourseStatus(course.code, "pending");
  };

  const handleSetStatus =
    (next: Exclude<CourseStatus, "pending">) =>
    (e: { stopPropagation(): void }) => {
      e.stopPropagation();
      updateCourseStatus(course.code, next);
    };

  return (
    <Card
      className={`course-node-card relative h-[100px] w-[220px] select-none rounded-xl border py-0 shadow-xs ring-0 transition-[background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:shadow-sm ${CARD_STYLES[status]} ${selected ? 'ring-2 ring-primary border-primary shadow-md' : ''}`}
    >
      {/* Handles for React Flow connections */}
      <Handle
        type="target"
        position={isVertical ? Position.Top : Position.Left}
        className="!size-2.5 !rounded-full !border-2 !border-card !bg-muted-foreground/50 transition-colors hover:!bg-primary"
      />

      {/* Status accent edge (clipped to the rounded corner by overflow-hidden) */}
      {isSet && (
        <div
          aria-hidden="true"
          className={
            isVertical
              ? `absolute inset-x-0 top-0 h-[3px] ${EDGE_STYLES[status]}`
              : `absolute inset-y-0 left-0 w-[3px] ${EDGE_STYLES[status]}`
          }
        />
      )}

      <CardContent className="flex h-full flex-col justify-between p-2.5">
        <div className="flex h-5 items-center justify-between gap-1.5">
          <span className="rounded-md border border-border/70 bg-muted px-1.5 py-px font-mono text-xs font-semibold tracking-wider text-foreground">
            {course.code}
          </span>

          {/* Grade stamp: current status icon; click resets to pending */}
          {isSet ? (
            <button
              type="button"
              onClick={handleReset}
              title="Reset to pending"
              aria-label={`Reset ${course.code} status to pending`}
              className={`grid size-5 place-items-center rounded-full ring-1 ${ACTION_TRANSITION} active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${CHIP_STYLES[status]}`}
            >
              <StatusIcon className="size-3 stroke-[2.5]" aria-hidden="true" />
            </button>
          ) : (
            <span className="grid size-5 place-items-center text-muted-foreground/50">
              <Circle className="size-3" aria-hidden="true" />
              <span className="sr-only">Pending</span>
            </span>
          )}
        </div>

        <h4
          className="line-clamp-2 text-xs font-medium leading-snug text-foreground"
          title={`${course.title}${
            course.prerequisites.length > 0
              ? ` — hard prereqs: ${course.prerequisites.join(", ")}`
              : ""
          }${
            (course.softPrerequisites ?? []).length > 0
              ? ` — soft prereqs: ${(course.softPrerequisites ?? []).join(", ")}`
              : ""
          }`}
        >
          {course.title}
        </h4>

        <div className="flex h-6 items-center justify-between">
          <span className="text-[10px] font-medium text-muted-foreground">
            {course.units} {course.units === 1 ? "Unit" : "Units"} •{" "}
            <span className="font-mono tracking-wider">
              Y{course.year}T{course.term}
            </span>
          </span>

          {/* Action controls: quiet at rest, full presence on hover/focus */}
          <div className="flex items-center gap-1 opacity-60 transition-opacity duration-200 focus-within:opacity-100 group-hover/card:opacity-100">
            {isSet && (
              <button
                type="button"
                onClick={handleReset}
                className={`grid size-6 place-items-center rounded-full bg-muted/70 text-muted-foreground ${ACTION_TRANSITION} hover:bg-muted hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
                title="Reset Status"
                aria-label={`Reset ${course.code} status to pending`}
              >
                <RefreshCw className="size-3" aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              onClick={handleSetStatus("passed")}
              className={`grid size-6 place-items-center rounded-full bg-tint-passed text-status-passed ring-1 ring-status-passed/30 ${ACTION_TRANSITION} hover:bg-status-passed hover:text-background hover:ring-status-passed active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
              title="Mark Passed"
              aria-label={`Mark ${course.code} as passed`}
            >
              <Check className="size-3.5 stroke-[2.5]" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleSetStatus("failed")}
              className={`grid size-6 place-items-center rounded-full bg-tint-failed text-status-failed ring-1 ring-status-failed/30 ${ACTION_TRANSITION} hover:bg-status-failed hover:text-background hover:ring-status-failed active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
              title="Mark Failed"
              aria-label={`Mark ${course.code} as failed`}
            >
              <X className="size-3.5 stroke-[2.5]" aria-hidden="true" />
            </button>
          </div>
        </div>
      </CardContent>

      <Handle
        type="source"
        position={isVertical ? Position.Bottom : Position.Right}
        className="!size-2.5 !rounded-full !border-2 !border-card !bg-muted-foreground/50 transition-colors hover:!bg-primary"
      />
    </Card>
  );
});
