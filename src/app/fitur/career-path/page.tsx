import Link from "next/link";
import { Icon } from "@/components/icons";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function CareerPathPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-slate-900 font-sans">
      <Navbar />

      {/* 1. Hero */}
      <section className="pt-32 pb-20 px-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/20 rounded-full blur-[100px] -z-10 translate-x-1/3"></div>
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-semibold text-emerald-600 shadow-sm">
            <Icon name="spark" size={16} /> Coming Soon
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight">
            Visualisasikan <br className="hidden md:block"/>
            <span className="text-emerald-600">Jejak Kariermu.</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Dari junior developer menjadi Tech Lead, atau dari nyambi desain menjadi Creative Director. Fitur ini sedang kami bangun — belum tersedia di akun Nyamby kamu hari ini.
          </p>
        </div>
      </section>

      {/* 2. Visualisasi */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold mb-4">Peta Jalan yang Jelas</h2>
            <p className="text-slate-500">
              Rencananya: AI akan menganalisis tren industri untuk merancang peta jalan karier (Career Path) khusus untukmu, seperti mockup di samping. Fitur ini masih dalam pengembangan dan belum bisa dipakai.
            </p>
            <ul className="space-y-3 pt-4">
              <li className="flex items-center gap-3"><Icon name="check" className="text-emerald-500" /> Milestone yang terukur</li>
              <li className="flex items-center gap-3"><Icon name="check" className="text-emerald-500" /> Rekomendasi sertifikasi</li>
              <li className="flex items-center gap-3"><Icon name="check" className="text-emerald-500" /> Estimasi gaji di setiap level</li>
            </ul>
          </div>
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col gap-4">
             {/* Mockup UI Career Path */}
             <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
               <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><Icon name="check" /></div>
               <div><div className="font-bold">Junior Frontend</div><div className="text-xs text-slate-500">Tercapai</div></div>
             </div>
             <div className="w-1 h-6 bg-emerald-200 ml-9"></div>
             <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-md border-2 border-emerald-500">
               <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white"><Icon name="target" /></div>
               <div><div className="font-bold">Mid-Level React Dev</div><div className="text-xs text-slate-500">Target Saat Ini (Sedang Dipelajari)</div></div>
             </div>
             <div className="w-1 h-6 bg-slate-200 ml-9"></div>
             <div className="flex items-center gap-4 p-4 bg-white rounded-xl opacity-60">
               <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center"><Icon name="lock" /></div>
               <div><div className="font-bold">Senior Frontend / Tech Lead</div><div className="text-xs text-slate-500">Tujuan Akhir</div></div>
             </div>
          </div>
        </div>
      </section>

      {/* 3. Rencana ke depan */}
      <section className="py-24 px-6 bg-slate-900 text-white text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <Icon name="ai" size={48} className="text-emerald-400 mx-auto" />
          <h2 className="text-3xl md:text-4xl font-bold">AI sebagai Mentor Pribadimu</h2>
          <p className="text-slate-400 text-lg">
            Rencananya, AI tidak hanya memberi daftar tugas — ia akan bertindak seperti mentor: memberi saran saat kamu terjebak, menyarankan proyek portofolio yang cocok, dan membantu memantau progres. Fitur ini belum aktif.
          </p>
        </div>
      </section>

      {/* 4. CTA */}
      <section className="bg-emerald-600 text-white py-20 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Mau Dikabari Saat Fitur Ini Siap?</h2>
        <p className="text-emerald-100 mb-8 max-w-xl mx-auto">Sementara itu, kamu tetap bisa pakai Skill Gap Analysis dan AI Matching yang sudah aktif di dashboard Nyamby.</p>
        <Link href="/talent/dashboard" className="bg-white text-emerald-700 px-8 py-3.5 rounded-full font-bold shadow-xl hover:bg-slate-50 transition-colors inline-block">
          Ke Dashboard Saya
        </Link>
      </section>

      <Footer />
    </div>
  );
}
