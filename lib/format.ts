const decimal = new Intl.NumberFormat("it-IT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

// Prima i prezzi venivano stampati grezzi in alcuni punti (129.9 -> "€ 129.9")
// e con toFixed(2) in altri: un unico helper tiene il formato coerente e
// italiano su tutto il sito.
export function formatPrice(value: number): string {
    if (!Number.isFinite(value)) return "€ —";
    return `€ ${decimal.format(value)}`;
}

export const SHIPPING_CENTS = 990;
export const FREE_SHIPPING_THRESHOLD_CENTS = 15000;

export function toCents(value: number): number {
    return Math.round(value * 100);
}
