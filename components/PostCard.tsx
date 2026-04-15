import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import type { FeedPost } from '@/lib/social';
import { colors } from '@/theme/colors';
import { type, fonts } from '@/theme/tokens';

type Props = {
  post: FeedPost;
  onToggleLike: (post: FeedPost) => void;
};

function formatWhen(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'agora';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

export function PostCard({ post, onToggleLike }: Props) {
  const router = useRouter();
  const name = post.author?.display_name || post.author?.username || 'anônimo';
  const username = post.author?.username;
  const [imgLoaded, setImgLoaded] = useState(false);

  const imgOpacity = useSharedValue(0);
  const burst = useSharedValue(0);
  const likeScale = useSharedValue(1);
  const lastTap = useSharedValue(0);

  const imgStyle = useAnimatedStyle(() => ({ opacity: imgOpacity.value }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: burst.value,
    transform: [{ scale: 0.4 + burst.value * 1.6 }],
  }));
  const likeBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));

  const triggerLike = (post: FeedPost) => {
    onToggleLike(post);
  };

  const burstLike = () => {
    burst.value = withSequence(
      withTiming(1, { duration: 140, easing: Easing.out(Easing.cubic) }),
      withDelay(180, withTiming(0, { duration: 200 })),
    );
  };

  const onImagePress = () => {
    const now = Date.now();
    if (now - lastTap.value < 280) {
      lastTap.value = 0;
      burstLike();
      if (!post.liked_by_me) triggerLike(post);
      return;
    }
    lastTap.value = now;
    router.push(`/post/${post.id}`);
  };

  const onHeartPress = () => {
    likeScale.value = withSequence(
      withTiming(1.25, { duration: 120 }),
      withSpring(1, { damping: 8, stiffness: 260 }),
    );
    if (!post.liked_by_me) burstLike();
    triggerLike(post);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {username ? (
          <Link href={`/profile/${username}`} asChild>
            <TouchableOpacity style={styles.authorRow} activeOpacity={0.7}>
              <View style={styles.avatar}>
                <Text style={styles.avatarTxt}>{name.slice(0, 1).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.when}>
                  @{username} · {formatWhen(post.created_at)}
                </Text>
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

      <Pressable onPress={onImagePress} style={styles.photoWrap}>
        {!imgLoaded ? <View style={styles.skeleton} /> : null}
        <Animated.View style={[StyleSheet.absoluteFillObject, imgStyle]}>
          <Image
            source={{ uri: post.photo_url }}
            style={styles.photo}
            onLoad={() => {
              setImgLoaded(true);
              imgOpacity.value = withTiming(1, { duration: 280 });
            }}
          />
        </Animated.View>
        <Animated.View pointerEvents="none" style={[styles.burst, burstStyle]}>
          <Text style={styles.burstHeart}>♥</Text>
        </Animated.View>
      </Pressable>

      <View style={styles.meta}>
        <View style={styles.actions}>
          <Pressable onPress={onHeartPress} hitSlop={8} style={styles.actionBtn}>
            <Animated.Text
              style={[
                styles.heart,
                post.liked_by_me && { color: colors.ember },
                likeBtnStyle,
              ]}
            >
              {post.liked_by_me ? '♥' : '♡'}
            </Animated.Text>
            <Text style={styles.actionCount}>{post.like_count}</Text>
          </Pressable>
          <TouchableOpacity
            onPress={() => router.push(`/post/${post.id}`)}
            style={styles.actionBtn}
            activeOpacity={0.7}
            hitSlop={8}
          >
            <Text style={styles.bubble}>◐</Text>
            <Text style={styles.actionCount}>{post.comment_count}</Text>
          </TouchableOpacity>
        </View>

        {post.caption ? <Text style={styles.caption}>{post.caption}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    marginBottom: 4,
  },
  header: { paddingHorizontal: 14, paddingVertical: 12 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
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
  name: { ...type.bodyStrong, color: colors.text },
  when: {
    fontFamily: fonts.mono,
    color: colors.textDim,
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  photoWrap: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.surfaceAlt,
    position: 'relative',
    overflow: 'hidden',
  },
  skeleton: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surfaceAlt,
  },
  photo: { width: '100%', height: '100%' },
  burst: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  burstHeart: {
    color: colors.ember,
    fontSize: 120,
    textShadowColor: 'rgba(255,122,26,0.6)',
    textShadowRadius: 20,
  },
  meta: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 16 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 18, marginBottom: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 2 },
  heart: { color: colors.text, fontSize: 26, lineHeight: 28 },
  bubble: { color: colors.text, fontSize: 22, lineHeight: 26 },
  actionCount: {
    fontFamily: fonts.mono,
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  caption: {
    ...type.body,
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
});
