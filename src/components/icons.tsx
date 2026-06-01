import {
  Brain,
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Calendar,
  Check,
  Code,
  Palette,
  ExternalLink,
  FileText,
  Link,
  Lock,
  Banknote,
  Search,
  Settings,
  Shield,
  Sparkles,
  Star,
  Crosshair,
  Upload,
  User,
  X,
  BarChart3,
  Bell,
  Plus,
  Zap,
  FlaskConical,
  type LucideIcon,
} from "lucide-react";

/** Map of custom icon names → Lucide React components. */
const lucideMap: Record<string, LucideIcon> = {
  ai: Brain,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  briefcase: BriefcaseBusiness,
  calendar: Calendar,
  check: Check,
  code: Code,
  design: Palette,
  external: ExternalLink,
  file: FileText,
  link: Link,
  lock: Lock,
  money: Banknote,
  search: Search,
  settings: Settings,
  shield: Shield,
  spark: Sparkles,
  star: Star,
  starFilled: Star,
  target: Crosshair,
  upload: Upload,
  user: User,
  x: X,
  chart: BarChart3,
  bell: Bell,
  plus: Plus,
  bolt: Zap,
  beaker: FlaskConical,
};

export type IconName = keyof typeof lucideMap;

/** Backward-compatible Icon component powered by Lucide React. */
export function Icon({
  name,
  className = "",
  size = 20,
}: {
  name: IconName;
  className?: string;
  size?: number;
}) {
  const LucideComponent = lucideMap[name];
  return <LucideComponent aria-hidden="true" className={className} size={size} />;
}

/** Dummy rating stars (4.0–5.0) for demo social proof. Uses Lucide Star. */
export function RatingStars({
  rating = 4.5,
  reviewCount = 12,
  size = 16,
  showCount = true,
}: {
  rating?: number;
  reviewCount?: number;
  size?: number;
  showCount?: boolean;
}) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const starValue = i + 1;
    return rating >= starValue
      ? ("filled" as const)
      : rating >= starValue - 0.5
        ? ("filled" as const)
        : ("empty" as const);
  });

  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500">
      {stars.map((type, i) =>
        type === "filled" ? (
          <Star key={i} size={size} fill="currentColor" />
        ) : (
          <Star key={i} size={size} />
        ),
      )}
      {showCount && (
        <span className="ml-1.5 text-xs text-surface-400">
          {rating.toFixed(1)} ({reviewCount})
        </span>
      )}
    </span>
  );
}
