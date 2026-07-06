import Link from "next/link";
import { Icon } from "@/components/icons";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const sections = [
  {
    id: "ketentuan-umum",
    title: "1. Ketentuan Umum",
    content: [
      "Selamat datang di Nyamby. Dengan mengakses dan menggunakan platform Nyamby, Anda menyetujui untuk terikat oleh Syarat & Ketentuan ini.",
      "• Nyamby adalah platform marketplace talenta berbasis AI yang menghubungkan penyedia jasa (\"Talenta\") dengan pencari jasa (\"Klien\").",
      "• Kami berhak memperbarui ketentuan ini dari waktu ke waktu. Perubahan akan diberitahukan melalui email atau notifikasi di platform.",
      "• Jika Anda tidak menyetujui perubahan, Anda dapat menghentikan penggunaan layanan dan menutup akun Anda.",
    ],
  },
  {
    id: "akun",
    title: "2. Akun Pengguna",
    content: [
      "• Anda harus berusia minimal 17 tahun atau memiliki izin orang tua/wali untuk menggunakan Nyamby.",
      "• Satu orang hanya boleh memiliki satu akun aktif.",
      "• Anda bertanggung jawab menjaga kerahasiaan kredensial akun Anda.",
      "• Informasi yang diberikan saat pendaftaran harus akurat dan terkini.",
      "• Kami berhak menangguhkan atau menonaktifkan akun yang melanggar ketentuan ini.",
    ],
  },
  {
    id: "layanan",
    title: "3. Penggunaan Layanan",
    content: [
      "Anda setuju untuk menggunakan Nyamby hanya untuk tujuan yang sah. Secara khusus, Anda dilarang:",
      "• Memberikan informasi palsu atau menyesatkan dalam profil atau proposal.",
      "• Melakukan transaksi di luar platform untuk menghindari sistem escrow.",
      "• Mengirim spam, konten ofensif, atau melakukan pelecehan terhadap pengguna lain.",
      "• Menggunakan bot, scraper, atau alat otomatis lainnya tanpa izin tertulis.",
      "• Mencoba mengakses akun pengguna lain atau sistem internal platform.",
      "• Menawarkan atau meminta layanan yang melanggar hukum Indonesia.",
    ],
  },
  {
    id: "pembayaran",
    title: "4. Pembayaran & Escrow",
    content: [
      "• Semua transaksi di Nyamby difasilitasi melalui sistem escrow untuk melindungi kedua belah pihak.",
      "• Dana dari Klien akan ditahan di escrow saat project dimulai dan dirilis ke Talenta setelah pekerjaan disetujui.",
      "• Nyamby mengenakan biaya layanan sebesar persentase yang ditentukan dari nilai transaksi. Besaran biaya ditampilkan secara transparan sebelum transaksi.",
      "• Penarikan dana mengikuti jadwal dan metode yang tersedia di platform.",
      "• Dalam kasus dispute, dana tetap ditahan di escrow hingga mediasi selesai.",
    ],
  },
  {
    id: "hki",
    title: "5. Hak Kekayaan Intelektual",
    content: [
      "• Konten yang Anda upload ke platform (portfolio, CV, deskripsi) tetap menjadi hak milik Anda.",
      "• Dengan mengupload konten, Anda memberikan Nyamby lisensi non-eksklusif untuk menampilkan konten tersebut di platform.",
      "• Merek dagang, logo, desain, dan teknologi Nyamby dilindungi oleh hukum kekayaan intelektual.",
      "• Hasil kerja project yang diselesaikan melalui platform menjadi milik Klien setelah pembayaran penuh, kecuali disepakati lain.",
    ],
  },
  {
    id: "pembatasan",
    title: "6. Pembatasan Tanggung Jawab",
    content: [
      "• Nyamby adalah platform penghubung dan tidak bertanggung jawab atas kualitas pekerjaan yang dilakukan oleh Talenta.",
      "• Kami tidak menjamin kecocokan atau keberhasilan setiap matching AI, meskipun kami berusaha memberikan rekomendasi terbaik.",
      "• Nyamby tidak bertanggung jawab atas kerugian tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan platform.",
      "• Dalam keadaan apa pun, total kewajiban Nyamby tidak melebihi jumlah biaya layanan yang Anda bayarkan dalam 12 bulan terakhir.",
    ],
  },
  {
    id: "penghentian",
    title: "7. Penghentian Layanan",
    content: [
      "• Anda dapat menutup akun kapan saja melalui pengaturan akun.",
      "• Kami berhak menangguhkan atau menghentikan akun Anda jika terdapat pelanggaran terhadap ketentuan ini.",
      "• Penangguhan otomatis terjadi jika akun menerima 3 atau lebih laporan pelanggaran.",
      "• Setelah penghentian, Anda tetap bertanggung jawab atas kewajiban yang belum diselesaikan (termasuk project aktif dan pembayaran tertunda).",
    ],
  },
  {
    id: "hukum",
    title: "8. Hukum yang Berlaku",
    content: [
      "• Syarat & Ketentuan ini diatur dan ditafsirkan sesuai dengan hukum Negara Republik Indonesia.",
      "• Segala perselisihan yang timbul akan diselesaikan terlebih dahulu melalui musyawarah.",
      "• Jika musyawarah tidak mencapai kesepakatan, perselisihan akan diselesaikan melalui Badan Arbitrase Nasional Indonesia (BANI).",
    ],
  },
  {
    id: "kontak",
    title: "9. Kontak",
    content: [
      "Untuk pertanyaan mengenai Syarat & Ketentuan ini, hubungi kami:",
      "• **Email**: legal@nyamby.id",
      "• **Alamat**: Nyamby HQ, Bandar Lampung, Lampung, Indonesia",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-slate-900 font-sans">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <Link href="/legal/privacy" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-8">
            <Icon name="arrowLeft" size={14} /> Kembali ke Legal
          </Link>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
            Syarat & Ketentuan
          </h1>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>Terakhir diperbarui: 1 Juni 2026</span>
            <span>·</span>
            <span>Berlaku efektif: 1 Juni 2026</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Intro */}
          <div className="p-6 rounded-2xl bg-primary-50/50 border border-primary-100 mb-12">
            <p className="text-sm text-slate-700 leading-relaxed">
              Syarat & Ketentuan ini mengatur hubungan antara Anda dan Nyamby saat menggunakan platform dan layanan kami. Harap baca dengan seksama sebelum menggunakan layanan Nyamby.
            </p>
          </div>

          {/* Table of Contents */}
          <nav className="mb-12 p-6 rounded-2xl border border-slate-100 bg-white">
            <p className="text-sm font-semibold text-slate-900 mb-4">Daftar Isi</p>
            <div className="grid md:grid-cols-2 gap-2">
              {sections.map((s, i) => (
                <a key={i} href={`#${s.id}`} className="text-sm text-primary-600 hover:text-primary-800 hover:underline transition-colors">
                  {s.title}
                </a>
              ))}
            </div>
          </nav>

          {/* Sections */}
          <div className="space-y-12">
            {sections.map((s, i) => (
              <div key={i} id={s.id} className="scroll-mt-24">
                <h2 className="text-xl font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">{s.title}</h2>
                <div className="space-y-3">
                  {s.content.map((paragraph, j) => (
                    <p key={j} className="text-sm text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{
                      __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-800">$1</strong>')
                    }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
