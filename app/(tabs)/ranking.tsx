import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { RankingRow } from '@/components/RankingRow';
import { fetchLeaderboard, type LeaderboardRow } from '@/lib/social';
import { useAuth } from '@/store/useAuth';
import { colors } from '@/theme/colors';
import { type, fonts } from '@/theme/tokens';

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

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      if (mode === 'streak') {
        if (b.current_streak !== a.current_streak) return b.current_streak - a.current_streak;
        return b.completed_days - a.completed_days;
      }
      if (b.completed_days !== a.completed_days) return b.completed_days - a.completed_days;
      return b.current_streak - a.current_streak;
    });
  }, [rows, mode]);

  const podium = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <FlatList
        data={rest}
        keyExtractor={(r) => r.user_id}
        renderItem={({ item, index }) => (
          <RankingRow row={item} position={index + 4} isMe={item.user_id === userId} />
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
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={styles.eyebrow}>COMUNIDADE</Text>
              <Text style={styles.title}>RANKING</Text>
            </View>

            <View style={styles.segment}>
              <SegmentBtn
                label="Streak"
                suffix="🔥"
                active={mode === 'streak'}
                onPress={() => setMode('streak')}
              />
              <SegmentBtn
                label="Dias completos"
                active={mode === 'total'}
                onPress={() => setMode('total')}
              />
            </View>

            {podium.length > 0 ? (
              <Animated.View entering={FadeInDown.duration(400)} style={styles.podium}>
                {podium[1] ? (
                  <PodiumCard row={podium[1]} rank={2} mode={mode} isMe={podium[1].user_id === userId} />
                ) : (
                  <View style={{ flex: 1 }} />
                )}
                {podium[0] ? (
                  <PodiumCard row={podium[0]} rank={1} mode={mode} isMe={podium[0].user_id === userId} />
                ) : (
                  <View style={{ flex: 1 }} />
                )}
                {podium[2] ? (
                  <PodiumCard row={podium[2]} rank={3} mode={mode} isMe={podium[2].user_id === userId} />
                ) : (
                  <View style={{ flex: 1 }} />
                )}
              </Animated.View>
            ) : null}

            {rest.length > 0 ? (
              <View style={styles.sectionRow}>
                <Text style={styles.sectionLabel}>DEMAIS</Text>
                <View style={styles.sectionLine} />
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          sorted.length === 0 ? (
            <Text style={styles.empty}>Ninguém no ranking ainda.</Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

function SegmentBtn({
  label,
  active,
  onPress,
  suffix,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  suffix?: string;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.seg, active && styles.segActive]}>
      <Text style={[styles.segTxt, active && styles.segTxtActive]}>
        {label.toUpperCase()}
        {suffix ? ` ${suffix}` : ''}
      </Text>
    </Pressable>
  );
}

function PodiumCard({
  row,
  rank,
  mode,
  isMe,
}: {
  row: LeaderboardRow;
  rank: 1 | 2 | 3;
  mode: Mode;
  isMe: boolean;
}) {
  const name = row.display_name || row.username || '—';
  const height = rank === 1 ? 150 : rank === 2 ? 128 : 110;
  const value = mode === 'streak' ? row.current_streak : row.completed_days;
  const valueSuffix = mode === 'streak' ? '🔥' : 'd';
  const rankColor = rank === 1 ? colors.neon : rank === 2 ? '#E0E0E0' : '#B87333';

  const body = (
    <View style={styles.podiumItem}>
      <View
        style={[
          styles.podiumAvatar,
          {
            borderColor: rankColor,
            transform: [{ scale: rank === 1 ? 1.1 : 1 }],
          },
          isMe && { backgroundColor: colors.neonSoft },
        ]}
      >
        <Text style={[styles.podiumAvatarTxt, { color: rankColor }]}>
          {name.slice(0, 1).toUpperCase()}
        </Text>
        <View style={[styles.rankBadge, { backgroundColor: rankColor }]}>
          <Text style={styles.rankBadgeTxt}>{rank}</Text>
        </View>
      </View>
      <Text style={styles.podiumName} numberOfLines={1}>
        {name}
      </Text>
      <Text style={styles.podiumUser} numberOfLines={1}>
        @{row.username}
      </Text>
      <View
        style={[
          styles.podiumBar,
          { height, borderColor: rankColor, backgroundColor: isMe ? colors.neonSoft : colors.surface },
        ]}
      >
        <Text style={[styles.podiumValue, { color: rankColor }]}>{value}</Text>
        <Text style={styles.podiumValueSuffix}>{valueSuffix}</Text>
      </View>
    </View>
  );

  if (!row.username) return body;
  return (
    <Link href={`/profile/${row.username}`} asChild>
      <Pressable style={{ flex: 1 }}>{body}</Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  eyebrow: { ...type.eyebrow, color: colors.neon, marginBottom: 4 },
  title: { ...type.h1, color: colors.text, fontSize: 34 },

  segment: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  seg: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segActive: { backgroundColor: colors.neon, borderColor: colors.neon },
  segTxt: {
    ...type.label,
    color: colors.textMuted,
    fontSize: 11,
  },
  segTxtActive: { color: '#000' },

  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  podiumItem: { flex: 1, alignItems: 'center' },
  podiumAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.surfaceHi,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  podiumAvatarTxt: {
    fontSize: 22,
    fontWeight: '900',
  },
  rankBadge: {
    position: 'absolute',
    bottom: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeTxt: {
    color: '#000',
    fontWeight: '900',
    fontSize: 11,
    fontFamily: fonts.mono,
  },
  podiumName: {
    ...type.bodyStrong,
    color: colors.text,
    fontSize: 13,
    marginTop: 4,
    maxWidth: '100%',
  },
  podiumUser: {
    fontFamily: fonts.mono,
    color: colors.textDim,
    fontSize: 10,
    marginBottom: 8,
  },
  podiumBar: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  podiumValue: {
    fontFamily: fonts.mono,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  podiumValueSuffix: {
    fontFamily: fonts.mono,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 12,
  },
  sectionLabel: { ...type.label, color: colors.textMuted },
  sectionLine: { flex: 1, height: 1, backgroundColor: colors.border },

  list: { paddingHorizontal: 20, paddingBottom: 80 },
  empty: {
    ...type.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
  },
});
