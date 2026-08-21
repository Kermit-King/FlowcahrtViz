"use client";

import { useCourseStore } from "@/store/courseStore";
import FileUpload from "@/components/FileUpload";
import CurriculumFlow from "@/components/CurriculumFlow";
import GWACalculator from "@/components/GWACalculator";
import { Button } from "@/components/ui/button";
import { GraduationCap, Trash2 } from "lucide-react";

export default function Home() {
  const courses = useCourseStore((state) => state.courses);
  const setCourses = useCourseStore((state) => state.setCourses);

  const handleClearCurriculum = () => {
    setCourses([]);
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      {/* Premium Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
              Degree Path Simulator
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              Interactive Prerequisite Tree & Degree Progression Planner
            </p>
          </div>
        </div>

        {courses.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClearCurriculum}
            className="flex items-center gap-1.5 text-xs"
          >
            <Trash2 className="w-4 h-4" />
            Clear Curriculum
          </Button>
        )}
      </header>

      {/* Main Content Area */}
      {courses.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto">
          <div className="mb-6 max-w-2xl">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl mb-3">
              Upload Your University Curriculum
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Drop your official university curriculum PDF (e.g. computer science, engineering) here. 
              Our Gemini parser will structure the courses, credits, semesters, and prerequisites into 
              an interactive visual graph.
            </p>
          </div>
          <div className="w-full">
            <FileUpload onUploadComplete={(data) => setCourses(data.courses)} />
          </div>
        </div>
      ) : (
        <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-73px)]">
          {/* GWA Calculator & Sidebar Info */}
          <div className="lg:col-span-3 flex flex-col gap-6 overflow-y-auto">
            <GWACalculator />

            {/* Extra Info Box */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl p-5 shadow-md flex flex-col gap-2">
              <h3 className="font-bold text-sm">💡 Quick Tips</h3>
              <p className="text-xs text-blue-100 leading-relaxed">
                You can drag nodes to rearrange them to your liking. Clicking "Reset Layout" will restore the automatic left-to-right DAG layout computed by Dagre.
              </p>
            </div>
          </div>

          {/* Interactive React Flow Canvas */}
          <div className="lg:col-span-9 h-full flex flex-col">
            <CurriculumFlow />
          </div>
        </div>
      )}
    </main>
  );
}
