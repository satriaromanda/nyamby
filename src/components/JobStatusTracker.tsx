"use client";

import { Icon } from "@/components/icons";

/**
 * Shared job status tracker (PRD v5.3 §6.2).
 * Previously inlined in 3 places (jobs/[id], talent/dashboard, client/dashboard) —
 * extracted so the workspace page and job detail render the same real progress.
 *
 * Handles the full JobStatus enum including submitted_for_review /
 * revision_requested / disputed (the old inline version only knew 4 states).
 */
export function JobStatusTracker({
  status,
  onDispute,
}: {
  status: string;
  onDispute?: () => void;
}) {
  const steps = [
    { key: "active", label: "Aktif", icon: "file" as const },
    { key: "matched", label: "Matched", icon: "ai" as const },
    { key: "in_progress", label: "Dikerjakan", icon: "settings" as const },
    { key: "submitted_for_review", label: "Review", icon: "search" as const },
    { key: "completed", label: "Selesai", icon: "check" as const },
  ];

  const statusOrder: Record<string, number> = {
    active: 0,
    matched: 1,
    in_progress: 2,
    revision_requested: 2, // back in progress after revision request
    submitted_for_review: 3,
    completed: 4,
    cancelled: -1,
    disputed: -2,
  };

  const currentIndex = statusOrder[status] ?? 0;

  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
        <Icon name="x" className="text-red-600" size={15} />
        <span className="text-xs text-red-600 font-medium">Dibatalkan</span>
      </div>
    );
  }

  if (status === "disputed") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
        <Icon name="alertTriangle" className="text-amber-600" size={15} />
        <span className="text-xs text-amber-700 font-medium">
          Dalam Dispute — tim Nyamby sedang meninjau
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center gap-0 w-full">
        {steps.map((step, i) => {
          const isActive = i <= currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-500 ${
                    isCurrent
                      ? "gradient-primary shadow-lg shadow-primary-500/20 scale-110 text-white"
                      : isActive
                        ? "bg-accent-500/10 text-accent-600"
                        : "bg-surface-100 text-surface-400"
                  }`}
                >
                  {isActive && i < currentIndex ? (
                    <Icon name="check" size={14} />
                  ) : (
                    <Icon name={step.icon} size={14} />
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
                <div
                  className={`flex-1 h-0.5 mx-1 rounded-full transition-all duration-500 ${
                    i < currentIndex ? "bg-accent-500/30" : "bg-surface-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {status === "revision_requested" && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 self-start">
          <Icon name="arrowLeft" className="text-amber-600" size={13} />
          <span className="text-xs text-amber-700 font-medium">Revisi diminta client</span>
        </div>
      )}

      {(status === "in_progress" || status === "submitted_for_review") && onDispute && (
        <button
          onClick={onDispute}
          className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1 self-start ml-2"
        >
          <Icon name="alertTriangle" size={14} /> Laporkan Masalah
        </button>
      )}
    </div>
  );
}

export default JobStatusTracker;
