import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from '@/store/useAuth';
import { useProfile } from '@/store/useProfile';
import { useHabits } from '@/store/useHabits';
import { useAntiHabits } from '@/store/useAntiHabits';
import { useRewards } from '@/store/useRewards';
import { useWallet } from '@/store/useWallet';
import { useMissions } from '@/store/useMissions';
import { ToastHost } from '@/components/ToastHost';
import { colors } from '@/theme/colors';

export default function RootLayout() {
  const init = useAuth((s) => s.init);
  const session = useAuth((s) => s.session);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (session) {
      (async () => {
        await Promise.all([
          useProfile.getState().fetch(),
          useHabits.getState().fetch(),
          useAntiHabits.getState().fetch(),
          useRewards.getState().fetch(),
          useWallet.getState().fetch(),
          useMissions.getState().fetch(),
        ]);
        await useMissions.getState().ensureWeekly();
      })();
    }
  }, [session]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.bg },
            headerTitleStyle: { color: colors.text, fontWeight: '700' },
            headerTintColor: colors.text,
            contentStyle: { backgroundColor: colors.bg },
            headerShadowVisible: false,
            headerBackTitle: '',
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="review" options={{ title: 'Review semanal', presentation: 'modal' }} />
          <Stack.Screen name="habit/new" options={{ title: 'Novo hábito', presentation: 'modal' }} />
          <Stack.Screen name="habit/[id]" options={{ title: 'Editar hábito' }} />
          <Stack.Screen name="anti/new" options={{ title: 'Novo anti-hábito', presentation: 'modal' }} />
          <Stack.Screen name="anti/[id]" options={{ title: 'Editar anti-hábito' }} />
          <Stack.Screen name="reward/new" options={{ title: 'Nova recompensa', presentation: 'modal' }} />
          <Stack.Screen name="reward/[id]" options={{ title: 'Editar recompensa' }} />
        </Stack>
        <ToastHost />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
