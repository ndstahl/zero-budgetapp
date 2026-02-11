# Zero Budget App - Testing Checklist

## Authentication
- [ ] Sign up with email/password
- [ ] Sign in with existing account
- [ ] Sign out
- [ ] Forgot password flow
- [ ] Apple Sign In (if on iOS device)
- [ ] Session persistence (close app, reopen - should stay logged in)

## Home Tab (Dashboard)
- [ ] Displays greeting with user's first name
- [ ] Month navigation arrows work
- [ ] Overview card shows income, spent, remaining
- [ ] Progress bar reflects spending percentage
- [ ] Tap "Income Received" opens income modal
- [ ] Tap "Spent" opens expenses modal
- [ ] "Add Transaction" button works
- [ ] Recent Transactions shows correct month's data
- [ ] "See All" navigates to Transactions tab
- [ ] Empty state shows "Create Your Budget" when no budget exists

## Budget Tab
- [ ] Month navigation works
- [ ] Create new budget
- [ ] Copy budget from previous month
- [ ] View "Left to Budget" summary
- [ ] Edit planned income
- [ ] Add new line item to category
- [ ] Edit line item amount
- [ ] View income vs expense sections

## Transactions Tab
- [ ] List shows all transactions for current month
- [ ] Add income transaction
- [ ] Add expense transaction
- [ ] Edit existing transaction
- [ ] Delete transaction
- [ ] Categorize transaction (assign to line item)
- [ ] Split transaction across categories
- [ ] Search/filter transactions

## Reports Tab
- [ ] Charts/graphs display correctly
- [ ] Data reflects actual transactions

## More Tab - Features
- [ ] Financial Roadmap
- [ ] Household management (Premium)
- [ ] Transaction Rules
- [ ] Paycheck Planner
- [ ] Bill Reminders
- [ ] Subscriptions (Premium)

## More Tab - Settings
- [ ] Profile - update name/info
- [ ] Appearance - light/dark/system theme
- [ ] Notifications settings
- [ ] Security settings
- [ ] Subscription status
- [ ] Linked Accounts (Premium)
- [ ] Export Data
- [ ] About page

## Cross-Cutting
- [ ] Dark mode displays correctly throughout
- [ ] Light mode displays correctly throughout
- [ ] Data syncs between months correctly
- [ ] App works offline gracefully (or shows appropriate errors)
- [ ] Pull to refresh where applicable

## Edge Cases
- [ ] Empty budget month (no transactions)
- [ ] Negative remaining balance displays in red
- [ ] Very long transaction names truncate properly
- [ ] Large dollar amounts format correctly
