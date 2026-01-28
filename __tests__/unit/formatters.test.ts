import {
  formatCurrency,
  formatCurrencyCompact,
  parseDollarsToCents,
  centsToDollars,
  formatPercent,
  getMonthName,
  getMonthShort,
  formatDate,
  formatDateRelative,
} from '../../src/utils/formatters';

describe('formatCurrency', () => {
  it('formats cents to dollar string', () => {
    expect(formatCurrency(150000)).toBe('$1,500.00');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('handles cents', () => {
    expect(formatCurrency(99)).toBe('$0.99');
  });
});

describe('formatCurrencyCompact', () => {
  it('omits decimals for whole dollars', () => {
    expect(formatCurrencyCompact(150000)).toBe('$1,500');
  });

  it('includes decimals for fractional amounts', () => {
    expect(formatCurrencyCompact(150050)).toBe('$1,500.50');
  });
});

describe('parseDollarsToCents', () => {
  it('parses dollar string to cents', () => {
    expect(parseDollarsToCents('1500.50')).toBe(150050);
  });

  it('handles non-numeric input', () => {
    expect(parseDollarsToCents('abc')).toBe(0);
  });

  it('strips non-numeric chars', () => {
    expect(parseDollarsToCents('$1,500.00')).toBe(150000);
  });
});

describe('centsToDollars', () => {
  it('converts cents to dollar string', () => {
    expect(centsToDollars(150050)).toBe('1500.50');
  });

  it('handles zero', () => {
    expect(centsToDollars(0)).toBe('0.00');
  });
});

describe('formatPercent', () => {
  it('formats decimal to percent string', () => {
    expect(formatPercent(0.75)).toBe('75%');
  });

  it('rounds to nearest integer', () => {
    expect(formatPercent(0.333)).toBe('33%');
  });

  it('handles zero', () => {
    expect(formatPercent(0)).toBe('0%');
  });

  it('handles 100%', () => {
    expect(formatPercent(1)).toBe('100%');
  });
});

describe('getMonthName', () => {
  it('returns full month name', () => {
    expect(getMonthName(1)).toBe('January');
    expect(getMonthName(6)).toBe('June');
    expect(getMonthName(12)).toBe('December');
  });
});

describe('getMonthShort', () => {
  it('returns abbreviated month name', () => {
    expect(getMonthShort(1)).toBe('Jan');
    expect(getMonthShort(12)).toBe('Dec');
  });
});

describe('formatDate', () => {
  it('formats date string to display format', () => {
    const result = formatDate('2024-03-15');
    expect(result).toMatch(/Mar/);
    expect(result).toMatch(/15/);
    expect(result).toMatch(/2024/);
  });
});

describe('formatDateRelative', () => {
  it('returns Today for today', () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    expect(formatDateRelative(dateStr)).toBe('Today');
  });

  it('returns Yesterday for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, '0');
    const day = String(yesterday.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    expect(formatDateRelative(dateStr)).toBe('Yesterday');
  });

  it('returns formatted date for older dates', () => {
    const result = formatDateRelative('2023-01-01');
    expect(result).toMatch(/Jan/);
    expect(result).toMatch(/2023/);
  });
});
