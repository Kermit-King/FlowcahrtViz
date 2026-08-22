import { create } from "zustand";
import {
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";
import {
  Course,
  computeCourseStatuses,
  getLayoutedElements,
  getTermGridElements,
  generateEdgesFromPrereqs,
} from "@/lib/graphUtils";

type LayoutDirection = "LR" | "TB";
type LayoutMode = "flow" | "grid";

function applyLayout(
  courses: Course[],
  edges: Edge[],
  mode: LayoutMode,
  direction: LayoutDirection
) {
  return mode === "grid"
    ? getTermGridElements(courses, edges)
    : getLayoutedElements(courses, edges, direction);
}

function withoutPrerequisite(
  courses: Course[],
  source: string,
  target: string,
  isSoft: boolean
): Course[] {
  return courses.map((c) => {
    if (c.code !== target) return c;
    return isSoft
      ? {
          ...c,
          softPrerequisites: (c.softPrerequisites ?? []).filter(
            (p) => p !== source
          ),
        }
      : { ...c, prerequisites: c.prerequisites.filter((p) => p !== source) };
  });
}

interface CourseState {
  courses: Course[];
  nodes: Node[];
  edges: Edge[];
  layoutDirection: LayoutDirection;
  layoutMode: LayoutMode;
  setCourses: (courses: Omit<Course, "status">[]) => void;
  setLayoutDirection: (direction: LayoutDirection) => void;
  setLayoutMode: (mode: LayoutMode) => void;
  updateCourseStatus: (code: string, status: Course["status"]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  deleteEdge: (edgeId: string) => void;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  nodes: [],
  edges: [],
  layoutDirection: "LR",
  layoutMode: "flow",

  setCourses: (rawCourses) => {
    const initialCourses: Course[] = rawCourses.map((c) => ({
      ...c,
      softPrerequisites: c.softPrerequisites ?? [],
      status: "pending",
    }));

    const computedCourses = computeCourseStatuses(initialCourses);
    const initialEdges = generateEdgesFromPrereqs(computedCourses);
    const { nodes, edges } = applyLayout(
      computedCourses,
      initialEdges,
      get().layoutMode,
      get().layoutDirection
    );

    set({
      courses: computedCourses,
      nodes,
      edges,
    });
  },

  setLayoutDirection: (direction) => {
    set((state) => {
      if (state.layoutDirection === direction && state.layoutMode === "flow")
        return {};

      const computedCourses = computeCourseStatuses(state.courses);
      const freshEdges = generateEdgesFromPrereqs(computedCourses);
      const { nodes, edges } = applyLayout(
        computedCourses,
        freshEdges,
        "flow",
        direction
      );

      return {
        layoutDirection: direction,
        layoutMode: "flow",
        courses: computedCourses,
        nodes,
        edges,
      };
    });
  },

  setLayoutMode: (mode) => {
    set((state) => {
      if (state.layoutMode === mode) return {};

      const computedCourses = computeCourseStatuses(state.courses);
      const freshEdges = generateEdgesFromPrereqs(computedCourses);
      const { nodes, edges } = applyLayout(
        computedCourses,
        freshEdges,
        mode,
        state.layoutDirection
      );

      return {
        layoutMode: mode,
        courses: computedCourses,
        nodes,
        edges,
      };
    });
  },

  updateCourseStatus: (code, status) => {
    set((state) => {
      // 1. Update the target course status
      const updatedCourses = state.courses.map((c) =>
        c.code === code ? { ...c, status } : c
      );

      // 2. Re-compute dependent statuses (blocks propagate)
      const computedCourses = computeCourseStatuses(updatedCourses);

      // 3. Update node data without resetting positions
      const updatedNodes = state.nodes.map((node) => {
        const foundCourse = computedCourses.find((c) => c.code === node.id);
        if (foundCourse) {
          return {
            ...node,
            data: {
              ...node.data,
              course: foundCourse,
            },
          };
        }
        return node;
      });

      // 4. Update edges styles based on new statuses
      const updatedEdges = state.edges.map((edge) => {
        const targetCourse = computedCourses.find((c) => c.code === edge.target);
        if (targetCourse) {
          const soft = edge.id.startsWith("e-soft-");
          return {
            ...edge,
            animated: !soft && targetCourse.status === "passed",
            style: {
              stroke:
                targetCourse.status === "passed"
                  ? "var(--edge-passed)"
                  : targetCourse.status === "blocked"
                  ? "var(--edge-blocked)"
                  : targetCourse.status === "failed"
                  ? "var(--edge-failed)"
                  : "var(--edge-pending)",
              strokeWidth: 2,
              ...(soft ? { strokeDasharray: "6 3" } : {}),
            },
          };
        }
        return edge;
      });

      return {
        courses: computedCourses,
        nodes: updatedNodes,
        edges: updatedEdges,
      };
    });
  },

  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    }));
  },

  onEdgesChange: (changes) => {
    set((state) => {
      const updatedEdges = applyEdgeChanges(changes, state.edges);
      const updatedCourses = [...state.courses];
      let coursesChanged = false;

      // Detect edge removals
      changes.forEach((change) => {
        if (change.type === "remove") {
          const removedEdge = state.edges.find((e) => e.id === change.id);
          if (removedEdge) {
            const updated = withoutPrerequisite(
              updatedCourses,
              removedEdge.source,
              removedEdge.target,
              removedEdge.id.startsWith("e-soft-")
            );
            updatedCourses.splice(0, updatedCourses.length, ...updated);
            coursesChanged = true;
          }
        }
      });

      if (coursesChanged) {
        const computedCourses = computeCourseStatuses(updatedCourses);
        // Regenerate edges to align with updated prerequisites
        const freshEdges = generateEdgesFromPrereqs(computedCourses);
        const { nodes, edges } = applyLayout(
          computedCourses,
          freshEdges,
          state.layoutMode,
          state.layoutDirection
        );
        return {
          courses: computedCourses,
          nodes,
          edges,
        };
      }

      return { edges: updatedEdges };
    });
  },

  onConnect: (connection) => {
    set((state) => {
      const { source, target } = connection;
      if (!source || !target) return {};

      // Avoid self-connections
      if (source === target) return {};

      // Check if connection already exists
      const exists = state.edges.some(
        (e) => e.source === source && e.target === target
      );
      if (exists) return {};

      // 1. Update target course's prerequisites list
      const updatedCourses = state.courses.map((c) => {
        if (c.code === target) {
          return {
            ...c,
            prerequisites: [...c.prerequisites, source],
          };
        }
        return c;
      });

      // 2. Re-compute statuses and layout
      const computedCourses = computeCourseStatuses(updatedCourses);
      const freshEdges = generateEdgesFromPrereqs(computedCourses);
      const { nodes, edges } = applyLayout(
        computedCourses,
        freshEdges,
        state.layoutMode,
        state.layoutDirection
      );

      return {
        courses: computedCourses,
        nodes,
        edges,
      };
    });
  },

  deleteEdge: (edgeId) => {
    set((state) => {
      const edge = state.edges.find((e) => e.id === edgeId);
      if (!edge) return {};

      const updatedCourses = withoutPrerequisite(
        state.courses,
        edge.source,
        edge.target,
        edge.id.startsWith("e-soft-")
      );

      // 2. Recompute
      const computedCourses = computeCourseStatuses(updatedCourses);
      const freshEdges = generateEdgesFromPrereqs(computedCourses);
      const { nodes, edges } = applyLayout(
        computedCourses,
        freshEdges,
        state.layoutMode,
        state.layoutDirection
      );

      return {
        courses: computedCourses,
        nodes,
        edges,
      };
    });
  },
}));
