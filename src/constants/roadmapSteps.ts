export interface RoadmapStep {
  key: string;
  title: string;
  description: string;
  icon: string; // lucide icon name for display reference
  order: number;
}

export const ROADMAP_STEPS: RoadmapStep[] = [
  {
    key: 'starter_budget',
    title: 'Create Your First Budget',
    description: 'Set up a zero-based budget and assign every dollar a job.',
    icon: 'Wallet',
    order: 1,
  },
  {
    key: 'starter_emergency',
    title: '$1,000 Starter Emergency Fund',
    description: 'Save $1,000 as fast as you can for unexpected expenses.',
    icon: 'Shield',
    order: 2,
  },
  {
    key: 'pay_off_debt',
    title: 'Pay Off All Debt (Debt Snowball)',
    description: 'List debts smallest to largest. Attack the smallest first while paying minimums on everything else.',
    icon: 'TrendingDown',
    order: 3,
  },
  {
    key: 'full_emergency',
    title: 'Full Emergency Fund (3-6 Months)',
    description: 'Build 3-6 months of expenses in a savings account for full financial security.',
    icon: 'ShieldCheck',
    order: 4,
  },
  {
    key: 'invest_15',
    title: 'Invest 15% of Income',
    description: 'Invest 15% of household income into retirement accounts (401k, Roth IRA).',
    icon: 'TrendingUp',
    order: 5,
  },
  {
    key: 'college_fund',
    title: 'Save for Education',
    description: 'Start saving for children\'s college or other education goals using 529 plans or ESAs.',
    icon: 'GraduationCap',
    order: 6,
  },
  {
    key: 'pay_off_home',
    title: 'Pay Off Your Home',
    description: 'Make extra payments on your mortgage to become completely debt-free.',
    icon: 'Home',
    order: 7,
  },
  {
    key: 'build_wealth',
    title: 'Build Wealth & Give',
    description: 'Live and give like no one else. Maximize investments and generosity.',
    icon: 'Heart',
    order: 8,
  },
];
