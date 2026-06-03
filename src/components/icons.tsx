import {
  Brain,
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  Code,
  Eye,
  EyeOff,
  Palette,
  ExternalLink,
  FileText,
  Image,
  Info,
  Link,
  Lock,
  Mail,
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

const TwitterIcon = ({ size = 24, className = "", ...props }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const InstagramIcon = ({ size = 24, className = "", ...props }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const LinkedinIcon = ({ size = 24, className = "", ...props }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GithubIcon = ({ size = 24, className = "", ...props }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

/** Map of custom icon names → Lucide React components. */
const lucideMap: Record<string, any> = {
  ai: Brain,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  briefcase: BriefcaseBusiness,
  building: Building2,
  calendar: Calendar,
  check: Check,
  chevronDown: ChevronDown,
  code: Code,
  design: Palette,
  external: ExternalLink,
  eye: Eye,
  eyeOff: EyeOff,
  file: FileText,
  image: Image,
  info: Info,
  link: Link,
  lock: Lock,
  mail: Mail,
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
  twitter: TwitterIcon,
  instagram: InstagramIcon,
  linkedin: LinkedinIcon,
  github: GithubIcon,
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
  return <LucideComponent aria-hidden="true" className={className} size={size} {...(fill ? { fill } : {})} />;
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
