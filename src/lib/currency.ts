import { useEffect, useState } from "react";

/**
 * Display-only currency conversion. SEK stays the master price and Stripe
 * Adaptive Pricing does the real conversion at checkout — these numbers are
 * approximate so on-site prices match what the customer sees in Checkout.
 */

type CurrencyInfo = { code: string; rate: number; locale: string };

// Approximate rates: 1 SEK -> currency
const CURRENCIES: Record<string, CurrencyInfo> = {
  SEK: { code: "SEK", rate: 1, locale: "sv-SE" },
  EUR: { code: "EUR", rate: 0.087, locale: "de-DE" },
  DKK: { code: "DKK", rate: 0.65, locale: "da-DK" },
  NOK: { code: "NOK", rate: 1.02, locale: "nb-NO" },
  GBP: { code: "GBP", rate: 0.073, locale: "en-GB" },
  CHF: { code: "CHF", rate: 0.082, locale: "de-CH" },
  PLN: { code: "PLN", rate: 0.37, locale: "pl-PL" },
  CZK: { code: "CZK", rate: 2.05, locale: "cs-CZ" },
  USD: { code: "USD", rate: 0.095, locale: "en-US" },
};

const COUNTRY_CURRENCY: Record<string, string> = {
  SE: "SEK",
  DK: "DKK",
  NO: "NOK",
  GB: "GBP",
  CH: "CHF",
  PL: "PLN",
  CZ: "CZK",
  US: "USD",
  DE: "EUR", FR: "EUR", NL: "EUR", BE: "EUR", ES: "EUR", IT: "EUR", FI: "EUR",
  AT: "EUR", IE: "EUR", PT: "EUR", GR: "EUR", EE: "EUR", LV: "EUR", LT: "EUR",
  SK: "EUR", SI: "EUR", LU: "EUR", MT: "EUR", CY: "EUR", HR: "EUR",
};

function detectCurrency(): CurrencyInfo {
  if (typeof navigator === "undefined") return CURRENCIES.SEK;
  const langs = [navigator.language, ...(navigator.languages ?? [])];
  for (const lang of langs) {
    if (!lang) continue;
    let region: string | undefined;
    try {
      region = new Intl.Locale(lang).maximize().region ?? undefined;
    } catch {
      region = lang.split("-")[1];
    }
    const code = region ? COUNTRY_CURRENCY[region.toUpperCase()] : undefined;
    if (code) return CURRENCIES[code];
  }
  return CURRENCIES.SEK;
}

function round(amount: number, code: string) {
  if (code === "SEK") return amount;
  if (code === "EUR" || code === "GBP" || code === "CHF" || code === "USD") {
    // .90 psychological rounding for small currencies
    return Math.round(amount) - 0.1;
  }
  return Math.round(amount);
}

export function useCurrency() {
  const [info, setInfo] = useState<CurrencyInfo>(CURRENCIES.SEK);

  useEffect(() => {
    setInfo(detectCurrency());
  }, []);

  const convert = (sek: number) => round(sek * info.rate, info.code);

  const format = (sek: number, opts?: { decimals?: number }) => {
    const value = convert(sek);
    const decimals = opts?.decimals ?? (Number.isInteger(value) ? 0 : 2);
    return `${value.toLocaleString(info.locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })} ${info.code}`;
  };

  const formatPrecise = (sek: number, decimals = 2) => {
    const value = sek * info.rate;
    return `${value.toLocaleString(info.locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })} ${info.code}`;
  };

  return { code: info.code, isSEK: info.code === "SEK", convert, format, formatPrecise };
}
