import fs from "fs";
import path from "path";

// ── Laravel-style centralized logger ─────────────────────────────────────────
// Menulis semua log ke file harian JSONL: logs/app-YYYY-MM-DD.log
// Format tiap baris: {"ts","level","channel","message","context"}
// Aman: penulisan tidak pernah melempar error (agar logging tak merusak request).

export type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_DIR = path.join(process.cwd(), "logs");
const MAX_CONTEXT_CHARS = 8000;

export interface LogEntry {
  ts: string;
  level: LogLevel;
  channel: string;
  message: string;
  context?: unknown;
}

function todayStamp(d = new Date()): string {
  // YYYY-MM-DD dalam waktu lokal server
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function logFilePath(dateStamp = todayStamp()): string {
  return path.join(LOG_DIR, `app-${dateStamp}.log`);
}

function ensureDir() {
  try {
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
  } catch {
    /* ignore */
  }
}

/** Ubah nilai apa pun (termasuk Error) menjadi bentuk yang bisa di-serialize. */
function normalizeContext(ctx: unknown): unknown {
  if (ctx === undefined || ctx === null) return undefined;
  if (ctx instanceof Error) {
    return { name: ctx.name, message: ctx.message, stack: ctx.stack };
  }
  if (typeof ctx === "object") {
    try {
      const seen = new WeakSet();
      const json = JSON.stringify(ctx, (_k, v) => {
        if (v instanceof Error) {
          return { name: v.name, message: v.message, stack: v.stack };
        }
        if (typeof v === "object" && v !== null) {
          if (seen.has(v)) return "[Circular]";
          seen.add(v);
        }
        if (typeof v === "bigint") return v.toString();
        return v;
      });
      const parsed = JSON.parse(json);
      const str = JSON.stringify(parsed);
      if (str.length > MAX_CONTEXT_CHARS) {
        return { _truncated: true, preview: str.slice(0, MAX_CONTEXT_CHARS) };
      }
      return parsed;
    } catch {
      return { _unserializable: String(ctx) };
    }
  }
  return ctx;
}

// Guard agar patch console tidak menyebabkan rekursi tak terbatas.
let insideWrite = false;

function writeEntry(level: LogLevel, channel: string, message: string, context?: unknown) {
  const entry: LogEntry = {
    ts: new Date().toISOString(),
    level,
    channel: channel || "app",
    message: String(message ?? ""),
    context: normalizeContext(context),
  };

  // Tulis ke file (hanya di runtime Node yang punya fs).
  if (!insideWrite) {
    insideWrite = true;
    try {
      ensureDir();
      fs.appendFileSync(logFilePath(), JSON.stringify(entry) + "\n", "utf8");
    } catch {
      /* jangan pernah lempar dari logger */
    } finally {
      insideWrite = false;
    }
  }
}

// Mirror ke console asli (disimpan sebelum instrumentation mem-patch console).
type ConsoleFn = (...args: unknown[]) => void;
export const rawConsole: {
  log: ConsoleFn;
  warn: ConsoleFn;
  error: ConsoleFn;
  debug: ConsoleFn;
} = {
  log: console.log.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
  debug: (console.debug || console.log).bind(console),
};

function emit(level: LogLevel, channel: string, message: string, context?: unknown) {
  writeEntry(level, channel, message, context);
  const line = `[${level.toUpperCase()}] [${channel}] ${message}`;
  if (level === "error") rawConsole.error(line, context ?? "");
  else if (level === "warn") rawConsole.warn(line, context ?? "");
  else rawConsole.log(line, context ?? "");
}

export const logger = {
  debug: (channel: string, message: string, context?: unknown) =>
    emit("debug", channel, message, context),
  info: (channel: string, message: string, context?: unknown) =>
    emit("info", channel, message, context),
  warn: (channel: string, message: string, context?: unknown) =>
    emit("warn", channel, message, context),
  error: (channel: string, message: string, context?: unknown) =>
    emit("error", channel, message, context),
  /** Dipakai oleh instrumentation untuk meneruskan console.* mentah ke file. */
  raw: writeEntry,
};

// ── Pembacaan log untuk admin viewer ─────────────────────────────────────────

export interface ReadLogsOptions {
  date?: string; // YYYY-MM-DD; default hari ini
  level?: LogLevel | "all";
  channel?: string;
  q?: string; // pencarian teks pada message/context
  limit?: number; // maksimal baris terbaru
}

export interface ReadLogsResult {
  date: string;
  total: number;
  returned: number;
  channels: string[];
  entries: LogEntry[];
}

export function readLogs(opts: ReadLogsOptions = {}): ReadLogsResult {
  const date = opts.date || todayStamp();
  const limit = Math.min(Math.max(opts.limit ?? 500, 1), 5000);
  const file = logFilePath(date);

  let lines: string[] = [];
  try {
    if (fs.existsSync(file)) {
      lines = fs.readFileSync(file, "utf8").split("\n").filter(Boolean);
    }
  } catch {
    /* ignore */
  }

  const channelsSet = new Set<string>();
  const parsed: LogEntry[] = [];
  for (const line of lines) {
    try {
      const e = JSON.parse(line) as LogEntry;
      channelsSet.add(e.channel);
      parsed.push(e);
    } catch {
      /* skip baris rusak */
    }
  }

  let filtered = parsed;
  if (opts.level && opts.level !== "all") {
    filtered = filtered.filter((e) => e.level === opts.level);
  }
  if (opts.channel && opts.channel !== "all") {
    filtered = filtered.filter((e) => e.channel === opts.channel);
  }
  if (opts.q) {
    const q = opts.q.toLowerCase();
    filtered = filtered.filter((e) => {
      if (e.message.toLowerCase().includes(q)) return true;
      if (e.context && JSON.stringify(e.context).toLowerCase().includes(q)) return true;
      return false;
    });
  }

  // Ambil N terbaru (file tersimpan kronologis; balik agar terbaru di atas)
  const total = filtered.length;
  const recent = filtered.slice(-limit).reverse();

  return {
    date,
    total,
    returned: recent.length,
    channels: Array.from(channelsSet).sort(),
    entries: recent,
  };
}

/** Daftar tanggal yang punya file log (untuk pemilih tanggal). */
export function availableLogDates(): string[] {
  try {
    if (!fs.existsSync(LOG_DIR)) return [];
    return fs
      .readdirSync(LOG_DIR)
      .map((f) => /^app-(\d{4}-\d{2}-\d{2})\.log$/.exec(f)?.[1])
      .filter((d): d is string => !!d)
      .sort()
      .reverse();
  } catch {
    return [];
  }
}

/** Kosongkan file log suatu tanggal (dipakai tombol clear di admin). */
export function clearLogFile(date?: string): boolean {
  const target = logFilePath(date || todayStamp());
  try {
    if (fs.existsSync(target)) fs.writeFileSync(target, "", "utf8");
    return true;
  } catch {
    return false;
  }
}
