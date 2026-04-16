import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from './supabase';

const PROGRESS_BUCKET = 'h75-progress-photos';
const SOCIAL_BUCKET = 'h75-social-posts';

type PickedAsset = { uri: string; file?: File | null };
const assetCache = new Map<string, File>();

function rememberAsset(asset: { uri: string; file?: File | null }): string {
  if (asset.file && Platform.OS === 'web') {
    assetCache.set(asset.uri, asset.file);
  }
  return asset.uri;
}

export async function captureProgressPhoto(): Promise<string | null> {
  if (Platform.OS === 'web') {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (result.canceled) return null;
    return rememberAsset(result.assets[0] as PickedAsset);
  }
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) return null;
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.7,
    allowsEditing: false,
  });
  if (result.canceled) return null;
  return result.assets[0].uri;
}

export async function pickImageFromLibrary(): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.7,
    allowsEditing: true,
    aspect: [1, 1],
  });
  if (result.canceled) return null;
  if (Platform.OS === 'web') return rememberAsset(result.assets[0] as PickedAsset);
  return result.assets[0].uri;
}

function extFromMime(mime: string | undefined, fallback: string): string {
  if (!mime) return fallback;
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg';
  if (mime.includes('png')) return 'png';
  if (mime.includes('webp')) return 'webp';
  if (mime.includes('heic')) return 'heic';
  if (mime.includes('heif')) return 'heif';
  return fallback;
}

async function reencodeImageWeb(source: Blob | File): Promise<Blob> {
  const MAX_DIM = 1600;
  const QUALITY = 0.82;
  const objectUrl = URL.createObjectURL(source);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Não foi possível decodificar a imagem.'));
      el.src = objectUrl;
    });
    const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas indisponível.');
    ctx.drawImage(img, 0, 0, w, h);
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', QUALITY),
    );
    if (!blob) throw new Error('Falha ao reencodar a imagem.');
    return blob;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function uriToUpload(uri: string): Promise<{ body: Blob | Uint8Array; ext: string; contentType: string }> {
  const rawExt = (uri.split('.').pop() || 'jpg').split('?')[0].toLowerCase();
  if (Platform.OS === 'web') {
    const cached = assetCache.get(uri);
    let source: Blob | File | null = cached ?? null;
    if (!source) {
      const res = await fetch(uri);
      if (!res.ok) throw new Error(`Falha ao ler a imagem (${res.status}).`);
      source = await res.blob();
    }
    const jpeg = await reencodeImageWeb(source);
    return { body: jpeg, ext: 'jpg', contentType: 'image/jpeg' };
  }
  // React Native: fetch local URI directly — much faster than base64 + atob
  const res = await fetch(uri);
  const blob = await res.blob();
  const contentType = blob.type || `image/${rawExt}`;
  const ext = extFromMime(blob.type, rawExt);
  return { body: blob, ext, contentType };
}

export async function uploadProgressPhoto(
  localUri: string,
  userId: string,
  challengeId: string,
  day: number,
): Promise<string> {
  const { body, ext, contentType } = await uriToUpload(localUri);
  const path = `${userId}/${challengeId}/${day}.${ext}`;
  const { error } = await supabase.storage
    .from(PROGRESS_BUCKET)
    .upload(path, body, { contentType, upsert: true });
  if (error) throw error;
  return path;
}

export async function getSignedPhotoUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(PROGRESS_BUCKET)
    .createSignedUrl(path, 60 * 60);
  if (error) return null;
  return data.signedUrl;
}

export async function uploadSocialPhoto(localUri: string, userId: string): Promise<string> {
  const { body, ext, contentType } = await uriToUpload(localUri);
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from(SOCIAL_BUCKET)
    .upload(path, body, { contentType, upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(SOCIAL_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
