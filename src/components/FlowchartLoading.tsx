import { FileText, Cpu, CheckCircle } from "lucide-react";

export default function FlowchartLoading() {
  return (
    <div className="flex flex-col items-center justify-center p-8 w-full min-h-[300px]">
      <h3 className="text-xl font-semibold mb-8 text-foreground animate-pulse">Processing Curriculum...</h3>
      
      <div className="flex items-center justify-center w-full">
        {/* Node 1 */}
        <div className="flex flex-col items-center justify-center p-4 border-2 rounded-xl bg-card w-24 h-24 border-status-passed/70 text-status-passed">
          <FileText className="size-8 mb-2" />
          <span className="text-[10px] font-medium text-center">Reading File</span>
        </div>

        {/* Line 1 */}
        <div className="w-8 sm:w-16 h-1 bg-muted relative overflow-hidden rounded-full mx-2">
            <div className="absolute inset-0 bg-primary origin-left animate-[loading-bar_1.5s_ease-in-out_infinite]" />
        </div>

        {/* Node 2 */}
        <div className="flex flex-col items-center justify-center p-4 border-2 rounded-xl bg-card w-24 h-24 border-primary shadow-[0_0_15px_-3px_hsl(var(--primary))] animate-pulse">
          <Cpu className="size-8 mb-2 text-primary" />
          <span className="text-[10px] font-medium text-center">AI Parsing</span>
        </div>

        {/* Line 2 */}
        <div className="w-8 sm:w-16 h-1 bg-muted relative overflow-hidden rounded-full mx-2">
            <div className="absolute inset-0 bg-muted-foreground/30 origin-left" />
        </div>

        {/* Node 3 */}
        <div className="flex flex-col items-center justify-center p-4 border-2 rounded-xl bg-card w-24 h-24 opacity-50 border-border">
          <CheckCircle className="size-8 mb-2" />
          <span className="text-[10px] font-medium text-center">Generating Map</span>
        </div>
      </div>
      
      <p className="mt-8 text-sm text-muted-foreground text-center max-w-xs animate-pulse">
        Our AI is analyzing prerequisites, corequisites, and terms... This usually takes a few seconds.
      </p>

      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
