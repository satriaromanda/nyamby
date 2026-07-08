// Logika instrumentation khusus runtime Node.
// File ini HANYA di-import dari cabang `NEXT_RUNTIME === "nodejs"` di
// instrumentation.ts, sehingga fs/path/process.on tidak pernah masuk bundle Edge.

import { logger, rawConsole } from "@/lib/logger";

// Deteksi channel dari prefix "[Xxx]" yang sudah dipakai kode existing.
function detectChannel(args: unknown[]): { channel: string; msg: string } {
  const first = typeof args[0] === "string" ? (args[0] as string) : "";
  const m = /^\[([^\]]+)\]/.exec(first);
  const channel = m ? m[1] : "console";
  const parts = args.map((a) => {
    if (typeof a === "string") return a;
    if (a instanceof Error) return `${a.name}: ${a.message}`;
    try {
      return JSON.stringify(a);
    } catch {
      return String(a);
    }
  });
  return { channel, msg: parts.join(" ") };
}

function patch(
  level: "debug" | "info" | "warn" | "error",
  orig: (...a: unknown[]) => void
) {
  return (...args: unknown[]) => {
    orig(...args); // tetap tampil di terminal
    try {
      const { channel, msg } = detectChannel(args);
      // Sertakan objek Error / context terakhir bila ada
      const ctx = args.find((a) => a instanceof Error) ?? (args.length > 1 ? args.slice(1) : undefined);
      logger.raw(level, channel, msg, ctx);
    } catch {
      /* jangan pernah lempar dari console patch */
    }
  };
}

export function registerNode() {
  console.log = patch("info", rawConsole.log);
  console.info = patch("info", rawConsole.log);
  console.debug = patch("debug", rawConsole.debug);
  console.warn = patch("warn", rawConsole.warn);
  console.error = patch("error", rawConsole.error);

  // Error proses yang tak tertangani
  process.on("unhandledRejection", (reason) => {
    logger.error("process", "Unhandled promise rejection", reason);
  });
  process.on("uncaughtException", (err) => {
    logger.error("process", "Uncaught exception", err);
  });

  logger.info("system", "Logger diinisialisasi — mencatat semua console.* dan error server.");
}
