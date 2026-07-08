import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pusat Bantuan — FAQ & Panduan",
  description: "Temukan jawaban seputar akun, pembayaran escrow, AI matching, dan penggunaan platform Nyamby.",
  alternates: {
    canonical: "/help"
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
