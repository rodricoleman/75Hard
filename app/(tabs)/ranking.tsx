import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RankingRow } from '@/components/RankingRow';
import { fetchLeaderboard, type LeaderboardRow } from '@/lib/social';
import { useAuth } from '@/store/useAuth';
import { colors } from '@/theme/colors';

type Mode = 'streak' | 'total';

export default function RankingTab() {
  const userId = useAuth((s) => s.user?.id);
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [mode, setMode] = useState<Mode>('streak');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchLeaderboard();
      setRows(data);
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sorted = [...rows].sort((a, b) => {
    if (mode === 'streak') {
      if (b.current_streak !== a.current_streak) return b.current_streak - a.current_streak;
      return b.completed_days - a.completed_days;
    }
    if (b.completed_days !== a.completed_days) return b.completed_days - a.completed_days;
    return b.current_streak - a.current_streak;
  });

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>RANKING</Text>
        <View style={styles.toggle}>
          <TabBtn label="Streak" active={mode === 'streak'} onPress={() => setMode('streak')} />
          <TabBtn label="Total" active={mode === 'total'} onPress={() => setMode('total')} />
        </View>
      </View>
      <FlatList
        data={sorted}
        keyExtractor={(r) => r.user_id}
        renderItem={({ item, index }) => (
          <RankingRow row={item} position={index + 1} isMe={item.user_id === userId} />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={colors.neon}
          />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>Ninguém no ranking ainda.</Text>
        }
      />
    </SafeAreaView>
  );
}

function TabBtn({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Text
      onPress={onPress}
      style={[styles.tab, active && styles.tabActive]}
    >
      {label.toUpperCase()}
    </Text>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { color: colors.text, fontSize: 28, fontWeight: '900', marginBottom: 12 },
  toggle: { flexDirection: 'row', gap: 8 },
  tab: {
    color: colors.textMuted,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderRadius: 8,
    overflow: 'hidden',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1,
  },
  tabActive: { color: '#000', backgroundColor: colors.neon },
  list: { padding: 16, paddingBottom: 80 },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 60 },
});
