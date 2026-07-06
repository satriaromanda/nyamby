import Link from "next/link";
import { Icon } from "@/components/icons";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const securityFeatures = [
  {
    icon: "lock" as const,
    title: "Enkripsi Data",
    description: "Semua data sensitif dienkripsi menggunakan standar AES-256 saat disimpan dan TLS 1.3 saat ditransmisikan.",
    details: [
      "Enkripsi end-to-end untuk data pembayaran",
      "Password di-hash dengan bcrypt",
      "SSL/TLS di semua koneksi",
      "Enkripsi database at-rest",
    ],
    color: "#2563EB",
    bg: "#eff6ff",
  },
  {
    icon: "user" as const,
    title: "Verifikasi Identitas",
    description: "Sistem verifikasi berlapis memastikan setiap pengguna adalah orang yang sesungguhnya.",
    details: [
      "Verifikasi email & nomor HP",
      "KTP verification untuk Physical Mode",
      "Selfie + liveness detection",
      "Badge 'Terverifikasi' di profil publik",
    ],
    color: "#0F6E56",
    bg: "#e6f2ee",
  },
  {
    icon: "shield" as const,
    title: "Escrow Payment",
    description: "Dana dilindungi oleh sistem escrow — tidak ada transfer langsung antara pengguna.",
    details: [
      "Dana ditahan hingga pekerjaan disetujui",
      "Transparansi status pembayaran real-time",
      "Dispute resolution dalam 48 jam",
      "Refund policy yang jelas",
    ],
    color: "#854F0B",
    bg: "#faeeda",
  },
  {
    icon: "eye" as const,
    title: "Monitoring & Deteksi",
    description: "Sistem pemantauan otomatis mendeteksi aktivitas mencurigakan dan ancaman keamanan.",
    details: [
      "Deteksi fraud otomatis",
      "Rate limiting & DDoS protection",
      "Monitoring aktivitas akun 24/7",
      "Auto-suspend setelah 3 laporan",
    ],
    color: "#993C1D",
    bg: "#f5ebe6",
  },
];

const practices = [
  {
    title: "Akses Terbatas",
    description: "Hanya personel berwenang yang dapat mengakses data pengguna, dengan log audit untuk setiap akses.",
  },
  {
    title: "Backup Reguler",
    description: "Data di-backup secara otomatis setiap hari ke lokasi terpisah yang juga terenkripsi.",
  },
  {
    title: "Security Testing",
    description: "Penetration testing dan code review dilakukan secara berkala untuk mengidentifikasi kerentanan.",
  },
  {
    title: "Incident Response",
    description: "Tim keamanan kami memiliki prosedur respons insiden yang terstruktur untuk menangani ancaman dengan cepat.",
  },
  {
    title: "Pembaruan Berkala",
    description: "Dependencies dan infrastruktur diperbarui secara rutin untuk menutup kerentanan yang diketahui.",
  },
  {
    title: "Kepatuhan Regulasi",
    description: "Kami mematuhi regulasi perlindungan data yang berlaku di Indonesia termasuk UU PDP.",
  },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-slate-900 font-sans">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-primary-400/8 rounded-full blur-[140px] -z-10"></div>
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-semibold text-primary-600 shadow-sm">
            <Icon name="shield" size={16} /> Keamanan Platform
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900">
            Keamanan Adalah <br className="hidden md:block" />
            <span className="text-primary-600">Prioritas Utama.</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Nyamby dibangun di atas fondasi kepercayaan. Kami menerapkan standar keamanan tinggi untuk melindungi data, transaksi, dan identitas setiap pengguna.
          </p>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary-600 mb-3 tracking-wide uppercase">Perlindungan Berlapis</p>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Empat Pilar Keamanan</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {securityFeatures.map((f, i) => (
              <div key={i} className="p-8 rounded-2xl border border-slate-100 bg-white hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-start gap-5">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ background: f.bg }}
                  >
                    <Icon name={f.icon} size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-lg mb-2">{f.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-5">{f.description}</p>
                    <div className="space-y-2.5">
                      {f.details.map((d, j) => (
                        <div key={j} className="flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: f.bg }}>
                            <Icon name="check" size={12} />
                          </div>
                          <span className="text-sm text-slate-600">{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary-600 mb-3 tracking-wide uppercase">Standar Kami</p>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Praktik Keamanan Terbaik</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {practices.map((p, i) => (
              <div key={i} className="p-6 rounded-2xl border border-slate-100 bg-white hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
                  <span className="text-primary-600 font-bold text-sm">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{p.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Report Vulnerability */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-10 rounded-3xl border border-slate-200 bg-[#FAFAF8] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-6">
              <Icon name="shield" size={28} className="text-primary-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Responsible Disclosure</h2>
            <p className="text-slate-500 mb-8 max-w-lg mx-auto">
              Menemukan kerentanan keamanan? Kami menghargai kontribusi peneliti keamanan yang membantu menjaga platform tetap aman.
            </p>
            <a
              href="mailto:security@nyamby.id"
              className="btn-primary px-8 py-3 rounded-xl font-medium text-sm inline-block"
            >
              Laporkan ke security@nyamby.id →
            </a>
            <p className="text-xs text-slate-400 mt-4">
              Harap jangan mengungkapkan kerentanan secara publik sebelum kami menyelesaikan perbaikan.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
