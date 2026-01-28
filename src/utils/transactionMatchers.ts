import type { TransactionRule } from '../types/common';

/**
 * Find the first matching transaction rule for a given transaction.
 * Rules are evaluated in priority order (highest first).
 */
export function findMatchingRule(
  transaction: { merchantName: string | null; description: string | null },
  rules: TransactionRule[]
): TransactionRule | null {
  const sorted = [...rules].sort((a, b) => b.priority - a.priority);

  for (const rule of sorted) {
    if (!rule.is_active) continue;

    const fieldValue =
      rule.match_field === 'merchant_name'
        ? transaction.merchantName
        : transaction.description;

    if (!fieldValue) continue;

    const normalizedField = fieldValue.toLowerCase();
    const normalizedMatch = rule.match_value.toLowerCase();

    switch (rule.match_type) {
      case 'contains':
        if (normalizedField.includes(normalizedMatch)) return rule;
        break;
      case 'equals':
        if (normalizedField === normalizedMatch) return rule;
        break;
      case 'starts_with':
        if (normalizedField.startsWith(normalizedMatch)) return rule;
        break;
    }
  }

  return null;
}

/**
 * Apply rules to suggest a category for a transaction being entered manually.
 */
export function suggestCategory(
  merchantName: string,
  rules: TransactionRule[]
): string | null {
  const match = findMatchingRule(
    { merchantName, description: null },
    rules
  );
  return match?.line_item_id ?? null;
}
