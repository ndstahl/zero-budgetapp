import { Stack } from 'expo-router';

export default function StacksLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTitleStyle: { fontWeight: '600', fontSize: 17 },
        presentation: 'modal',
      }}
    >
      <Stack.Screen
        name="add-transaction"
        options={{ title: 'Add Transaction' }}
      />
      <Stack.Screen
        name="edit-transaction"
        options={{ title: 'Edit Transaction' }}
      />
      <Stack.Screen
        name="add-category"
        options={{ title: 'Add Category' }}
      />
      <Stack.Screen
        name="split-transaction"
        options={{ title: 'Split Transaction' }}
      />
      <Stack.Screen
        name="add-fund"
        options={{ title: 'New Savings Fund' }}
      />
      <Stack.Screen
        name="fund-detail"
        options={{ title: 'Fund Details' }}
      />
      <Stack.Screen
        name="bill-reminders"
        options={{ title: 'Bill Reminders' }}
      />
      <Stack.Screen
        name="transaction-rules"
        options={{ title: 'Transaction Rules' }}
      />
      <Stack.Screen
        name="paycheck-planner"
        options={{ title: 'Paycheck Planner' }}
      />
      <Stack.Screen
        name="plaid-link"
        options={{ title: 'Link Bank Account' }}
      />
      <Stack.Screen
        name="linked-accounts"
        options={{ title: 'Linked Accounts' }}
      />
      <Stack.Screen
        name="subscription-manager"
        options={{ title: 'Subscriptions' }}
      />
      <Stack.Screen
        name="net-worth"
        options={{ title: 'Net Worth' }}
      />
      <Stack.Screen
        name="household-manage"
        options={{ title: 'Household' }}
      />
      <Stack.Screen
        name="household-invite"
        options={{ title: 'Join Household' }}
      />
      <Stack.Screen
        name="paywall"
        options={{ title: 'Upgrade to Premium' }}
      />
      <Stack.Screen
        name="roadmap"
        options={{ title: 'Financial Roadmap' }}
      />
      <Stack.Screen
        name="settings/profile"
        options={{ title: 'Profile' }}
      />
      <Stack.Screen
        name="settings/notifications"
        options={{ title: 'Notifications' }}
      />
      <Stack.Screen
        name="settings/security"
        options={{ title: 'Security' }}
      />
      <Stack.Screen
        name="settings/subscription"
        options={{ title: 'Subscription' }}
      />
      <Stack.Screen
        name="settings/export-data"
        options={{ title: 'Export Data' }}
      />
      <Stack.Screen
        name="settings/about"
        options={{ title: 'About' }}
      />
    </Stack>
  );
}
