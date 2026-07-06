"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from "@/components/icons";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  onboarding_complete: boolean;
  is_suspended: boolean;
  suspend_reason: string | null;
  created_at: string;
  total_jobs: number;
  total_completed: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  const [suspendModal, setSuspendModal] = useState<{ isOpen: boolean; userId: string; userName: string; isSuspending: boolean } | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.append("q", search);
      if (roleFilter) params.append("role", roleFilter);
      if (statusFilter) params.append("status", statusFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data.users);
        setTotalPages(data.data.pagination.total_pages);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleStatusChange = async (userId: string, status: "suspended" | "active", reason?: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reason }),
      });
      if (res.ok) {
        fetchUsers();
        setSuspendModal(null);
        setSuspendReason("");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to update status");
      }
    } catch (err) {
      alert("Error updating status");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-surface-900">User Management</h1>
        <p className="text-surface-500 text-sm mt-1">Kelola akun talent, client, dan admin.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={16} />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
            className="w-full pl-10 pr-4 py-2 bg-white border border-surface-200 rounded-lg text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-white border border-surface-200 rounded-lg px-4 py-2 text-sm focus:border-primary-500 outline-none"
        >
          <option value="">Semua Role</option>
          <option value="talent">Talent</option>
          <option value="client">Client</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-surface-200 rounded-lg px-4 py-2 text-sm focus:border-primary-500 outline-none"
        >
          <option value="">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-200">
                <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Jobs (Total/Selesai)</th>
                <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Bergabung</th>
                <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider text-right">Aksi</th>
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-surface-400">Tidak ada user ditemukan.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-surface-900">{user.full_name}</div>
                      <div className="text-xs text-surface-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        user.role === 'admin' ? 'bg-amber-50 text-amber-600' :
                        user.role === 'client' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_suspended ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-red-50 text-red-600 w-max">Suspended</span>
                          <span className="text-[10px] text-surface-400 truncate max-w-[150px]" title={user.suspend_reason || ""}>
                            {user.suspend_reason}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-600">Aktif</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-surface-600">
                      {user.total_jobs} / {user.total_completed}
                    </td>
                    <td className="px-6 py-4 text-xs text-surface-500">
                      {new Date(user.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.role !== "admin" && (
                        user.is_suspended ? (
                          <button
                            onClick={() => handleStatusChange(user.id, "active")}
                            className="text-xs text-emerald-600 font-medium hover:underline"
                          >
                            Aktifkan
                          </button>
                        ) : (
                          <button
                            onClick={() => setSuspendModal({ isOpen: true, userId: user.id, userName: user.full_name, isSuspending: true })}
                            className="text-xs text-red-600 font-medium hover:underline"
                          >
                            Suspend
                          </button>
                        )
                      )}
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

      {/* Suspend Modal */}
      {suspendModal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-surface-900 mb-2">Suspend User</h3>
            <p className="text-sm text-surface-600 mb-4">
              Anda yakin ingin men-suspend akun <span className="font-semibold">{suspendModal.userName}</span>?
            </p>
            <textarea
              className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm mb-4 focus:border-red-500 outline-none"
              rows={3}
              placeholder="Alasan suspend (wajib)..."
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setSuspendModal(null)}
                className="px-4 py-2 text-sm text-surface-600 hover:text-surface-900 transition-colors"
                disabled={submitting}
              >
                Batal
              </button>
              <button
                onClick={() => handleStatusChange(suspendModal.userId, "suspended", suspendReason)}
                disabled={submitting || !suspendReason.trim()}
                className="bg-red-600 hover:bg-red-700 text-white text-sm px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {submitting ? "Memproses..." : "Suspend"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
