// Next.js instrumentation — dijalankan sekali saat server start di semua runtime.
// Kode Node (fs/path/process.on + logger) diletakkan di ./instrumentation-node
// dan hanya di-import lewat cabang NEXT_RUNTIME === "nodejs" agar tidak masuk
// bundle Edge. Lihat: node_modules/next/dist/docs/01-app/02-guides/instrumentation.md

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { registerNode } = await import("./instrumentation-node");
    registerNode();
  }
}

// Menangkap semua error server yang di-capture Next.js (API route & render).
// Logger memakai fs → hanya jalan di runtime Node; guard positif memastikan
// import-nya di-tree-shake keluar dari bundle Edge.
export async function onRequestError(
  err: unknown,
  request: { path?: string; method?: string },
  context: { routerKind?: string; routePath?: string; renderSource?: string }
) {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    const { logger } = await import("@/lib/logger");
    logger.error(
      "request-error",
      `Server error pada ${request?.method ?? "?"} ${request?.path ?? context?.routePath ?? "?"}`,
      { error: err, request, context }
    );
  } catch {
    /* jangan pernah lempar dari handler error */
  }
}
