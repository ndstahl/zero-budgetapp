import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState } from 'react';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { authService } from '../../src/services/auth.service';
import Toast from 'react-native-toast-message';
import { Mail, ArrowLeft } from 'lucide-react-native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      await authService.resetPassword(email.trim());
      setSent(true);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.message ?? 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-8">
          <View className="mb-6 h-16 w-16 items-center justify-center rounded-full bg-success-50">
            <Mail color="#22C55E" size={32} />
          </View>
          <Text className="mb-2 text-center text-2xl font-bold text-gray-900">
            Check your email
          </Text>
          <Text className="mb-8 text-center text-base text-gray-500">
            We sent a password reset link to{'\n'}
            {email}
          </Text>
          <Button
            title="Back to Sign In"
            onPress={() => router.replace('/(auth)/sign-in')}
            size="lg"
            fullWidth
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-4">
        <Pressable onPress={() => router.back()} className="mb-6">
          <ArrowLeft color="#374151" size={24} />
        </Pressable>
        <Text className="mb-2 text-3xl font-bold text-gray-900">
          Reset password
        </Text>
        <Text className="mb-8 text-base text-gray-500">
          Enter your email and we'll send you a link to reset your password.
        </Text>
      </View>

      <View className="px-6">
        <View className="mb-6">
          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon={<Mail color="#9CA3AF" size={20} />}
          />
        </View>
        <Button
          title="Send Reset Link"
          onPress={handleReset}
          loading={loading}
          size="lg"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}
