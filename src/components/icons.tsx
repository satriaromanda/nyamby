import {
  Brain,
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Calendar,
  Check,
  ChevronDown,
  Code,
  Palette,
  ExternalLink,
  FileText,
  Info,
  Link,
  Lock,
  Banknote,
  BookOpen,
  Search,
  Settings,
  Shield,
  Sparkles,
  Star,
  Crosshair,
  TrendingUp,
  Upload,
  User,
  Users,
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
  chevronDown: ChevronDown,
  code: Code,
  design: Palette,
  external: ExternalLink,
  file: FileText,
  info: Info,
  link: Link,
  lock: Lock,
  money: Banknote,
  book: BookOpen,
  search: Search,
  settings: Settings,
  shield: Shield,
  spark: Sparkles,
  star: Star,
  starFilled: Star,
  target: Crosshair,
  trendingUp: TrendingUp,
  upload: Upload,
  user: User,
  users: Users,
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
  fill,
}: {
  name: IconName;
  className?: string;
  size?: number;
  fill?: string;
}) {
  const LucideComponent = lucideMap[name];
  return <LucideComponent aria-hidden="true" className={className} size={size} fill={fill} />;
}

/** Nyamby full logo (icon + text) as inline SVG. Pass `height` to control size. */
export function Logo({ height = 32, className = "" }: { height?: number; className?: string }) {
  const aspect = 840 / 302;
  const width = Math.round(height * aspect);
  return (
    <img
      src="/logo-full.png"
      alt="Nyamby Logo"
      className={`object-contain ${className}`}
      style={{ height: `${height}px`, width: 'auto' }}
    />
  );
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
