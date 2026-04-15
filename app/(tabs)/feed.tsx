import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { PostCard } from '@/components/PostCard';
import { fetchFeed, toggleLike, type FeedPost } from '@/lib/social';
import { useAuth } from '@/store/useAuth';
import { colors } from '@/theme/colors';

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
      <View style={styles.header}>
        <Text style={styles.title}>FEED</Text>
        <TouchableOpacity style={styles.newBtn} onPress={() => router.push('/post/new')}>
          <Text style={styles.newBtnText}>+ POSTAR</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => <PostCard post={item} onToggleLike={onToggleLike} />}
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
            <Text style={styles.empty}>
              Ninguém postou ainda. Seja o primeiro — toque em +POSTAR.
            </Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: { color: colors.text, fontSize: 28, fontWeight: '900' },
  newBtn: {
    backgroundColor: colors.neon,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  newBtnText: { color: '#000', fontWeight: '900', letterSpacing: 1, fontSize: 12 },
  list: { padding: 16, paddingBottom: 80 },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 60, paddingHorizontal: 24 },
});
