import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors } from '@/theme/colors';
import { useAuth } from '@/store/useAuth';
import { useChallenge } from '@/store/useChallenge';

function AuthGate() {
  const booting = useAuth((s) => s.booting);
  const session = useAuth((s) => s.session);
  const needsOnboarding = useChallenge((s) => s.needsOnboarding);
  const challengeLoading = useChallenge((s) => s.loading);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (booting) return;
    const first = (Array.isArray(segments) ? segments[0] : undefined) as string | undefined;
    const inAuth = first === '(auth)';
    const inOnboarding = first === 'onboarding';
    try {
      if (!session && !inAuth) {
        router.replace('/(auth)/login');
      } else if (session && inAuth) {
        router.replace('/(tabs)/feed');
      } else if (session && needsOnboarding && !challengeLoading && !inOnboarding) {
        router.replace('/onboarding');
      } else if (session && !needsOnboarding && inOnboarding) {
        router.replace('/(tabs)/feed');
      }
    } catch (e) {
      console.warn('[AuthGate] nav error', e);
    }
  }, [booting, session, segments, router, needsOnboarding, challengeLoading]);

  return null;
}

export default function RootLayout() {
  const init = useAuth((s) => s.init);
  const booting = useAuth((s) => s.booting);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    init().then((c) => {
      cleanup = c;
    });
    return () => cleanup?.();
  }, [init]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
          {booting ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator color={colors.neon} />
            </View>
          ) : (
            <>
              <AuthGate />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: colors.bg },
                }}
              />
            </>
          )}
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
