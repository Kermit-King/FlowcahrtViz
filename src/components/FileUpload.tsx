"use client";

import { useState, useRef } from "react";
import { FileText, Loader2, TriangleAlert, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

const ACCEPTED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp", "image/heic", "image/heif"];
const FILE_TYPE_HINTS = ["PDF", "PNG", "JPG", "WebP", "HEIC"];

export default function FileUpload({ onUploadComplete }: { onUploadComplete: (data: { courses: Array<{ code: string; title: string; units: number; year: number; term: number; prerequisites: string[] }> }) => void }) {
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

    setIsUploading(true);
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
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full rounded-xl border border-border bg-card p-4 shadow-xs sm:p-6">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload curriculum file: PDF or a photo of it, drag and drop or browse"
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:p-10 ${
          isDragging
            ? "border-primary bg-primary/5"
            : file
              ? "border-status-passed/60 bg-tint-passed/40"
              : "border-input hover:border-primary/50 hover:bg-muted/50"
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
          <div className="flex flex-col items-center">
            <span className="mb-3 flex size-12 items-center justify-center rounded-full bg-tint-passed text-status-passed">
              <FileText className="size-6" />
            </span>
            <p className="max-w-[220px] truncate text-sm font-medium text-foreground" title={file.name}>
              {file.name}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Click or drop another file to replace
            </p>
          </div>
        ) : (
          <>
            <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              <UploadCloud className="size-6" />
            </span>
            <h3 className="font-heading text-lg font-semibold tracking-tight">
              Drop your curriculum
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Drag &amp; drop your PDF or a photo of it here, or click to browse
            </p>
          </>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="mt-3 flex items-start gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive"
        >
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
          {error}
        </p>
      )}

      <ul className="mt-3 flex flex-wrap items-center justify-center gap-1.5" aria-label="Accepted file types">
        {FILE_TYPE_HINTS.map((hint) => (
          <li
            key={hint}
            className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground"
          >
            {hint}
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <Button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Parsing curriculum…
            </>
          ) : (
            "Process curriculum"
          )}
        </Button>
      </div>
    </div>
  );
}
