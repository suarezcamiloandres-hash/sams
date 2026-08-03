/** Formats a money amount for display. Shared by server and client code. */
export function formatMoney(
  amount: number | string,
  currencyCode: string,
): string {
  const value = typeof amount === "number" ? amount : Number(amount);
  const symbol = currencyCode === "AUD" || currencyCode === "USD" ? "$" : "";
  const formatted = Number.isFinite(value) ? value.toFixed(2) : String(amount);
  return symbol ? `${symbol}${formatted}` : `${formatted} ${currencyCode}`;
}
