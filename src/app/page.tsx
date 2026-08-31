"use client";

import { useState } from "react";
import { useCourseStore } from "@/store/courseStore";
import FileUpload from "@/components/FileUpload";
import FlowchartLoading from "@/components/FlowchartLoading";
import CurriculumFlow from "@/components/CurriculumFlow";
import DashboardRail from "@/components/DashboardRail";
import Mascot from "@/components/Mascot";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";

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
        /* Side-by-Side Split Card Empty State - Balanced & Fuller 100% Zoom */
        <div className="relative flex flex-1 items-center justify-center p-3 sm:p-5 md:p-6 lg:p-7 w-full max-w-5xl xl:max-w-[1240px] mx-auto min-h-0">
          {/* Main 2-Column Split Card */}
          <div className="relative z-10 w-full max-h-[calc(100dvh-5.5rem)] overflow-hidden rounded-3xl border border-border/80 bg-card shadow-2xl grid grid-cols-1 lg:grid-cols-12 animate-rise">
            
            {/* Left Column: Heading & Upload */}
            <div className="lg:col-span-7 p-7 sm:p-9 lg:p-10 xl:p-12 flex flex-col justify-between gap-5 sm:gap-6 overflow-y-auto">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary tracking-wide">
                  <Sparkles className="size-3.5" />
                  <span>Degree Path Simulator</span>
                </div>

                <h1 className="mt-4 font-heading text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground leading-[1.14]">
                  Chart your degree, <br className="hidden sm:inline" />
                  course by course.
                </h1>

                <p className="mt-2 text-xs sm:text-sm lg:text-base leading-relaxed text-muted-foreground max-w-xl">
                  Drop in your official curriculum PDF or syllabus image. FlowchartViz parses every
                  course, credit, and prerequisite into a live interactive map.
                </p>
              </div>

              <div className="my-auto py-1">
                <FileUpload 
                  onUploadStart={() => setIsUploading(true)}
                  onUploadComplete={(data) => {
                    setIsUploading(false);
                    setCourses(data.courses);
                  }} 
                  onUploadError={() => setIsUploading(false)}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs sm:text-sm text-muted-foreground pt-3.5 border-t border-border/60">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-primary" />
                  Fast, secure in-browser parsing
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-status-passed" />
                  Instant degree simulation
                </span>
              </div>
            </div>

            {/* Right Column: Visual Showcase & Mascot Card */}
            <div className="lg:col-span-5 p-5 sm:p-6 lg:p-7 xl:p-8 bg-muted/25 border-t lg:border-t-0 lg:border-l border-border/70 flex flex-col justify-center">
              <div className="relative flex flex-1 flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-background/90 dark:bg-card/90 p-6 sm:p-7 xl:p-8 shadow-xs">
                
                {/* Top badge */}
                <div className="flex items-center justify-between relative z-10">
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-muted/60 px-2.5 py-1 text-xs sm:text-sm font-medium text-foreground/85 shadow-2xs">
                    {SHOWCASE_SLIDES[activeSlide].badge}
                  </span>
                  <span className="text-xs sm:text-sm font-mono text-muted-foreground font-semibold">
                    0{activeSlide + 1} / 0{SHOWCASE_SLIDES.length}
                  </span>
                </div>

                {/* Center Mascot & Feature Pills */}
                <div className="my-6 flex flex-col items-center justify-center relative z-10">
                  <div className="relative flex items-center justify-center p-2">
                    <Mascot size={150} className="relative z-10 transition-transform duration-300 hover:scale-105" />
                  </div>

                  {/* Feature Pills */}
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2 max-w-sm">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/50 px-3 py-1.5 text-xs font-medium text-foreground shadow-2xs">
                      <Network className="size-3.5 text-primary" />
                      Auto-DAG Layout
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/50 px-3 py-1.5 text-xs font-medium text-foreground shadow-2xs">
                      <Calculator className="size-3.5 text-status-passed" />
                      GWA Simulator
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/50 px-3 py-1.5 text-xs font-medium text-foreground shadow-2xs">
                      <CalendarCheck className="size-3.5 text-status-blocked" />
                      Term Tracking
                    </span>
                  </div>
                </div>

                {/* Bottom Quote & Carousel Controls */}
                <div className="relative z-10 pt-1">
                  <div className="min-h-[72px]">
                    <p className="font-heading text-base sm:text-lg lg:text-xl font-semibold leading-snug tracking-tight text-foreground">
                      “{SHOWCASE_SLIDES[activeSlide].tagline}”
                    </p>
                    <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {SHOWCASE_SLIDES[activeSlide].subtext}
                    </p>
                  </div>

                  {/* Navigation dots and arrows */}
                  <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3.5">
                    {/* Dots */}
                    <div className="flex items-center gap-2" role="tablist" aria-label="Showcase slides">
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
                              ? "w-7 bg-primary"
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
                        className="flex size-8 items-center justify-center rounded-full border border-border/80 bg-muted/40 text-foreground transition-colors hover:bg-muted hover:text-foreground shadow-2xs"
                      >
                        <ChevronLeft className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextSlide}
                        aria-label="Next showcase slide"
                        className="flex size-8 items-center justify-center rounded-full border border-border/80 bg-muted/40 text-foreground transition-colors hover:bg-muted hover:text-foreground shadow-2xs"
                      >
                        <ChevronRight className="size-4" />
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
    </main>
  );
}

