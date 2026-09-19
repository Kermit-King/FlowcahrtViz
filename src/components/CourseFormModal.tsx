"use client";

import { useEffect, useState, useMemo } from "react";
import { useCourseStore } from "@/store/courseStore";
import { Course, detectCycle } from "@/lib/graphUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  BookOpen,
  Check,
  GraduationCap,
  Layers,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

export default function CourseFormModal() {
  const isOpen = useCourseStore((state) => state.courseModalOpen);
  const courseToEdit = useCourseStore((state) => state.courseToEdit);
  const closeCourseModal = useCourseStore((state) => state.closeCourseModal);
  const addCourse = useCourseStore((state) => state.addCourse);
  const editCourse = useCourseStore((state) => state.editCourse);
  const deleteCourse = useCourseStore((state) => state.deleteCourse);
  const allCourses = useCourseStore((state) => state.courses);

  const isEditing = Boolean(courseToEdit);

  // Form State
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [units, setUnits] = useState("3");
  const [year, setYear] = useState("1");
  const [term, setTerm] = useState("1");
  const [selectedPrereqs, setSelectedPrereqs] = useState<string[]>([]);
  const [selectedSoftPrereqs, setSelectedSoftPrereqs] = useState<string[]>([]);
  const [searchPrereq, setSearchPrereq] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Reset/populate form when modal opens or edit course changes
  useEffect(() => {
    if (isOpen) {
      if (courseToEdit) {
        setCode(courseToEdit.code);
        setTitle(courseToEdit.title);
        setUnits(String(courseToEdit.units || 3));
        setYear(String(courseToEdit.year || 1));
        setTerm(String(courseToEdit.term || 1));
        setSelectedPrereqs(courseToEdit.prerequisites || []);
        setSelectedSoftPrereqs(courseToEdit.softPrerequisites || []);
      } else {
        setCode("");
        setTitle("");
        setUnits("3");
        setYear("1");
        setTerm("1");
        setSelectedPrereqs([]);
        setSelectedSoftPrereqs([]);
      }
      setSearchPrereq("");
      setError(null);
    }
  }, [isOpen, courseToEdit]);

  // Candidates for prerequisites (cannot pick self)
  const availablePrereqs = useMemo(() => {
    return allCourses
      .filter((c) => !isEditing || c.code !== courseToEdit?.code)
      .filter(
        (c) =>
          c.code.toLowerCase().includes(searchPrereq.toLowerCase()) ||
          c.title.toLowerCase().includes(searchPrereq.toLowerCase())
      );
  }, [allCourses, courseToEdit, isEditing, searchPrereq]);

  // Cycle check warning for candidate prerequisites
  const isPrereqCyclic = (prereqCode: string) => {
    if (!code.trim()) return false;
    return detectCycle(allCourses, prereqCode, isEditing ? courseToEdit!.code : code.trim());
  };

  const togglePrereq = (prereqCode: string) => {
    setError(null);
    if (selectedPrereqs.includes(prereqCode)) {
      setSelectedPrereqs((prev) => prev.filter((p) => p !== prereqCode));
    } else {
      // Check cycle
      if (isPrereqCyclic(prereqCode)) {
        setError(`Selecting "${prereqCode}" would create a circular prerequisite loop.`);
        return;
      }
      setSelectedPrereqs((prev) => [...prev, prereqCode]);
      // Remove from soft if present
      setSelectedSoftPrereqs((prev) => prev.filter((p) => p !== prereqCode));
    }
  };

  const toggleSoftPrereq = (prereqCode: string) => {
    setError(null);
    if (selectedSoftPrereqs.includes(prereqCode)) {
      setSelectedSoftPrereqs((prev) => prev.filter((p) => p !== prereqCode));
    } else {
      setSelectedSoftPrereqs((prev) => [...prev, prereqCode]);
      // Remove from hard if present
      setSelectedPrereqs((prev) => prev.filter((p) => p !== prereqCode));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCode = code.trim().toUpperCase();
    const trimmedTitle = title.trim() || trimmedCode;
    const numUnits = Math.max(0.5, Number(units) || 3);
    const numYear = Math.max(1, Math.min(6, parseInt(year, 10) || 1));
    const numTerm = Math.max(1, Math.min(3, parseInt(term, 10) || 1));

    if (!trimmedCode) {
      setError("Course code is required.");
      return;
    }

    const payload = {
      code: trimmedCode,
      title: trimmedTitle,
      units: numUnits,
      year: numYear,
      term: numTerm,
      prerequisites: selectedPrereqs,
      softPrerequisites: selectedSoftPrereqs,
    };

    let result;
    if (isEditing && courseToEdit) {
      result = editCourse(courseToEdit.code, payload);
    } else {
      result = addCourse(payload);
    }

    if (!result.success) {
      setError(result.error || "Failed to save course.");
    }
  };

  const handleDelete = () => {
    if (courseToEdit && confirm(`Are you sure you want to delete "${courseToEdit.code}"? This will remove its prerequisite connections.`)) {
      deleteCourse(courseToEdit.code);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeCourseModal()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-5 sm:p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <GraduationCap className="size-4.5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                {isEditing ? `Edit Course: ${courseToEdit?.code}` : "Add New Course"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {isEditing
                  ? "Update course information and prerequisite links."
                  : "Add a course to your curriculum flowchart and connect its prerequisites."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 py-2">
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertTriangle className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Row 1: Code & Units */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label htmlFor="course-code" className="text-xs font-medium text-foreground">
                Course Code <span className="text-destructive">*</span>
              </label>
              <Input
                id="course-code"
                placeholder="e.g. CS 101, MATH 21"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError(null);
                }}
                className="h-9 text-sm font-mono uppercase"
                required
                autoFocus={!isEditing}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="course-units" className="text-xs font-medium text-foreground">
                Units / Credits
              </label>
              <Input
                id="course-units"
                type="number"
                step="0.5"
                min="0.5"
                max="20"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                className="h-9 text-sm font-mono"
                required
              />
            </div>
          </div>

          {/* Row 2: Title */}
          <div className="space-y-1.5">
            <label htmlFor="course-title" className="text-xs font-medium text-foreground">
              Course Title
            </label>
            <Input
              id="course-title"
              placeholder="e.g. Data Structures and Algorithms"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          {/* Row 3: Year & Term */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="course-year" className="text-xs font-medium text-foreground flex items-center gap-1">
                <Layers className="size-3 text-muted-foreground" />
                Year Level
              </label>
              <select
                id="course-year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="1">Year 1 (Freshman)</option>
                <option value="2">Year 2 (Sophomore)</option>
                <option value="3">Year 3 (Junior)</option>
                <option value="4">Year 4 (Senior)</option>
                <option value="5">Year 5</option>
                <option value="6">Year 6</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="course-term" className="text-xs font-medium text-foreground flex items-center gap-1">
                <BookOpen className="size-3 text-muted-foreground" />
                Term / Semester
              </label>
              <select
                id="course-term"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="1">1st Semester / Term</option>
                <option value="2">2nd Semester / Term</option>
                <option value="3">Midyear / Summer</option>
              </select>
            </div>
          </div>

          {/* Row 4: Prerequisites Selection */}
          <div className="space-y-2 pt-1 border-t border-border/70">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">
                Prerequisites ({selectedPrereqs.length + selectedSoftPrereqs.length})
              </label>
              <span className="text-[11px] text-muted-foreground">
                Select courses required before taking this
              </span>
            </div>

            {allCourses.length > (isEditing ? 1 : 0) ? (
              <div className="space-y-2">
                {/* Search prerequisite */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search courses to link as prereq..."
                    value={searchPrereq}
                    onChange={(e) => setSearchPrereq(e.target.value)}
                    className="h-8 pl-8 text-xs"
                  />
                </div>

                {/* Prerequisite List */}
                <div className="max-h-40 overflow-y-auto rounded-lg border border-border/80 bg-muted/20 divide-y divide-border/60">
                  {availablePrereqs.length === 0 ? (
                    <p className="p-3 text-center text-xs text-muted-foreground">
                      No matching courses found.
                    </p>
                  ) : (
                    availablePrereqs.map((prereq) => {
                      const isHard = selectedPrereqs.includes(prereq.code);
                      const isSoft = selectedSoftPrereqs.includes(prereq.code);
                      const isSelected = isHard || isSoft;

                      return (
                        <div
                          key={prereq.code}
                          className={`flex items-center justify-between p-2 text-xs transition-colors ${
                            isSelected ? "bg-primary/5" : "hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <button
                              type="button"
                              onClick={() => togglePrereq(prereq.code)}
                              className={`flex size-4.5 shrink-0 items-center justify-center rounded border transition-colors cursor-pointer ${
                                isHard
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-input bg-background hover:border-primary"
                              }`}
                              title={isHard ? "Remove prerequisite" : "Set as hard prerequisite"}
                            >
                              {isHard && <Check className="size-3 stroke-[3]" />}
                            </button>
                            <div className="min-w-0">
                              <span className="font-mono font-semibold text-foreground">
                                {prereq.code}
                              </span>
                              <span className="ml-1.5 text-muted-foreground truncate hidden sm:inline">
                                {prereq.title}
                              </span>
                              <span className="ml-1.5 text-[10px] text-muted-foreground font-mono">
                                (Y{prereq.year}T{prereq.term})
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => toggleSoftPrereq(prereq.code)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                                isSoft
                                  ? "bg-secondary text-secondary-foreground font-semibold ring-1 ring-secondary"
                                  : "text-muted-foreground hover:bg-muted"
                              }`}
                              title="Toggle as Soft Prerequisite (co-requisite)"
                            >
                              {isSoft ? "Soft Prereq" : "Set Soft"}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-border/80 p-3 text-center text-xs text-muted-foreground">
                No other courses exist yet. Add more courses to establish prerequisite connections!
              </p>
            )}
          </div>

          <DialogFooter className="pt-2 flex items-center justify-between gap-2">
            {isEditing ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                className="gap-1 text-xs"
              >
                <Trash2 className="size-3.5" />
                Delete
              </Button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={closeCourseModal}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="gap-1.5 font-semibold">
                {isEditing ? (
                  <>
                    <Check className="size-3.5" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Plus className="size-3.5" />
                    Add Course
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
