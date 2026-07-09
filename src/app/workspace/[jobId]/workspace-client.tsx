"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";

type Message = {
  id: string;
  body: string;
  sender_user_id: string;
  sender_name?: string;
  is_mine: boolean;
  created_at: string;
};

type ProgressUpdate = {
  id: string;
  progress_pct: number;
  note: string;
  attachment_url: string | null;
  author_name?: string;
  is_mine: boolean;
  created_at: string;
};

function timeLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function WorkspaceClient({
  jobId,
  myRole,
  initialEscrowHeld,
  jobStatus,
}: {
  jobId: string;
  myRole: "client" | "talent";
  initialEscrowHeld: boolean;
  jobStatus: string;
}) {
  const [escrowHeld, setEscrowHeld] = useState(initialEscrowHeld);
  const [tab, setTab] = useState<"chat" | "progress">("chat");

  // ── Chat state ──
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Progress state ──
  const [updates, setUpdates] = useState<ProgressUpdate[]>([]);
  const [latestPct, setLatestPct] = useState(0);
  const [pct, setPct] = useState(0);
  const [note, setNote] = useState("");
  const [attachment, setAttachment] = useState("");
  const [postingProgress, setPostingProgress] = useState(false);
  const [progressError, setProgressError] = useState<string | null>(null);

  const readOnly = jobStatus === "completed" || jobStatus === "cancelled";

  const fetchMessages = useCallback(async () => {
    const res = await fetch(`/api/jobs/${jobId}/messages`);
    if (!res.ok) return;
    const json = await res.json();
    setMessages(json.data.messages);
    setEscrowHeld(json.data.escrow_held);
  }, [jobId]);

  const fetchProgress = useCallback(async () => {
    const res = await fetch(`/api/jobs/${jobId}/progress`);
    if (!res.ok) return;
    const json = await res.json();
    setUpdates(json.data.updates);
    setLatestPct(json.data.latest_pct);
    setEscrowHeld(json.data.escrow_held);
  }, [jobId]);

  // Poll setiap 5 detik untuk pesan/progress baru
  useEffect(() => {
    fetchMessages();
    fetchProgress();
    const iv = setInterval(() => {
      fetchMessages();
      fetchProgress();
    }, 5000);
    return () => clearInterval(iv);
  }, [fetchMessages, fetchProgress]);

  useEffect(() => {
    if (tab === "chat" && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, tab]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      if (res.ok) {
        setDraft("");
        await fetchMessages();
      } else {
        const json = await res.json();
        alert(json.message || "Gagal mengirim pesan.");
      }
    } finally {
      setSending(false);
    }
  };

  const handlePostProgress = async () => {
    setProgressError(null);
    if (!note.trim()) {
      setProgressError("Catatan tidak boleh kosong.");
      return;
    }
    setPostingProgress(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          progress_pct: pct,
          note: note.trim(),
          attachment_url: attachment.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setNote("");
        setAttachment("");
        await fetchProgress();
      } else {
        setProgressError(json.message || "Gagal menyimpan progress.");
      }
    } finally {
      setPostingProgress(false);
    }
  };

  if (!escrowHeld) {
    return (
      <div className="glass rounded-2xl p-8 border border-amber-200 bg-amber-50/50 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <Icon name="lock" size={28} />
        </div>
        <h2 className="text-lg font-bold text-surface-900 mb-1">Ruang kerja terkunci</h2>
        <p className="text-sm text-surface-600 max-w-md mx-auto">
          {myRole === "client"
            ? "Selesaikan pembayaran escrow terlebih dahulu. Chat dan progress akan terbuka begitu dana ditahan."
            : "Menunggu client menyelesaikan pembayaran escrow. Ruang kerja akan terbuka begitu dana ditahan."}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Progress bar ringkas */}
      <div className="glass rounded-2xl p-5 border border-surface-200 mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-surface-900">Progress Pekerjaan</span>
          <span className="text-sm font-bold text-accent-600">{latestPct}%</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-surface-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-accent-500 transition-all"
            style={{ width: `${latestPct}%` }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("chat")}
          className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all ${
            tab === "chat" ? "bg-primary-500 text-white shadow-md" : "bg-white text-surface-600 border border-surface-200"
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setTab("progress")}
          className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all ${
            tab === "progress" ? "bg-primary-500 text-white shadow-md" : "bg-white text-surface-600 border border-surface-200"
          }`}
        >
          Progress
        </button>
      </div>

      {tab === "chat" ? (
        <div className="glass rounded-2xl border border-surface-200 overflow-hidden">
          <div ref={scrollRef} className="h-[460px] overflow-y-auto p-5 space-y-3 bg-surface-50/50">
            {messages.length === 0 ? (
              <p className="text-sm text-surface-400 text-center py-8">
                Belum ada pesan. Mulai percakapan untuk mengoordinasikan pekerjaan.
              </p>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`flex ${m.is_mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      m.is_mine
                        ? "bg-primary-500 text-white rounded-br-sm"
                        : "bg-white border border-surface-200 text-surface-900 rounded-bl-sm"
                    }`}
                  >
                    {!m.is_mine && (
                      <div className="text-[11px] font-semibold opacity-70 mb-0.5">{m.sender_name}</div>
                    )}
                    <div className="text-sm whitespace-pre-wrap break-words">{m.body}</div>
                    <div className={`text-[10px] mt-1 ${m.is_mine ? "text-white/70" : "text-surface-400"}`}>
                      {timeLabel(m.created_at)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {!readOnly ? (
            <div className="border-t border-surface-200 p-3 flex items-end gap-2 bg-white">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={1}
                placeholder="Tulis pesan… (Enter untuk kirim)"
                className="flex-1 resize-none rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 max-h-32"
              />
              <button
                onClick={handleSend}
                disabled={sending || !draft.trim()}
                className="btn-primary px-4 py-2.5 disabled:opacity-50 shrink-0"
              >
                <Icon name="arrowRight" size={18} />
              </button>
            </div>
          ) : (
            <div className="border-t border-surface-200 p-3 text-center text-xs text-surface-400 bg-white">
              Pekerjaan telah selesai. Percakapan bersifat hanya-baca.
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {myRole === "talent" && !readOnly && (
            <div className="glass rounded-2xl border border-surface-200 p-5">
              <h3 className="text-sm font-bold text-surface-900 mb-3">Tambah Update Progress</h3>
              {progressError && (
                <div className="mb-3 p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                  {progressError}
                </div>
              )}
              <label className="block text-xs font-medium text-surface-500 mb-1">
                Persentase: <span className="font-bold text-accent-600">{pct}%</span>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={pct}
                onChange={(e) => setPct(Number(e.target.value))}
                className="w-full mb-3 accent-accent-500"
              />
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Apa yang sudah dikerjakan? (contoh: 'Selesai desain homepage, mulai halaman produk')"
                className="w-full resize-none rounded-xl border border-surface-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-3"
              />
              <input
                type="url"
                value={attachment}
                onChange={(e) => setAttachment(e.target.value)}
                placeholder="Link lampiran (opsional) — Figma, Drive, dll"
                className="w-full rounded-xl border border-surface-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-3"
              />
              <button
                onClick={handlePostProgress}
                disabled={postingProgress}
                className="btn-primary w-full py-2.5 disabled:opacity-50"
              >
                {postingProgress ? "Menyimpan…" : "Simpan Progress"}
              </button>
            </div>
          )}

          <div className="glass rounded-2xl border border-surface-200 p-5">
            <h3 className="text-sm font-bold text-surface-900 mb-4">Timeline Progress</h3>
            {updates.length === 0 ? (
              <p className="text-sm text-surface-400 text-center py-6">
                Belum ada update progress.
              </p>
            ) : (
              <div className="space-y-4">
                {updates.map((u) => (
                  <div key={u.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-9 h-9 rounded-full bg-accent-50 text-accent-600 flex items-center justify-center text-xs font-bold shrink-0">
                        {u.progress_pct}%
                      </div>
                      <div className="flex-1 w-px bg-surface-200 my-1" />
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-surface-900">{u.author_name}</span>
                        <span className="text-[10px] text-surface-400">{timeLabel(u.created_at)}</span>
                      </div>
                      <p className="text-sm text-surface-700 whitespace-pre-wrap break-words">{u.note}</p>
                      {u.attachment_url && (
                        <a
                          href={u.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline mt-1"
                        >
                          <Icon name="link" size={12} /> Lihat lampiran
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
