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
  const profile = useAuth((s) => s.profile);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (booting) return;
    const inAuth = segments[0] === '(auth)';
    if (!session && !inAuth) {
      router.replace('/(auth)/login');
    } else if (session && inAuth) {
      // Quando loga pela 1ª vez sem perfil ainda, o signup já cria via RPC;
      // casos extremos (sem username) permanecem no signup.
      if (profile?.username) router.replace('/(tabs)');
      else router.replace('/(tabs)');
    }
  }, [booting, session, profile, segments, router]);

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
