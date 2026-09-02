import { memo } from "react";

export interface TermBackdropData {
  width: number;
  height: number;
  year: number;
  term: number;
}

export default memo(function TermBackdropNode({
  data,
}: {
  data: TermBackdropData;
}) {
  return (
    <div
      style={{ width: data.width, height: data.height }}
      className="pointer-events-none select-none rounded-2xl border border-dashed border-border/70 bg-muted/20 backdrop-blur-[1px] transition-colors"
    />
  );
});
