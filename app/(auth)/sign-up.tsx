import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState } from 'react';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { authService } from '../../src/services/auth.service';
import Toast from 'react-native-toast-message';
import { User, Mail, Lock, ArrowLeft } from 'lucide-react-native';

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = 'Name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email address';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8)
      newErrors.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.signUp(email.trim(), password, fullName.trim());
      Toast.show({
        type: 'success',
        text1: 'Account Created',
        text2: 'Check your email to verify your account.',
      });
      router.replace('/(auth)/sign-in');
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Sign Up Failed',
        text2: err.message ?? 'Something went wrong',
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
              Create your account
            </Text>
            <Text className="mb-8 text-base text-gray-500">
              Start giving every dollar a job today.
            </Text>
          </View>

          {/* Form */}
          <View className="flex-1 px-6">
            <View className="mb-4">
              <Input
                label="Full Name"
                placeholder="Jane Doe"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                error={errors.fullName}
                leftIcon={<User color="#9CA3AF" size={20} />}
              />
            </View>

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

            <View className="mb-4">
              <Input
                label="Password"
                placeholder="Min. 8 characters"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                error={errors.password}
                leftIcon={<Lock color="#9CA3AF" size={20} />}
              />
            </View>

            <View className="mb-6">
              <Input
                label="Confirm Password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                error={errors.confirmPassword}
                leftIcon={<Lock color="#9CA3AF" size={20} />}
              />
            </View>

            <Button
              title="Create Account"
              onPress={handleSignUp}
              loading={loading}
              size="lg"
              fullWidth
            />
          </View>

          {/* Footer */}
          <View className="flex-row items-center justify-center px-6 pb-8 pt-4">
            <Text className="text-base text-gray-500">Already have an account? </Text>
            <Pressable onPress={() => router.replace('/(auth)/sign-in')}>
              <Text className="text-base font-semibold text-brand-500">Sign In</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
