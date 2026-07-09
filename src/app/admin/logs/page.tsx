"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Icon } from "@/components/icons";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  ts: string;
  level: LogLevel;
  channel: string;
  message: string;
  context?: unknown;
}

const LEVEL_STYLE: Record<LogLevel, string> = {
  error: "bg-red-50 text-red-700 border-red-200",
  warn: "bg-amber-50 text-amber-700 border-amber-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
  debug: "bg-surface-100 text-surface-500 border-surface-200",
};

const ROW_ACCENT: Record<LogLevel, string> = {
  error: "border-l-red-400",
  warn: "border-l-amber-400",
  info: "border-l-blue-300",
  debug: "border-l-surface-200",
};

export default function AdminLogsPage() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [channels, setChannels] = useState<string[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [level, setLevel] = useState<LogLevel | "all">("all");
  const [channel, setChannel] = useState("all");
  const [q, setQ] = useState("");
  const [date, setDate] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const qDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [qApplied, setQApplied] = useState("");

  const fetchLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (level !== "all") params.set("level", level);
      if (channel !== "all") params.set("channel", channel);
      if (qApplied) params.set("q", qApplied);
      if (date) params.set("date", date);
      params.set("limit", "1000");

      const res = await fetch(`/api/admin/logs?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setEntries(json.data.entries);
        setChannels(json.data.channels);
        setTotal(json.data.total);
        setAvailableDates(json.data.available_dates);
        if (!date && json.data.date) setDate(json.data.date);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [level, channel, qApplied, date]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Auto-refresh tiap 5 detik
  useEffect(() => {
    if (!autoRefresh) return;
    const iv = setInterval(fetchLogs, 5000);
    return () => clearInterval(iv);
  }, [autoRefresh, fetchLogs]);

  // Debounce pencarian
  useEffect(() => {
    if (qDebounce.current) clearTimeout(qDebounce.current);
    qDebounce.current = setTimeout(() => setQApplied(q), 400);
    return () => {
      if (qDebounce.current) clearTimeout(qDebounce.current);
    };
  }, [q]);

  const handleClear = async () => {
    if (!confirm(`Kosongkan log tanggal ${date}? Tindakan ini tidak bisa dibatalkan.`)) return;
    await fetch(`/api/admin/logs?date=${date}`, { method: "DELETE" });
    fetchLogs();
  };

  const toggleExpand = (i: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const counts = entries.reduce(
    (acc, e) => {
      acc[e.level] = (acc[e.level] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-surface-900">System Logs</h1>
          <p className="text-surface-500 text-sm mt-1">
            Semua error &amp; debug dari AI, API, webhook, dan proses — terpusat seperti Laravel Log.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-surface-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="accent-primary-500"
            />
            Auto-refresh
          </label>
          <button
            onClick={fetchLogs}
            className="flex items-center gap-1.5 text-sm font-medium bg-white border border-surface-200 rounded-lg px-3 py-2 hover:bg-surface-50"
          >
            <Icon name="settings" size={15} /> Refresh
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 text-sm font-medium bg-red-50 text-red-600 border border-red-200 rounded-lg px-3 py-2 hover:bg-red-100"
          >
            <Icon name="x" size={15} /> Bersihkan
          </button>
        </div>
      </div>

      {/* Ringkasan level */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {(["error", "warn", "info", "debug"] as LogLevel[]).map((lv) => (
          <button
            key={lv}
            onClick={() => setLevel(level === lv ? "all" : lv)}
            className={`text-left p-4 rounded-xl border transition-all ${
              level === lv ? "ring-2 ring-primary-400 " : ""
            }${LEVEL_STYLE[lv]}`}
          >
            <div className="text-2xl font-bold">{counts[lv] || 0}</div>
            <div className="text-xs font-semibold uppercase tracking-wider">{lv}</div>
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari pesan atau context…"
          className="bg-white border border-surface-200 rounded-lg px-4 py-2 text-sm focus:border-primary-500 outline-none flex-1"
        />
        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          className="bg-white border border-surface-200 rounded-lg px-4 py-2 text-sm focus:border-primary-500 outline-none sm:w-52"
        >
          <option value="all">Semua Channel</option>
          {channels.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-white border border-surface-200 rounded-lg px-4 py-2 text-sm focus:border-primary-500 outline-none sm:w-44"
        >
          {availableDates.length === 0 && date && <option value={date}>{date}</option>}
          {availableDates.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className="text-xs text-surface-400 mb-2">
        Menampilkan {entries.length} dari {total} entri
        {level !== "all" || channel !== "all" || qApplied ? " (terfilter)" : ""}.
      </div>

      {/* Daftar log */}
      <div className="glass rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin w-7 h-7 border-2 border-primary-500 border-t-transparent rounded-full" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16 text-surface-400 text-sm">
            Tidak ada log untuk filter ini.
          </div>
        ) : (
          <div className="divide-y divide-surface-100">
            {entries.map((e, i) => {
              const hasContext = e.context !== undefined && e.context !== null;
              const isOpen = expanded.has(i);
              return (
                <div key={i} className={`border-l-4 ${ROW_ACCENT[e.level]}`}>
                  <button
                    onClick={() => hasContext && toggleExpand(i)}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-surface-50/60 ${
                      hasContext ? "cursor-pointer" : "cursor-default"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border shrink-0 mt-0.5 ${LEVEL_STYLE[e.level]}`}
                    >
                      {e.level}
                    </span>
                    <span className="text-[11px] font-mono text-surface-400 shrink-0 mt-1 w-[74px]">
                      {new Date(e.ts).toLocaleTimeString("id-ID", { hour12: false })}
                    </span>
                    <span className="text-[11px] font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded shrink-0 mt-0.5">
                      {e.channel}
                    </span>
                    <span className="text-sm text-surface-800 flex-1 break-words font-mono">
                      {e.message}
                    </span>
                    {hasContext && (
                      <Icon
                        name="chevronDown"
                        size={16}
                        className={`text-surface-400 shrink-0 mt-1 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    )}
                  </button>
                  {hasContext && isOpen && (
                    <pre className="mx-4 mb-3 mt-0 p-3 rounded-lg bg-surface-900 text-surface-100 text-xs overflow-x-auto">
                      {JSON.stringify(e.context, null, 2)}
                    </pre>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
