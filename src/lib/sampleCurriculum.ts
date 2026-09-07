import { Course } from "./graphUtils";

export const sampleCurriculum: Course[] = [
  { code: "CS 11", title: "Introduction to Computer Science 1", units: 3, year: 1, term: 1, prerequisites: [], status: "pending" },
  { code: "Math 21", title: "University Precalculus", units: 3, year: 1, term: 1, prerequisites: [], status: "pending" },
  { code: "Eng 1", title: "English Composition", units: 3, year: 1, term: 1, prerequisites: [], status: "pending" },
  
  { code: "CS 12", title: "Introduction to Computer Science 2", units: 3, year: 1, term: 2, prerequisites: ["CS 11"], status: "pending" },
  { code: "Math 22", title: "Calculus I", units: 4, year: 1, term: 2, prerequisites: ["Math 21"], status: "pending" },
  { code: "Phys 71", title: "Elementary Physics I", units: 4, year: 1, term: 2, prerequisites: ["Math 21"], status: "pending" },

  { code: "CS 20", title: "Discrete Mathematics", units: 3, year: 2, term: 1, prerequisites: ["Math 22"], status: "pending" },
  { code: "CS 21", title: "Data Structures and Algorithms", units: 3, year: 2, term: 1, prerequisites: ["CS 12"], status: "pending" },
  { code: "Math 23", title: "Calculus II", units: 4, year: 2, term: 1, prerequisites: ["Math 22"], status: "pending" },
  
  { code: "CS 130", title: "Logic Design and Digital Computer Circuits", units: 3, year: 2, term: 2, prerequisites: ["CS 20"], status: "pending" },
  { code: "CS 140", title: "Operating Systems", units: 3, year: 2, term: 2, prerequisites: ["CS 21"], status: "pending" },
  { code: "CS 133", title: "Object-Oriented Programming", units: 3, year: 2, term: 2, prerequisites: ["CS 21"], status: "pending" },

  { code: "CS 150", title: "Programming Languages", units: 3, year: 3, term: 1, prerequisites: ["CS 140", "CS 133"], status: "pending" },
  { code: "CS 135", title: "Computer Networks", units: 3, year: 3, term: 1, prerequisites: ["CS 140"], status: "pending" },
  { code: "CS 165", title: "Database Systems", units: 3, year: 3, term: 1, prerequisites: ["CS 21"], status: "pending" },

  { code: "CS 153", title: "Software Engineering", units: 3, year: 3, term: 2, prerequisites: ["CS 150", "CS 165"], status: "pending" },
  { code: "CS 170", title: "Artificial Intelligence", units: 3, year: 3, term: 2, prerequisites: ["CS 21", "Math 23"], status: "pending" },
  { code: "CS 195", title: "Practicum", units: 3, year: 3, term: 2, prerequisites: ["CS 153"], status: "pending" },

  { code: "CS 198", title: "Special Problem I", units: 3, year: 4, term: 1, prerequisites: ["CS 153"], status: "pending" },
  { code: "CS Elective 1", title: "CS Elective I", units: 3, year: 4, term: 1, prerequisites: ["CS 140"], status: "pending" },

  { code: "CS 199", title: "Special Problem II", units: 3, year: 4, term: 2, prerequisites: ["CS 198"], status: "pending" },
  { code: "CS Elective 2", title: "CS Elective II", units: 3, year: 4, term: 2, prerequisites: ["CS 140"], status: "pending" },
];
