import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors } from '@/theme/colors';
import { useAuth } from '@/store/useAuth';

function AuthGate() {
  const booting = useAuth((s) => s.booting);
  const session = useAuth((s) => s.session);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (booting) return;
    const first = Array.isArray(segments) ? segments[0] : undefined;
    const inAuth = first === '(auth)';
    try {
      if (!session && !inAuth) router.replace('/(auth)/login');
      else if (session && inAuth) router.replace('/(tabs)/feed');
    } catch (e) {
      console.warn('[AuthGate] nav error', e);
    }
  }, [booting, session, segments, router]);

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
