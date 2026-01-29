import { View, Text, Dimensions, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState, useRef } from 'react';
import { Button } from '../../src/components/ui/Button';
import {
  Wallet,
  TrendingDown,
  PiggyBank,
  Link2,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    icon: <Wallet color="#FFFFFF" size={48} />,
    title: 'Zero-Based\nBudgeting',
    subtitle: 'Every dollar has a job.',
    description:
      'Assign every dollar of income to a category so you always know where your money is going.',
  },
  {
    id: '2',
    icon: <TrendingDown color="#FFFFFF" size={48} />,
    title: 'Track Your\nSpending',
    subtitle: 'Stay in control.',
    description:
      'Log transactions manually or sync your bank automatically. See real-time progress on every budget category.',
  },
  {
    id: '3',
    icon: <PiggyBank color="#FFFFFF" size={48} />,
    title: 'Savings\nGoals',
    subtitle: 'Build your future.',
    description:
      'Create savings funds with targets. Contribute monthly and watch your progress grow over time.',
  },
  {
    id: '4',
    icon: <Link2 color="#FFFFFF" size={48} />,
    title: 'Bank Sync\n& More',
    subtitle: 'Premium power.',
    description:
      'Link bank accounts, auto-categorize transactions, track net worth, share with household, and get detailed reports.',
  },
];

export default function WelcomeScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      });
    } else {
      router.push('/(auth)/sign-up');
    }
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={{ width: SCREEN_WIDTH }} className="items-center justify-center px-10">
      <View className="mb-8 h-24 w-24 items-center justify-center rounded-3xl bg-brand-500">
        {item.icon}
      </View>
      <Text className="mb-2 text-center text-3xl font-bold text-gray-900 dark:text-white">
        {item.title}
      </Text>
      <Text className="mb-2 text-center text-lg font-medium text-brand-500">
        {item.subtitle}
      </Text>
      <Text className="text-center text-base leading-6 text-gray-500 dark:text-gray-400">
        {item.description}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1 justify-center">
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          renderItem={renderSlide}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(
              e.nativeEvent.contentOffset.x / SCREEN_WIDTH
            );
            setActiveIndex(index);
          }}
        />

        {/* Dots */}
        <View className="flex-row items-center justify-center py-4">
          {SLIDES.map((_, idx) => (
            <View
              key={idx}
              className={`mx-1 rounded-full ${
                idx === activeIndex
                  ? 'h-2.5 w-6 bg-brand-500'
                  : 'h-2.5 w-2.5 bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </View>
      </View>

      {/* Bottom CTA */}
      <View className="px-8 pb-4">
        <Button
          title={activeIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          size="lg"
          fullWidth
        />
        <View className="mt-3">
          <Button
            title="I already have an account"
            onPress={() => router.push('/(auth)/sign-in')}
            variant="ghost"
            size="lg"
            fullWidth
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
