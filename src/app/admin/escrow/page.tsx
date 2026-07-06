"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from "@/components/icons";

interface Payout {
  status: string;
  payout_type: string;
  amount: number;
  destination_channel: string;
}

interface Escrow {
  id: string;
  job_id: string;
  job_title: string;
  job_status: string;
  client_name: string;
  client_email: string;
  talent_name: string;
  talent_email: string;
  amount: number;
  platform_fee: number;
  status: string;
  held_at: string;
  released_at: string | null;
  payment: {
    status: string;
    payment_code: string | null;
    payment_code_type: string | null;
  } | null;
  payouts: Payout[];
}

export default function AdminEscrowPage() {
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchEscrows = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (statusFilter) params.append("status", statusFilter);

      const res = await fetch(`/api/admin/escrow?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setEscrows(data.data.escrows);
        setTotalPages(data.data.pagination.total_pages);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchEscrows();
  }, [fetchEscrows]);

  const formatIDR = (amount: number) =>
    `Rp ${Math.round(amount).toLocaleString("id-ID")}`;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-surface-900">Escrow Management</h1>
        <p className="text-surface-500 text-sm mt-1">Pantau seluruh transaksi escrow dan status payout.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-surface-200 rounded-lg px-4 py-2 text-sm focus:border-primary-500 outline-none w-full sm:w-48"
        >
          <option value="">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="held">Held (Ditahan)</option>
          <option value="released">Released</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-200">
                <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Job / Client</th>
                <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Talent</th>
                <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Amount / Fee</th>
                <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Status Escrow</th>
                <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Payment / Payouts</th>
                <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider text-right">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-surface-400">
                    <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-2" />
                    Memuat data...
                  </td>
                </tr>
              ) : escrows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-surface-400">Tidak ada transaksi ditemukan.</td>
                </tr>
              ) : (
                escrows.map((escrow) => (
                  <tr key={escrow.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-surface-900 truncate max-w-[200px]" title={escrow.job_title}>
                        {escrow.job_title}
                      </div>
                      <div className="text-xs text-surface-500">{escrow.client_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-surface-900">{escrow.talent_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-surface-900">{formatIDR(escrow.amount)}</div>
                      <div className="text-xs text-emerald-600">Fee: {formatIDR(escrow.platform_fee)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        escrow.status === 'held' ? 'bg-amber-50 text-amber-600' :
                        escrow.status === 'released' ? 'bg-emerald-50 text-emerald-600' :
                        escrow.status === 'refunded' ? 'bg-red-50 text-red-600' : 'bg-surface-100 text-surface-600'
                      }`}>
                        {escrow.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {escrow.payment ? (
                        <div className="flex items-center gap-1 mb-1">
                          <Icon name={escrow.payment.status === "SUCCESS" ? "check" : "target"} size={12} className={escrow.payment.status === "SUCCESS" ? "text-emerald-500" : "text-amber-500"} />
                          Pay-in: {escrow.payment.status}
                        </div>
                      ) : (
                        <div className="text-surface-400 mb-1">-</div>
                      )}
                      
                      {escrow.payouts.map((p, i) => (
                        <div key={i} className="flex items-center gap-1 text-[10px] mt-1">
                          <Icon name={p.status === "SUCCESS" ? "check" : "target"} size={10} className={p.status === "SUCCESS" ? "text-emerald-500" : "text-amber-500"} />
                          {p.payout_type}: {p.status} ({p.destination_channel})
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 text-xs text-surface-500 text-right">
                      {new Date(escrow.held_at).toLocaleDateString("id-ID")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-surface-200 flex items-center justify-between bg-white">
          <span className="text-xs text-surface-500">
            Halaman {page} dari {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 bg-surface-100 hover:bg-surface-200 text-surface-600 text-xs rounded transition-colors disabled:opacity-50"
            >
              Sebelumnya
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 bg-surface-100 hover:bg-surface-200 text-surface-600 text-xs rounded transition-colors disabled:opacity-50"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
