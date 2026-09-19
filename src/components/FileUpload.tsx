"use client";

import { useState, useRef } from "react";
import { FileText, Loader2, TriangleAlert, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

const ACCEPTED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp", "image/heic", "image/heif"];
const FILE_TYPE_HINTS = ["PDF", "PNG", "JPG", "WebP", "HEIC"];

export default function FileUpload({
  onUploadComplete,
  onUploadStart,
  onUploadError,
  className,
}: {
  onUploadComplete: (data: {
    courses: Array<{
      code: string;
      title: string;
      units: number;
      year: number;
      term: number;
      prerequisites: string[];
      softPrerequisites?: string[];
    }>;
  }) => void;
  onUploadStart?: () => void;
  onUploadError?: (error: string) => void;
  className?: string;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (ACCEPTED_TYPES.includes(droppedFile.type)) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError("Please upload a PDF or an image (PNG, JPG, WebP, HEIC).");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (ACCEPTED_TYPES.includes(selectedFile.type)) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError("Please upload a PDF or an image (PNG, JPG, WebP, HEIC).");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    if (onUploadStart) onUploadStart();
    else setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/parse-curriculum", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: unknown } | null;
        const detail = typeof body?.error === "string" ? body.error : `Failed to parse curriculum (HTTP ${response.status})`;
        throw new Error(detail);
      }

      const data = await response.json();
      onUploadComplete(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred during parsing.";
      setError(errorMessage);
      if (onUploadError) onUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`w-full flex flex-col gap-4 sm:gap-4.5 ${className || ""}`}>
        <>
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload curriculum file: PDF or a photo of it, drag and drop or browse"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={handleKeyDown}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 sm:p-6 text-center outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
              isDragging
                ? "border-primary bg-primary/10 scale-[0.99] shadow-inner"
                : file
                  ? "border-status-passed/70 bg-tint-passed/50 shadow-sm"
                  : "border-border/80 bg-muted/30 hover:border-primary/60 hover:bg-muted/60 hover:shadow-sm"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="application/pdf,image/png,image/jpeg,image/webp,image/heic,image/heif"
              className="hidden"
              tabIndex={-1}
              aria-hidden="true"
            />

            {file ? (
              <div className="flex flex-col items-center py-1">
                <span className="mb-2.5 flex size-12 items-center justify-center rounded-2xl bg-tint-passed text-status-passed shadow-xs transition-transform group-hover:scale-105">
                  <FileText className="size-6" />
                </span>
                <p className="max-w-[280px] truncate text-sm sm:text-base font-semibold text-foreground" title={file.name}>
                  {file.name}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground font-mono">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <span className="mt-2.5 inline-flex items-center rounded-full bg-background/90 px-3 py-0.5 text-xs font-medium text-muted-foreground border border-border/70 shadow-2xs">
                  Click or drop another file to replace
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center py-1">
                <span className="mb-2.5 flex size-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground shadow-xs transition-transform group-hover:scale-105 group-hover:bg-primary/15 group-hover:text-primary">
                  <UploadCloud className="size-6" />
                </span>
                <h3 className="font-heading text-base sm:text-lg font-semibold tracking-tight text-foreground">
                  Drop your curriculum file
                </h3>
                <p className="mt-1 max-w-sm text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Drag &amp; drop your official PDF, syllabus, or photo here, or click to browse
                </p>
              </div>
            )}
          </div>

          {error && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive animate-rise"
            >
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-muted-foreground">
            <span className="font-medium text-xs">Accepted formats:</span>
            <ul className="flex flex-wrap items-center gap-1.5" aria-label="Accepted file types">
              {FILE_TYPE_HINTS.map((hint) => (
                <li
                  key={hint}
                  className="rounded-md border border-border/70 bg-muted/60 px-2 py-0.5 text-[11px] font-medium tracking-wide text-muted-foreground"
                >
                  {hint}
                </li>
              ))}
            </ul>
          </div>

          <Button
            onClick={handleUpload}
            disabled={!file}
            size="lg"
            className="w-full h-11.5 text-sm sm:text-base font-semibold rounded-xl shadow-md transition-all hover:shadow-lg disabled:opacity-50"
          >
            Process curriculum & generate map
          </Button>
        </>
    </div>
  );
}
