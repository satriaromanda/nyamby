import Link from "next/link";
import { Icon } from "@/components/icons";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function AiMatchingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-slate-900 font-sans">
      <Navbar />

      {/* 1. Hero Section */}
      <section className="pt-32 pb-20 px-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-400/20 rounded-full blur-[100px] -z-10 translate-x-1/3"></div>
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-semibold text-primary-600 shadow-sm">
            <Icon name="spark" size={16} /> Fitur Unggulan
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight">
            AI Job Matching yang <br className="hidden md:block"/>
            <span className="text-primary-600">Mengerti Konteks Kariermu.</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Sistem kami tidak sekadar mencocokkan kata kunci. AI Nyamby membaca pengalaman, menganalisis gaya portofolio, dan memberikan skor relevansi yang sangat akurat untuk setiap kandidat.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link href="/register" className="btn-primary px-8 py-3 rounded-full font-medium text-sm shadow-lg hover:-translate-y-0.5 transition-transform">
              Coba Gratis Sekarang
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Masalah vs Solusi */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Mengapa AI Matching Berbeda?</h2>
            <p className="text-slate-500">Tinggalkan cara lama yang membuang banyak waktu.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl bg-red-50 border border-red-100">
              <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
                <Icon name="x" size={20} /> Cara Lama
              </h3>
              <ul className="space-y-4 text-slate-700">
                <li>Menyaring ratusan CV PDF secara manual.</li>
                <li>Hanya mencari kecocokan "keyword" (misal: React), walau pengalaman tidak relevan.</li>
                <li>Banyak kandidat *spam* yang melamar membabi buta.</li>
                <li>Sulit menilai kualitas *soft-skill* dari tulisan.</li>
              </ul>
            </div>
            <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-100 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <Icon name="spark" size={120} />
              </div>
              <h3 className="text-xl font-bold text-emerald-700 mb-4 flex items-center gap-2">
                <Icon name="check" size={20} /> Cara Nyamby
              </h3>
              <ul className="space-y-4 text-slate-700 relative z-10">
                <li>AI menganalisis portofolio dan repo Github secara instan.</li>
                <li>Memahami *konteks* pekerjaan dan memberi skor akurasi (0-100%).</li>
                <li>Otomatis memfilter kandidat yang tidak relevan secara semantik.</li>
                <li>Menyediakan ringkasan "Kekuatan & Kelemahan" untuk setiap kandidat.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Cara Kerja */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Bagaimana Ini Bekerja?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Ekstraksi Konteks", desc: "Klien memposting pekerjaan, dan AI mengekstrak kompetensi inti yang benar-benar dibutuhkan, bukan cuma judul." },
              { step: "2", title: "Vector Search", desc: "Kami mencari di database talenta menggunakan semantic search, menemukan orang yang punya pengalaman serupa." },
              { step: "3", title: "Scoring & Insight", desc: "Setiap kandidat diberi skor kecocokan, beserta insight spesifik mengapa mereka cocok untuk proyek tersebut." }
            ].map((s, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative pt-12">
                <div className="absolute top-0 -translate-y-1/2 w-12 h-12 bg-primary-600 text-white font-bold text-xl rounded-full flex items-center justify-center border-4 border-slate-50">
                  {s.step}
                </div>
                <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Statistik / Testimonial */}
      <section className="py-24 px-6 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl font-bold leading-tight">Menghemat <span className="text-primary-600">80% Waktu</span> Rekrutmen</h2>
            <p className="text-slate-500 text-lg">
              Klien kami melaporkan penurunan drastis dalam waktu yang dihabiskan untuk *screening* kandidat. Dengan AI Matching, Anda langsung berhadapan dengan top 5% talenta.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <div className="w-12 h-12 rounded-full bg-slate-200"></div>
              <div>
                <p className="font-bold">Budi Santoso</p>
                <p className="text-sm text-slate-500">Tech Lead di Startup X</p>
              </div>
            </div>
            <p className="italic text-slate-600">"Biasanya butuh 2 minggu cari freelancer React yang pas. Pake Nyamby, hari itu juga dapet 3 kandidat dengan skor 95%+ dan langsung interview."</p>
          </div>
          <div className="flex-1 w-full bg-slate-100 rounded-3xl p-8 flex items-center justify-center min-h-[300px]">
            <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm space-y-4">
              <div className="flex justify-between items-center border-b pb-4">
                <div className="font-bold">Kandidat Teratas</div>
                <div className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-1 rounded">Top Match</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">A</div>
                <div>
                  <div className="font-semibold text-sm">Andi Setiawan</div>
                  <div className="text-xs text-slate-500">Fullstack Engineer</div>
                </div>
                <div className="ml-auto text-emerald-600 font-bold">98%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA */}
      <section className="bg-primary-900 text-white py-20 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Siap Menemukan Kecocokan yang Tepat?</h2>
        <p className="text-primary-200 mb-8 max-w-xl mx-auto">
          Daftar sekarang dan biarkan AI kami bekerja untuk Anda.
        </p>
        <Link href="/register" className="bg-white text-primary-900 px-8 py-3.5 rounded-full font-bold shadow-xl hover:bg-slate-50 transition-colors inline-block">
          Mulai Pencarian
        </Link>
      </section>

      <Footer />
    </div>
  );
}
