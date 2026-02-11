import { View, Text, ScrollView, Pressable, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { useResolvedTheme } from '../../src/components/ThemeProvider';
import { authService } from '../../src/services/auth.service';
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Link2,
  Download,
  HelpCircle,
  LogOut,
  ChevronRight,
  Crown,
  Users,
  Target,
  Receipt,
  Zap,
  DollarSign,
  Repeat,
  Info,
  Palette,
  type LucideIcon,
} from 'lucide-react-native';

export default function MoreScreen() {
  const resolvedTheme = useResolvedTheme();
  const isDark = resolvedTheme === 'dark';
  const profile = useAuthStore((s) => s.profile);

  const styles = createStyles(isDark);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await authService.signOut();
            useAuthStore.getState().reset();
            router.replace('/(auth)/welcome');
          } catch (error) {
            Alert.alert('Error', 'Failed to sign out. Please try again.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitial}>
              {profile?.full_name?.[0]?.toUpperCase() ?? '?'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile?.full_name ?? 'User'}</Text>
            <Text style={styles.profileEmail}>{profile?.email}</Text>
          </View>
          {profile?.premium_tier === 'premium' && (
            <View style={styles.premiumBadge}>
              <Crown color="#4F46E5" size={14} />
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          )}
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FEATURES</Text>
          <View style={styles.menuCard}>
            <MenuItem icon={Target} label="Financial Roadmap" onPress={() => router.push('/(stacks)/roadmap')} isDark={isDark} />
            <MenuItem icon={Users} label="Household" onPress={() => router.push('/(stacks)/household-manage')} premium isDark={isDark} />
            <MenuItem icon={Receipt} label="Transaction Rules" onPress={() => router.push('/(stacks)/transaction-rules')} isDark={isDark} />
            <MenuItem icon={DollarSign} label="Paycheck Planner" onPress={() => router.push('/(stacks)/paycheck-planner')} isDark={isDark} />
            <MenuItem icon={Zap} label="Bill Reminders" onPress={() => router.push('/(stacks)/bill-reminders')} isDark={isDark} />
            <MenuItem icon={Repeat} label="Subscriptions" onPress={() => router.push('/(stacks)/subscription-manager')} premium isDark={isDark} isLast />
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SETTINGS</Text>
          <View style={styles.menuCard}>
            <MenuItem icon={User} label="Profile" onPress={() => router.push('/(stacks)/settings/profile')} isDark={isDark} />
            <MenuItem icon={Palette} label="Appearance" onPress={() => router.push('/(stacks)/settings/appearance')} isDark={isDark} />
            <MenuItem icon={Bell} label="Notifications" onPress={() => router.push('/(stacks)/settings/notifications')} isDark={isDark} />
            <MenuItem icon={Shield} label="Security" onPress={() => router.push('/(stacks)/settings/security')} isDark={isDark} />
            <MenuItem icon={CreditCard} label="Subscription" onPress={() => router.push('/(stacks)/settings/subscription')} isDark={isDark} />
            <MenuItem icon={Link2} label="Linked Accounts" onPress={() => router.push('/(stacks)/linked-accounts')} premium isDark={isDark} />
            <MenuItem icon={Download} label="Export Data" onPress={() => router.push('/(stacks)/settings/export-data')} isDark={isDark} isLast />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUPPORT</Text>
          <View style={styles.menuCard}>
            <MenuItem icon={HelpCircle} label="Help & Support" onPress={() => {}} isDark={isDark} />
            <MenuItem icon={Info} label="About" onPress={() => router.push('/(stacks)/settings/about')} isDark={isDark} isLast />
          </View>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <View style={styles.menuCard}>
            <Pressable
              onPress={handleSignOut}
              style={({ pressed }) => [styles.signOutButton, pressed && styles.menuItemPressed]}
            >
              <LogOut color="#EF4444" size={20} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onPress,
  premium,
  isDark,
  isLast,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  premium?: boolean;
  isDark: boolean;
  isLast?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 14,
          backgroundColor: pressed ? (isDark ? '#283548' : '#F9FAFB') : 'transparent',
          borderBottomWidth: isLast ? 0 : 1,
          borderBottomColor: isDark ? '#374151' : '#F3F4F6',
        },
      ]}
    >
      <View style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: isDark ? '#374151' : '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Icon color={isDark ? '#9CA3AF' : '#6B7280'} size={18} />
      </View>
      <Text style={{
        flex: 1,
        marginLeft: 12,
        fontSize: 15,
        fontWeight: '500',
        color: isDark ? '#FFFFFF' : '#111827',
      }}>
        {label}
      </Text>
      {premium && (
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: isDark ? 'rgba(79, 70, 229, 0.2)' : '#EEF2FF',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 6,
          marginRight: 8,
          gap: 4,
        }}>
          <Crown color="#4F46E5" size={12} />
          <Text style={{ fontSize: 11, fontWeight: '600', color: '#4F46E5' }}>PRO</Text>
        </View>
      )}
      <ChevronRight color="#9CA3AF" size={18} />
    </Pressable>
  );
}

const createStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#0F172A' : '#FAF9F6',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: isDark ? '#FFFFFF' : '#111827',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '600',
    color: isDark ? '#FFFFFF' : '#111827',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(79, 70, 229, 0.2)' : '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  premiumText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItemPressed: {
    backgroundColor: isDark ? '#283548' : '#F9FAFB',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  signOutText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
});
