import dagre from "@dagrejs/dagre";
import { Node, Edge } from "reactflow";

export interface Course {
  code: string;
  title: string;
  units: number;
  year: number;
  term: number;
  prerequisites: string[];
  status: "pending" | "passed" | "failed" | "blocked";
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

  return Array.from(courseMap.values());
}

// Generate dagre layout for React Flow nodes and edges
export function getLayoutedElements(
  courses: Course[],
  edges: Edge[],
  direction = "LR"
) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 220;
  const nodeHeight = 100;

  // Configure dagre graph layout options
  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: 80,
    nodesep: 40,
  });

  // Convert courses to React Flow Nodes
  const nodes: Node[] = courses.map((course) => {
    return {
      id: course.code,
      type: "courseNode",
      data: { course },
      position: { x: 0, y: 0 }, // Dagre will calculate this
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

// Generate initial React Flow edges from course prerequisites
export function generateEdgesFromPrereqs(courses: Course[]): Edge[] {
  const edges: Edge[] = [];
  courses.forEach((course) => {
    course.prerequisites.forEach((prereq) => {
      // Find if prerequisite actually exists in curriculum
      const prereqExists = courses.some((c) => c.code === prereq);
      if (prereqExists) {
        edges.push({
          id: `e-${prereq}-${course.code}`,
          source: prereq,
          target: course.code,
          type: "smoothstep",
          animated: course.status === "passed",
          style: {
            stroke:
              course.status === "passed"
                ? "var(--edge-passed)"
                : course.status === "blocked"
                ? "var(--edge-blocked)"
                : course.status === "failed"
                ? "var(--edge-failed)"
                : "var(--edge-pending)",
            strokeWidth: 2,
          },
        });
      }
    });
  });
  return edges;
}
