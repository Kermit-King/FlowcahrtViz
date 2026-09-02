import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  BackgroundVariant,
  Node,
  ReactFlowProvider,
  SelectionMode,
  useReactFlow,
  useStore,
} from "reactflow";
import "reactflow/dist/style.css";
import { useCourseStore } from "@/store/courseStore";
import { Course, getCurriculumStats } from "@/lib/graphUtils";
import CourseNode from "./CourseNode";
import TermHeaderNode from "./TermHeaderNode";
import YearGroupNode from "./YearGroupNode";
import TermBackdropNode from "./TermBackdropNode";
import { Button } from "./ui/button";
import {
  ArrowDown,
  ArrowRight,
  Columns3,
  LayoutGrid,
  RotateCcw,
  Workflow,
} from "lucide-react";

const nodeTypes = {
  courseNode: CourseNode,
  termHeaderNode: TermHeaderNode,
  yearGroupNode: YearGroupNode,
  termBackdropNode: TermBackdropNode,
};

const FIT_VIEW_OPTIONS = { padding: 0.15, maxZoom: 1 } as const;

const STATUS_LEGEND = [
  { label: "Passed", dot: "bg-status-passed" },
  { label: "Failed", dot: "bg-status-failed" },
  { label: "Blocked", dot: "bg-status-blocked" },
  { label: "Pending", dot: "bg-status-pending" },
] as const;

const PREREQ_LEGEND = [
  { label: "Hard prereq", line: "solid" },
  { label: "Soft prereq", line: "dashed" },
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
  minimapBg: "oklch(0.95 0.01 120)",
  minimapMask: "oklch(0.458 0.085 155 / 15%)",
  stroke: {
    passed: "oklch(0.5 0.11 152)",
    failed: "oklch(0.5 0.18 27)",
    blocked: "oklch(0.505 0.105 80)",
    pending: "oklch(0.75 0.02 125)",
  },
  fill: {
    passed: "oklch(0.85 0.08 150)",
    failed: "oklch(0.85 0.08 25)",
    blocked: "oklch(0.86 0.08 90)",
    pending: "oklch(0.86 0.015 125)",
  },
};

function statusOfNode(node: Node): CourseStatus {
  if (node.type !== "courseNode") return "pending";
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
  if (typeof document === "undefined") return LIGHT_CHART_COLORS;
  const styles = getComputedStyle(document.documentElement);
  const read = (name: string) => styles.getPropertyValue(name).trim();
  return {
    dots: read("--canvas-dots") || LIGHT_CHART_COLORS.dots,
    minimapBg: read("--minimap-bg") || LIGHT_CHART_COLORS.minimapBg,
    minimapMask: read("--minimap-mask") || LIGHT_CHART_COLORS.minimapMask,
    stroke: {
      passed: read("--status-passed") || LIGHT_CHART_COLORS.stroke.passed,
      failed: read("--status-failed") || LIGHT_CHART_COLORS.stroke.failed,
      blocked: read("--status-blocked") || LIGHT_CHART_COLORS.stroke.blocked,
      pending: read("--minimap-node-stroke") || read("--border") || LIGHT_CHART_COLORS.stroke.pending,
    },
    fill: {
      passed: read("--status-passed") || LIGHT_CHART_COLORS.fill.passed,
      failed: read("--status-failed") || LIGHT_CHART_COLORS.fill.failed,
      blocked: read("--status-blocked") || LIGHT_CHART_COLORS.fill.blocked,
      pending: read("--minimap-node") || read("--muted") || LIGHT_CHART_COLORS.fill.pending,
    },
  };
}

let chartColorsKey = "__unset__";
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
  const layoutMode = useCourseStore((state) => state.layoutMode);
  const setLayoutMode = useCourseStore((state) => state.setLayoutMode);
  const chartColors = useChartColors();
  const { fitView } = useReactFlow();

  const stats = getCurriculumStats(courses);

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
  }, [layoutDirection, layoutMode, fitView]);

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = wrapperRef.current;
    if (!element) return;

    let lastWidth = element.clientWidth;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? element.clientWidth;
      if (Math.abs(width - lastWidth) < 60) return;
      lastWidth = width;
      clearTimeout(timer);
      timer = setTimeout(() => fitView(FIT_VIEW_OPTIONS), 150);
    });

    observer.observe(element);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [fitView]);

  const handleResetStatuses = useCallback(() => {
    // Reset all courses status to pending
    const resetCourses = courses.map((c) => ({
      ...c,
      status: "pending" as const,
    }));
    setCourses(resetCourses);
  }, [courses, setCourses]);

  const handleResetLayout = useCallback(() => {
    // Reset layout by running setCourses on current courses to run algorithm
    setCourses(courses);
  }, [courses, setCourses]);

  const directionButtonClass = (active: boolean) =>
    `flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring ${
      active
        ? "bg-card text-foreground shadow-xs"
        : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div
      ref={wrapperRef}
      className="relative h-full w-full overflow-hidden rounded-xl border border-border bg-muted/40 shadow-xs cursor-grab active:cursor-grabbing"
    >
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
        panOnDrag={true}
        selectionOnDrag={false}
        panOnScroll={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        selectionMode={SelectionMode.Partial}
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
          nodeBorderRadius={4}
          nodeStrokeWidth={1.5}
          zoomable
          pannable
          className="hidden overflow-hidden !rounded-lg sm:block"
        />

        {/* Layout toolbar */}
        <Panel position="top-right">
          <div
            role="group"
            aria-label="Canvas tools"
            className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-1.5 shadow-xs"
          >
            {stats.totalTerms > 0 && (
              <div className="hidden md:flex items-center gap-1.5 px-2 py-1 border-r border-border text-xs font-medium text-muted-foreground">
                <span>{stats.totalYears} {stats.totalYears === 1 ? 'Year' : 'Years'}</span>
                <span>•</span>
                <span>{stats.totalTerms} Terms</span>
                <span>•</span>
                <span>{stats.totalUnits} Units</span>
              </div>
            )}

            <div
              role="group"
              aria-label="Arrangement"
              className="flex gap-1 rounded-lg bg-muted p-1"
            >
              <button
                type="button"
                onClick={() => setLayoutMode("flow")}
                aria-pressed={layoutMode === "flow"}
                title="Arrange by prerequisite dependencies (DAG flow)"
                className={directionButtonClass(layoutMode === "flow")}
              >
                <Workflow className="size-3.5" />
                <span className="hidden sm:inline">By Prereq Flow</span>
                <span className="sr-only sm:hidden">Prerequisite flow arrangement</span>
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode("grid")}
                aria-pressed={layoutMode === "grid"}
                title="Arrange by Year and Term flowchart columns"
                className={directionButtonClass(layoutMode === "grid")}
              >
                <Columns3 className="size-3.5" />
                <span className="hidden sm:inline">By Terms</span>
                <span className="sr-only sm:hidden">Year and Term column arrangement</span>
              </button>
            </div>

            <div
              role="group"
              aria-label="Layout direction"
              className={`flex gap-1 rounded-lg bg-muted p-1 ${layoutMode === "grid" ? "hidden" : ""}`}
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
              title="Reset layout to default arrangement"
            >
              <LayoutGrid className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleResetStatuses}
              aria-label="Reset statuses"
              title="Reset all course statuses to pending"
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
              <li className="mx-0.5 h-3 w-px bg-border" aria-hidden="true" />
              {PREREQ_LEGEND.map((item) => (
                <li key={item.label} className="flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className={`h-0 w-3.5 border-t border-muted-foreground ${
                      item.line === "dashed" ? "border-dashed" : ""
                    }`}
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
