import Link from "next/link";
import type { ComponentProps } from "react";

interface LogoProps extends ComponentProps<typeof Link> {
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-8 h-8 rounded-lg text-sm",
  md: "w-9 h-9 rounded-xl text-lg",
  lg: "w-10 h-10 rounded-xl text-lg",
};

export function Logo({ size = "md", className, ...props }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className ?? ""}`} {...props}>
      <div
        className={`${sizeClasses[size]} gradient-primary flex items-center justify-center font-bold text-white`}
        style={{ fontFamily: "Outfit" }}
      >
        N
      </div>
      <span
        className={`font-bold text-surface-900 ${size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-xl"}`}
        style={{ fontFamily: "Outfit" }}
      >
        Nyamby
      </span>
    </Link>
  );
}
