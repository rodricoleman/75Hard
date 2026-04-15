import { supabase } from './supabase';

export type FeedAuthor = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

export type FeedPost = {
  id: string;
  user_id: string;
  photo_url: string;
  caption: string | null;
  created_at: string;
  author: FeedAuthor | null;
  like_count: number;
  comment_count: number;
  liked_by_me: boolean;
};

export type PostComment = {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  created_at: string;
  author: FeedAuthor | null;
};

export type LeaderboardRow = {
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  current_streak: number;
  completed_days: number;
};

export async function fetchFeed(currentUserId: string, limit = 40): Promise<FeedPost[]> {
  const { data: posts, error } = await supabase
    .from('h75_posts')
    .select('id, user_id, photo_url, caption, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  if (!posts?.length) return [];

  const userIds = Array.from(new Set(posts.map((p) => p.user_id)));
  const postIds = posts.map((p) => p.id);

  const [{ data: authors }, { data: likes }, { data: comments }, { data: myLikes }] =
    await Promise.all([
      supabase
        .from('h75_profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', userIds),
      supabase.from('h75_post_likes').select('post_id').in('post_id', postIds),
      supabase.from('h75_post_comments').select('post_id').in('post_id', postIds),
      supabase
        .from('h75_post_likes')
        .select('post_id')
        .eq('user_id', currentUserId)
        .in('post_id', postIds),
    ]);

  const authorMap = new Map<string, FeedAuthor>();
  (authors ?? []).forEach((a) => authorMap.set(a.id, a as FeedAuthor));

  const likeMap = new Map<string, number>();
  (likes ?? []).forEach((l: any) => likeMap.set(l.post_id, (likeMap.get(l.post_id) ?? 0) + 1));

  const commentMap = new Map<string, number>();
  (comments ?? []).forEach((c: any) =>
    commentMap.set(c.post_id, (commentMap.get(c.post_id) ?? 0) + 1),
  );

  const myLikeSet = new Set((myLikes ?? []).map((l: any) => l.post_id));

  return posts.map((p) => ({
    ...p,
    author: authorMap.get(p.user_id) ?? null,
    like_count: likeMap.get(p.id) ?? 0,
    comment_count: commentMap.get(p.id) ?? 0,
    liked_by_me: myLikeSet.has(p.id),
  }));
}

export async function fetchPost(postId: string, currentUserId: string): Promise<FeedPost | null> {
  const { data: post, error } = await supabase
    .from('h75_posts')
    .select('id, user_id, photo_url, caption, created_at')
    .eq('id', postId)
    .maybeSingle();
  if (error || !post) return null;

  const [{ data: author }, { count: likeCount }, { count: commentCount }, { data: myLike }] =
    await Promise.all([
      supabase
        .from('h75_profiles')
        .select('id, username, display_name, avatar_url')
        .eq('id', post.user_id)
        .maybeSingle(),
      supabase
        .from('h75_post_likes')
        .select('post_id', { count: 'exact', head: true })
        .eq('post_id', postId),
      supabase
        .from('h75_post_comments')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', postId),
      supabase
        .from('h75_post_likes')
        .select('post_id')
        .eq('post_id', postId)
        .eq('user_id', currentUserId)
        .maybeSingle(),
    ]);

  return {
    ...post,
    author: (author as FeedAuthor) ?? null,
    like_count: likeCount ?? 0,
    comment_count: commentCount ?? 0,
    liked_by_me: !!myLike,
  };
}

export async function createPost(userId: string, photoUrl: string, caption: string) {
  const { data, error } = await supabase
    .from('h75_posts')
    .insert({ user_id: userId, photo_url: photoUrl, caption: caption || null })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function toggleLike(postId: string, userId: string, liked: boolean) {
  if (liked) {
    await supabase.from('h75_post_likes').delete().match({ post_id: postId, user_id: userId });
  } else {
    await supabase.from('h75_post_likes').insert({ post_id: postId, user_id: userId });
  }
}

export async function fetchComments(postId: string): Promise<PostComment[]> {
  const { data, error } = await supabase
    .from('h75_post_comments')
    .select('id, post_id, user_id, body, created_at')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  if (!data?.length) return [];
  const ids = Array.from(new Set(data.map((c) => c.user_id)));
  const { data: authors } = await supabase
    .from('h75_profiles')
    .select('id, username, display_name, avatar_url')
    .in('id', ids);
  const map = new Map<string, FeedAuthor>();
  (authors ?? []).forEach((a) => map.set(a.id, a as FeedAuthor));
  return data.map((c) => ({ ...c, author: map.get(c.user_id) ?? null }));
}

export async function addComment(postId: string, userId: string, body: string) {
  const { error } = await supabase
    .from('h75_post_comments')
    .insert({ post_id: postId, user_id: userId, body });
  if (error) throw error;
}

export async function fetchLeaderboard(): Promise<LeaderboardRow[]> {
  const { data, error } = await supabase
    .from('h75_leaderboard')
    .select('*')
    .order('current_streak', { ascending: false })
    .order('completed_days', { ascending: false });
  if (error) throw error;
  return (data ?? []) as LeaderboardRow[];
}

export async function createInvite(userId: string): Promise<string> {
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();
  const { error } = await supabase
    .from('h75_invites')
    .insert({ code, created_by: userId });
  if (error) throw error;
  return code;
}

export async function fetchMyInvites(userId: string) {
  const { data, error } = await supabase
    .from('h75_invites')
    .select('code, used_by, used_at, created_at')
    .eq('created_by', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchUserPosts(userId: string) {
  const { data, error } = await supabase
    .from('h75_posts')
    .select('id, photo_url, caption, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchProfileByUsername(username: string) {
  const { data, error } = await supabase
    .from('h75_profiles')
    .select('id, username, display_name, avatar_url')
    .eq('username', username.toLowerCase())
    .maybeSingle();
  if (error) throw error;
  return data as FeedAuthor | null;
}

export async function updateOwnProfile(
  userId: string,
  patch: { display_name?: string; avatar_url?: string },
) {
  const { error } = await supabase.from('h75_profiles').update(patch).eq('id', userId);
  if (error) throw error;
}
