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
        return "border-green-500 bg-green-50/90 text-green-900 shadow-green-100/50";
      case "failed":
        return "border-red-500 bg-red-50/90 text-red-900 shadow-red-100/50";
      case "blocked":
        return "border-yellow-500 border-dashed bg-yellow-50/80 text-yellow-900 shadow-yellow-100/50";
      default:
        return "border-slate-200 bg-white text-slate-800 hover:border-slate-300 shadow-sm";
    }
  };

  const getBadgeStyles = () => {
    switch (course.status) {
      case "passed":
        return "bg-green-500/10 text-green-700 border-green-200";
      case "failed":
        return "bg-red-500/10 text-red-700 border-red-200";
      case "blocked":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <Card
      className={`w-[220px] border-2 rounded-xl transition-all duration-200 ${getStatusStyles()} relative group select-none`}
    >
      {/* Handles for React Flow connections */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-slate-400 border-2 border-white hover:!bg-blue-500 transition-colors"
      />
      
      <CardContent className="p-3.5 flex flex-col justify-between h-[96px]">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-xs font-bold font-mono tracking-wider">
              {course.code}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium uppercase ${getBadgeStyles()}`}>
              {course.status}
            </span>
          </div>
          <h4 className="text-xs font-semibold leading-tight line-clamp-2" title={course.title}>
            {course.title}
          </h4>
        </div>

        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100">
          <span className="text-[10px] text-slate-500 font-medium">
            {course.units} {course.units === 1 ? "Unit" : "Units"} • Y{course.year}T{course.term}
          </span>

          {/* Action buttons (Appear on hover or active status) */}
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            {course.status === "passed" || course.status === "failed" || course.status === "blocked" ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateCourseStatus(course.code, "pending");
                }}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Reset Status"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateCourseStatus(course.code, "passed");
                  }}
                  className="p-1 rounded-md text-green-600 hover:bg-green-100 transition-colors"
                  title="Mark Passed"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateCourseStatus(course.code, "failed");
                  }}
                  className="p-1 rounded-md text-red-600 hover:bg-red-100 transition-colors"
                  title="Mark Failed"
                >
                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </>
            )}
          </div>
        </div>
      </CardContent>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-slate-400 border-2 border-white hover:!bg-blue-500 transition-colors"
      />
    </Card>
  );
});
