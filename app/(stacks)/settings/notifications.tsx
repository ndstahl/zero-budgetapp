import { View, Text, ScrollView, Switch } from 'react-native';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../src/stores/authStore';
import { authService } from '../../../src/services/auth.service';
import { Card } from '../../../src/components/ui/Card';
import Toast from 'react-native-toast-message';

interface NotificationPrefs {
  bill_reminders: boolean;
  budget_alerts: boolean;
  weekly_summary: boolean;
  plaid_sync_alerts: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  bill_reminders: true,
  budget_alerts: true,
  weekly_summary: false,
  plaid_sync_alerts: true,
};

export default function NotificationSettingsScreen() {
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const user = useAuthStore((s) => s.user);

  const [prefs, setPrefs] = useState<NotificationPrefs>(() => ({
    ...DEFAULT_PREFS,
    ...((profile as any)?.notification_prefs ?? {}),
  }));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if ((profile as any)?.notification_prefs) {
      setPrefs({ ...DEFAULT_PREFS, ...((profile as any).notification_prefs) });
    }
  }, [profile]);

  const toggle = async (key: keyof NotificationPrefs) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);

    if (!user) return;
    setSaving(true);
    try {
      const updatedProfile = await authService.updateProfile(user.id, {
        notification_prefs: updated,
      } as any);
      setProfile(updatedProfile);
    } catch (err: any) {
      setPrefs(prefs); // revert
      Toast.show({ type: 'error', text1: 'Error', text2: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ padding: 16 }}
    >
      <Card>
        <NotificationRow
          title="Bill Reminders"
          description="Get notified before bills are due"
          value={prefs.bill_reminders}
          onToggle={() => toggle('bill_reminders')}
          disabled={saving}
        />
        <NotificationRow
          title="Budget Alerts"
          description="Alerts when a category is almost or fully spent"
          value={prefs.budget_alerts}
          onToggle={() => toggle('budget_alerts')}
          disabled={saving}
        />
        <NotificationRow
          title="Weekly Summary"
          description="Receive a weekly spending summary"
          value={prefs.weekly_summary}
          onToggle={() => toggle('weekly_summary')}
          disabled={saving}
        />
        <NotificationRow
          title="Bank Sync Alerts"
          description="Notify when bank sync requires attention"
          value={prefs.plaid_sync_alerts}
          onToggle={() => toggle('plaid_sync_alerts')}
          disabled={saving}
          isLast
        />
      </Card>

      <Text className="mt-3 px-2 text-xs text-gray-400">
        Notification preferences are synced across devices.
      </Text>

      <View className="h-16" />
    </ScrollView>
  );
}

function NotificationRow({
  title,
  description,
  value,
  onToggle,
  disabled,
  isLast,
}: {
  title: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  disabled?: boolean;
  isLast?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center justify-between py-3 ${
        !isLast ? 'border-b border-gray-100' : ''
      }`}
    >
      <View className="mr-4 flex-1">
        <Text className="text-sm font-medium text-gray-900">{title}</Text>
        <Text className="mt-0.5 text-xs text-gray-500">{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}
