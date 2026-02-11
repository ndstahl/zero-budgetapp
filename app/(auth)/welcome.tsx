import { View, Text, Pressable, Platform, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState, useRef } from 'react';
import { Button } from '../../src/components/ui/Button';
import {
  Wallet,
  TrendingDown,
  PiggyBank,
  Link2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native';

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
    title: 'Zero-Based Budgeting',
    subtitle: 'Every dollar has a job.',
    description:
      'Assign every dollar of income to a category so you always know where your money is going.',
  },
  {
    id: '2',
    icon: <TrendingDown color="#FFFFFF" size={48} />,
    title: 'Track Your Spending',
    subtitle: 'Stay in control.',
    description:
      'Log transactions manually or sync your bank automatically. See real-time progress on every budget category.',
  },
  {
    id: '3',
    icon: <PiggyBank color="#FFFFFF" size={48} />,
    title: 'Savings Goals',
    subtitle: 'Build your future.',
    description:
      'Create savings funds with targets. Contribute monthly and watch your progress grow over time.',
  },
  {
    id: '4',
    icon: <Link2 color="#FFFFFF" size={48} />,
    title: 'Bank Sync & More',
    subtitle: 'Premium power.',
    description:
      'Link bank accounts, auto-categorize transactions, track net worth, share with household, and get detailed reports.',
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function WelcomeScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const isWeb = Platform.OS === 'web';

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      const nextIndex = activeIndex + 1;
      setActiveIndex(nextIndex);
      scrollViewRef.current?.scrollTo({ x: nextIndex * SCREEN_WIDTH, animated: true });
    } else {
      router.push('/(auth)/sign-up');
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      const prevIndex = activeIndex - 1;
      setActiveIndex(prevIndex);
      scrollViewRef.current?.scrollTo({ x: prevIndex * SCREEN_WIDTH, animated: true });
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / SCREEN_WIDTH);
    if (index !== activeIndex && index >= 0 && index < SLIDES.length) {
      setActiveIndex(index);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      {/* Swipeable Slides */}
      <View className="flex-1">
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ alignItems: 'center' }}
        >
          {SLIDES.map((slide, index) => (
            <View
              key={slide.id}
              style={{ width: SCREEN_WIDTH }}
              className="flex-1 items-center justify-center px-6"
            >
              <View className="w-full max-w-md items-center py-8">
                <View className="mb-8 h-24 w-24 items-center justify-center rounded-3xl bg-brand-500">
                  {slide.icon}
                </View>
                <Text className="mb-3 text-center text-3xl font-bold text-gray-900 dark:text-white">
                  {slide.title}
                </Text>
                <Text className="mb-3 text-center text-lg font-medium text-brand-500">
                  {slide.subtitle}
                </Text>
                <Text className="text-center text-base leading-6 text-gray-500 dark:text-gray-400">
                  {slide.description}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Navigation Arrows (for web) */}
      {isWeb && (
        <View className="flex-row items-center justify-center py-4">
          <Pressable
            onPress={handlePrev}
            disabled={activeIndex === 0}
            className={`mr-4 h-10 w-10 items-center justify-center rounded-full ${
              activeIndex === 0 ? 'bg-gray-100 dark:bg-gray-800' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <ChevronLeft
              color={activeIndex === 0 ? '#D1D5DB' : '#6B7280'}
              size={24}
            />
          </Pressable>

          {/* Dots */}
          <View className="flex-row items-center justify-center">
            {SLIDES.map((_, idx) => (
              <Pressable
                key={idx}
                onPress={() => {
                  setActiveIndex(idx);
                  scrollViewRef.current?.scrollTo({ x: idx * SCREEN_WIDTH, animated: true });
                }}
                className={`mx-1.5 rounded-full ${
                  idx === activeIndex
                    ? 'h-3 w-8 bg-brand-500'
                    : 'h-3 w-3 bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </View>

          <Pressable
            onPress={handleNext}
            disabled={activeIndex === SLIDES.length - 1}
            className={`ml-4 h-10 w-10 items-center justify-center rounded-full ${
              activeIndex === SLIDES.length - 1 ? 'bg-gray-100 dark:bg-gray-800' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <ChevronRight
              color={activeIndex === SLIDES.length - 1 ? '#D1D5DB' : '#6B7280'}
              size={24}
            />
          </Pressable>
        </View>
      )}

      {/* Dots only (for mobile) */}
      {!isWeb && (
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
      )}

      {/* Bottom CTA - constrained width on web */}
      <View className="items-center px-6 pb-6">
        <View className="w-full max-w-md">
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
      </View>
    </SafeAreaView>
  );
}
