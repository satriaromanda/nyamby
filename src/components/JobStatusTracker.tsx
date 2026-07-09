import { Icon } from "@/components/icons";

export function JobStatusTracker({ status }: { status: string }) {
  const steps = [
    { key: "active", label: "Posted", icon: "file" as const },
    { key: "matched", label: "Matched", icon: "ai" as const },
    { key: "in_progress", label: "In Progress", icon: "settings" as const },
    { key: "completed", label: "Selesai", icon: "check" as const },
  ];

  const statusOrder: Record<string, number> = {
    active: 0,
    matched: 1,
    in_progress: 2,
    submitted_for_review: 2,
    revision_requested: 2,
    completed: 3,
    cancelled: -1,
  };

  const currentIndex = statusOrder[status] ?? 0;

  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
        <Icon name="x" className="text-red-600" size={14} />
        <span className="text-xs text-red-600 font-medium">Dibatalkan</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0 w-full">
      {steps.map((step, i) => {
        const isActive = i <= currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none min-w-0">
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm transition-all duration-500 shrink-0 ${
                  isCurrent
                    ? "gradient-primary shadow-lg shadow-primary-500/20 scale-110 text-white"
                    : isActive
                      ? "bg-accent-500/10 text-accent-600"
                      : "bg-surface-100 text-surface-400"
                }`}
              >
                {isActive && i < currentIndex ? <Icon name="check" size={12} /> : <Icon name={step.icon} size={12} />}
              </div>
              <span
                className={`text-[8px] sm:text-[9px] mt-1 font-medium transition-colors whitespace-nowrap ${
                  isCurrent
                    ? "text-primary-600"
                    : isActive
                      ? "text-accent-600"
                      : "text-surface-300"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-0.5 sm:mx-1 rounded-full transition-all duration-500 ${
                  i < currentIndex ? "bg-accent-500/30" : "bg-surface-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
