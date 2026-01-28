import { View, Text, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../src/stores/authStore';
import { authService } from '../../../src/services/auth.service';
import { Card } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';
import { Input } from '../../../src/components/ui/Input';
import Toast from 'react-native-toast-message';

export default function ProfileSettingsScreen() {
  const profile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);
  const setProfile = useAuthStore((s) => s.setProfile);

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile?.full_name) setFullName(profile.full_name);
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const updated = await authService.updateProfile(user.id, {
        full_name: fullName.trim() || null,
      });
      setProfile(updated);
      Toast.show({ type: 'success', text1: 'Profile updated' });
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ padding: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Avatar */}
      <View className="mb-6 items-center">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-brand-100">
          <Text className="text-3xl font-bold text-brand-600">
            {fullName?.[0]?.toUpperCase() ?? '?'}
          </Text>
        </View>
      </View>

      <Card>
        <View className="mb-4">
          <Input
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Your name"
          />
        </View>

        <View className="mb-4">
          <Text className="mb-1 text-sm font-medium text-gray-700">Email</Text>
          <View className="rounded-xl bg-gray-100 px-4 py-3">
            <Text className="text-sm text-gray-500">{profile?.email ?? user?.email}</Text>
          </View>
          <Text className="mt-1 text-xs text-gray-400">
            Email cannot be changed here
          </Text>
        </View>

        <View className="mb-4">
          <Text className="mb-1 text-sm font-medium text-gray-700">
            Member Since
          </Text>
          <View className="rounded-xl bg-gray-100 px-4 py-3">
            <Text className="text-sm text-gray-500">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString()
                : 'N/A'}
            </Text>
          </View>
        </View>

        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={loading}
          fullWidth
        />
      </Card>

      <View className="h-16" />
    </ScrollView>
  );
}
