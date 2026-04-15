import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import type { LeaderboardRow } from '@/lib/social';
import { colors } from '@/theme/colors';
import { type, fonts } from '@/theme/tokens';

type Props = { row: LeaderboardRow; position: number; isMe: boolean };

export function RankingRow({ row, position, isMe }: Props) {
  const name = row.display_name || row.username || '—';
  const content = (
    <View style={[styles.row, isMe && styles.meRow]}>
      <View style={styles.posWrap}>
        <Text style={styles.pos}>#{String(position).padStart(2, '0')}</Text>
      </View>
      <View style={styles.avatar}>
        <Text style={styles.avatarTxt}>{name.slice(0, 1).toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          {isMe ? (
            <View style={styles.meTag}>
              <Text style={styles.meTagTxt}>VOCÊ</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.username}>@{row.username}</Text>
      </View>
      <View style={styles.stats}>
        <View style={styles.streakPill}>
          <Text style={styles.streakTxt}>{row.current_streak}</Text>
          <Text style={styles.streakFlame}>🔥</Text>
        </View>
        <Text style={styles.total}>{row.completed_days}d</Text>
      </View>
    </View>
  );

  if (!row.username) return content;
  return (
    <Link href={`/profile/${row.username}`} asChild>
      <TouchableOpacity activeOpacity={0.75}>{content}</TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 8,
  },
  meRow: {
    borderColor: colors.neon,
    backgroundColor: colors.neonSoft,
  },
  posWrap: { width: 42 },
  pos: {
    fontFamily: fonts.mono,
    color: colors.textMuted,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: -0.3,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceHi,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: { color: colors.neon, fontWeight: '900', fontSize: 15 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { ...type.bodyStrong, color: colors.text, flexShrink: 1 },
  meTag: {
    backgroundColor: colors.neon,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  meTagTxt: {
    color: '#000',
    fontWeight: '900',
    fontSize: 9,
    letterSpacing: 1,
  },
  username: {
    fontFamily: fonts.mono,
    color: colors.textDim,
    fontSize: 11,
    marginTop: 2,
  },
  stats: { alignItems: 'flex-end', gap: 4 },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: colors.emberSoft,
    borderRadius: 999,
  },
  streakTxt: {
    fontFamily: fonts.mono,
    color: colors.ember,
    fontWeight: '900',
    fontSize: 14,
  },
  streakFlame: { fontSize: 11 },
  total: {
    fontFamily: fonts.mono,
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
});
