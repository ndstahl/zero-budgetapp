import {
  findMatchingRule,
  suggestCategory,
} from '../../src/utils/transactionMatchers';
import type { TransactionRule } from '../../src/types/common';

const mockRules: TransactionRule[] = [
  {
    id: '1',
    user_id: 'u1',
    match_field: 'merchant_name',
    match_type: 'contains',
    match_value: 'Walmart',
    line_item_id: 'li-groceries',
    is_active: true,
    priority: 1,
    created_at: '',
  },
  {
    id: '2',
    user_id: 'u1',
    match_field: 'merchant_name',
    match_type: 'equals',
    match_value: 'netflix',
    line_item_id: 'li-streaming',
    is_active: true,
    priority: 2,
    created_at: '',
  },
  {
    id: '3',
    user_id: 'u1',
    match_field: 'description',
    match_type: 'starts_with',
    match_value: 'transfer',
    line_item_id: 'li-savings',
    is_active: true,
    priority: 3,
    created_at: '',
  },
  {
    id: '4',
    user_id: 'u1',
    match_field: 'merchant_name',
    match_type: 'contains',
    match_value: 'Target',
    line_item_id: 'li-shopping',
    is_active: false,
    priority: 10,
    created_at: '',
  },
];

describe('findMatchingRule', () => {
  it('matches contains rule (case insensitive)', () => {
    const result = findMatchingRule(
      { merchantName: 'WALMART SUPERCENTER', description: null },
      mockRules,
    );
    expect(result?.id).toBe('1');
  });

  it('matches equals rule (case insensitive)', () => {
    const result = findMatchingRule(
      { merchantName: 'Netflix', description: null },
      mockRules,
    );
    expect(result?.id).toBe('2');
  });

  it('matches starts_with on description', () => {
    const result = findMatchingRule(
      { merchantName: null, description: 'Transfer to savings' },
      mockRules,
    );
    expect(result?.id).toBe('3');
  });

  it('skips inactive rules', () => {
    const result = findMatchingRule(
      { merchantName: 'Target', description: null },
      mockRules,
    );
    expect(result).toBeNull();
  });

  it('returns null when no match', () => {
    const result = findMatchingRule(
      { merchantName: 'Unknown Store', description: null },
      mockRules,
    );
    expect(result).toBeNull();
  });

  it('returns highest priority match first', () => {
    const rules: TransactionRule[] = [
      ...mockRules,
      {
        id: '5',
        user_id: 'u1',
        match_field: 'merchant_name',
        match_type: 'contains',
        match_value: 'Walmart',
        line_item_id: 'li-other',
        is_active: true,
        priority: 99,
        created_at: '',
      },
    ];
    const result = findMatchingRule(
      { merchantName: 'Walmart', description: null },
      rules,
    );
    expect(result?.id).toBe('5');
  });
});

describe('suggestCategory', () => {
  it('returns line_item_id for matching merchant', () => {
    expect(suggestCategory('Walmart Grocery', mockRules)).toBe('li-groceries');
  });

  it('returns null for no match', () => {
    expect(suggestCategory('Unknown', mockRules)).toBeNull();
  });
});
