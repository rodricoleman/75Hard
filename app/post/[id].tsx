import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  addComment,
  fetchComments,
  fetchPost,
  toggleLike,
  type FeedPost,
  type PostComment,
} from '@/lib/social';
import { useAuth } from '@/store/useAuth';
import { colors } from '@/theme/colors';

export default function PostDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = useAuth((s) => s.user?.id);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [post, setPost] = useState<FeedPost | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    if (!id || !userId) return;
    try {
      const [p, c] = await Promise.all([fetchPost(id, userId), fetchComments(id)]);
      setPost(p);
      setComments(c);
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
    }
  }, [id, userId]);

  useEffect(() => {
    load();
  }, [load]);

  async function onLike() {
    if (!post || !userId) return;
    const prev = post.liked_by_me;
    setPost({
      ...post,
      liked_by_me: !prev,
      like_count: post.like_count + (prev ? -1 : 1),
    });
    try {
      await toggleLike(post.id, userId, prev);
    } catch (e: any) {
      Alert.alert('Erro', e.message);
      load();
    }
  }

  async function onSend() {
    if (!post || !userId || !text.trim()) return;
    setSending(true);
    try {
      await addComment(post.id, userId, text.trim());
      setText('');
      const c = await fetchComments(post.id);
      setComments(c);
      setPost({ ...post, comment_count: c.length });
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.root}>
        <ActivityIndicator color={colors.neon} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }
  if (!post) {
    return (
      <SafeAreaView style={styles.root}>
        <Text style={styles.empty}>Post não encontrado.</Text>
      </SafeAreaView>
    );
  }

  const name = post.author?.display_name || post.author?.username || 'anônimo';

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{name}</Text>
          <View style={{ width: 30 }} />
        </View>

        <FlatList
          data={comments}
          keyExtractor={(c) => c.id}
          ListHeaderComponent={
            <View>
              <Image source={{ uri: post.photo_url }} style={styles.photo} />
              <View style={styles.actions}>
                <TouchableOpacity onPress={onLike}>
                  <Text style={[styles.action, post.liked_by_me && { color: colors.neon }]}>
                    {post.liked_by_me ? '♥' : '♡'} {post.like_count}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.action}>💬 {post.comment_count}</Text>
              </View>
              {post.caption ? <Text style={styles.caption}>{post.caption}</Text> : null}
              <Text style={styles.section}>COMENTÁRIOS</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.comment}>
              <Text style={styles.commentAuthor}>
                {item.author?.display_name || item.author?.username || 'anônimo'}
              </Text>
              <Text style={styles.commentBody}>{item.body}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.noComments}>Nenhum comentário ainda.</Text>
          }
          contentContainerStyle={styles.list}
        />

        <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Comentar..."
            placeholderTextColor={colors.textDim}
            style={styles.input}
            returnKeyType="send"
            onSubmitEditing={onSend}
            blurOnSubmit={false}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={onSend} disabled={sending || !text.trim()}>
            <Text style={styles.sendTxt}>{sending ? '…' : 'ENVIAR'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  list: { paddingBottom: 20 },
  photo: { width: '100%', aspectRatio: 1, backgroundColor: colors.surfaceAlt },
  actions: { flexDirection: 'row', gap: 20, paddingHorizontal: 16, paddingTop: 12 },
  action: { color: colors.text, fontSize: 16, fontWeight: '700' },
  caption: { color: colors.text, paddingHorizontal: 16, paddingTop: 10, fontSize: 14, lineHeight: 20 },
  section: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  comment: { paddingHorizontal: 16, paddingVertical: 8 },
  commentAuthor: { color: colors.neon, fontWeight: '700', fontSize: 13 },
  commentBody: { color: colors.text, fontSize: 14, marginTop: 2, lineHeight: 18 },
  noComments: { color: colors.textDim, textAlign: 'center', paddingVertical: 20 },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingHorizontal: 10,
    paddingTop: 10,
    gap: 8,
    backgroundColor: colors.bg,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 14,
    minHeight: 40,
  },
  sendBtn: {
    backgroundColor: colors.neon,
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 40,
    justifyContent: 'center',
  },
  sendTxt: { color: '#000', fontWeight: '900', fontSize: 12, letterSpacing: 1 },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 60 },
});
