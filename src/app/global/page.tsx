"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon, Logo } from "@/components/icons";
import { Navbar } from "@/components/layout/Navbar";

/* ─── Cost Calculator ──────────────────────────────────────────── */

const BENCHMARK_RATES: Record<string, { min: number; max: number; median: number }> = {
  web_dev: { min: 15, max: 50, median: 28 },
  graphic_designer: { min: 12, max: 40, median: 22 },
};

const LOCAL_RATES_MYR: Record<string, { min: number; max: number }> = {
  web_dev: { min: 80, max: 200 },
  graphic_designer: { min: 60, max: 150 },
};

function CostCalculator() {
  const [category, setCategory] = useState<"web_dev" | "graphic_designer">("web_dev");
  const [hours, setHours] = useState(40);

  const nyambyRate = BENCHMARK_RATES[category];
  const localRate = LOCAL_RATES_MYR[category];

  const nyambyCostMin = hours * nyambyRate.min;
  const nyambyCostMax = hours * nyambyRate.max;
  const localCostMin = hours * localRate.min;
  const localCostMax = hours * localRate.max;

  const savingsMin = localCostMin - nyambyCostMax;
  const savingsMax = localCostMax - nyambyCostMin;
  const savingsPct = Math.round(((localCostMin - nyambyCostMax) / localCostMin) * 100);

  return (
    <div className="card p-8">
      <h3 className="text-xl font-bold text-surface-900 mb-6 flex items-center gap-2">
        <Icon name="money" size={20} />
        Cost Comparison Calculator
      </h3>

      <div className="space-y-6">
        <div>
          <label className="block text-sm text-surface-600 mb-2">Category</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "web_dev" as const, label: "Web Development" },
              { value: "graphic_designer" as const, label: "Graphic Design" },
            ].map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                className={`p-3 rounded-xl text-sm font-medium transition-all ${
                  category === c.value
                    ? "gradient-primary text-white"
                    : "bg-white border border-surface-200 text-surface-600 hover:border-primary-200"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-surface-600 mb-2">
            Estimated Hours: <strong>{hours}h</strong>
          </label>
          <input
            type="range"
            min={10}
            max={200}
            step={10}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-full accent-primary-500"
          />
          <div className="flex justify-between text-xs text-surface-400 mt-1">
            <span>10h</span>
            <span>200h</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="text-xs text-green-700 font-medium mb-1">Via Nyamby</p>
            <p className="text-lg font-bold text-green-800">
              ${nyambyCostMin.toLocaleString()} – ${nyambyCostMax.toLocaleString()}
            </p>
            <p className="text-xs text-green-600 mt-1">
              ${nyambyRate.min}–${nyambyRate.max}/hr (USD)
            </p>
          </div>
          <div className="p-4 rounded-xl bg-surface-50 border border-surface-200">
            <p className="text-xs text-surface-500 font-medium mb-1">Local Hire (MYR est.)</p>
            <p className="text-lg font-bold text-surface-700">
              RM {localCostMin.toLocaleString()} – RM {localCostMax.toLocaleString()}
            </p>
            <p className="text-xs text-surface-400 mt-1">
              RM {localRate.min}–RM {localRate.max}/hr
            </p>
          </div>
        </div>

        {savingsMin > 0 && (
          <div className="p-4 rounded-xl bg-primary-50 border border-primary-100 text-center">
            <p className="text-sm font-medium text-primary-700">
              💰 Potential savings: up to {savingsPct > 0 ? `${savingsPct}%` : "significant"} compared to local hire
            </p>
          </div>
        )}

        <p className="text-xs text-surface-400 italic">
          ⚠️ These are preliminary estimates based on secondary research of the SEA freelance market, not verified Nyamby transaction data. Rates will be updated automatically as real export job data becomes available.
        </p>
      </div>
    </div>
  );
}

/* ─── Main Page ────────────────────────────────────────────────── */

export default function GlobalLandingPage() {
  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero relative overflow-hidden">
        <div className="gradient-glow absolute inset-0" />
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-surface-200 text-sm text-surface-600 mb-8 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" />
              Now serving Malaysia & Southeast Asia
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-surface-900 leading-tight mb-6">
              Hire Verified{" "}
              <span className="gradient-text">Indonesian Talent</span>
              <br />at Competitive Rates
            </h1>

            <p className="text-lg text-surface-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Access Indonesia&apos;s best digital professionals — web developers, graphic designers — matched by AI, protected by escrow, at rates that make sense for your business.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register?role=client&country=malaysia"
                className="btn-primary text-base px-8 py-4 rounded-2xl w-full sm:w-auto"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <Icon name="briefcase" size={18} />
                  Post a Job — It&apos;s Free
                </span>
              </Link>
              <a
                href="#how-it-works"
                className="btn-secondary text-base px-8 py-4 rounded-2xl w-full sm:w-auto"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <Icon name="info" size={18} />
                  How It Works
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Why Nyamby */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-surface-900 mb-4">
              Why Malaysian Businesses Choose Nyamby
            </h2>
            <p className="text-surface-500 max-w-2xl mx-auto">
              We bridge the talent gap between Indonesia&apos;s deep pool of digital professionals and Southeast Asian businesses that need quality work at fair prices.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "ai" as const,
                title: "AI-Powered Matching",
                desc: "Our AI analyzes skills, portfolio quality, and work style to recommend the top talent for your specific project — no endless browsing needed.",
                accent: "bg-primary-50 text-primary-600",
              },
              {
                icon: "shield" as const,
                title: "Secure Escrow Payment",
                desc: "Your payment is held safely in escrow until you're satisfied with the work. Transparent process, full dispute resolution support.",
                accent: "bg-green-50 text-green-600",
              },
              {
                icon: "trendingUp" as const,
                title: "Competitive Pricing",
                desc: "Access top-quality Indonesian talent at rates significantly lower than local Malaysian freelancers — without compromising on quality.",
                accent: "bg-amber-50 text-amber-600",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-100 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.1)] p-8 card-hover"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${feature.accent}`}>
                  <Icon name={feature.icon} size={22} />
                </div>
                <h3 className="text-lg font-bold text-surface-900 mb-3">{feature.title}</h3>
                <p className="text-sm text-surface-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-surface-900 mb-4">
              How It Works
            </h2>
            <p className="text-surface-500">Get started in minutes, not weeks.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Post Your Job",
                desc: "Describe your project in English. Set your budget in MYR, SGD, or USD.",
                icon: "briefcase" as const,
              },
              {
                step: "02",
                title: "AI Finds Talent",
                desc: "Our matching engine evaluates all talents and recommends the best fits within seconds.",
                icon: "ai" as const,
              },
              {
                step: "03",
                title: "Secure Payment",
                desc: "Funds are held in escrow. Talent works with peace of mind, you pay only for quality.",
                icon: "lock" as const,
              },
              {
                step: "04",
                title: "Review & Release",
                desc: "Approve the work and release payment. Rate your talent to help the community.",
                icon: "check" as const,
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl gradient-primary flex items-center justify-center text-white mb-4">
                  <Icon name={item.icon} size={24} />
                </div>
                <div className="text-xs font-bold text-primary-500 mb-2">{item.step}</div>
                <h3 className="text-base font-bold text-surface-900 mb-2">{item.title}</h3>
                <p className="text-sm text-surface-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cost Calculator */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-surface-900 mb-4">
              See How Much You Can Save
            </h2>
            <p className="text-surface-500">
              Compare estimated costs between hiring through Nyamby vs. local Malaysian freelancers.
            </p>
          </div>
          <CostCalculator />
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-surface-900 mb-12">
            Built for Cross-Border Trust
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "shield" as const,
                title: "Verified Talent",
                desc: "Every talent goes through portfolio analysis, skill verification, and AI quality scoring.",
              },
              {
                icon: "lock" as const,
                title: "Escrow Protection",
                desc: "Payments are held securely until work is approved. Full dispute resolution if needed.",
              },
              {
                icon: "spark" as const,
                title: "Business Verification",
                desc: "Cross-border clients go through a lightweight business check for mutual trust.",
              },
            ].map((item, i) => (
              <div key={i} className="p-6">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-surface-100 flex items-center justify-center text-surface-600 mb-4">
                  <Icon name={item.icon} size={24} />
                </div>
                <h3 className="font-bold text-surface-900 mb-2">{item.title}</h3>
                <p className="text-sm text-surface-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card p-12">
            <h2 className="text-3xl font-bold text-surface-900 mb-4">
              Ready to Hire Indonesian Talent?
            </h2>
            <p className="text-surface-500 mb-8 max-w-xl mx-auto">
              Post your first job for free. Our AI will match you with the best available professionals in under 60 seconds.
            </p>
            <Link
              href="/register?role=client&country=malaysia"
              className="btn-primary text-base px-10 py-4 rounded-2xl inline-flex items-center gap-2"
            >
              <Icon name="briefcase" size={18} />
              Post a Job — Get Started
            </Link>
            <p className="text-xs text-surface-400 mt-4">
              No credit card required • Free to post • Pay only when you hire
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-100 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo height={24} />
            <span className="text-xs text-surface-400">Global</span>
          </div>
          <p className="text-xs text-surface-400">
            © {new Date().getFullYear()} Nyamby. AI-Powered Talent Platform from Indonesia.
          </p>
          <div className="flex gap-4">
            <Link href="/" className="text-xs text-surface-400 hover:text-surface-600">
              Bahasa Indonesia
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
