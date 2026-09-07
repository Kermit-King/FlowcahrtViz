import dagre from "@dagrejs/dagre";
import { Node, Edge } from "reactflow";

export interface Course {
  code: string;
  title: string;
  units: number;
  year: number;
  term: number;
  prerequisites: string[];
  softPrerequisites?: string[];
  status: "pending" | "passed" | "failed" | "blocked" | "eligible";
  grade?: number;
}

// Compute the status of each course based on passed/failed inputs
export function computeCourseStatuses(courses: Course[]): Course[] {
  // Create a map for quick access
  const courseMap = new Map<string, Course>(
    courses.map((c) => [c.code, { ...c, status: c.status === "passed" || c.status === "failed" ? c.status : "pending" }])
  );

  // Build adjacency list for forward traversal (prereq -> downstream)
  const adjacencyList = new Map<string, string[]>();
  courses.forEach((c) => {
    c.prerequisites.forEach((prereq) => {
      const list = adjacencyList.get(prereq) || [];
      list.push(c.code);
      adjacencyList.set(prereq, list);
    });
  });

  // Find all blocked nodes by performing a BFS/DFS from failed or blocked nodes
  const queue: string[] = [];
  
  // Initialize queue with all failed nodes
  courseMap.forEach((course, code) => {
    if (course.status === "failed") {
      queue.push(code);
    }
  });

  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    // If it's not the initial failed node, mark it as blocked
    const currentCourse = courseMap.get(current);
    if (currentCourse && currentCourse.status !== "failed") {
      currentCourse.status = "blocked";
    }

    // Add all downstream courses to the queue
    const downstream = adjacencyList.get(current) || [];
    downstream.forEach((nextCode) => {
      if (!visited.has(nextCode)) {
        queue.push(nextCode);
      }
    });
  }

  // Second pass: identify 'eligible' courses.
  // A course is eligible if it is 'pending' and ALL of its hard prerequisites are 'passed'.
  courseMap.forEach((course) => {
    if (course.status === "pending") {
      const allPassed = course.prerequisites.every((prereqCode) => {
        const prereq = courseMap.get(prereqCode);
        return prereq && prereq.status === "passed";
      });
      if (allPassed) {
        course.status = "eligible";
      }
    }
  });

  return Array.from(courseMap.values());
}

// Generate dagre layout for React Flow nodes and edges
export function getLayoutedElements(
  courses: Course[],
  edges: Edge[],
  direction: "LR" | "TB" = "LR"
) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 220;
  const nodeHeight = 100;

  const isVertical = direction === "TB";

  // Configure dagre graph layout options tailored to direction
  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: isVertical ? 80 : 90,
    nodesep: isVertical ? 40 : 35,
    marginx: 20,
    marginy: 20,
  });

  // Sort courses by year and term so Dagre orders nodes logically within ranks
  const sortedCourses = [...courses].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    if (a.term !== b.term) return a.term - b.term;
    return a.code.localeCompare(b.code);
  });

  // Convert courses to React Flow Nodes
  const nodes: Node[] = sortedCourses.map((course) => {
    return {
      id: course.code,
      type: "courseNode",
      data: { course },
      position: { x: 0, y: 0 }, // Dagre will calculate this
      width: nodeWidth,
      height: nodeHeight,
      style: { width: nodeWidth, height: nodeHeight },
    };
  });

  // Add nodes to dagre
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  // Add edges to dagre
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Run the layout algorithm
  dagre.layout(dagreGraph);

  // Map positioned nodes back
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

export function getTermGridElements(courses: Course[], edges: Edge[]) {
  const nodeWidth = 220;
  const nodeHeight = 100;
  const columnGap = 60;
  const rowGap = 24;

  const termOf = (course: Course) => ({
    year: Math.max(1, Math.round(course.year) || 1),
    term: Math.max(1, Math.round(course.term) || 1),
  });

  const terms = [
    ...new Map(
      courses.map((course) => {
        const { year, term } = termOf(course);
        return [`${year}:${term}`, { year, term }];
      })
    ).values(),
  ].sort((a, b) => a.year - b.year || a.term - b.term);

  const columnIndex = new Map(
    terms.map(({ year, term }, index) => [`${year}:${term}`, index])
  );

  const perTerm = new Map<string, Course[]>();
  [...courses]
    .sort((a, b) => a.code.localeCompare(b.code))
    .forEach((course) => {
      const { year, term } = termOf(course);
      const key = `${year}:${term}`;
      const bucket = perTerm.get(key) || [];
      bucket.push(course);
      perTerm.set(key, bucket);
    });

  const nodes: Node[] = [];
  perTerm.forEach((bucket, key) => {
    const column = columnIndex.get(key) ?? terms.length - 1;
    bucket.forEach((course, row) => {
      nodes.push({
        id: course.code,
        type: "courseNode",
        data: { course },
        position: {
          x: column * (nodeWidth + columnGap),
          y: row * (nodeHeight + rowGap),
        },
        width: nodeWidth,
        height: nodeHeight,
        style: { width: nodeWidth, height: nodeHeight },
      });
    });
  });

  return { nodes, edges };
}

// Generate initial React Flow edges from course prerequisites
export function generateEdgesFromPrereqs(courses: Course[]): Edge[] {
  const edges: Edge[] = [];
  const courseCodes = new Set(courses.map((c) => c.code));

  const edgeStyle = (course: Course): Edge["style"] => ({
    stroke:
      course.status === "passed"
        ? "var(--edge-passed)"
        : course.status === "blocked"
        ? "var(--edge-blocked)"
        : course.status === "failed"
        ? "var(--edge-failed)"
        : "var(--edge-pending)",
    strokeWidth: 2,
  });

  courses.forEach((course) => {
    course.prerequisites.forEach((prereq) => {
      // Find if prerequisite actually exists in curriculum
      if (courseCodes.has(prereq)) {
        edges.push({
          id: `e-${prereq}-${course.code}`,
          source: prereq,
          target: course.code,
          type: "smoothstep",
          animated: course.status === "passed",
          style: edgeStyle(course),
        });
      }
    });
    (course.softPrerequisites ?? []).forEach((prereq) => {
      if (courseCodes.has(prereq) && !course.prerequisites.includes(prereq)) {
        edges.push({
          id: `e-soft-${prereq}-${course.code}`,
          source: prereq,
          target: course.code,
          type: "smoothstep",
          animated: false,
          style: { ...edgeStyle(course), strokeDasharray: "6 3" },
        });
      }
    });
  });
  return edges;
}

// Check if adding an edge from source -> target creates a cycle
export function detectCycle(
  courses: Course[],
  source: string,
  target: string
): boolean {
  const adjacencyList = new Map<string, string[]>();
  courses.forEach((c) => {
    adjacencyList.set(c.code, [...c.prerequisites]);
  });
  
  // Temporarily add the new edge (target depends on source)
  const targetPrereqs = adjacencyList.get(target) || [];
  targetPrereqs.push(source);
  adjacencyList.set(target, targetPrereqs);

  const visited = new Set<string>();
  const recStack = new Set<string>();

  function dfs(node: string): boolean {
    if (recStack.has(node)) return true;
    if (visited.has(node)) return false;

    visited.add(node);
    recStack.add(node);

    const prereqs = adjacencyList.get(node) || [];
    for (const prereq of prereqs) {
      if (dfs(prereq)) return true;
    }

    recStack.delete(node);
    return false;
  }

  for (const course of courses) {
    if (dfs(course.code)) return true;
  }

  return false;
}

export interface Gatekeeper {
  code: string;
  unlockedCount: number;
  unlockedUnits: number;
}

export interface BottleneckAnalysis {
  criticalPath: string[];
  gatekeepers: Gatekeeper[];
}

export function analyzeBottlenecks(courses: Course[]): BottleneckAnalysis {
  const adjacencyList = new Map<string, string[]>(); // node -> downstream nodes
  const courseMap = new Map<string, Course>();

  courses.forEach((c) => {
    courseMap.set(c.code, c);
    c.prerequisites.forEach((prereq) => {
      const list = adjacencyList.get(prereq) || [];
      list.push(c.code);
      adjacencyList.set(prereq, list);
    });
  });

  // Calculate critical path (longest path of prerequisites)
  const memoLongestPath = new Map<string, string[]>();

  function getLongestPath(node: string): string[] {
    if (memoLongestPath.has(node)) return memoLongestPath.get(node)!;

    const downstream = adjacencyList.get(node) || [];
    let maxPath: string[] = [];

    for (const next of downstream) {
      const path = getLongestPath(next);
      if (path.length > maxPath.length) {
        maxPath = path;
      }
    }

    const result = [node, ...maxPath];
    memoLongestPath.set(node, result);
    return result;
  }

  let criticalPath: string[] = [];
  courses.forEach((c) => {
    if (c.prerequisites.length === 0) {
      const path = getLongestPath(c.code);
      if (path.length > criticalPath.length) {
        criticalPath = path;
      }
    }
  });

  // Calculate gatekeepers (number of downstream courses unlocked)
  const gatekeepers: Gatekeeper[] = [];

  function getReachableDownstream(startNode: string): Set<string> {
    const reachable = new Set<string>();
    const queue = [startNode];
    while (queue.length > 0) {
      const curr = queue.shift()!;
      const downstream = adjacencyList.get(curr) || [];
      for (const next of downstream) {
        if (!reachable.has(next)) {
          reachable.add(next);
          queue.push(next);
        }
      }
    }
    return reachable;
  }

  courses.forEach((c) => {
    const reachable = getReachableDownstream(c.code);
    let unlockedUnits = 0;
    reachable.forEach((code) => {
      const course = courseMap.get(code);
      if (course) unlockedUnits += course.units;
    });

    if (reachable.size > 0) {
      gatekeepers.push({
        code: c.code,
        unlockedCount: reachable.size,
        unlockedUnits,
      });
    }
  });

  // Sort gatekeepers by impact
  gatekeepers.sort((a, b) => {
    if (b.unlockedCount !== a.unlockedCount) return b.unlockedCount - a.unlockedCount;
    return b.unlockedUnits - a.unlockedUnits;
  });

  return { criticalPath, gatekeepers };
}
