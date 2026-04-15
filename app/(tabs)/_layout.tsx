import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '@/theme/colors';
import { useAuth } from '@/store/useAuth';
import { useChallenge } from '@/store/useChallenge';
import { useFeedBadge } from '@/store/useFeedBadge';

function Icon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text
      style={{
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        color: focused ? colors.neon : colors.textDim,
      }}
    >
      {label.toUpperCase()}
    </Text>
  );
}

export default function TabsLayout() {
  const userId = useAuth((s) => s.user?.id);
  const unreadCount = useFeedBadge((s) => s.unreadCount);

  useEffect(() => {
    if (!userId) {
      useChallenge.getState().reset();
      useFeedBadge.getState().reset();
      return;
    }
    useChallenge.getState().load();
    useFeedBadge.getState().refresh();
    const id = setInterval(() => {
      useFeedBadge.getState().refresh();
    }, 60_000);
    return () => clearInterval(id);
  }, [userId]);

  return (
    <Tabs
      initialRouteName="feed"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 64,
        },
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          tabBarIcon: ({ focused }) => <Icon label="Feed" focused={focused} />,
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.danger, color: '#fff', fontSize: 10 },
        }}
      />
      <Tabs.Screen
        name="index"
        options={{ tabBarIcon: ({ focused }) => <Icon label="Hoje" focused={focused} /> }}
      />
      <Tabs.Screen
        name="ranking"
        options={{ tabBarIcon: ({ focused }) => <Icon label="Ranking" focused={focused} /> }}
      />
      <Tabs.Screen
        name="stats"
        options={{ tabBarIcon: ({ focused }) => <Icon label="Stats" focused={focused} /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ tabBarIcon: ({ focused }) => <Icon label="Ajustes" focused={focused} /> }}
      />
    </Tabs>
  );
}
