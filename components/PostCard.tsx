import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import type { FeedPost } from '@/lib/social';
import { colors } from '@/theme/colors';

type Props = {
  post: FeedPost;
  onToggleLike: (post: FeedPost) => void;
};

function formatWhen(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'agora';
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

export function PostCard({ post, onToggleLike }: Props) {
  const router = useRouter();
  const name = post.author?.display_name || post.author?.username || 'anônimo';
  const username = post.author?.username;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {username ? (
          <Link href={`/profile/${username}`} asChild>
            <TouchableOpacity style={styles.authorRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarTxt}>{name.slice(0, 1).toUpperCase()}</Text>
              </View>
              <View>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.when}>{formatWhen(post.created_at)}</Text>
              </View>
            </TouchableOpacity>
          </Link>
        ) : (
          <View style={styles.authorRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTxt}>?</Text>
            </View>
            <Text style={styles.name}>{name}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push(`/post/${post.id}`)}
      >
        <Image source={{ uri: post.photo_url }} style={styles.photo} />
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onToggleLike(post)} style={styles.actionBtn}>
          <Text style={[styles.actionTxt, post.liked_by_me && { color: colors.neon }]}>
            {post.liked_by_me ? '♥' : '♡'} {post.like_count}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push(`/post/${post.id}`)}
          style={styles.actionBtn}
        >
          <Text style={styles.actionTxt}>💬 {post.comment_count}</Text>
        </TouchableOpacity>
      </View>

      {post.caption ? <Text style={styles.caption}>{post.caption}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    marginBottom: 6,
  },
  header: { paddingHorizontal: 12, paddingVertical: 10 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
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
  when: { color: colors.textDim, fontSize: 11, marginTop: 2 },
  photo: { width: '100%', aspectRatio: 1, backgroundColor: colors.surfaceAlt },
  actions: { flexDirection: 'row', padding: 10, gap: 16 },
  actionBtn: { paddingVertical: 4 },
  actionTxt: { color: colors.text, fontSize: 16, fontWeight: '700' },
  caption: {
    color: colors.text,
    paddingHorizontal: 12,
    paddingBottom: 14,
    fontSize: 14,
    lineHeight: 20,
  },
});
