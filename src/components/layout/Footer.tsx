import Link from "next/link";
import { Icon, Logo } from "@/components/icons";

export function Footer() {
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
              AI Career Companion untuk talenta Indonesia. Dari nyambi menjadi karier.
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
              <h3 className="font-semibold text-surface-900 mb-6">Fitur</h3>
              <ul className="flex flex-col gap-4">
                <li><Link href="/fitur/ai-matching" className="text-surface-500 hover:text-surface-900 text-sm transition-colors">AI Matching</Link></li>
                <li><Link href="/fitur/career-path" className="text-surface-500 hover:text-surface-900 text-sm transition-colors">Career Path</Link></li>
                <li><Link href="/fitur/skill-gap" className="text-surface-500 hover:text-surface-900 text-sm transition-colors">Skill Gap Analysis</Link></li>
                <li><Link href="/fitur/escrow" className="text-surface-500 hover:text-surface-900 text-sm transition-colors">Escrow Aman</Link></li>
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <h3 className="font-semibold text-surface-900 mb-6">Perusahaan</h3>
              <ul className="flex flex-col gap-4">
                <li><Link href="/perusahaan/tentang" className="text-surface-500 hover:text-surface-900 text-sm transition-colors">Tentang</Link></li>
                <li><Link href="/coming-soon" className="text-surface-500 hover:text-surface-900 text-sm transition-colors">Karier</Link></li>
                <li><Link href="/coming-soon" className="text-surface-500 hover:text-surface-900 text-sm transition-colors">Kontak</Link></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h3 className="font-semibold text-surface-900 mb-6">Resources</h3>
              <ul className="flex flex-col gap-4">
                <li><Link href="/coming-soon" className="text-surface-500 hover:text-surface-900 text-sm transition-colors">Blog</Link></li>
                <li><Link href="/coming-soon" className="text-surface-500 hover:text-surface-900 text-sm transition-colors">Help</Link></li>
                <li><Link href="/coming-soon" className="text-surface-500 hover:text-surface-900 text-sm transition-colors">Status</Link></li>
              </ul>
            </div>

            {/* Column 4 */}
            <div>
              <h3 className="font-semibold text-surface-900 mb-6">Legal</h3>
              <ul className="flex flex-col gap-4">
                <li><Link href="/coming-soon" className="text-surface-500 hover:text-surface-900 text-sm transition-colors">Privacy</Link></li>
                <li><Link href="/coming-soon" className="text-surface-500 hover:text-surface-900 text-sm transition-colors">Terms</Link></li>
                <li><Link href="/coming-soon" className="text-surface-500 hover:text-surface-900 text-sm transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-surface-200">
          <p className="text-sm text-surface-400">
            © 2026 Nyamby. Dibuat dengan ❤️ di Bandar Lampung
          </p>
        </div>
      </div>
    </footer>
  );
}
