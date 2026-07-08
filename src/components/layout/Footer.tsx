"use client";

import Link from "next/link";
import { Icon, Logo } from "@/components/icons";
import { useLang } from "@/lib/lang";

const copy = {
  id: {
    tagline: "AI Career Companion untuk talenta Indonesia. Dari nyambi menjadi karier.",
    colFitur: "Fitur",
    aiMatching: "AI Matching",
    careerPath: "Career Path",
    skillGap: "Skill Gap Analysis",
    escrow: "Escrow Aman",
    colCompany: "Perusahaan",
    about: "Tentang",
    global: "Global (MY)",
    careers: "Karier",
    contact: "Kontak",
    colResources: "Resources",
    blog: "Blog",
    help: "Help",
    status: "Status",
    colLegal: "Legal",
    privacy: "Privacy",
    terms: "Terms",
    security: "Security",
    bottom: "© 2026 Nyamby. Dibuat dengan ❤️ di Bandar Lampung",
  },
  en: {
    tagline: "AI Career Companion for Indonesian talent. From side gigs to careers.",
    colFitur: "Features",
    aiMatching: "AI Matching",
    careerPath: "Career Path",
    skillGap: "Skill Gap Analysis",
    escrow: "Secure Escrow",
    colCompany: "Company",
    about: "About",
    global: "Global (MY)",
    careers: "Careers",
    contact: "Contact",
    colResources: "Resources",
    blog: "Blog",
    help: "Help",
    status: "Status",
    colLegal: "Legal",
    privacy: "Privacy",
    terms: "Terms",
    security: "Security",
    bottom: "© 2026 Nyamby. Made with ❤️ in Bandar Lampung",
  },
} as const;

export function Footer() {
  const [lang] = useLang();
  const t = copy[lang];

  return (
    <footer className="bg-surface-50 pt-16 pb-8 border-t border-surface-200">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-8 mb-16">
          {/* Logo & Description */}
          <div className="max-w-xs">
            <div className="mb-4">
              <Logo height={40} />
            </div>
            <p className="text-surface-500 text-sm mb-6 leading-relaxed">
              {t.tagline}
            </p>
            <div className="flex gap-4">
              <Link href="#" aria-label="Twitter" className="w-10 h-10 flex items-center justify-center rounded-full border border-surface-200 text-surface-500 hover:text-surface-900 hover:border-surface-300 transition-colors">
                <Icon name="twitter" size={18} />
              </Link>
              <Link href="#" aria-label="Instagram" className="w-10 h-10 flex items-center justify-center rounded-full border border-surface-200 text-surface-500 hover:text-surface-900 hover:border-surface-300 transition-colors">
                <Icon name="instagram" size={18} />
              </Link>
              <Link href="#" aria-label="LinkedIn" className="w-10 h-10 flex items-center justify-center rounded-full border border-surface-200 text-surface-500 hover:text-surface-900 hover:border-surface-300 transition-colors">
                <Icon name="linkedin" size={18} />
              </Link>
              <Link href="#" aria-label="GitHub" className="w-10 h-10 flex items-center justify-center rounded-full border border-surface-200 text-surface-500 hover:text-surface-900 hover:border-surface-300 transition-colors">
                <Icon name="github" size={18} />
              </Link>
            </div>
          </div>

          {/* Links grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-16">
            {/* Column 1 */}
            <div>
              <h3 className="font-semibold text-surface-900 mb-6">{t.colFitur}</h3>
              <ul className="flex flex-col gap-4">
                <li><Link href="/fitur/ai-matching" className="text-surface-500 hover:text-surface-900 text-sm transition-colors">{t.aiMatching}</Link></li>
                <li><Link href="/fitur/career-path" className="text-surface-500 hover:text-surface-900 text-sm transition-colors">{t.careerPath}</Link></li>
                <li><Link href="/fitur/skill-gap" className="text-surface-500 hover:text-surface-900 text-sm transition-colors">{t.skillGap}</Link></li>
                <li><Link href="/fitur/escrow" className="text-surface-500 hover:text-surface-900 text-sm transition-colors">{t.escrow}</Link></li>
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <h3 className="font-semibold text-surface-900 mb-6">{t.colCompany}</h3>
              <ul className="flex flex-col gap-4">
                <li><Link href="/perusahaan/tentang" className="text-surface-500 hover:text-surface-900 text-sm transition-colors">{t.about}</Link></li>
                <li><Link href="/global" className="text-surface-500 hover:text-surface-900 text-sm transition-colors">{t.global}</Link></li>
                <li><Link href="/perusahaan/karier" className="text-surface-500 hover:text-surface-900 text-sm transition-colors">{t.careers}</Link></li>
                <li><Link href="/perusahaan/kontak" className="text-surface-500 hover:text-surface-900 text-sm transition-colors">{t.contact}</Link></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h3 className="font-semibold text-surface-900 mb-6">{t.colResources}</h3>
              <ul className="flex flex-col gap-4">
                <li><Link href="/blog" className="text-surface-500 hover:text-surface-900 text-sm transition-colors">{t.blog}</Link></li>
                <li><Link href="/help" className="text-surface-500 hover:text-surface-900 text-sm transition-colors">{t.help}</Link></li>
                <li><Link href="/coming-soon" className="text-surface-500 hover:text-surface-900 text-sm transition-colors">{t.status}</Link></li>
              </ul>
            </div>

            {/* Column 4 */}
            <div>
              <h3 className="font-semibold text-surface-900 mb-6">{t.colLegal}</h3>
              <ul className="flex flex-col gap-4">
                <li><Link href="/legal/privacy" className="text-surface-500 hover:text-surface-900 text-sm transition-colors">{t.privacy}</Link></li>
                <li><Link href="/legal/terms" className="text-surface-500 hover:text-surface-900 text-sm transition-colors">{t.terms}</Link></li>
                <li><Link href="/legal/security" className="text-surface-500 hover:text-surface-900 text-sm transition-colors">{t.security}</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-surface-200">
          <p className="text-sm text-surface-400">
            {t.bottom}
          </p>
        </div>
      </div>
    </footer>
  );
}
