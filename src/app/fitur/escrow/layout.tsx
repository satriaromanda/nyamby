import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Escrow Payment — Transaksi Freelance Aman",
  description: "Sistem escrow Nyamby melindungi pembayaran freelance: dana ditahan aman sampai pekerjaan selesai dan disetujui.",
  alternates: {
    canonical: "/fitur/escrow"
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
