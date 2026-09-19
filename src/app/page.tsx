"use client";

import { useState } from "react";
import { useCourseStore } from "@/store/courseStore";
import FileUpload from "@/components/FileUpload";
import FlowchartLoading from "@/components/FlowchartLoading";
import CurriculumFlow from "@/components/CurriculumFlow";
import DashboardRail from "@/components/DashboardRail";
import Mascot from "@/components/Mascot";
import CourseFormModal from "@/components/CourseFormModal";
import OnboardingTour from "@/components/OnboardingTour";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { openPrivacyPolicy } from "@/components/PrivacyPolicyModal";
import {
  PanelLeft,
  Trash2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Network,
  Calculator,
  CalendarCheck,
  CheckCircle2,
  ShieldCheck,
  Plus,
  PenTool,
  HelpCircle,
} from "lucide-react";
import { sampleCurriculum } from "@/lib/sampleCurriculum";

const SHOWCASE_SLIDES = [
  {
    tagline: "Finally, your entire degree in one interactive map.",
    subtext:
      "Visual prerequisite tree tracing, smart term grouping, and live degree progression simulator.",
    badge: "Interactive Prereq DAG",
  },
  {
    tagline: "Simulate grades & know your graduation standing.",
    subtext:
      "Real-time GWA calculation, target GPA goal seeker, and Latin honors threshold tracker.",
    badge: "GWA & Honors Simulator",
  },
  {
    tagline: "Prevent bottlenecks before they delay graduation.",
    subtext:
      "Identify critical chain dependencies and plan optimal semester-by-semester roadmaps.",
    badge: "Bottleneck Analyzer",
  },
];

export default function Home() {
  const courses = useCourseStore((state) => state.courses);
  const setCourses = useCourseStore((state) => state.setCourses);
  const openAddCourseModal = useCourseStore((state) => state.openAddCourseModal);
  const openTour = useCourseStore((state) => state.openTour);
  const [railOpen, setRailOpen] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleClearCurriculum = () => {
    setCourses([]);
  };

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? SHOWCASE_SLIDES.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev === SHOWCASE_SLIDES.length - 1 ? 0 : prev + 1));
  };

  return (
    <main className="flex min-h-dvh flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-xs">
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
                variant="default"
                size="sm"
                onClick={openAddCourseModal}
                className="h-8 px-2.5 text-xs font-semibold gap-1 rounded-lg mr-1"
              >
                <Plus className="size-3.5" />
                <span className="hidden sm:inline">Add Course</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={openTour}
              aria-label="Interactive Tutorial & Guide"
              title="Interactive Tutorial & Guide"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-2.5 h-8"
            >
              <HelpCircle className="size-3.5 text-primary" />
              <span className="hidden sm:inline">Guide</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={openPrivacyPolicy}
              aria-label="Privacy & Terms of Use"
              title="Privacy & Terms of Use"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-2.5 h-8"
            >
              <ShieldCheck className="size-3.5 text-primary" />
              <span className="hidden sm:inline">Privacy &amp; Terms</span>
            </Button>
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

      {isUploading ? (
        <div className="flex flex-1 items-center justify-center p-6 w-full h-full min-h-[calc(100dvh-4rem)]">
          <div className="w-full max-w-3xl flex flex-col items-center justify-center">
            <FlowchartLoading />
          </div>
        </div>
      ) : courses.length === 0 ? (
        /* Side-by-Side Split Card Empty State - Naturally Scrollable & Responsive */
        <div className="w-full flex-1 flex items-center justify-center py-6 sm:py-8 md:py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          {/* Main 2-Column Split Card */}
          <div className="relative z-10 w-full rounded-3xl border border-border/80 bg-card shadow-xl grid grid-cols-1 lg:grid-cols-12 animate-rise overflow-hidden">
            
            {/* Left Column: Heading & Upload */}
            <div className="lg:col-span-7 p-6 sm:p-8 lg:p-9 xl:p-10 flex flex-col justify-between gap-5">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary tracking-wide">
                  <Sparkles className="size-3.5" />
                  <span>Degree Path Simulator</span>
                </div>

                <h1 className="mt-3.5 font-heading text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground leading-[1.14]">
                  Chart your degree, <br className="hidden sm:inline" />
                  course by course.
                </h1>

                <p className="mt-2 text-xs sm:text-sm lg:text-base leading-relaxed text-muted-foreground max-w-xl">
                  Drop in your official curriculum PDF or syllabus image. FlowchartViz parses every
                  course, credit, and prerequisite into a live interactive map.
                </p>
              </div>

              <div className="py-1 flex flex-col gap-3.5">
                <FileUpload 
                  onUploadStart={() => setIsUploading(true)}
                  onUploadComplete={(data) => {
                    setIsUploading(false);
                    setCourses(data.courses);
                  }} 
                  onUploadError={() => setIsUploading(false)}
                />
                
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-border/60" />
                  <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">OR</span>
                  <div className="h-px flex-1 bg-border/60" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <Button 
                    variant="outline" 
                    onClick={() => setCourses(sampleCurriculum)}
                    className="h-11 rounded-xl border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 transition-colors text-xs sm:text-sm font-medium"
                  >
                    <Sparkles className="mr-1.5 size-4 text-primary shrink-0" />
                    Try Sample Curriculum
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={openAddCourseModal}
                    className="h-11 rounded-xl border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 transition-colors text-xs sm:text-sm font-medium"
                  >
                    <PenTool className="mr-1.5 size-4 text-primary shrink-0" />
                    Build Flowchart Manually
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs sm:text-sm text-muted-foreground pt-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={openPrivacyPolicy}
                  className="group flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  title="View Privacy Policy & Terms"
                >
                  <ShieldCheck className="size-4 text-primary" />
                  <span>Fast, secure in-browser parsing</span>
                </button>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-status-passed" />
                  Instant degree simulation
                </span>
              </div>
            </div>

            {/* Right Column: Visual Showcase & Brand Card */}
            <div className="lg:col-span-5 p-5 sm:p-6 lg:p-7 xl:p-8 bg-muted/25 border-t lg:border-t-0 lg:border-l border-border/70 flex flex-col justify-center">
              <div className="relative flex flex-1 flex-col justify-between rounded-2xl border border-border/80 bg-background/90 dark:bg-card/90 p-5 sm:p-6 lg:p-7 shadow-xs">
                
                {/* Top badge */}
                <div className="flex items-center justify-between relative z-10">
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-muted/60 px-2.5 py-1 text-xs sm:text-sm font-medium text-foreground/85 shadow-2xs">
                    {SHOWCASE_SLIDES[activeSlide].badge}
                  </span>
                  <span className="text-xs sm:text-sm font-mono text-muted-foreground font-semibold">
                    0{activeSlide + 1} / 0{SHOWCASE_SLIDES.length}
                  </span>
                </div>

                {/* Center Logo & Feature Pills */}
                <div className="my-4 flex flex-col items-center justify-center relative z-10">
                  <div className="relative flex items-center justify-center p-1.5">
                    <Mascot size={110} className="relative z-10 transition-transform duration-300 hover:scale-105" />
                  </div>

                  {/* Feature Pills */}
                  <div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5 max-w-sm">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground shadow-2xs">
                      <Network className="size-3 text-primary" />
                      Auto-DAG Layout
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground shadow-2xs">
                      <Calculator className="size-3 text-status-passed" />
                      GWA Simulator
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground shadow-2xs">
                      <CalendarCheck className="size-3 text-status-blocked" />
                      Term Tracking
                    </span>
                  </div>
                </div>

                {/* Bottom Quote & Carousel Controls */}
                <div className="relative z-10 pt-1">
                  <div className="min-h-[64px]">
                    <p className="font-heading text-sm sm:text-base lg:text-lg font-semibold leading-snug tracking-tight text-foreground">
                      “{SHOWCASE_SLIDES[activeSlide].tagline}”
                    </p>
                    <p className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {SHOWCASE_SLIDES[activeSlide].subtext}
                    </p>
                  </div>

                  {/* Navigation dots and arrows */}
                  <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                    {/* Dots */}
                    <div className="flex items-center gap-1.5" role="tablist" aria-label="Showcase slides">
                      {SHOWCASE_SLIDES.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          role="tab"
                          aria-selected={idx === activeSlide}
                          aria-label={`Slide ${idx + 1}`}
                          onClick={() => setActiveSlide(idx)}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            idx === activeSlide
                              ? "w-6 bg-primary"
                              : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Arrow buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handlePrevSlide}
                        aria-label="Previous showcase slide"
                        className="flex size-7.5 items-center justify-center rounded-full border border-border/80 bg-muted/40 text-foreground transition-colors hover:bg-muted hover:text-foreground shadow-2xs"
                      >
                        <ChevronLeft className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextSlide}
                        aria-label="Next showcase slide"
                        className="flex size-7.5 items-center justify-center rounded-full border border-border/80 bg-muted/40 text-foreground transition-colors hover:bg-muted hover:text-foreground shadow-2xs"
                      >
                        <ChevronRight className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
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
      <CourseFormModal />
    </main>
  );
}

