import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/store/useAuth';
import { useProfile } from '@/store/useProfile';
import { colors } from '@/theme/colors';

export default function Index() {
  const { session, loading } = useAuth();
  const profile = useProfile((s) => s.profile);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!session) return <Redirect href="/(auth)/login" />;
  if (profile && !profile.first_run_at) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)" />;
}
