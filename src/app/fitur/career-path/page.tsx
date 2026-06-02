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
            <Icon name="spark" size={16} /> Fitur Unggulan
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight">
            Visualisasikan <br className="hidden md:block"/>
            <span className="text-emerald-600">Jejak Kariermu.</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Dari junior developer menjadi Tech Lead, atau dari nyambi desain menjadi Creative Director. AyoNyamby membantu memetakan langkah konkret untuk mencapai tujuanmu.
          </p>
        </div>
      </section>

      {/* 2. Visualisasi */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold mb-4">Peta Jalan yang Jelas</h2>
            <p className="text-slate-500">
              Berhenti menebak-nebak skill apa yang harus dipelajari selanjutnya. AI kami menganalisis tren industri dan data ribuan profesional sukses untuk merancang peta jalan karier (Career Path) khusus untuk Anda.
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

      {/* 3. Mentor Guidance */}
      <section className="py-24 px-6 bg-slate-900 text-white text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <Icon name="ai" size={48} className="text-emerald-400 mx-auto" />
          <h2 className="text-3xl md:text-4xl font-bold">AI sebagai Mentor Pribadimu</h2>
          <p className="text-slate-400 text-lg">
            Tidak hanya memberi daftar tugas, AI kami bertindak seperti mentor. Ia akan memberi saran saat Anda terjebak, menyarankan proyek portofolio yang cocok, dan memotivasi Anda.
          </p>
        </div>
      </section>

      {/* 4. Success Stories */}
      <section className="py-24 px-6 bg-white">
         <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12">Cerita Sukses</h2>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="p-8 border border-slate-100 rounded-3xl shadow-sm">
                <div className="flex gap-1 text-amber-400 mb-4">
                  <Icon name="star" fill="currentColor" /><Icon name="star" fill="currentColor" /><Icon name="star" fill="currentColor" /><Icon name="star" fill="currentColor" /><Icon name="star" fill="currentColor" />
                </div>
                <p className="text-slate-700 italic mb-6">"Saya bingung setelah lulus kuliah. Fitur Career Path memberi saya arahan spesifik apa yang harus dipelajari. Dalam 6 bulan, saya dapat job freelance bergaji tinggi pertama saya."</p>
                <div className="font-bold">Siti Aisyah</div>
                <div className="text-sm text-slate-500">UI/UX Designer</div>
              </div>
              <div className="p-8 border border-slate-100 rounded-3xl shadow-sm">
                <div className="flex gap-1 text-amber-400 mb-4">
                  <Icon name="star" fill="currentColor" /><Icon name="star" fill="currentColor" /><Icon name="star" fill="currentColor" /><Icon name="star" fill="currentColor" /><Icon name="star" fill="currentColor" />
                </div>
                <p className="text-slate-700 italic mb-6">"Peta jalan dari Nambi sangat realistis dan berbasis data industri. Saya jadi tahu bahwa mempelajari TypeScript akan meningkatkan peluang saya hingga 40%."</p>
                <div className="font-bold">Kevin Wijaya</div>
                <div className="text-sm text-slate-500">Fullstack Developer</div>
              </div>
            </div>
         </div>
      </section>

      {/* 5. CTA */}
      <section className="bg-emerald-600 text-white py-20 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Mulai Rancang Kariermu</h2>
        <p className="text-emerald-100 mb-8 max-w-xl mx-auto">Gabung sekarang dan biarkan AI memandu perjalanan karier profesionalmu.</p>
        <Link href="/register" className="bg-white text-emerald-700 px-8 py-3.5 rounded-full font-bold shadow-xl hover:bg-slate-50 transition-colors inline-block">
          Buat Peta Karier Saya
        </Link>
      </section>

      <Footer />
    </div>
  );
}
