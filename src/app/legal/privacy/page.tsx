import Link from "next/link";
import { Icon } from "@/components/icons";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description: "Bagaimana Nyamby mengumpulkan, menggunakan, dan melindungi data pribadi talenta dan klien di platform kami.",
  alternates: {
    canonical: "/legal/privacy"
  }
};


const sections = [
  {
    id: "data-dikumpulkan",
    title: "1. Data yang Kami Kumpulkan",
    content: [
      "Kami mengumpulkan informasi yang Anda berikan secara langsung saat mendaftar dan menggunakan layanan Nyamby, termasuk:",
      "• **Data Identitas**: Nama lengkap, alamat email, nomor telepon, dan foto profil.",
      "• **Data Profesional**: Skill, pengalaman kerja, portfolio, CV, rate, dan preferensi pekerjaan.",
      "• **Data Transaksi**: Riwayat pembayaran, invoice, dan informasi escrow.",
      "• **Data Penggunaan**: Log aktivitas, interaksi dengan fitur platform, preferensi, dan data analitik.",
      "• **Data Perangkat**: Jenis perangkat, browser, alamat IP, dan informasi teknis lainnya.",
    ],
  },
  {
    id: "penggunaan-data",
    title: "2. Bagaimana Kami Menggunakan Data",
    content: [
      "Data yang dikumpulkan digunakan untuk:",
      "• **Layanan Inti**: Menjalankan AI Matching, menampilkan profil, memfasilitasi transaksi escrow, dan menyediakan fitur platform.",
      "• **Personalisasi**: Menyesuaikan rekomendasi job dan talenta berdasarkan profil dan aktivitas Anda.",
      "• **Keamanan**: Verifikasi identitas, deteksi fraud, dan perlindungan akun.",
      "• **Komunikasi**: Mengirim notifikasi terkait layanan, update fitur, dan informasi penting.",
      "• **Peningkatan Layanan**: Analisis penggunaan untuk meningkatkan kualitas platform dan pengalaman pengguna.",
    ],
  },
  {
    id: "penyimpanan",
    title: "3. Penyimpanan & Keamanan Data",
    content: [
      "• Data Anda disimpan di server yang aman dengan enkripsi standar industri (AES-256).",
      "• Kami menerapkan kontrol akses ketat — hanya personel yang berwenang yang dapat mengakses data pengguna.",
      "• Data disimpan selama akun Anda aktif. Setelah penghapusan akun, data akan dihapus dalam 30 hari kecuali diwajibkan oleh hukum.",
      "• Kami melakukan backup rutin untuk memastikan ketersediaan dan integritas data.",
    ],
  },
  {
    id: "berbagi-data",
    title: "4. Berbagi Data dengan Pihak Ketiga",
    content: [
      "Kami tidak menjual data pribadi Anda. Data hanya dibagikan dalam kondisi berikut:",
      "• **Dengan Pengguna Lain**: Informasi profil publik Anda (nama, skill, portfolio) dapat dilihat oleh klien atau talenta lain sesuai pengaturan visibilitas Anda.",
      "• **Penyedia Layanan**: Mitra teknis yang membantu operasional platform (hosting, payment gateway, analitik) dengan perjanjian kerahasiaan.",
      "• **Kewajiban Hukum**: Jika diwajibkan oleh hukum, regulasi, atau proses hukum yang sah.",
    ],
  },
  {
    id: "hak-pengguna",
    title: "5. Hak Anda",
    content: [
      "Anda memiliki hak untuk:",
      "• **Mengakses**: Meminta salinan data pribadi yang kami simpan tentang Anda.",
      "• **Memperbaiki**: Memperbarui atau mengoreksi data yang tidak akurat.",
      "• **Menghapus**: Meminta penghapusan akun dan data pribadi Anda.",
      "• **Membatasi**: Membatasi penggunaan data Anda untuk tujuan tertentu.",
      "• **Mengunduh**: Mengekspor data Anda dalam format yang dapat dibaca mesin.",
      "Untuk menggunakan hak-hak ini, hubungi kami di privacy@nyamby.id.",
    ],
  },
  {
    id: "cookies",
    title: "6. Cookies & Teknologi Pelacakan",
    content: [
      "Kami menggunakan cookies dan teknologi serupa untuk:",
      "• **Cookies Esensial**: Diperlukan agar platform berfungsi (autentikasi, keamanan).",
      "• **Cookies Analitik**: Memahami bagaimana pengguna berinteraksi dengan platform untuk peningkatan layanan.",
      "• **Cookies Preferensi**: Menyimpan preferensi Anda seperti bahasa dan pengaturan tampilan.",
      "Anda dapat mengelola preferensi cookies melalui pengaturan browser Anda.",
    ],
  },
  {
    id: "perubahan",
    title: "7. Perubahan Kebijakan",
    content: [
      "Kami dapat memperbarui kebijakan ini dari waktu ke waktu. Perubahan signifikan akan diberitahukan melalui email atau notifikasi di platform. Versi terbaru selalu tersedia di halaman ini.",
      "Dengan terus menggunakan layanan Nyamby setelah perubahan, Anda menyetujui kebijakan yang diperbarui.",
    ],
  },
  {
    id: "kontak",
    title: "8. Hubungi Kami",
    content: [
      "Jika Anda memiliki pertanyaan tentang kebijakan privasi ini, hubungi kami:",
      "• **Email**: privacy@nyamby.id",
      "• **Alamat**: Nyamby HQ, Bandar Lampung, Lampung, Indonesia",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-slate-900 font-sans">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <Link href="/legal/terms" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-8">
            <Icon name="arrowLeft" size={14} /> Kembali ke Legal
          </Link>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
            Kebijakan Privasi
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
              Nyamby (&quot;kami&quot;, &quot;platform&quot;) berkomitmen melindungi privasi pengguna. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi Anda saat menggunakan layanan Nyamby.
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
