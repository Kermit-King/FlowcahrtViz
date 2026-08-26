"use client";

import { useState } from "react";
import { useCourseStore } from "@/store/courseStore";
import FileUpload from "@/components/FileUpload";
import CurriculumFlow from "@/components/CurriculumFlow";
import DashboardRail from "@/components/DashboardRail";
import Mascot from "@/components/Mascot";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { PanelLeft, Trash2 } from "lucide-react";

export default function Home() {
  const courses = useCourseStore((state) => state.courses);
  const setCourses = useCourseStore((state) => state.setCourses);
  const [railOpen, setRailOpen] = useState(true);

  const handleClearCurriculum = () => {
    setCourses([]);
  };

  return (
    <main className="flex min-h-dvh flex-col bg-background text-foreground">
      {/* Header - solid paper background, whisper border, no glass */}
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="flex h-16 w-full items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <Mascot size={36} className="shrink-0" />
            <div className="min-w-0">
              <p className="font-heading text-lg font-semibold leading-tight tracking-tight">
                FlowchartViz
              </p>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Degree path simulator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {courses.length > 0 && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setRailOpen(!railOpen)}
                aria-label={railOpen ? "Close sidebar" : "Open sidebar"}
                title={railOpen ? "Close sidebar" : "Open sidebar"}
                className="sm:hidden text-muted-foreground hover:text-foreground"
              >
                <PanelLeft className="size-4" />
              </Button>
            )}
            <ThemeToggle />
            {courses.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCurriculum}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 data-icon="inline-start" />
                Clear curriculum
              </Button>
            )}
          </div>
        </div>
      </header>

      {courses.length === 0 ? (
        /* Empty state - Sprout beside the serif hero, above the dropzone */
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
          <div className="flex w-full max-w-2xl flex-col items-center">
            <Mascot size={148} className="animate-rise" />
            <h1 className="animate-rise stagger-1 mt-6 max-w-xl text-balance font-heading text-3xl font-medium leading-[1.15] tracking-tight sm:text-[2.75rem]">
              Chart your degree, course by course.
            </h1>
            <p className="animate-rise stagger-2 mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Drop in your official curriculum PDF and FlowchartViz parses every
              course, credit, and prerequisite into a living map. Then simulate
              the grades that carry you to graduation.
            </p>
            <div className="animate-rise stagger-3 mt-10 w-full max-w-md">
              <FileUpload onUploadComplete={(data) => setCourses(data.courses)} />
            </div>
          </div>
        </div>
      ) : (
        /* Dashboard - docked sidebar with full-bleed canvas */
        <div className="flex h-[calc(100dvh_-_4rem)] w-full overflow-hidden">
          <DashboardRail open={railOpen} onOpenChange={setRailOpen} />
          <div className="relative flex-1 h-full w-full overflow-hidden bg-background">
            {!railOpen && (
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => setRailOpen(true)}
                aria-label="Open simulator sidebar"
                title="Open simulator sidebar"
                className="absolute left-3 top-3 z-20 bg-card shadow-sm hover:bg-muted"
              >
                <PanelLeft className="size-4" />
              </Button>
            )}
            <CurriculumFlow />
          </div>
        </div>
      )}
    </main>
  );
}
