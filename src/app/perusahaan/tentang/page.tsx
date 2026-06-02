import Link from "next/link";
import { Icon } from "@/components/icons";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function TentangKamiPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-slate-900 font-sans">
      <Navbar />

      {/* 1. Hero */}
      <section className="pt-32 pb-20 px-6 overflow-hidden relative">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-sm font-semibold text-slate-600">
            Misi Kami
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900">
            Mengubah "Nyambi" <br className="hidden md:block"/>
            Menjadi <span className="text-primary-600">Karier Profesional.</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            AyoNyamby lahir dari sebuah keresahan: banyak talenta digital luar biasa di Indonesia yang kesulitan menembus pasar kerja profesional, hanya karena mereka memulainya dari "nyambi" (pekerjaan sampingan).
          </p>
        </div>
      </section>

      {/* 2. Latar Belakang */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 relative">
            <div className="absolute top-4 -left-4 w-full h-full bg-primary-100 rounded-3xl -z-10"></div>
            <img src="/images/hero-mascot.png" alt="Tentang AyoNyamby" className="w-full rounded-3xl object-cover bg-slate-50 border border-slate-200" />
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <h2 className="text-3xl font-bold mb-4">Cerita di Balik AyoNyamby</h2>
            <p className="text-slate-500 leading-relaxed">
              Semua berawal dari Bandar Lampung. Kami melihat teman-teman mahasiswa dan pekerja *part-time* yang memiliki skill *coding* dan desain kelas dunia, namun terjebak dalam *loop* lowongan kerja yang mensyaratkan "Pengalaman 5 Tahun".
            </p>
            <p className="text-slate-500 leading-relaxed">
              Portofolio mereka luar biasa, tapi sering diremehkan karena tidak punya *title* korporat. Dari situlah kami membangun AyoNyamby: sebuah jembatan bertenaga AI yang menilai seseorang murni dari **apa yang bisa mereka lakukan**, bukan sekadar apa yang tertulis di CV formal mereka.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Value Perusahaan */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-16">Nilai yang Kami Pegang</h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 flex items-center justify-center rounded-2xl mb-6">
                <Icon name="check" size={24} />
              </div>
              <h3 className="font-bold text-xl mb-3">Meritokrasi Murni</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Kami percaya bakat ada di mana-mana. Sistem kami buta terhadap latar belakang kampus atau perusahaan lama, dan hanya fokus pada *skill* aktual.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 flex items-center justify-center rounded-2xl mb-6">
                <Icon name="shield" size={24} />
              </div>
              <h3 className="font-bold text-xl mb-3">Keamanan Bersama</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Tidak ada pihak yang dirugikan. Escrow kami menjamin talenta dibayar atas keringatnya, dan klien mendapat hasil sesuai janjinya.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 flex items-center justify-center rounded-2xl mb-6">
                <Icon name="chart" size={24} />
              </div>
              <h3 className="font-bold text-xl mb-3">Pertumbuhan Agresif</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Kami bukan sekadar *job portal*. Kami adalah inkubator karier Anda dengan fitur analisis dan rute belajar berkelanjutan.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Tim */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Bertemu dengan Tim</h2>
          <p className="text-slate-500 mb-16 max-w-2xl mx-auto">Kami adalah sekumpulan desainer, *engineer*, dan pemimpi yang pernah berada di posisi Anda—memulai semuanya dari nyambi.</p>
          <div className="grid md:grid-cols-4 gap-8">
            {[1,2,3,4].map((i) => (
               <div key={i} className="space-y-4">
                 <div className="w-32 h-32 mx-auto bg-slate-200 rounded-full overflow-hidden">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=NyambyTeam${i}`} alt="Team Member" />
                 </div>
                 <div>
                   <h3 className="font-bold text-slate-900">Founder {i}</h3>
                   <p className="text-sm text-primary-600">Position {i}</p>
                 </div>
               </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CTA */}
      <section className="bg-slate-900 text-white py-20 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Bergabung dalam Revolusi Ini</h2>
        <p className="text-slate-400 mb-8 max-w-xl mx-auto">
          Jadilah bagian dari ribuan talenta digital Indonesia yang sedang merintis masa depan mereka bersama kami.
        </p>
        <Link href="/register" className="btn-primary px-8 py-3.5 rounded-full font-bold shadow-xl transition-colors inline-block">
          Daftar Sekarang
        </Link>
      </section>

      <Footer />
    </div>
  );
}
