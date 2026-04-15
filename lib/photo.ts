import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from './supabase';

const BUCKET = 'h75-progress-photos';

export async function captureProgressPhoto(): Promise<string | null> {
  if (Platform.OS === 'web') {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (result.canceled) return null;
    return result.assets[0].uri;
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

async function uriToBytes(uri: string): Promise<{ bytes: Uint8Array; ext: string }> {
  const ext = (uri.split('.').pop() || 'jpg').split('?')[0].toLowerCase();
  if (Platform.OS === 'web') {
    const res = await fetch(uri);
    const buf = await res.arrayBuffer();
    return { bytes: new Uint8Array(buf), ext };
  }
  const FileSystem = require('expo-file-system') as typeof import('expo-file-system');
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return { bytes, ext };
}

export async function uploadProgressPhoto(
  localUri: string,
  userId: string,
  challengeId: string,
  day: number,
): Promise<string> {
  const { bytes, ext } = await uriToBytes(localUri);
  const path = `${userId}/${challengeId}/${day}.${ext}`;
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
