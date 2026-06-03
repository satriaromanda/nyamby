import { URLSearchParams } from "url";

/**
 * Standardized pagination helper per PRD §14.
 * Default: 12 items for talents/jobs, 20 for notifications.
 */

export function getPaginationParams(
  searchParams: URLSearchParams | { get(key: string): string | null },
  defaultPerPage: number = 12,
  maxPerPage: number = 48
) {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const per_page = Math.min(
    maxPerPage,
    Math.max(1, parseInt(searchParams.get("per_page") || searchParams.get("limit") || String(defaultPerPage), 10))
  );
  const skip = (page - 1) * per_page;
  return { page, per_page, skip, take: per_page };
}

export function buildPaginationMeta(total: number, page: number, per_page: number) {
  const total_pages = Math.ceil(total / per_page);
  return {
    page,
    per_page,
    total,
    total_pages,
    has_next: page < total_pages,
    has_prev: page > 1,
  };
}
