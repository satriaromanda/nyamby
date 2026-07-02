// PRD v4.0 §3.2 — FX Rate Utility
// Fetches exchange rates for cross-border currency conversion.
// Budget is always stored in IDR as source of truth; displayCurrency + fxRateAtPosting
// are for rendering purposes only.

// Fallback rates (used when API is unavailable or during pilot phase)
const FALLBACK_RATES_TO_IDR: Record<string, number> = {
  IDR: 1,
  MYR: 3600,   // 1 MYR ≈ 3,600 IDR
  SGD: 12000,  // 1 SGD ≈ 12,000 IDR
  USD: 16000,  // 1 USD ≈ 16,000 IDR
};

export interface FxRate {
  from: string;
  to: string;
  rate: number;
  source: "api" | "fallback";
  timestamp: string;
}

/**
 * Get exchange rate from a given currency to IDR.
 * Tries free API first, falls back to hardcoded rates for pilot phase.
 */
export async function getExchangeRateToIDR(fromCurrency: string): Promise<FxRate> {
  if (fromCurrency === "IDR") {
    return {
      from: "IDR",
      to: "IDR",
      rate: 1,
      source: "fallback",
      timestamp: new Date().toISOString(),
    };
  }

  // Try exchangerate-api (free tier, no key required for basic usage)
  try {
    const res = await fetch(
      `https://open.er-api.com/v6/latest/${fromCurrency}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (res.ok) {
      const data = await res.json();
      if (data.result === "success" && data.rates?.IDR) {
        return {
          from: fromCurrency,
          to: "IDR",
          rate: data.rates.IDR,
          source: "api",
          timestamp: data.time_last_update_utc || new Date().toISOString(),
        };
      }
    }
  } catch (error) {
    console.warn("[FxRate] API fetch failed, using fallback:", error);
  }

  // Fallback to hardcoded rates
  const fallbackRate = FALLBACK_RATES_TO_IDR[fromCurrency];
  if (!fallbackRate) {
    throw new Error(`Unsupported currency: ${fromCurrency}`);
  }

  return {
    from: fromCurrency,
    to: "IDR",
    rate: fallbackRate,
    source: "fallback",
    timestamp: new Date().toISOString(),
  };
}

/**
 * Convert an amount from a given currency to IDR.
 */
export async function convertToIDR(amount: number, fromCurrency: string): Promise<{
  amountIDR: number;
  fxRate: number;
  source: "api" | "fallback";
}> {
  const fx = await getExchangeRateToIDR(fromCurrency);
  return {
    amountIDR: Math.round(amount * fx.rate),
    fxRate: fx.rate,
    source: fx.source,
  };
}

/**
 * Convert an IDR amount to a display currency.
 */
export function convertFromIDR(amountIDR: number, toCurrency: string, fxRate: number): number {
  if (toCurrency === "IDR" || fxRate === 0) return amountIDR;
  return Math.round((amountIDR / fxRate) * 100) / 100;
}
