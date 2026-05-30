import { FileText, Bot, Wrench, CheckCircle, XCircle } from "lucide-react";

const steps = [
  { key: "active", label: "Posted", Icon: FileText },
  { key: "matched", label: "Matched", Icon: Bot },
  { key: "in_progress", label: "In Progress", Icon: Wrench },
  { key: "completed", label: "Selesai", Icon: CheckCircle },
] as const;

const statusOrder: Record<string, number> = {
  active: 0,
  matched: 1,
  in_progress: 2,
  completed: 3,
  cancelled: -1,
};

export function JobStatusTracker({ status }: { status: string }) {
  const currentIndex = statusOrder[status] ?? 0;

  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
        <XCircle className="w-4 h-4 text-red-500" />
        <span className="text-xs text-red-600 font-medium">Dibatalkan</span>
      </div>
    );
  }

  return (
    <div className="flex items-center w-full">
      {steps.map((step, i) => {
        const isActive = i <= currentIndex;
        const isCurrent = i === currentIndex;
        const Icon = step.Icon;
        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isCurrent
                    ? "gradient-primary shadow-lg shadow-primary-500/20 scale-110 text-white"
                    : isActive
                      ? "bg-accent-500/10 text-accent-600"
                      : "bg-surface-100 text-surface-400"
                }`}
              >
                {isActive && i < currentIndex ? (
                  <CheckCircle className="w-3.5 h-3.5" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
              </div>
              <span
                className={`text-[9px] mt-1 font-medium transition-colors ${
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
              <div className="flex-1 h-px mx-1">
                <div
                  className={`h-full transition-all duration-500 ${
                    i < currentIndex ? "bg-accent-500" : "bg-surface-200"
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
