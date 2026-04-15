import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { captureProgressPhoto, pickImageFromLibrary, uploadSocialPhoto } from '@/lib/photo';
import { createPost } from '@/lib/social';
import { useAuth } from '@/store/useAuth';
import { colors } from '@/theme/colors';

export default function NewPost() {
  const userId = useAuth((s) => s.user?.id);
  const router = useRouter();
  const [uri, setUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  async function onSubmit() {
    if (!userId || !uri) return Alert.alert('Escolha uma foto');
    setUploading(true);
    try {
      const photoUrl = await uploadSocialPhoto(uri, userId);
      await createPost(userId, photoUrl, caption);
      router.replace('/(tabs)/feed');
    } catch (e: any) {
      Alert.alert('Erro ao postar', e.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.cancel}>← Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.title}>NOVO POST</Text>
            <View style={{ width: 70 }} />
          </View>

          {uri ? (
            <Image source={{ uri }} style={styles.preview} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderTxt}>Sem foto</Text>
            </View>
          )}

          <View style={styles.row}>
            <TouchableOpacity
              style={styles.pickBtn}
              onPress={async () => {
                const u = await captureProgressPhoto();
                if (u) setUri(u);
              }}
            >
              <Text style={styles.pickBtnTxt}>📷 Câmera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.pickBtn}
              onPress={async () => {
                const u = await pickImageFromLibrary();
                if (u) setUri(u);
              }}
            >
              <Text style={styles.pickBtnTxt}>🖼 Galeria</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>LEGENDA</Text>
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="O que você quer contar?"
            placeholderTextColor={colors.textDim}
            style={styles.caption}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity style={styles.submit} onPress={onSubmit} disabled={uploading}>
            {uploading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.submitTxt}>PUBLICAR</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 20, maxWidth: 560, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { color: colors.text, fontWeight: '900', fontSize: 18, letterSpacing: 2 },
  cancel: { color: colors.textMuted, fontSize: 14, width: 90 },
  preview: { width: '100%', aspectRatio: 1, borderRadius: 12, backgroundColor: colors.surface },
  placeholder: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderTxt: { color: colors.textDim, letterSpacing: 2 },
  row: { flexDirection: 'row', gap: 10, marginTop: 14 },
  pickBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  pickBtnTxt: { color: colors.text, fontWeight: '700' },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 6,
  },
  caption: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submit: {
    backgroundColor: colors.neon,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 18,
  },
  submitTxt: { color: '#000', fontWeight: '900', letterSpacing: 2 },
});
