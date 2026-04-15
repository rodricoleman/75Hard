import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from './supabase';

const BUCKET = 'h75-progress-photos';

export async function captureProgressPhoto(): Promise<string | null> {
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

export async function uploadProgressPhoto(
  localUri: string,
  userId: string,
  challengeId: string,
  day: number,
): Promise<string> {
  const ext = localUri.split('.').pop() || 'jpg';
  const path = `${userId}/${challengeId}/${day}.${ext}`;
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: `image/${ext}`, upsert: true });
  if (error) throw error;
  return path;
}

export async function getSignedPhotoUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60);
  if (error) return null;
  return data.signedUrl;
}
