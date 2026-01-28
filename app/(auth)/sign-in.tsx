import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState } from 'react';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { authService } from '../../src/services/auth.service';
import Toast from 'react-native-toast-message';
import { Mail, Lock, ArrowLeft } from 'lucide-react-native';
import { Pressable } from 'react-native';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.signIn(email.trim(), password);
      // Auth listener in useAuth will handle navigation
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Sign In Failed',
        text2: err.message ?? 'Invalid email or password',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="px-6 pt-4">
            <Pressable onPress={() => router.back()} className="mb-6">
              <ArrowLeft color="#374151" size={24} />
            </Pressable>
            <Text className="mb-2 text-3xl font-bold text-gray-900">
              Welcome back
            </Text>
            <Text className="mb-8 text-base text-gray-500">
              Sign in to your account to continue budgeting.
            </Text>
          </View>

          {/* Form */}
          <View className="flex-1 px-6">
            <View className="mb-4">
              <Input
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={errors.email}
                leftIcon={<Mail color="#9CA3AF" size={20} />}
              />
            </View>

            <View className="mb-6">
              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                error={errors.password}
                leftIcon={<Lock color="#9CA3AF" size={20} />}
              />
            </View>

            <Button
              title="Sign In"
              onPress={handleSignIn}
              loading={loading}
              size="lg"
              fullWidth
            />

            <Pressable
              onPress={() => router.push('/(auth)/forgot-password')}
              className="mt-4 self-center"
            >
              <Text className="text-base text-brand-500 font-medium">
                Forgot your password?
              </Text>
            </Pressable>
          </View>

          {/* Footer */}
          <View className="flex-row items-center justify-center px-6 pb-8 pt-4">
            <Text className="text-base text-gray-500">Don't have an account? </Text>
            <Pressable onPress={() => router.replace('/(auth)/sign-up')}>
              <Text className="text-base font-semibold text-brand-500">Sign Up</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
