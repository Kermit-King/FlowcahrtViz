import { create } from "zustand";
import { persist } from "zustand/middleware";
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
  detectCycle,
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
  selectedCourseId: string | null;
  focusCourseId: string | null;
  courseModalOpen: boolean;
  courseToEdit: Course | null;
  tourOpen: boolean;
  hasSeenTour: boolean;
  openTour: () => void;
  closeTour: () => void;
  setCourses: (courses: Omit<Course, "status">[]) => void;
  setLayoutDirection: (direction: LayoutDirection) => void;
  setLayoutMode: (mode: LayoutMode) => void;
  updateCourseStatus: (code: string, status: Course["status"]) => void;
  updateCourseGrade: (code: string, grade?: number) => void;
  setSelectedCourseId: (id: string | null) => void;
  setFocusCourseId: (id: string | null) => void;
  openAddCourseModal: () => void;
  openEditCourseModal: (course: Course) => void;
  closeCourseModal: () => void;
  addCourse: (course: Omit<Course, "status">) => { success: boolean; error?: string };
  editCourse: (originalCode: string, updated: Omit<Course, "status">) => { success: boolean; error?: string };
  deleteCourse: (code: string) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  deleteEdge: (edgeId: string) => void;
}

export const useCourseStore = create<CourseState>()(
  persist(
    (set, get) => ({
      courses: [],
      nodes: [],
      edges: [],
      layoutDirection: "LR",
      layoutMode: "flow",
      selectedCourseId: null,
      focusCourseId: null,
      courseModalOpen: false,
      courseToEdit: null,
      tourOpen: false,
      hasSeenTour: false,

      openTour: () => set({ tourOpen: true }),
      closeTour: () => set({ tourOpen: false, hasSeenTour: true }),
      openAddCourseModal: () => set({ courseModalOpen: true, courseToEdit: null }),
      openEditCourseModal: (course) => set({ courseModalOpen: true, courseToEdit: course }),
      closeCourseModal: () => set({ courseModalOpen: false, courseToEdit: null }),

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

    const shouldOpenTour = !get().hasSeenTour && rawCourses.length > 0;

    set({
      courses: computedCourses,
      nodes,
      edges,
      tourOpen: shouldOpenTour ? true : get().tourOpen,
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

  updateCourseGrade: (code, grade) => {
    set((state) => {
      const updatedCourses = state.courses.map((c) =>
        c.code === code ? { ...c, grade } : c
      );
      const computedCourses = computeCourseStatuses(updatedCourses);
      const updatedNodes = state.nodes.map((node) => {
        const foundCourse = computedCourses.find((c) => c.code === node.id);
        return foundCourse ? { ...node, data: { ...node.data, course: foundCourse } } : node;
      });
      return { courses: computedCourses, nodes: updatedNodes };
    });
  },

  setSelectedCourseId: (id) => set({ selectedCourseId: id }),
  setFocusCourseId: (id) => set({ focusCourseId: id }),

  onNodesChange: (changes) => {
    set((state) => {
      const updatedNodes = applyNodeChanges(changes, state.nodes);
      let selectedId = state.selectedCourseId;
      
      const selectionChange = changes.find((c) => c.type === "select");
      if (selectionChange && selectionChange.type === "select") {
        if (selectionChange.selected) {
          selectedId = selectionChange.id;
        } else if (selectedId === selectionChange.id) {
          selectedId = null;
        }
      }

      return {
        nodes: updatedNodes,
        selectedCourseId: selectedId,
      };
    });
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

      // Cycle detection
      if (detectCycle(state.courses, source, target)) {
        console.warn(`Connection from ${source} to ${target} creates a cycle and is ignored.`);
        return {};
      }

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

  addCourse: (courseData) => {
    const trimmedCode = courseData.code.trim();
    if (!trimmedCode) {
      return { success: false, error: "Course code is required." };
    }

    const state = get();
    const existing = state.courses.find(
      (c) => c.code.toLowerCase() === trimmedCode.toLowerCase()
    );
    if (existing) {
      return { success: false, error: `Course "${trimmedCode}" already exists.` };
    }

    const newCourse: Course = {
      code: trimmedCode,
      title: courseData.title.trim() || trimmedCode,
      units: Number(courseData.units) || 3,
      year: Number(courseData.year) || 1,
      term: Number(courseData.term) || 1,
      prerequisites: courseData.prerequisites ?? [],
      softPrerequisites: courseData.softPrerequisites ?? [],
      status: "pending",
    };

    const nextCourses = [...state.courses, newCourse];
    const computedCourses = computeCourseStatuses(nextCourses);
    const freshEdges = generateEdgesFromPrereqs(computedCourses);
    const { nodes, edges } = applyLayout(
      computedCourses,
      freshEdges,
      state.layoutMode,
      state.layoutDirection
    );

    set({
      courses: computedCourses,
      nodes,
      edges,
      courseModalOpen: false,
      courseToEdit: null,
    });

    return { success: true };
  },

  editCourse: (originalCode, updatedData) => {
    const trimmedNewCode = updatedData.code.trim();
    if (!trimmedNewCode) {
      return { success: false, error: "Course code is required." };
    }

    const state = get();
    // Check duplicate code if renamed
    if (originalCode.toLowerCase() !== trimmedNewCode.toLowerCase()) {
      const duplicate = state.courses.find(
        (c) => c.code.toLowerCase() === trimmedNewCode.toLowerCase()
      );
      if (duplicate) {
        return { success: false, error: `Course code "${trimmedNewCode}" already exists.` };
      }
    }

    // Update target course and rename references in other courses' prerequisites
    const updatedCourses = state.courses.map((course) => {
      if (course.code === originalCode) {
        return {
          ...course,
          code: trimmedNewCode,
          title: updatedData.title.trim() || trimmedNewCode,
          units: Number(updatedData.units) || course.units,
          year: Number(updatedData.year) || course.year,
          term: Number(updatedData.term) || course.term,
          prerequisites: updatedData.prerequisites ?? [],
          softPrerequisites: updatedData.softPrerequisites ?? [],
        };
      }

      // If code was renamed, update any prerequisites pointing to originalCode
      if (originalCode !== trimmedNewCode) {
        const hasHard = course.prerequisites.includes(originalCode);
        const hasSoft = (course.softPrerequisites ?? []).includes(originalCode);
        if (hasHard || hasSoft) {
          return {
            ...course,
            prerequisites: hasHard
              ? course.prerequisites.map((p) => (p === originalCode ? trimmedNewCode : p))
              : course.prerequisites,
            softPrerequisites: hasSoft
              ? (course.softPrerequisites ?? []).map((p) => (p === originalCode ? trimmedNewCode : p))
              : course.softPrerequisites,
          };
        }
      }

      return course;
    });

    const computedCourses = computeCourseStatuses(updatedCourses);
    const freshEdges = generateEdgesFromPrereqs(computedCourses);
    const { nodes, edges } = applyLayout(
      computedCourses,
      freshEdges,
      state.layoutMode,
      state.layoutDirection
    );

    set({
      courses: computedCourses,
      nodes,
      edges,
      selectedCourseId: state.selectedCourseId === originalCode ? trimmedNewCode : state.selectedCourseId,
      courseModalOpen: false,
      courseToEdit: null,
    });

    return { success: true };
  },

  deleteCourse: (codeToDelete) => {
    const state = get();
    // Remove course and scrub prerequisite references
    const updatedCourses = state.courses
      .filter((c) => c.code !== codeToDelete)
      .map((c) => ({
        ...c,
        prerequisites: c.prerequisites.filter((p) => p !== codeToDelete),
        softPrerequisites: (c.softPrerequisites ?? []).filter((p) => p !== codeToDelete),
      }));

    const computedCourses = computeCourseStatuses(updatedCourses);
    const freshEdges = generateEdgesFromPrereqs(computedCourses);
    const { nodes, edges } = applyLayout(
      computedCourses,
      freshEdges,
      state.layoutMode,
      state.layoutDirection
    );

    set({
      courses: computedCourses,
      nodes,
      edges,
      selectedCourseId: state.selectedCourseId === codeToDelete ? null : state.selectedCourseId,
      focusCourseId: state.focusCourseId === codeToDelete ? null : state.focusCourseId,
      courseModalOpen: state.courseToEdit?.code === codeToDelete ? false : state.courseModalOpen,
      courseToEdit: state.courseToEdit?.code === codeToDelete ? null : state.courseToEdit,
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
}),
{
  name: "course-store",
}
)
);
