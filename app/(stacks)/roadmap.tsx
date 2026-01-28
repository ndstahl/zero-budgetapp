import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRoadmap } from '../../src/hooks/useRoadmap';
import { Card } from '../../src/components/ui/Card';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Badge } from '../../src/components/ui/Badge';
import { LoadingScreen } from '../../src/components/shared/LoadingScreen';
import { formatPercent } from '../../src/utils/formatters';
import {
  CheckCircle2,
  Circle,
  Play,
  Lock,
  Target,
} from 'lucide-react-native';

export default function RoadmapScreen() {
  const {
    steps,
    completedCount,
    percentComplete,
    isLoading,
    updateStep,
  } = useRoadmap();

  if (isLoading) return <LoadingScreen />;

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ padding: 16 }}
    >
      {/* Progress Header */}
      <Card className="mb-4">
        <View className="flex-row items-center mb-3">
          <Target color="#4F46E5" size={24} />
          <Text className="ml-2 text-lg font-bold text-gray-900">
            Financial Roadmap
          </Text>
        </View>
        <Text className="mb-2 text-sm text-gray-500">
          Follow these steps to financial freedom. Based on proven principles
          from Dave Ramsey's Baby Steps.
        </Text>
        <View className="mb-1 flex-row justify-between">
          <Text className="text-xs text-gray-400">
            {completedCount} of {steps.length} steps complete
          </Text>
          <Text className="text-xs font-medium text-brand-500">
            {formatPercent(percentComplete)}
          </Text>
        </View>
        <ProgressBar
          progress={percentComplete}
          color="brand"
          height="md"
        />
      </Card>

      {/* Steps */}
      {steps.map((step, idx) => {
        const isCompleted = step.status === 'completed';
        const isActive = step.status === 'active';
        const isLocked = step.status === 'locked';

        return (
          <View key={step.key} className="flex-row mb-1">
            {/* Timeline line */}
            <View className="items-center mr-3 w-8">
              {/* Icon */}
              <View
                className={`h-8 w-8 items-center justify-center rounded-full ${
                  isCompleted
                    ? 'bg-success-500'
                    : isActive
                      ? 'bg-brand-500'
                      : 'bg-gray-200'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 color="#FFFFFF" size={18} />
                ) : isActive ? (
                  <Play color="#FFFFFF" size={14} />
                ) : (
                  <Text className="text-xs font-bold text-gray-400">
                    {idx + 1}
                  </Text>
                )}
              </View>
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <View
                  className={`w-0.5 flex-1 ${
                    isCompleted ? 'bg-success-300' : 'bg-gray-200'
                  }`}
                  style={{ minHeight: 40 }}
                />
              )}
            </View>

            {/* Content */}
            <Card
              className={`flex-1 mb-3 ${
                isActive ? 'border border-brand-200' : ''
              }`}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1 mr-2">
                  <View className="flex-row items-center mb-1">
                    <Text
                      className={`text-sm font-semibold ${
                        isCompleted
                          ? 'text-success-600'
                          : isActive
                            ? 'text-brand-600'
                            : 'text-gray-700'
                      }`}
                    >
                      Step {idx + 1}
                    </Text>
                    {isCompleted && (
                      <Badge label="Complete" variant="success" />
                    )}
                    {isActive && <Badge label="In Progress" variant="brand" />}
                  </View>
                  <Text
                    className={`text-base font-bold ${
                      isLocked ? 'text-gray-400' : 'text-gray-900'
                    }`}
                  >
                    {step.title}
                  </Text>
                  <Text className="mt-1 text-sm text-gray-500">
                    {step.description}
                  </Text>
                  {step.completedAt && (
                    <Text className="mt-1 text-xs text-success-500">
                      Completed {new Date(step.completedAt).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </View>

              {/* Action buttons */}
              {!isCompleted && (
                <View className="mt-3 flex-row">
                  {isLocked && (
                    <Pressable
                      onPress={() =>
                        updateStep({ stepKey: step.key, status: 'active' })
                      }
                      className="rounded-lg bg-brand-50 px-3 py-1.5"
                    >
                      <Text className="text-xs font-medium text-brand-600">
                        Start This Step
                      </Text>
                    </Pressable>
                  )}
                  {isActive && (
                    <Pressable
                      onPress={() =>
                        updateStep({ stepKey: step.key, status: 'completed' })
                      }
                      className="rounded-lg bg-success-50 px-3 py-1.5"
                    >
                      <Text className="text-xs font-medium text-success-600">
                        Mark Complete
                      </Text>
                    </Pressable>
                  )}
                </View>
              )}
            </Card>
          </View>
        );
      })}

      <View className="h-16" />
    </ScrollView>
  );
}
