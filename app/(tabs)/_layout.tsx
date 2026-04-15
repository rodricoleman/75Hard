import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/tokens';
import { useAuth } from '@/store/useAuth';
import { useChallenge } from '@/store/useChallenge';
import { useFeedBadge } from '@/store/useFeedBadge';

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <View style={styles.iconWrap}>
      <View style={[styles.indicator, focused && styles.indicatorOn]} />
      <Text
        style={[
          styles.iconTxt,
          { color: focused ? colors.neon : colors.textDim },
        ]}
      >
        {label.toUpperCase()}
      </Text>
    </View>
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
          borderTopWidth: 1,
          height: 68,
          paddingTop: 6,
        },
        tabBarItemStyle: { paddingVertical: 4 },
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Feed" focused={focused} />,
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.ember,
            color: '#fff',
            fontSize: 10,
            fontFamily: fonts.mono,
            fontWeight: '900',
          },
        }}
      />
      <Tabs.Screen
        name="index"
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Hoje" focused={focused} /> }}
      />
      <Tabs.Screen
        name="ranking"
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Rank" focused={focused} /> }}
      />
      <Tabs.Screen
        name="stats"
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Stats" focused={focused} /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Ajustes" focused={focused} /> }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    paddingTop: 2,
    minWidth: 56,
  },
  indicator: {
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  indicatorOn: {
    backgroundColor: colors.neon,
    shadowColor: colors.neon,
    shadowOpacity: 0.6,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  iconTxt: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
});
