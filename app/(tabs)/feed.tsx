import { useCallback, useEffect, useState } from 'react';
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
import { useFocusEffect, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { PostCard } from '@/components/PostCard';
import { TodayBanner } from '@/components/TodayBanner';
import { fetchFeed, toggleLike, type FeedPost } from '@/lib/social';
import { useAuth } from '@/store/useAuth';
import { useFeedBadge } from '@/store/useFeedBadge';
import { colors } from '@/theme/colors';
import { type, fonts } from '@/theme/tokens';

export default function FeedTab() {
  const userId = useAuth((s) => s.user?.id);
  const router = useRouter();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await fetchFeed(userId);
      setPosts(data);
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      useFeedBadge.getState().markSeen();
      load();
    }, [load]),
  );

  async function onToggleLike(post: FeedPost) {
    if (!userId) return;
    const prev = post.liked_by_me;
    setPosts((ps) =>
      ps.map((p) =>
        p.id === post.id
          ? { ...p, liked_by_me: !prev, like_count: p.like_count + (prev ? -1 : 1) }
          : p,
      ),
    );
    try {
      await toggleLike(post.id, userId, prev);
    } catch (e: any) {
      Alert.alert('Erro', e.message);
      load();
    }
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <Animated.View entering={FadeInDown.duration(320)} style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>COMUNIDADE</Text>
          <Text style={styles.title}>FEED</Text>
        </View>
        <Pressable style={styles.newBtn} onPress={() => router.push('/post/new')}>
          <Text style={styles.newBtnPlus}>+</Text>
          <Text style={styles.newBtnText}>POSTAR</Text>
        </Pressable>
      </Animated.View>
      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => <PostCard post={item} onToggleLike={onToggleLike} />}
        ListHeaderComponent={<TodayBanner />}
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
          !loading ? (
            <View style={styles.emptyWrap}>
              <View style={styles.emptyBadge}>
                <Text style={styles.emptyBadgeTxt}>75H</Text>
              </View>
              <Text style={styles.emptyTitle}>O FEED ESTÁ QUIETO</Text>
              <Text style={styles.emptyText}>
                Ninguém postou hoje. Mostre seu progresso e inspire a comunidade.
              </Text>
              <Pressable style={styles.emptyCta} onPress={() => router.push('/post/new')}>
                <Text style={styles.emptyCtaTxt}>POSTAR O PRIMEIRO</Text>
              </Pressable>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  eyebrow: { ...type.eyebrow, color: colors.neon, marginBottom: 2 },
  title: { ...type.h1, color: colors.text, fontSize: 34 },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.neon,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  newBtnPlus: { color: '#000', fontWeight: '900', fontSize: 16, lineHeight: 16 },
  newBtnText: {
    color: '#000',
    fontWeight: '900',
    letterSpacing: 1.5,
    fontSize: 11,
  },
  list: { paddingTop: 4, paddingBottom: 80 },
  emptyWrap: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 32,
  },
  emptyBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: colors.neon,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neonSoft,
    marginBottom: 20,
  },
  emptyBadgeTxt: {
    fontFamily: fonts.mono,
    color: colors.neon,
    fontWeight: '900',
    fontSize: 20,
    letterSpacing: -1,
  },
  emptyTitle: {
    ...type.h2,
    color: colors.text,
    fontSize: 18,
    letterSpacing: 1,
    marginBottom: 8,
  },
  emptyText: {
    ...type.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyCta: {
    backgroundColor: colors.neon,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },
  emptyCtaTxt: {
    color: '#000',
    fontWeight: '900',
    letterSpacing: 2,
    fontSize: 12,
  },
});
