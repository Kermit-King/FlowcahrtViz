import { useCallback, useEffect, useSyncExternalStore } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  BackgroundVariant,
  Node,
  ReactFlowProvider,
  useReactFlow,
  useStore,
} from "reactflow";
import "reactflow/dist/style.css";
import { useCourseStore } from "@/store/courseStore";
import { Course } from "@/lib/graphUtils";
import CourseNode from "./CourseNode";
import { Button } from "./ui/button";
import { ArrowDown, ArrowRight, LayoutGrid, RotateCcw } from "lucide-react";

const nodeTypes = {
  courseNode: CourseNode,
};

const FIT_VIEW_OPTIONS = { padding: 0.15, maxZoom: 1 } as const;

const STATUS_LEGEND = [
  { label: "Passed", dot: "bg-status-passed" },
  { label: "Failed", dot: "bg-status-failed" },
  { label: "Blocked", dot: "bg-status-blocked" },
  { label: "Pending", dot: "bg-status-pending" },
] as const;

type CourseStatus = Course["status"];

interface ChartColors {
  dots: string;
  minimapBg: string;
  minimapMask: string;
  stroke: Record<CourseStatus, string>;
  fill: Record<CourseStatus, string>;
}

const LIGHT_CHART_COLORS: ChartColors = {
  dots: "oklch(0.85 0.012 125)",
  minimapBg: "oklch(0.988 0.005 120)",
  minimapMask: "oklch(0.967 0.009 120 / 70%)",
  stroke: {
    passed: "oklch(0.5 0.11 152)",
    failed: "oklch(0.5 0.18 27)",
    blocked: "oklch(0.505 0.105 80)",
    pending: "oklch(0.885 0.014 125)",
  },
  fill: {
    passed: "oklch(0.93 0.035 150)",
    failed: "oklch(0.93 0.03 25)",
    blocked: "oklch(0.94 0.04 90)",
    pending: "oklch(0.988 0.005 120)",
  },
};

function statusOfNode(node: Node): CourseStatus {
  const course = (node.data as { course?: Course } | undefined)?.course;
  if (
    course?.status === "passed" ||
    course?.status === "failed" ||
    course?.status === "blocked"
  ) {
    return course.status;
  }
  return "pending";
}

function readChartColors(): ChartColors {
  const styles = getComputedStyle(document.documentElement);
  const read = (name: string) => styles.getPropertyValue(name).trim();
  return {
    dots: read("--canvas-dots"),
    minimapBg: read("--minimap-bg"),
    minimapMask: read("--minimap-mask"),
    stroke: {
      passed: read("--status-passed"),
      failed: read("--status-failed"),
      blocked: read("--status-blocked"),
      pending: read("--border"),
    },
    fill: {
      passed: read("--tint-passed"),
      failed: read("--tint-failed"),
      blocked: read("--tint-blocked"),
      pending: read("--card"),
    },
  };
}

let chartColorsKey = "";
let chartColorsCache: ChartColors = LIGHT_CHART_COLORS;

/**
 * MiniMap/Background paint colors through SVG attributes, which cannot
 * consume var(); treat the document's theme class as an external store
 * and re-read the token values whenever next-themes toggles it.
 */
function subscribeToThemeClass(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getChartColorsSnapshot(): ChartColors {
  const key = document.documentElement.className;
  if (key !== chartColorsKey) {
    chartColorsKey = key;
    chartColorsCache = readChartColors();
  }
  return chartColorsCache;
}

function getChartColorsServerSnapshot(): ChartColors {
  return LIGHT_CHART_COLORS;
}

function useChartColors(): ChartColors {
  return useSyncExternalStore(
    subscribeToThemeClass,
    getChartColorsSnapshot,
    getChartColorsServerSnapshot
  );
}

function ZoomReadout() {
  const zoom = useStore((state) => state.transform[2]);
  return (
    <span className="inline-flex min-w-[3.25rem] justify-center rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-wider text-muted-foreground tabular-nums">
      {Math.round(zoom * 100)}%
    </span>
  );
}

function CurriculumCanvas() {
  const nodes = useCourseStore((state) => state.nodes);
  const edges = useCourseStore((state) => state.edges);
  const onNodesChange = useCourseStore((state) => state.onNodesChange);
  const onEdgesChange = useCourseStore((state) => state.onEdgesChange);
  const onConnect = useCourseStore((state) => state.onConnect);
  const courses = useCourseStore((state) => state.courses);
  const setCourses = useCourseStore((state) => state.setCourses);
  const layoutDirection = useCourseStore((state) => state.layoutDirection);
  const setLayoutDirection = useCourseStore(
    (state) => state.setLayoutDirection
  );
  const chartColors = useChartColors();
  const { fitView } = useReactFlow();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key.toLowerCase() !== "f") return;

      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }

      event.preventDefault();
      fitView(FIT_VIEW_OPTIONS);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fitView]);

  useEffect(() => {
    fitView(FIT_VIEW_OPTIONS);
  }, [layoutDirection, fitView]);

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

  const directionButtonClass = (active: boolean) =>
    `flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring ${
      active
        ? "bg-card text-foreground shadow-xs"
        : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-border bg-muted/40 shadow-xs">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={FIT_VIEW_OPTIONS}
        className="bg-transparent"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={12}
          size={1}
          color={chartColors.dots}
        />
        <Controls showFitView fitViewOptions={FIT_VIEW_OPTIONS} />
        <MiniMap
          ariaLabel="Curriculum minimap"
          style={{ backgroundColor: chartColors.minimapBg }}
          maskColor={chartColors.minimapMask}
          nodeStrokeColor={(n) => chartColors.stroke[statusOfNode(n)]}
          nodeColor={(n) => chartColors.fill[statusOfNode(n)]}
          className="hidden overflow-hidden !rounded-lg sm:block"
        />

        {/* Layout toolbar */}
        <Panel position="top-right">
          <div
            role="group"
            aria-label="Canvas tools"
            className="flex items-center gap-2 rounded-xl border border-border bg-card p-1.5 shadow-xs"
          >
            <div
              role="group"
              aria-label="Layout direction"
              className="flex gap-1 rounded-lg bg-muted p-1"
            >
              <button
                type="button"
                onClick={() => setLayoutDirection("LR")}
                aria-pressed={layoutDirection === "LR"}
                className={directionButtonClass(layoutDirection === "LR")}
              >
                <ArrowRight className="size-3.5" />
                <span className="hidden sm:inline">Horizontal</span>
                <span className="sr-only sm:hidden">Horizontal layout</span>
              </button>
              <button
                type="button"
                onClick={() => setLayoutDirection("TB")}
                aria-pressed={layoutDirection === "TB"}
                className={directionButtonClass(layoutDirection === "TB")}
              >
                <ArrowDown className="size-3.5" />
                <span className="hidden sm:inline">Vertical</span>
                <span className="sr-only sm:hidden">Vertical layout</span>
              </button>
            </div>

            <div className="h-5 w-px bg-border" aria-hidden="true" />

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleResetLayout}
              aria-label="Reset layout"
              title="Reset layout"
            >
              <LayoutGrid className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleResetStatuses}
              aria-label="Reset statuses"
              title="Reset statuses"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <RotateCcw className="size-3.5" />
            </Button>
          </div>
        </Panel>

        {/* Zoom readout + status legend */}
        <Panel position="bottom-left" className="ml-[3.25rem]!">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-2.5 py-1.5 shadow-xs">
            <ZoomReadout />
            <ul
              className="flex items-center gap-2.5"
              aria-label="Course status legend"
            >
              {STATUS_LEGEND.map((item) => (
                <li key={item.label} className="flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className={`size-2 rounded-full ${item.dot}`}
                  />
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default function CurriculumFlow() {
  return (
    <ReactFlowProvider>
      <CurriculumCanvas />
    </ReactFlowProvider>
  );
}
