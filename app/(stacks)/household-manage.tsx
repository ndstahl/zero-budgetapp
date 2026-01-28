import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useHousehold } from '../../src/hooks/useHousehold';
import { useAuthStore } from '../../src/stores/authStore';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Badge } from '../../src/components/ui/Badge';
import { EmptyState } from '../../src/components/shared/EmptyState';
import { LoadingScreen } from '../../src/components/shared/LoadingScreen';
import Toast from 'react-native-toast-message';
import {
  Users,
  Plus,
  UserPlus,
  Trash2,
  LogOut,
  Mail,
  Crown,
  Clock,
} from 'lucide-react-native';

export default function HouseholdManageScreen() {
  const profile = useAuthStore((s) => s.profile);
  const {
    household,
    members,
    invites,
    isLoading,
    isCreating,
    isInviting,
    createHousehold,
    inviteMember,
    removeMember,
    leaveHousehold,
    cancelInvite,
  } = useHousehold();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [householdName, setHouseholdName] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const isOwner = profile?.household_role === 'owner';

  const handleCreate = () => {
    if (!householdName.trim()) {
      Toast.show({ type: 'error', text1: 'Name required' });
      return;
    }

    createHousehold(householdName.trim(), {
      onSuccess: () => {
        Toast.show({ type: 'success', text1: 'Household created!' });
        setShowCreateForm(false);
        setHouseholdName('');
      },
    });
  };

  const handleInvite = () => {
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      Toast.show({ type: 'error', text1: 'Enter a valid email' });
      return;
    }

    inviteMember(inviteEmail.trim(), {
      onSuccess: () => {
        Toast.show({
          type: 'success',
          text1: 'Invite Sent',
          text2: `Invitation sent to ${inviteEmail}`,
        });
        setShowInviteForm(false);
        setInviteEmail('');
      },
    });
  };

  const handleRemoveMember = (memberId: string, name: string) => {
    Alert.alert('Remove Member', `Remove "${name}" from the household?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeMember(memberId) },
    ]);
  };

  const handleLeave = () => {
    Alert.alert(
      'Leave Household',
      'You will lose access to shared budgets and data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            leaveHousehold(undefined as any, {
              onSuccess: () => {
                Toast.show({ type: 'success', text1: 'Left household' });
                router.back();
              },
            });
          },
        },
      ]
    );
  };

  if (isLoading) return <LoadingScreen />;

  // No household yet
  if (!household) {
    return (
      <ScrollView
        className="flex-1 bg-gray-50"
        contentContainerStyle={{ padding: 16 }}
      >
        {showCreateForm ? (
          <Card>
            <Text className="mb-3 text-sm font-semibold text-gray-700">
              Create Household
            </Text>
            <View className="mb-3">
              <Input
                label="Household Name"
                placeholder="e.g. Smith Family, Our Budget"
                value={householdName}
                onChangeText={setHouseholdName}
              />
            </View>
            <Button
              title="Create Household"
              onPress={handleCreate}
              loading={isCreating}
              fullWidth
            />
          </Card>
        ) : (
          <EmptyState
            title="No Household"
            description="Create a household to share budgets, transactions, and savings goals with a partner or family member."
            icon={<Users color="#4F46E5" size={48} />}
            actionTitle="Create Household"
            onAction={() => setShowCreateForm(true)}
          />
        )}
      </ScrollView>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ padding: 16 }}
    >
      {/* Household Header */}
      <Card className="mb-4">
        <View className="flex-row items-center">
          <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-brand-100">
            <Users color="#4F46E5" size={24} />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900">
              {household.name}
            </Text>
            <Text className="text-sm text-gray-500">
              {members.length} member{members.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </Card>

      {/* Members */}
      <View className="mb-4">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-base font-bold text-gray-900">Members</Text>
          {isOwner && (
            <Button
              title="Invite"
              onPress={() => setShowInviteForm(!showInviteForm)}
              size="sm"
              icon={<UserPlus color="#FFFFFF" size={14} />}
            />
          )}
        </View>

        {/* Invite Form */}
        {showInviteForm && (
          <Card className="mb-3">
            <View className="mb-3">
              <Input
                label="Email Address"
                placeholder="partner@email.com"
                value={inviteEmail}
                onChangeText={setInviteEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <Button
              title="Send Invite"
              onPress={handleInvite}
              loading={isInviting}
              fullWidth
            />
          </Card>
        )}

        <Card padding="none">
          {members.map((member, idx) => (
            <View key={member.id}>
              <View className="flex-row items-center px-4 py-3">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <Text className="text-sm font-bold text-gray-500">
                    {member.full_name?.[0]?.toUpperCase() ?? '?'}
                  </Text>
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text className="text-sm font-medium text-gray-900">
                      {member.full_name ?? 'User'}
                    </Text>
                    {member.household_role === 'owner' && (
                      <View className="ml-2">
                        <Badge label="Owner" variant="brand" />
                      </View>
                    )}
                    {member.id === profile?.id && (
                      <Text className="ml-1 text-xs text-gray-400">(You)</Text>
                    )}
                  </View>
                  <Text className="text-xs text-gray-400">{member.email}</Text>
                </View>
                {isOwner && member.id !== profile?.id && (
                  <Pressable
                    onPress={() =>
                      handleRemoveMember(member.id, member.full_name ?? 'User')
                    }
                    className="p-2"
                  >
                    <Trash2 color="#EF4444" size={14} />
                  </Pressable>
                )}
              </View>
              {idx < members.length - 1 && <View className="h-px bg-gray-50" />}
            </View>
          ))}
        </Card>
      </View>

      {/* Pending Invites */}
      {invites.length > 0 && (
        <View className="mb-4">
          <Text className="mb-2 text-base font-bold text-gray-900">
            Pending Invites
          </Text>
          <Card padding="none">
            {invites.map((invite, idx) => (
              <View key={invite.id}>
                <View className="flex-row items-center px-4 py-3">
                  <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-warning-50">
                    <Mail color="#F59E0B" size={16} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-900">
                      {invite.invited_email}
                    </Text>
                    <View className="flex-row items-center">
                      <Clock color="#9CA3AF" size={11} />
                      <Text className="ml-1 text-xs text-gray-400">
                        Expires {new Date(invite.expires_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => cancelInvite(invite.id)}
                    className="p-2"
                  >
                    <Trash2 color="#EF4444" size={14} />
                  </Pressable>
                </View>
                {idx < invites.length - 1 && <View className="h-px bg-gray-50" />}
              </View>
            ))}
          </Card>
        </View>
      )}

      {/* Leave Household (non-owners) */}
      {!isOwner && (
        <Button
          title="Leave Household"
          onPress={handleLeave}
          variant="danger"
          icon={<LogOut color="#FFFFFF" size={16} />}
          fullWidth
          size="lg"
        />
      )}

      <View className="h-16" />
    </ScrollView>
  );
}
