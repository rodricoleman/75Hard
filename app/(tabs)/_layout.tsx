import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '@/theme/colors';

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
  return (
    <Tabs
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
        name="index"
        options={{ tabBarIcon: ({ focused }) => <Icon label="Hoje" focused={focused} /> }}
      />
      <Tabs.Screen
        name="feed"
        options={{ tabBarIcon: ({ focused }) => <Icon label="Feed" focused={focused} /> }}
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
