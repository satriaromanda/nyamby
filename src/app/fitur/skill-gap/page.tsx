import Link from "next/link";
import { Icon } from "@/components/icons";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function SkillGapPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-slate-900 font-sans">
      <Navbar />

      {/* 1. Hero */}
      <section className="pt-32 pb-20 px-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-400/20 rounded-full blur-[100px] -z-10 translate-x-1/3"></div>
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-semibold text-amber-600 shadow-sm">
            <Icon name="spark" size={16} /> Fitur Unggulan
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight">
            Tutup Celah Karier dengan <br className="hidden md:block"/>
            <span className="text-amber-600">Skill Gap Analysis.</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Cari tahu mengapa Anda sering ditolak. AI menganalisis profil Anda dan membandingkannya dengan permintaan pasar untuk menemukan keterampilan apa yang masih kurang.
          </p>
        </div>
      </section>

      {/* 2. Mengapa Penting */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 bg-amber-50 p-8 rounded-3xl border border-amber-100 flex items-center justify-center min-h-[300px]">
            <div className="space-y-4 w-full">
              <div className="flex justify-between text-sm font-bold text-slate-700"><span>React JS</span> <span>80%</span></div>
              <div className="w-full h-2 bg-slate-200 rounded-full"><div className="w-[80%] h-full bg-emerald-500 rounded-full"></div></div>
              
              <div className="flex justify-between text-sm font-bold text-slate-700 mt-4"><span>TypeScript (Dibutuhkan Pasar)</span> <span className="text-amber-600">Kurang</span></div>
              <div className="w-full h-2 bg-slate-200 rounded-full"><div className="w-[20%] h-full bg-amber-500 rounded-full"></div></div>
              
              <div className="flex justify-between text-sm font-bold text-slate-700 mt-4"><span>Next.js App Router</span> <span className="text-red-500">Kritis</span></div>
              <div className="w-full h-2 bg-slate-200 rounded-full"><div className="w-[0%] h-full bg-red-500 rounded-full"></div></div>
            </div>
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <h2 className="text-3xl font-bold mb-4">Berhenti Menebak Kenapa Ditolak</h2>
            <p className="text-slate-500">
              Banyak talenta tidak tahu mengapa profil mereka tidak pernah dipanggil klien. Seringkali, masalahnya ada pada 1 atau 2 skill spesifik yang sedang tren tapi belum mereka kuasai.
            </p>
            <p className="text-slate-500">
              Sistem kami memindai ribuan lowongan pekerjaan untuk mengetahui *precisely* apa yang diinginkan klien saat ini.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Laporan Detail */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Apa yang Anda Dapatkan?</h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <Icon name="search" className="text-amber-500 mb-4" size={32} />
              <h3 className="font-bold text-lg mb-2">Audit Profil Otomatis</h3>
              <p className="text-slate-500 text-sm">AI membedah CV, portofolio, dan repository Anda untuk mendeteksi *hard skill* dan *soft skill* yang Anda miliki secara objektif.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <Icon name="chart" className="text-amber-500 mb-4" size={32} />
              <h3 className="font-bold text-lg mb-2">Pemetaan Tren Industri</h3>
              <p className="text-slate-500 text-sm">Data real-time mengenai apa yang paling sering dicari oleh klien di kategori Anda (misal: UI/UX, Web Dev, dll).</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <Icon name="check" className="text-amber-500 mb-4" size={32} />
              <h3 className="font-bold text-lg mb-2">Skor Kelengkapan Profil</h3>
              <p className="text-slate-500 text-sm">Angka pasti (0-100) seberapa siap profil Anda bersaing di pasar kerja saat ini.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Rekomendasi Pelatihan */}
      <section className="py-24 px-6 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl font-bold">Bukan Hanya Masalah, Tapi Solusi.</h2>
            <p className="text-slate-400 text-lg">
              Setelah menemukan *skill gap*, AI Nyamby akan secara otomatis menyarankan materi pembelajaran, kursus, atau proyek portofolio mini untuk menutup celah tersebut.
            </p>
          </div>
          <div className="flex-1 bg-slate-800 p-8 rounded-3xl border border-slate-700">
             <div className="text-sm text-slate-400 mb-4">Rekomendasi AI untuk Anda:</div>
             <div className="bg-slate-700 p-4 rounded-xl flex items-center justify-between mb-3">
               <div><div className="font-bold">Belajar React Hooks</div><div className="text-xs text-slate-400">Durasi: 3 Jam</div></div>
               <Icon name="arrowRight" className="text-amber-400" />
             </div>
             <div className="bg-slate-700 p-4 rounded-xl flex items-center justify-between">
               <div><div className="font-bold">Proyek Clone Twitter UI</div><div className="text-xs text-slate-400">Tingkatkan Portofolio Tailwind</div></div>
               <Icon name="arrowRight" className="text-amber-400" />
             </div>
          </div>
        </div>
      </section>

      {/* 5. CTA */}
      <section className="bg-white py-20 px-6 text-center border-t border-slate-100">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900">Ketahui Kekuranganmu Hari Ini</h2>
        <p className="text-slate-500 mb-8 max-w-xl mx-auto">
          Analisis profil Anda hanya butuh 3 menit. Temukan celah karier Anda sekarang.
        </p>
        <Link href="/register" className="btn-primary bg-amber-500 hover:bg-amber-600 text-white px-8 py-3.5 rounded-full font-bold shadow-xl transition-colors inline-block">
          Analisis Profil Saya
        </Link>
      </section>

      <Footer />
    </div>
  );
}
