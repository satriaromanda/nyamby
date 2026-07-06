import Link from "next/link";
import { Icon } from "@/components/icons";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function EscrowPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-slate-900 font-sans">
      <Navbar />

      {/* 1. Hero */}
      <section className="pt-32 pb-20 px-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-400/20 rounded-full blur-[100px] -z-10 translate-x-1/3"></div>
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-semibold text-cyan-600 shadow-sm">
            <Icon name="spark" size={16} /> Keamanan Prioritas
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight">
            Kerja Tenang dengan <br className="hidden md:block"/>
            <span className="text-cyan-600">Sistem Pembayaran Escrow.</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Tidak ada lagi drama klien kabur atau freelancer menghilang. Dana diamankan oleh pihak ketiga (Nyamby) hingga pekerjaan selesai dan disetujui bersama.
          </p>
        </div>
      </section>

      {/* 2. Jaminan Keamanan */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-cyan-50 p-10 rounded-3xl border border-cyan-100">
              <Icon name="shield" size={48} className="text-cyan-600 mb-6" />
              <h3 className="text-2xl font-bold text-cyan-900 mb-4">Untuk Talenta</h3>
              <p className="text-slate-600 mb-6">
                Tidak perlu khawatir bekerja tanpa dibayar. Klien harus menyetorkan dana penuh sebelum pekerjaan dimulai. Fokus saja memberikan hasil terbaik.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm font-medium"><Icon name="check" className="text-cyan-500" size={18}/> Dana 100% diamankan di awal</li>
                <li className="flex items-center gap-2 text-sm font-medium"><Icon name="check" className="text-cyan-500" size={18}/> Pencairan otomatis bila disetujui</li>
                <li className="flex items-center gap-2 text-sm font-medium"><Icon name="check" className="text-cyan-500" size={18}/> Perlindungan dari pembatalan sepihak</li>
              </ul>
            </div>
            
            <div className="bg-slate-50 p-10 rounded-3xl border border-slate-200">
              <Icon name="briefcase" size={48} className="text-slate-600 mb-6" />
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Untuk Klien</h3>
              <p className="text-slate-600 mb-6">
                Uang Anda aman. Dana tidak akan diteruskan ke freelancer hingga Anda meninjau dan menyetujui hasil pekerjaannya sesuai kesepakatan.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm font-medium"><Icon name="check" className="text-slate-500" size={18}/> Hanya bayar untuk hasil yang disetujui</li>
                <li className="flex items-center gap-2 text-sm font-medium"><Icon name="check" className="text-slate-500" size={18}/> Sistem resolusi sengketa yang adil</li>
                <li className="flex items-center gap-2 text-sm font-medium"><Icon name="check" className="text-slate-500" size={18}/> Uang kembali jika freelancer wanprestasi</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Alur Transaksi */}
      <section className="py-24 px-6 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-16">Bagaimana Escrow Nyamby Bekerja?</h2>
          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting lines for desktop */}
            <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-slate-700 -z-10"></div>
            
            <div className="relative">
              <div className="w-24 h-24 mx-auto bg-slate-800 rounded-full flex items-center justify-center border-4 border-slate-900 mb-6">
                <Icon name="check" size={32} className="text-cyan-400" />
              </div>
              <h3 className="font-bold mb-2">1. Kesepakatan</h3>
              <p className="text-slate-400 text-sm">Klien dan talenta sepakat pada harga dan tenggat waktu.</p>
            </div>
            <div className="relative">
              <div className="w-24 h-24 mx-auto bg-slate-800 rounded-full flex items-center justify-center border-4 border-slate-900 mb-6">
                <Icon name="money" size={32} className="text-cyan-400" />
              </div>
              <h3 className="font-bold mb-2">2. Deposit Dana</h3>
              <p className="text-slate-400 text-sm">Klien menyetor dana ke rekening bersama Nyamby (Escrow).</p>
            </div>
            <div className="relative">
              <div className="w-24 h-24 mx-auto bg-slate-800 rounded-full flex items-center justify-center border-4 border-slate-900 mb-6">
                <Icon name="code" size={32} className="text-cyan-400" />
              </div>
              <h3 className="font-bold mb-2">3. Pengerjaan</h3>
              <p className="text-slate-400 text-sm">Talenta mulai bekerja dengan tenang karena dana sudah terjamin.</p>
            </div>
            <div className="relative">
              <div className="w-24 h-24 mx-auto bg-cyan-600 rounded-full flex items-center justify-center border-4 border-slate-900 mb-6 shadow-[0_0_30px_rgba(8,145,178,0.5)]">
                <Icon name="bolt" size={32} className="text-white" />
              </div>
              <h3 className="font-bold mb-2">4. Rilis Dana</h3>
              <p className="text-slate-400 text-sm">Pekerjaan disetujui, dana otomatis diteruskan ke talenta.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CTA */}
      <section className="bg-white py-20 px-6 text-center border-t border-slate-100">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900">Mulai Proyek Pertamamu dengan Aman</h2>
        <p className="text-slate-500 mb-8 max-w-xl mx-auto">
          Tinggalkan cara lama yang penuh risiko. Di Nyamby, semua pihak dilindungi.
        </p>
        <Link href="/register" className="btn-primary bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3.5 rounded-full font-bold shadow-xl transition-colors inline-block">
          Daftar Gratis Sekarang
        </Link>
      </section>

      <Footer />
    </div>
  );
}
