import { useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import { useCourseStore } from "@/store/courseStore";
import CourseNode from "./CourseNode";
import { Button } from "./ui/button";
import { Info, RotateCcw, LayoutGrid } from "lucide-react";

const nodeTypes = {
  courseNode: CourseNode,
};

export default function CurriculumFlow() {
  const nodes = useCourseStore((state) => state.nodes);
  const edges = useCourseStore((state) => state.edges);
  const onNodesChange = useCourseStore((state) => state.onNodesChange);
  const onEdgesChange = useCourseStore((state) => state.onEdgesChange);
  const onConnect = useCourseStore((state) => state.onConnect);
  const courses = useCourseStore((state) => state.courses);
  const setCourses = useCourseStore((state) => state.setCourses);

  const handleResetStatuses = useCallback(() => {
    // Reset all courses status to pending
    const resetCourses = courses.map((c) => ({
      ...c,
      status: "pending" as const,
    }));
    setCourses(resetCourses);
  }, [courses, setCourses]);

  const handleResetLayout = useCallback(() => {
    // Reset layout by running setCourses on current courses to run dagre algorithm
    setCourses(courses);
  }, [courses, setCourses]);

  return (
    <div className="w-full h-full relative border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 shadow-inner">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-slate-50/30"
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#cbd5e1" />
        <Controls className="!bg-white !border-slate-200 !shadow-md !rounded-lg" />
        <MiniMap
          nodeStrokeColor={(n) => {
            const course = n.data?.course;
            if (course?.status === "passed") return "#22c55e";
            if (course?.status === "failed") return "#ef4444";
            if (course?.status === "blocked") return "#eab308";
            return "#e2e8f0";
          }}
          nodeColor={(n) => {
            const course = n.data?.course;
            if (course?.status === "passed") return "#f0fdf4";
            if (course?.status === "failed") return "#fef2f2";
            if (course?.status === "blocked") return "#fef9c3";
            return "#ffffff";
          }}
          className="!bg-white/90 !border-slate-200 !shadow-md !rounded-lg overflow-hidden hidden sm:block"
        />

        {/* Panel for instructions & settings */}
        <Panel position="top-left" className="bg-white/95 backdrop-blur border border-slate-200 p-4 rounded-xl shadow-md max-w-sm flex flex-col gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-500" />
              Interactive Guide
            </h3>
            <ul className="text-xs text-slate-500 mt-2 space-y-1.5 list-disc pl-4">
              <li>Mark courses as <strong className="text-green-600">Passed</strong> or <strong className="text-red-600">Failed</strong>.</li>
              <li>Downstream dependencies will be <strong className="text-yellow-600 font-semibold">Blocked</strong> if prerequisites fail.</li>
              <li><strong>Add Connection:</strong> Drag from the right handle (source) to the left handle (target).</li>
              <li><strong>Remove Connection:</strong> Click on an edge and press <kbd className="px-1 bg-slate-100 border rounded text-[10px]">Backspace</kbd> or <kbd className="px-1 bg-slate-100 border rounded text-[10px]">Delete</kbd>.</li>
            </ul>
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetLayout}
              className="flex items-center gap-1 text-xs py-1.5 h-8"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Reset Layout
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetStatuses}
              className="flex items-center gap-1 text-xs py-1.5 h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Statuses
            </Button>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
