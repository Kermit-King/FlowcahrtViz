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
  status: "pending" | "passed" | "failed" | "blocked";
}

/**
 * Identify General Education (GE), Lasallian formation (LC/LCC/LASARE),
 * NSTP/ROTC, and PE subjects to be excluded from the curriculum flowchart.
 * Lab classes (LBY...) and Electives (ELEC...) are explicitly preserved.
 */
export function isGeneralEducationOrFormation(code: string, title: string = ""): boolean {
  const c = code.trim().toUpperCase();
  const t = title.trim().toUpperCase();

  // 1. ALWAYS KEEP Lab classes (LBY...) and Elective classes (ELEC...)
  if (c.includes("LBY") || t.includes("LBY") || t.includes("LABORATORY")) return false;
  if (c.includes("ELEC") || t.includes("ELEC") || t.includes("ELECTIVE")) return false;

  // 2. Exclude common GE / Formation prefixes
  const excludePrefixes = [
    "LC",
    "LCC",
    "GE",
    "LASARE",
    "LASALL",
    "NSTP",
    "ROTC",
    "SAS",
    "PATHFIT",
    "FITWELL",
  ];
  for (const prefix of excludePrefixes) {
    if (c.startsWith(prefix)) return true;
  }

  // 3. Exclude PE courses: PE1, PE2, PE3, PE4, PED..., PER...
  if (/^PE\s*\d/.test(c) || /^PED\d/.test(c) || /^PER\d/.test(c)) return true;

  // 4. Exclude by known GE / Formation title keywords
  if (
    t.includes("LASALLIAN") ||
    t.includes("FORMATION") ||
    t.includes("NATIONAL SERVICE") ||
    t.includes("CIVIC WELFARE") ||
    t.includes("PHYSICAL FITNESS") ||
    t.includes("PHYSICAL EDUCATION") ||
    t.includes("THEOLOGY") ||
    t.includes("GREAT WORKS") ||
    t.includes("UNDERSTANDING THE SELF") ||
    t.includes("PURPOSIVE COMMUNICATION") ||
    t.includes("READINGS IN PHILIPPINE HISTORY") ||
    t.includes("THE CONTEMPORARY WORLD") ||
    t.includes("ART APPRECIATION") ||
    t.includes("ETHICS") ||
    t.includes("SCIENCE, TECHNOLOGY AND SOCIETY") ||
    t.includes("LIFE AND WORKS OF RIZAL")
  ) {
    return true;
  }

  return false;
}

/**
 * Filters out General Education & Formation subjects and cleans up dead prerequisite links.
 */
export function filterAcademicCourses<
  T extends {
    code: string;
    title?: string;
    prerequisites?: string[];
    softPrerequisites?: string[];
  }
>(courses: T[]): T[] {
  const filtered = courses.filter(
    (c) => !isGeneralEducationOrFormation(c.code, c.title || "")
  );
  const keptCodes = new Set(filtered.map((c) => c.code));

  return filtered.map((c) => ({
    ...c,
    prerequisites: (c.prerequisites || []).filter((p) => keptCodes.has(p)),
    softPrerequisites: (c.softPrerequisites || []).filter((p) => keptCodes.has(p)),
  }));
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

export interface TermStat {
  year: number;
  term: number;
  termIndex: number;
  courses: Course[];
  totalUnits: number;
  passedUnits: number;
  totalCourses: number;
  passedCourses: number;
}

export interface YearStat {
  year: number;
  terms: TermStat[];
  totalUnits: number;
  passedUnits: number;
  totalCourses: number;
  passedCourses: number;
}

export interface CurriculumStats {
  totalYears: number;
  totalTerms: number;
  totalCourses: number;
  totalUnits: number;
  passedUnits: number;
  passedCourses: number;
  years: YearStat[];
}

export function getCurriculumStats(courses: Course[]): CurriculumStats {
  const termOf = (course: Course) => ({
    year: Math.max(1, Math.round(course.year) || 1),
    term: Math.max(1, Math.round(course.term) || 1),
  });

  const termKeys = [
    ...new Map(
      courses.map((course) => {
        const { year, term } = termOf(course);
        return [`${year}:${term}`, { year, term }];
      })
    ).values(),
  ].sort((a, b) => a.year - b.year || a.term - b.term);

  const termStatsMap = new Map<string, TermStat>();
  termKeys.forEach(({ year, term }, idx) => {
    termStatsMap.set(`${year}:${term}`, {
      year,
      term,
      termIndex: idx + 1,
      courses: [],
      totalUnits: 0,
      passedUnits: 0,
      totalCourses: 0,
      passedCourses: 0,
    });
  });

  courses.forEach((course) => {
    const { year, term } = termOf(course);
    const key = `${year}:${term}`;
    const stat = termStatsMap.get(key);
    if (stat) {
      stat.courses.push(course);
      stat.totalUnits += course.units;
      stat.totalCourses += 1;
      if (course.status === "passed") {
        stat.passedUnits += course.units;
        stat.passedCourses += 1;
      }
    }
  });

  const yearsMap = new Map<number, YearStat>();
  termStatsMap.forEach((termStat) => {
    let yearStat = yearsMap.get(termStat.year);
    if (!yearStat) {
      yearStat = {
        year: termStat.year,
        terms: [],
        totalUnits: 0,
        passedUnits: 0,
        totalCourses: 0,
        passedCourses: 0,
      };
      yearsMap.set(termStat.year, yearStat);
    }
    yearStat.terms.push(termStat);
    yearStat.totalUnits += termStat.totalUnits;
    yearStat.passedUnits += termStat.passedUnits;
    yearStat.totalCourses += termStat.totalCourses;
    yearStat.passedCourses += termStat.passedCourses;
  });

  const years = Array.from(yearsMap.values()).sort((a, b) => a.year - b.year);

  let totalUnits = 0;
  let passedUnits = 0;
  let totalCourses = courses.length;
  let passedCourses = 0;

  courses.forEach((c) => {
    totalUnits += c.units;
    if (c.status === "passed") {
      passedUnits += c.units;
      passedCourses += 1;
    }
  });

  return {
    totalYears: years.length,
    totalTerms: termKeys.length,
    totalCourses,
    totalUnits,
    passedUnits,
    passedCourses,
    years,
  };
}

export function getTermGridElements(courses: Course[], edges: Edge[]) {
  const nodeWidth = 220;
  const nodeHeight = 100;
  const columnWidth = 240;
  const courseOffsetX = (columnWidth - nodeWidth) / 2; // 10px centering
  const termGap = 36;
  const yearGap = 72; // Distinct gap to separate different academic years
  const rowGap = 20;

  const yearBannerHeight = 52;
  const yearBannerY = 0;
  const termHeaderHeight = 84;
  const termHeaderY = yearBannerHeight + 16; // 68
  const courseStartY = termHeaderY + termHeaderHeight + 20; // 172

  const stats = getCurriculumStats(courses);
  const totalTerms = stats.totalTerms;

  const nodes: Node[] = [];
  let currentX = 20;

  // Render year-by-year, term-by-term flowchart columns
  stats.years.forEach((yearStat) => {
    const yearStartX = currentX;

    yearStat.terms.forEach((termStat) => {
      const termX = currentX;
      const termCourses = [...termStat.courses].sort((a, b) =>
        a.code.localeCompare(b.code)
      );

      const maxCoursesInTerm = Math.max(termCourses.length, 1);
      const columnContentHeight =
        maxCoursesInTerm * (nodeHeight + rowGap) + 16;
      const backdropHeight =
        termHeaderHeight + 20 + columnContentHeight;

      // 1. Term Swimlane Backdrop Node (rendered behind)
      nodes.push({
        id: `term-backdrop-${termStat.year}-${termStat.term}`,
        type: "termBackdropNode",
        data: {
          width: columnWidth,
          height: backdropHeight,
          year: termStat.year,
          term: termStat.term,
        },
        position: { x: termX, y: termHeaderY },
        width: columnWidth,
        height: backdropHeight,
        zIndex: -1,
        selectable: false,
        draggable: false,
        focusable: false,
      });

      // 2. Term Header Node (top of the column)
      nodes.push({
        id: `term-header-${termStat.year}-${termStat.term}`,
        type: "termHeaderNode",
        data: {
          year: termStat.year,
          term: termStat.term,
          termIndex: termStat.termIndex,
          totalTerms,
          totalCourses: termStat.totalCourses,
          totalUnits: termStat.totalUnits,
          passedUnits: termStat.passedUnits,
          passedCourses: termStat.passedCourses,
          width: columnWidth,
          height: termHeaderHeight,
        },
        position: { x: termX, y: termHeaderY },
        width: columnWidth,
        height: termHeaderHeight,
        zIndex: 1,
        selectable: false,
        draggable: false,
        focusable: false,
      });

      // 3. Course Nodes in this term
      termCourses.forEach((course, row) => {
        nodes.push({
          id: course.code,
          type: "courseNode",
          data: { course },
          position: {
            x: termX + courseOffsetX,
            y: courseStartY + row * (nodeHeight + rowGap),
          },
          width: nodeWidth,
          height: nodeHeight,
          zIndex: 10,
          style: { width: nodeWidth, height: nodeHeight },
        });
      });

      currentX += columnWidth + termGap;
    });

    // 4. Academic Year Group Banner Node (spanning all terms of this year)
    const yearWidth = currentX - termGap - yearStartX;
    nodes.push({
      id: `year-group-${yearStat.year}`,
      type: "yearGroupNode",
      data: {
        year: yearStat.year,
        totalTerms: yearStat.terms.length,
        totalUnits: yearStat.totalUnits,
        totalCourses: yearStat.totalCourses,
        passedUnits: yearStat.passedUnits,
        width: yearWidth,
        height: yearBannerHeight,
      },
      position: { x: yearStartX, y: yearBannerY },
      width: yearWidth,
      height: yearBannerHeight,
      zIndex: 1,
      selectable: false,
      draggable: false,
      focusable: false,
    });

    // Add extra horizontal spacing for academic year separation
    currentX += yearGap - termGap;
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
