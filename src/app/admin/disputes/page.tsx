"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Icon, Logo } from "@/components/icons";
import { useRouter } from "next/navigation";

interface Dispute {
  id: string;
  job_id: string;
  job_title: string;
  escrow_amount: number;
  initiator: {
    name: string;
    role: string;
  };
  reason: string;
  status: "open" | "investigating" | "resolved";
  created_at: string;
}

export default function AdminDisputesPage() {
  const router = useRouter();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    const fetchDisputes = async () => {
      setLoading(true);
      try {
        const url = statusFilter 
          ? `/api/admin/disputes?status=${statusFilter}`
          : "/api/admin/disputes";
        const res = await fetch(url);
        if (res.status === 401 || res.status === 403) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (data.success) {
          setDisputes(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDisputes();
  }, [statusFilter, router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      {/* Nav */}
      <nav className="glass sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Logo height={32} />
            </Link>
            <span className="text-xs font-bold bg-primary-100 text-primary-700 px-2 py-1 rounded-md">
              ADMIN
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-surface-400 hover:text-surface-700"
          >
            Keluar
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-surface-900">
              Dispute Resolution
            </h1>
            <p className="text-surface-500">
              Kelola dan selesaikan dispute antara client dan talent.
            </p>
          </div>
          <div>
            <select
              className="input-dark text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className="glass rounded-xl overflow-hidden border border-surface-200">
          {loading ? (
            <div className="p-12 text-center text-surface-500">
              <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
              Memuat data...
            </div>
          ) : disputes.length === 0 ? (
            <div className="p-12 text-center text-surface-500">
              Belum ada dispute ticket.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-100 border-b border-surface-200">
                  <tr>
                    <th className="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Job</th>
                    <th className="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Initiator</th>
                    <th className="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Escrow</th>
                    <th className="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Tanggal</th>
                    <th className="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200 bg-white">
                  {disputes.map((d) => (
                    <tr key={d.id} className="hover:bg-surface-50 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-surface-900">{d.job_title}</div>
                        <div className="text-xs text-surface-400">ID: {d.id}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-surface-900">{d.initiator.name}</div>
                        <div className="text-xs text-surface-500 capitalize">{d.initiator.role}</div>
                      </td>
                      <td className="p-4 font-medium text-surface-900">
                        Rp {d.escrow_amount.toLocaleString("id-ID")}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            d.status === "open"
                              ? "bg-red-100 text-red-700"
                              : d.status === "investigating"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {d.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-surface-500">
                        {new Date(d.created_at).toLocaleDateString("id-ID")}
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/admin/disputes/${d.id}`}
                          className="btn-primary text-xs py-1.5 px-3 rounded-lg"
                        >
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
