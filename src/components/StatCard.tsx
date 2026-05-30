import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
}

export function StatCard({ icon: Icon, value, label }: StatCardProps) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center mb-3">
        <Icon className="w-4 h-4 text-primary-600" />
      </div>
      <div className="text-2xl font-bold text-surface-900" style={{ fontFamily: "Outfit" }}>
        {value}
      </div>
      <div className="text-xs text-surface-400">{label}</div>
    </div>
  );
}
