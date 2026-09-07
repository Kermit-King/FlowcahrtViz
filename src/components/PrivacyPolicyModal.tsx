"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Bot,
  Database,
  GraduationCap,
  HardDrive,
  Lock,
  Scale,
  ShieldCheck,
} from "lucide-react";

export function openPrivacyPolicy() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("flowchartviz:open-privacy-policy"));
  }
}

export function PrivacyPolicyModal() {
  const [open, setOpen] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasAccepted = localStorage.getItem("flowchartviz-privacy-accepted");
      if (hasAccepted) {
        setIsAccepted(true);
      } else {
        setOpen(true);
      }
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("flowchartviz:open-privacy-policy", handleOpen);
    return () => {
      window.removeEventListener("flowchartviz:open-privacy-policy", handleOpen);
    };
  }, []);

  const handleAccept = () => {
    localStorage.setItem("flowchartviz-privacy-accepted", "true");
    setIsAccepted(true);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent showCloseButton={true} className="sm:max-w-xl md:max-w-2xl max-h-[90dvh] flex flex-col p-5 sm:p-6">
        <DialogHeader className="shrink-0 pb-2">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-left text-lg font-semibold tracking-tight">
                Privacy Policy &amp; Terms of Use
              </DialogTitle>
              <DialogDescription className="text-left text-xs text-muted-foreground mt-0.5">
                Effective Date: September 2026 • Please read our data practices and simulator terms
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Policy Body */}
        <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-3.5 my-2 text-xs sm:text-sm text-muted-foreground">
          
          {/* Section 1: Academic Disclaimer */}
          <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 sm:p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <GraduationCap className="size-4 text-primary shrink-0" />
              <span>1. Unofficial Degree Planning &amp; Academic Disclaimer</span>
            </div>
            <p className="leading-relaxed">
              FlowchartViz is an independent degree planning, flowchart visualization, and GWA simulation tool. 
              <strong> FlowchartViz is NOT an official university registrar, degree audit portal, or academic advising platform.</strong>
            </p>
            <p className="leading-relaxed text-[11px] sm:text-xs text-muted-foreground">
              Course prerequisite trees, term sequences, units, and Latin honors threshold simulations are estimates generated from uploaded documents. 
              Curriculum rules change frequently. Always cross-check all degree requirements and prerequisites with your institution&apos;s official program advisor, department chair, or academic catalog before enrolling.
            </p>
          </div>

          {/* Section 2: Data Handling & Transient Processing */}
          <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 sm:p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <HardDrive className="size-4 text-primary shrink-0" />
              <span>2. File Uploads &amp; Transient In-Memory Processing</span>
            </div>
            <p className="leading-relaxed">
              When you upload a curriculum PDF, syllabus, or photo:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] sm:text-xs">
              <li><strong>Zero Persistent Server Storage:</strong> Your file is processed transiently in memory to perform text and layout extraction. It is never saved to a disk or persistent database on our servers.</li>
              <li><strong>No Data Monetization:</strong> We do not sell, rent, license, or trade your uploaded curriculum files or extracted course graphs to any third parties or data brokers.</li>
              <li><strong>Immediate Disposal:</strong> Once course codes and relationships are returned to your browser session, the server memory buffer is discarded.</li>
            </ul>
          </div>

          {/* Section 3: Third-Party AI Services */}
          <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 sm:p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Bot className="size-4 text-primary shrink-0" />
              <span>3. AI-Assisted Parsing (Google Gemini API)</span>
            </div>
            <p className="leading-relaxed">
              To accurately interpret complex tables, prerequisite arrows, and unstructured curriculum documents, FlowchartViz uses the Google Gemini API.
            </p>
            <p className="leading-relaxed text-[11px] sm:text-xs">
              Curriculum images or parsed text layers are securely transmitted via encrypted HTTPS directly to Google&apos;s API solely for structuring into standard course codes, units, terms, and prerequisite relationships. Use of this feature is governed by Google&apos;s API Terms and Enterprise Privacy safeguards.
            </p>
          </div>

          {/* Section 4: Sensitive PII Guidance */}
          <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 sm:p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Lock className="size-4 text-primary shrink-0" />
              <span>4. Sensitive Personal Information (PII) Protection</span>
            </div>
            <p className="leading-relaxed">
              FlowchartViz only requires general academic curriculum sheets (e.g. program checklists, departmental prospectus, or course sequence guides).
            </p>
            <p className="leading-relaxed text-[11px] sm:text-xs text-destructive-foreground font-medium bg-destructive/10 p-2 rounded-lg border border-destructive/20">
              <strong>Notice:</strong> Please do not upload personal academic transcripts or documents containing sensitive personal information such as Social Security Numbers (SSNs), student identification numbers, home addresses, government IDs, or payment details.
            </p>
          </div>

          {/* Section 5: Local Storage */}
          <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 sm:p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Database className="size-4 text-primary shrink-0" />
              <span>5. Local Browser Storage &amp; Cookies</span>
            </div>
            <p className="leading-relaxed">
              FlowchartViz does not use tracking cookies, analytics pixels, or marketing trackers.
            </p>
            <p className="leading-relaxed text-[11px] sm:text-xs">
              We utilize your browser&apos;s standard <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[11px]">localStorage</code> strictly to preserve your application state across page reloads:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] sm:text-xs">
              <li>Active curriculum course list and layout configuration</li>
              <li>Simulated course completion statuses (Passed, Failed, Pending)</li>
              <li>Your theme preference (Light or Dark mode)</li>
              <li>Policy acceptance confirmation flag</li>
            </ul>
            <p className="leading-relaxed text-[11px] sm:text-xs">
              You may wipe all stored course progress at any time by clicking &quot;Clear curriculum&quot; in the header or clearing your browser cookies/storage.
            </p>
          </div>

          {/* Section 6: Limitation of Liability */}
          <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 sm:p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Scale className="size-4 text-primary shrink-0" />
              <span>6. Limitation of Liability &amp; Warranty</span>
            </div>
            <p className="leading-relaxed">
              FlowchartViz is provided on an <strong>&quot;AS IS&quot;</strong> and <strong>&quot;AS AVAILABLE&quot;</strong> basis, without warranties of any kind, whether express or implied.
            </p>
            <p className="leading-relaxed text-[11px] sm:text-xs">
              To the fullest extent permitted by law, the creators and contributors of FlowchartViz disclaim all liability for any academic consequences, missed prerequisites, delayed graduation timelines, GWA computation discrepancies, or damages resulting from reliance on the software.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <DialogFooter className="shrink-0 pt-3 border-t border-border flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div className="text-[11px] text-muted-foreground text-center sm:text-left">
            By using FlowchartViz, you acknowledge and agree to these terms.
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isAccepted && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
                className="w-full sm:w-auto text-xs"
              >
                Close
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleAccept}
              className="w-full sm:w-auto text-xs font-semibold"
            >
              {isAccepted ? "Re-confirm & Save" : "I Understand & Agree"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
