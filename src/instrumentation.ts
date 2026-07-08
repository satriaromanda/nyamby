// Next.js instrumentation — dijalankan sekali saat server start.
// Meneruskan SEMUA console.* dan error yang tak tertangani ke logger terpusat
// sehingga tidak perlu mengubah 60+ file yang sudah memakai console.error.

export async function register() {
  // Hanya di runtime Node (punya akses fs). Lewati Edge runtime.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { logger, rawConsole } = await import("@/lib/logger");

  // Deteksi channel dari prefix "[Xxx]" yang sudah dipakai kode existing.
  const detectChannel = (args: unknown[]): { channel: string; msg: string } => {
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
  };

  const patch = (level: "debug" | "info" | "warn" | "error", orig: (...a: unknown[]) => void) => {
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
  };

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

// Menangkap semua error server yang di-capture Next.js (API route & render).
export async function onRequestError(
  err: unknown,
  request: { path?: string; method?: string },
  context: { routerKind?: string; routePath?: string; renderSource?: string }
) {
  try {
    const { logger } = await import("@/lib/logger");
    logger.error("request-error", `Server error pada ${request?.method ?? "?"} ${request?.path ?? context?.routePath ?? "?"}`, {
      error: err,
      request,
      context,
    });
  } catch {
    /* ignore */
  }
}
