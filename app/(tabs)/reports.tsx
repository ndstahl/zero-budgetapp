import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import {
  useSpendingByCategory,
  useMonthlyTrends,
  useIncomeVsExpenses,
} from '../../src/hooks/useReports';
import { SpendingByCategory } from '../../src/components/reports/SpendingByCategory';
import { SpendingOverTime } from '../../src/components/reports/SpendingOverTime';
import { IncomeVsExpenses } from '../../src/components/reports/IncomeVsExpenses';
import { LoadingScreen } from '../../src/components/shared/LoadingScreen';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { BarChart3, Lock, TrendingUp } from 'lucide-react-native';

type ReportTab = 'categories' | 'trends' | 'income';

export default function ReportsScreen() {
  const isPremium = useAuthStore((s) => s.isPremium());
  const [activeTab, setActiveTab] = useState<ReportTab>('categories');

  // If not premium, show upgrade prompt
  if (!isPremium) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
        <View className="bg-white px-4 pb-4 pt-4">
          <Text className="text-2xl font-bold text-gray-900">Reports</Text>
          <Text className="mt-1 text-sm text-gray-500">
            Insights into your spending habits
          </Text>
        </View>

        <View className="flex-1 items-center justify-center px-8">
          <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-brand-50">
            <BarChart3 color="#4F46E5" size={40} />
          </View>
          <Text className="mb-2 text-center text-xl font-bold text-gray-900">
            Unlock Reports
          </Text>
          <Text className="mb-6 text-center text-base text-gray-500">
            Get spending breakdowns, trend analysis, income vs. expenses charts,
            and net worth tracking with Premium.
          </Text>

          <Card className="mb-6 w-full">
            <View className="space-y-3">
              <ReportFeature title="Spending by Category" description="Donut chart breakdown" />
              <ReportFeature title="Spending Over Time" description="Monthly trend analysis" />
              <ReportFeature title="Income vs. Expenses" description="Monthly comparison" />
              <ReportFeature title="Net Worth Tracker" description="Assets minus liabilities" />
            </View>
          </Card>

          <Button
            title="Upgrade to Premium"
            onPress={() => router.push('/(stacks)/paywall')}
            icon={<Lock color="#FFFFFF" size={16} />}
            size="lg"
            fullWidth
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="bg-white px-4 pb-3 pt-4">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-gray-900">Reports</Text>
          <Pressable
            onPress={() => router.push('/(stacks)/net-worth')}
            className="flex-row items-center rounded-full bg-brand-50 px-3 py-1.5"
          >
            <TrendingUp color="#4F46E5" size={14} />
            <Text className="ml-1 text-sm font-medium text-brand-600">
              Net Worth
            </Text>
          </Pressable>
        </View>

        {/* Tab selector */}
        <View className="flex-row rounded-xl bg-gray-100 p-1">
          {([
            { key: 'categories', label: 'Categories' },
            { key: 'trends', label: 'Trends' },
            { key: 'income', label: 'Income vs Exp' },
          ] as { key: ReportTab; label: string }[]).map(({ key, label }) => (
            <Pressable
              key={key}
              onPress={() => setActiveTab(key)}
              className={`flex-1 items-center rounded-lg py-2 ${
                activeTab === key ? 'bg-white shadow-sm' : ''
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  activeTab === key ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'categories' && <CategoriesReport />}
        {activeTab === 'trends' && <TrendsReport />}
        {activeTab === 'income' && <IncomeReport />}
        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}

function CategoriesReport() {
  const { data, isLoading } = useSpendingByCategory();

  if (isLoading) return <LoadingScreen />;

  return <SpendingByCategory data={data ?? []} />;
}

function TrendsReport() {
  const { data, isLoading } = useMonthlyTrends(6);

  if (isLoading) return <LoadingScreen />;

  return <SpendingOverTime data={data ?? []} />;
}

function IncomeReport() {
  const { data, isLoading } = useIncomeVsExpenses(6);

  if (isLoading) return <LoadingScreen />;

  return <IncomeVsExpenses data={data ?? []} />;
}

function ReportFeature({ title, description }: { title: string; description: string }) {
  return (
    <View className="flex-row items-center rounded-lg bg-gray-50 p-3">
      <BarChart3 color="#4F46E5" size={20} />
      <View className="ml-3">
        <Text className="text-sm font-semibold text-gray-900">{title}</Text>
        <Text className="text-xs text-gray-500">{description}</Text>
      </View>
    </View>
  );
}
