import { View, Text, ScrollView, Switch, Alert } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Biometric } from '../../../src/lib/biometric';
import { Card } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';
import { useAuthStore } from '../../../src/stores/authStore';
import { authService } from '../../../src/services/auth.service';
import { Fingerprint, ShieldCheck } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

export default function SecuritySettingsScreen() {
  const user = useAuthStore((s) => s.user);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricTypes, setBiometricTypes] = useState<string[]>([]);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [changingPassword, setChangingPassword] = useState(false);

  const loadBiometricState = useCallback(async () => {
    try {
      const available = await Biometric.isAvailable();
      setBiometricAvailable(available);
      if (available) {
        const types = await Biometric.getSupportedTypes();
        setBiometricTypes(types);
        const enabled = await Biometric.isEnabled();
        setBiometricEnabled(enabled);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBiometricState();
  }, [loadBiometricState]);

  const handleBiometricToggle = async () => {
    if (!biometricEnabled) {
      // Turning on: authenticate first to confirm
      const success = await Biometric.authenticate(
        'Verify to enable biometric unlock'
      );
      if (!success) return;
      await Biometric.setEnabled(true);
      setBiometricEnabled(true);
      Toast.show({ type: 'success', text1: 'Biometric unlock enabled' });
    } else {
      await Biometric.setEnabled(false);
      setBiometricEnabled(false);
      await Biometric.clearSessionToken();
      Toast.show({ type: 'success', text1: 'Biometric unlock disabled' });
    }
  };

  const handleChangePassword = () => {
    if (!user?.email) return;
    Alert.alert(
      'Change Password',
      'We will send a password reset link to your email address.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Reset Link',
          onPress: async () => {
            setChangingPassword(true);
            try {
              await authService.resetPassword(user.email!);
              Toast.show({
                type: 'success',
                text1: 'Reset link sent',
                text2: 'Check your email to set a new password',
              });
            } catch (err: any) {
              Toast.show({ type: 'error', text1: 'Error', text2: err.message });
            } finally {
              setChangingPassword(false);
            }
          },
        },
      ]
    );
  };

  const biometricLabel = biometricTypes.length > 0
    ? biometricTypes.join(' / ')
    : 'Biometric';

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ padding: 16 }}
    >
      {/* Biometric Section */}
      <Text className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
        App Lock
      </Text>
      <Card className="mb-4">
        <View className="flex-row items-center mb-3">
          <Fingerprint color="#4F46E5" size={24} />
          <Text className="ml-2 text-base font-semibold text-gray-900">
            {biometricLabel} Unlock
          </Text>
        </View>

        {!loading && biometricAvailable ? (
          <>
            <Text className="mb-3 text-sm text-gray-500">
              Use {biometricLabel} to unlock the app quickly and securely.
            </Text>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-medium text-gray-700">
                Enable {biometricLabel}
              </Text>
              <Switch
                value={biometricEnabled}
                onValueChange={handleBiometricToggle}
                trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </>
        ) : !loading ? (
          <Text className="text-sm text-gray-400">
            Biometric authentication is not available on this device.
          </Text>
        ) : (
          <Text className="text-sm text-gray-400">Checking device...</Text>
        )}
      </Card>

      {/* Password Section */}
      <Text className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
        Password
      </Text>
      <Card className="mb-4">
        <View className="flex-row items-center mb-3">
          <ShieldCheck color="#4F46E5" size={24} />
          <Text className="ml-2 text-base font-semibold text-gray-900">
            Change Password
          </Text>
        </View>
        <Text className="mb-3 text-sm text-gray-500">
          A password reset link will be sent to {user?.email ?? 'your email'}.
        </Text>
        <Button
          title="Send Reset Link"
          onPress={handleChangePassword}
          variant="outline"
          loading={changingPassword}
          fullWidth
        />
      </Card>

      <View className="h-16" />
    </ScrollView>
  );
}
