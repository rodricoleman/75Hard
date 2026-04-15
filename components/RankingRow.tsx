import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import type { LeaderboardRow } from '@/lib/social';
import { colors } from '@/theme/colors';

type Props = { row: LeaderboardRow; position: number; isMe: boolean };

export function RankingRow({ row, position, isMe }: Props) {
  const name = row.display_name || row.username || '—';
  const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : `${position}`;
  const content = (
    <View style={[styles.row, isMe && styles.meRow]}>
      <Text style={styles.pos}>{medal}</Text>
      <View style={styles.avatar}>
        <Text style={styles.avatarTxt}>{name.slice(0, 1).toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
          {isMe ? <Text style={{ color: colors.neon }}> (você)</Text> : null}
        </Text>
        <Text style={styles.username}>@{row.username}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.streak}>{row.current_streak}🔥</Text>
        <Text style={styles.total}>{row.completed_days} dias</Text>
      </View>
    </View>
  );

  if (!row.username) return content;
  return (
    <Link href={`/profile/${row.username}`} asChild>
      <TouchableOpacity activeOpacity={0.7}>{content}</TouchableOpacity>
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
    borderRadius: 10,
    marginBottom: 8,
  },
  meRow: { borderColor: colors.neon },
  pos: { width: 32, color: colors.textMuted, fontWeight: '800', fontSize: 16, textAlign: 'center' },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: { color: colors.neon, fontWeight: '800' },
  name: { color: colors.text, fontWeight: '700' },
  username: { color: colors.textDim, fontSize: 11, marginTop: 2 },
  streak: { color: colors.neon, fontWeight: '900', fontSize: 18 },
  total: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
});
