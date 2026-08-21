import { create } from "zustand";
import {
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge as reactFlowAddEdge,
} from "reactflow";
import {
  Course,
  computeCourseStatuses,
  getLayoutedElements,
  generateEdgesFromPrereqs,
} from "@/lib/graphUtils";

interface CourseState {
  courses: Course[];
  nodes: Node[];
  edges: Edge[];
  setCourses: (courses: Omit<Course, "status">[]) => void;
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

  setCourses: (rawCourses) => {
    // Add default status
    const initialCourses: Course[] = rawCourses.map((c) => ({
      ...c,
      status: "pending",
    }));

    const computedCourses = computeCourseStatuses(initialCourses);
    const initialEdges = generateEdgesFromPrereqs(computedCourses);
    const { nodes, edges } = getLayoutedElements(computedCourses, initialEdges);

    set({
      courses: computedCourses,
      nodes,
      edges,
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
          return {
            ...edge,
            animated: targetCourse.status === "passed",
            style: {
              stroke:
                targetCourse.status === "passed"
                  ? "#22c55e"
                  : targetCourse.status === "blocked"
                  ? "#eab308"
                  : targetCourse.status === "failed"
                  ? "#ef4444"
                  : "#cbd5e1",
              strokeWidth: 2,
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
      let updatedEdges = applyEdgeChanges(changes, state.edges);
      let updatedCourses = [...state.courses];
      let coursesChanged = false;

      // Detect edge removals
      changes.forEach((change) => {
        if (change.type === "remove") {
          const removedEdge = state.edges.find((e) => e.id === change.id);
          if (removedEdge) {
            const { source, target } = removedEdge;
            const courseIdx = updatedCourses.findIndex((c) => c.code === target);
            if (courseIdx !== -1) {
              updatedCourses[courseIdx] = {
                ...updatedCourses[courseIdx],
                prerequisites: updatedCourses[courseIdx].prerequisites.filter(
                  (p) => p !== source
                ),
              };
              coursesChanged = true;
            }
          }
        }
      });

      if (coursesChanged) {
        const computedCourses = computeCourseStatuses(updatedCourses);
        // Regenerate edges to align with updated prerequisites
        const freshEdges = generateEdgesFromPrereqs(computedCourses);
        const { nodes, edges } = getLayoutedElements(computedCourses, freshEdges);
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
      const { nodes, edges } = getLayoutedElements(computedCourses, freshEdges);

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

      const { source, target } = edge;

      // 1. Update target course's prerequisites
      const updatedCourses = state.courses.map((c) => {
        if (c.code === target) {
          return {
            ...c,
            prerequisites: c.prerequisites.filter((p) => p !== source),
          };
        }
        return c;
      });

      // 2. Recompute
      const computedCourses = computeCourseStatuses(updatedCourses);
      const freshEdges = generateEdgesFromPrereqs(computedCourses);
      const { nodes, edges } = getLayoutedElements(computedCourses, freshEdges);

      return {
        courses: computedCourses,
        nodes,
        edges,
      };
    });
  },
}));
