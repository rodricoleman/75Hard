import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  fetchLeaderboard,
  fetchProfileByUsername,
  fetchUserPosts,
  type FeedAuthor,
  type LeaderboardRow,
} from '@/lib/social';
import { colors } from '@/theme/colors';

export default function Profile() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<FeedAuthor | null>(null);
  const [stats, setStats] = useState<LeaderboardRow | null>(null);
  const [posts, setPosts] = useState<Array<{ id: string; photo_url: string; caption: string | null; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!username) return;
    try {
      const prof = await fetchProfileByUsername(username);
      if (!prof) {
        setLoading(false);
        return;
      }
      setProfile(prof);
      const [ps, lb] = await Promise.all([fetchUserPosts(prof.id), fetchLeaderboard()]);
      setPosts(ps);
      setStats(lb.find((r) => r.user_id === prof.id) ?? null);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={styles.root}>
        <ActivityIndicator color={colors.neon} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }
  if (!profile) {
    return (
      <SafeAreaView style={styles.root}>
        <Text style={styles.empty}>Usuário não encontrado.</Text>
      </SafeAreaView>
    );
  }

  const name = profile.display_name || profile.username || '—';

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>@{profile.username}</Text>
        <View style={{ width: 30 }} />
      </View>

      <FlatList
        data={posts}
        numColumns={3}
        keyExtractor={(p) => p.id}
        ListHeaderComponent={
          <View style={styles.head}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTxt}>{name.slice(0, 1).toUpperCase()}</Text>
            </View>
            <Text style={styles.name}>{name}</Text>
            <View style={styles.statsRow}>
              <Stat label="Streak" value={`${stats?.current_streak ?? 0}🔥`} />
              <Stat label="Dias" value={`${stats?.completed_days ?? 0}`} />
              <Stat label="Posts" value={`${posts.length}`} />
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.gridCell}
            onPress={() => router.push(`/post/${item.id}`)}
          >
            <Image source={{ uri: item.photo_url }} style={styles.gridImg} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Ainda sem posts.</Text>
        }
      />
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  back: { color: colors.text, fontSize: 26, width: 30 },
  title: { color: colors.text, fontWeight: '800', fontSize: 16 },
  head: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 20 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarTxt: { color: colors.neon, fontWeight: '900', fontSize: 32 },
  name: { color: colors.text, fontSize: 20, fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: 24, marginTop: 18 },
  stat: { alignItems: 'center' },
  statValue: { color: colors.text, fontSize: 18, fontWeight: '900' },
  statLabel: { color: colors.textMuted, fontSize: 10, letterSpacing: 2, marginTop: 2 },
  gridCell: { flex: 1 / 3, aspectRatio: 1, padding: 1 },
  gridImg: { width: '100%', height: '100%', backgroundColor: colors.surfaceAlt },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 60 },
});
