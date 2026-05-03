import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { Text, View, Platform } from 'react-native';
import { useAuth } from '@/store/useAuth';
import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/tokens';

function Icon({ glyph, focused }: { glyph: string; focused: boolean }) {
  return (
    <View
      style={{
        width: 36,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.55 }}>{glyph}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const session = useAuth((s) => s.session);
  const loading = useAuth((s) => s.loading);
  if (!loading && !session) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderSoft,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 86 : 70,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 10,
        },
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.textDim,
        tabBarLabelStyle: {
          fontSize: 10.5,
          fontWeight: '700',
          fontFamily: fontFamily.body as any,
          letterSpacing: 0.3,
          marginTop: 2,
        },
        headerStyle: { backgroundColor: colors.bg },
        headerTitleStyle: {
          color: colors.text,
          fontWeight: '700',
          fontFamily: fontFamily.display as any,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hoje',
          headerShown: false,
          tabBarIcon: ({ focused }) => <Icon glyph="✿" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: 'Hábitos',
          tabBarIcon: ({ focused }) => <Icon glyph="✓" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: 'Loja',
          tabBarIcon: ({ focused }) => <Icon glyph="♡" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ focused }) => <Icon glyph="✦" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ focused }) => <Icon glyph="⚙" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
