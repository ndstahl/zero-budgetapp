/**
 * Format cents to a currency string.
 * e.g. 150000 -> "$1,500.00"
 */
export function formatCurrency(cents: number): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(dollars);
}

/**
 * Format cents to a compact currency string (no decimals for whole dollars).
 * e.g. 150000 -> "$1,500"
 */
export function formatCurrencyCompact(cents: number): string {
  const dollars = cents / 100;
  if (dollars % 1 === 0) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(dollars);
  }
  return formatCurrency(cents);
}

/**
 * Parse a dollar string input to cents.
 * e.g. "1500.50" -> 150050
 */
export function parseDollarsToCents(input: string): number {
  const cleaned = input.replace(/[^0-9.]/g, '');
  const dollars = parseFloat(cleaned);
  if (isNaN(dollars)) return 0;
  return Math.round(dollars * 100);
}

/**
 * Format cents to a dollar string for input fields.
 * e.g. 150050 -> "1500.50"
 */
export function centsToDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * Format a percentage value.
 * e.g. 0.75 -> "75%"
 */
export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

/**
 * Get month name from month number (1-12).
 */
export function getMonthName(month: number): string {
  const date = new Date(2024, month - 1, 1);
  return date.toLocaleString('en-US', { month: 'long' });
}

/**
 * Get short month name.
 */
export function getMonthShort(month: number): string {
  const date = new Date(2024, month - 1, 1);
  return date.toLocaleString('en-US', { month: 'short' });
}

/**
 * Format a date string to display format.
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format a date to relative label (Today, Yesterday, etc.).
 */
export function formatDateRelative(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.getTime() === today.getTime()) return 'Today';
  if (date.getTime() === yesterday.getTime()) return 'Yesterday';
  return formatDate(dateStr);
}
