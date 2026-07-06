// Shared "AI enrichment" pill — PRD v1.2 design system: amber light bg,
// amber dark text, pill shape, always paired with a label (never icon-only).
export function AIBadge({ label = "AI enrichment", className = "" }: { label?: string; className?: string }) {
  return (
    <span className={`text-xs px-3 py-1 rounded-full bg-[#FAEEDA] text-[#854F0B] font-medium ${className}`}>
      {label}
    </span>
  );
}
