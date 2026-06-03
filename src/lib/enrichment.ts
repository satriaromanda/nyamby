const MAX_CV_CHARS = 3000;
const MAX_PORTFOLIO_CHARS = 1000;

export function truncateText(value: string | null | undefined, maxLength: number) {
  if (!value) return null;
  const sanitized = value.replace(/\0/g, "");
  const normalized = sanitized.replace(/\s+/g, " ").trim();
  return normalized ? normalized.slice(0, maxLength) : null;
}

export function validateFile(file: File, options: { maxBytes: number; types: string[] }) {
  if (file.size > options.maxBytes) {
    return `Ukuran file ${file.name} melebihi batas ${Math.round(options.maxBytes / 1024 / 1024)}MB`;
  }

  const lowerName = file.name.toLowerCase();
  const accepted = options.types.some((type) => {
    if (type.startsWith(".")) return lowerName.endsWith(type);
    return file.type === type;
  });

  if (!accepted) {
    return `Format file ${file.name} tidak didukung`;
  }

  return null;
}

export async function extractCvText(file: File) {
  const validationError = validateFile(file, {
    maxBytes: 5 * 1024 * 1024,
    types: ["application/pdf", ".pdf"],
  });

  if (validationError) {
    return { fileName: file.name, text: null, warning: validationError };
  }

  try {
    const rawText = await file.text();
    const extracted = truncateText(rawText, MAX_CV_CHARS);
    return {
      fileName: file.name,
      text:
        extracted ||
        `CV PDF uploaded: ${file.name}. Parser fallback could not extract readable text in this environment.`,
      warning: extracted ? null : "CV tidak dapat dibaca, analisis menggunakan data form dan nama file CV.",
    };
  } catch {
    return {
      fileName: file.name,
      text: null,
      warning: "CV tidak dapat dibaca, analisis menggunakan data form.",
    };
  }
}

export async function extractPortfolioContext(file?: File | null, url?: string | null) {
  const parts: string[] = [];
  const warnings: string[] = [];
  let fileName: string | null = null;

  if (file && file.size > 0) {
    const validationError = validateFile(file, {
      maxBytes: 10 * 1024 * 1024,
      types: ["application/pdf", "application/zip", "application/x-zip-compressed", ".pdf", ".zip"],
    });

    if (validationError) {
      warnings.push(validationError);
    } else {
      fileName = file.name;
      parts.push(`Portfolio file uploaded: ${file.name}`);
      try {
        const rawText = await file.text();
        const extracted = truncateText(rawText, 600);
        if (extracted) parts.push(extracted);
      } catch {
        warnings.push("File portofolio tersimpan, tetapi metadata tidak dapat diekstrak.");
      }
    }
  }

  if (url) {
    parts.push(await buildPortfolioUrlContext(url));
  }

  return {
    fileName,
    context: truncateText(parts.join(" | "), MAX_PORTFOLIO_CHARS),
    warning: warnings.length > 0 ? warnings.join(" ") : null,
  };
}

export async function buildPortfolioUrlContext(url: string) {
  const safeUrl = url.trim();
  if (!safeUrl) return "";

  try {
    const parsedUrl = new URL(safeUrl);
    if (parsedUrl.hostname.includes("github.com")) {
      return buildGithubContext(parsedUrl);
    }

    const response = await fetch(parsedUrl.toString(), {
      headers: { "User-Agent": "Nyamby-MVP/1.0" },
      signal: AbortSignal.timeout(4000),
    });
    const html = await response.text();
    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim();
    const description =
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]?.trim() ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)?.[1]?.trim();

    return truncateText(
      `Portfolio URL: ${safeUrl}. Title: ${title || "Unavailable"}. Description: ${description || "Unavailable"}.`,
      MAX_PORTFOLIO_CHARS
    ) || `Portfolio URL: ${safeUrl}`;
  } catch {
    return `Portfolio URL: ${safeUrl}`;
  }
}

async function buildGithubContext(url: URL) {
  const segments = url.pathname.split("/").filter(Boolean);
  const owner = segments[0];
  const repo = segments[1];

  if (!owner || !repo) {
    return `GitHub profile portfolio: ${url.toString()}`;
  }

  try {
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { "User-Agent": "Nyamby-MVP/1.0" },
      signal: AbortSignal.timeout(4000),
    });
    const repoData = await repoResponse.json();
    return truncateText(
      `GitHub portfolio ${owner}/${repo}. Language: ${repoData.language || "Unknown"}. Stars: ${repoData.stargazers_count || 0}. Description: ${repoData.description || "No description"}.`,
      MAX_PORTFOLIO_CHARS
    ) || `GitHub portfolio: ${url.toString()}`;
  } catch {
    return `GitHub portfolio: ${url.toString()}`;
  }
}
