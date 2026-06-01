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

/** Nyamby full logo (icon + text) as inline SVG. Pass `height` to control size. */
export function Logo({ height = 32, className = "" }: { height?: number; className?: string }) {
  const aspect = 840 / 302;
  const width = Math.round(height * aspect);

  return (
    <svg
      aria-label="Nyamby"
      className={className}
      width={width}
      height={height}
      viewBox="0 0 840 302"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#logo-a)">
        <path d="M61 85C61 71.745 71.745 61 85 61s24 10.745 24 24v131c0 13.255-10.745 24-24 24s-24-10.745-24-24V85Z" fill="url(#logo-g0)" />
      </g>
      <g filter="url(#logo-b)">
        <path d="M163 85c0-13.255 10.745-24 24-24s24 10.745 24 24v131c0 13.255-10.745 24-24 24s-24-10.745-24-24V85Z" fill="url(#logo-g1)" />
      </g>
      <g filter="url(#logo-c)">
        <rect x="52" y="80.637" width="46.84" height="213.737" rx="23.42" transform="rotate(-37.69 52 80.637)" fill="url(#logo-g2)" />
      </g>
      <circle cx="85" cy="85" r="24" fill="url(#logo-g3)" />
      <circle cx="187" cy="220" r="24" fill="url(#logo-g4)" />
      <path d="M272.675 191H254.536V117.553h16.801l1.487 9.515c4.609-7.434 13.53-11.745 23.491-11.745 18.436 0 27.951 11.448 27.951 30.479V191h-18.138V150.113c0-12.34-6.096-18.287-15.463-18.287-11.151 0-17.99 7.731-17.99 19.626V191Zm61.568 34.047v-15.165h10.854c7.136 0 11.596-1.635 14.719-10.259l2.081-5.501-29.587-76.569h19.18l18.882 53.524 19.923-53.524h18.733l-35.98 89.802c-5.501 13.678-13.232 19.328-25.275 19.328-5.055 0-9.516-.595-13.53-1.636Zm103.314-32.114c-15.611 0-25.127-9.07-25.127-22.897 0-13.529 9.813-22.004 27.208-23.342l22.005-1.636v-1.635c0-9.961-5.947-13.976-15.165-13.976-10.705 0-16.652 4.461-16.652 12.192h-15.463c0-15.909 13.084-26.316 33.007-26.316 19.774 0 31.966 10.705 31.966 31.074V191h-15.909l-1.338-10.854c-3.122 7.583-13.084 12.787-24.532 12.787Zm5.947-13.679c11.151 0 18.288-6.69 18.288-17.99v-3.865l-15.314 1.189c-11.3 1.041-15.612 4.758-15.612 10.705 0 6.69 4.461 9.961 12.638 9.961ZM515.294 191h-18.139V117.553h16.652l1.487 8.623c3.717-6.096 11.15-10.853 21.707-10.853 11.151 0 18.882 5.501 22.747 13.976 3.717-8.475 12.341-13.976 23.492-13.976 17.841 0 27.654 10.705 27.654 27.654V191h-17.99V147.735c0-10.557-5.65-16.058-14.273-16.058-8.772 0-15.463 5.65-15.463 17.693V191h-18.139V147.586c0-10.259-5.501-15.76-14.124-15.76-8.624 0-15.611 5.65-15.611 17.544V191Zm130.207 0h-16.801V80.383h18.139v47.875c4.758-8.178 14.57-13.084 25.721-13.084 20.964 0 33.75 16.355 33.75 39.549 0 22.599-13.827 38.21-34.939 38.21-11.002 0-20.369-4.907-24.681-13.381l-1.189 11.448Zm1.487-37.021c0 13.232 8.177 22.302 20.666 22.302 12.786 0 20.369-9.218 20.369-22.302 0-13.084-7.583-22.45-20.369-22.45-12.489 0-20.666 9.218-20.666 22.45Zm64.613 71.068v-15.165h10.854c7.136 0 11.596-1.635 14.719-10.259l2.081-5.501-29.587-76.569h19.18l18.882 53.524 19.923-53.524h18.733l-35.98 89.802c-5.501 13.678-13.232 19.328-25.275 19.328-5.055 0-9.516-.595-13.53-1.636Z" fill="#00162F" />
      <defs>
        <filter id="logo-a" x="57" y="57" width="56" height="56" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="4" stdDeviation="2" floodColor="#006DAC" floodOpacity="1" />
        </filter>
        <filter id="logo-b" x="159" y="57" width="56" height="56" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="4" stdDeviation="2" floodColor="#006DAC" floodOpacity="1" />
        </filter>
        <filter id="logo-c" x="57" y="57" width="157" height="187" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="4" stdDeviation="2" floodColor="#006DAC" floodOpacity="1" />
        </filter>
        <linearGradient id="logo-g0" x1="85" y1="61" x2="85" y2="240" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1A4EC7" /><stop offset="1" stopColor="#0D2661" />
        </linearGradient>
        <linearGradient id="logo-g1" x1="187" y1="61" x2="187" y2="240" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1A4EC7" /><stop offset="1" stopColor="#0D2661" />
        </linearGradient>
        <linearGradient id="logo-g2" x1="75" y1="80" x2="75" y2="294" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1A4EC7" /><stop offset="1" stopColor="#0D2661" />
        </linearGradient>
        <linearGradient id="logo-g3" x1="61" y1="61" x2="109" y2="109" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1CCEFD" /><stop offset="1" stopColor="#008EF1" />
        </linearGradient>
        <linearGradient id="logo-g4" x1="163" y1="196" x2="211" y2="244" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1CCEFD" /><stop offset="1" stopColor="#008EF1" />
        </linearGradient>
      </defs>
    </svg>
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
