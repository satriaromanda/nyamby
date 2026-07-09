import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string; // last item usually has no href
}

/**
 * SEO breadcrumb (PRD v5.3 §6.11): visible trail + schema.org BreadcrumbList
 * JSON-LD. Mount on public hierarchical pages only (/jobs/[id], /talents/[id],
 * /fitur/*) — dashboards are noindex territory, skip them.
 */
export function Breadcrumb({
  items,
  jsonLdOnly = false,
}: {
  items: BreadcrumbItem[];
  /** Emit only the schema.org JSON-LD without the visible trail — for pages
   *  whose hero design leaves no room for a breadcrumb bar. */
  jsonLdOnly?: boolean;
}) {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://nyamby.id";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${base}${item.href}` } : {}),
    })),
  };

  if (jsonLdOnly) {
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    );
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-surface-400 mb-6">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-2 min-w-0">
            {i > 0 && <span aria-hidden="true">/</span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-primary-600 transition-colors whitespace-nowrap">
                {item.label}
              </Link>
            ) : (
              <span className="text-surface-600 truncate" aria-current="page">
                {item.label}
              </span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}

export default Breadcrumb;
