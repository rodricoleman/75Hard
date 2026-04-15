import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { colors } from '@/theme/colors';

export default function Login() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSend() {
    if (!email.includes('@')) return Alert.alert('Email inválido');
    setSending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: true },
    });
    setSending(false);
    if (error) return Alert.alert('Erro', error.message);
    setSent(true);
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>
        <Text style={styles.brand}>75<Text style={{ color: colors.neon }}>HARD</Text></Text>
        <Text style={styles.subtitle}>Disciplina diária. Sem desculpa.</Text>

        {sent ? (
          <View style={styles.sentBox}>
            <Text style={styles.sentTitle}>Código enviado</Text>
            <Text style={styles.sentText}>
              Abra o email {email} e use o link mágico para entrar.
            </Text>
            <TouchableOpacity onPress={() => setSent(false)}>
              <Text style={styles.link}>Usar outro email</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              placeholderTextColor={colors.textDim}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <TouchableOpacity
              style={[styles.button, sending && { opacity: 0.5 }]}
              disabled={sending}
              onPress={onSend}
            >
              <Text style={styles.buttonText}>{sending ? 'Enviando…' : 'Enviar link mágico'}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, padding: 28, justifyContent: 'center' },
  brand: { color: colors.text, fontSize: 52, fontWeight: '900', letterSpacing: -2 },
  subtitle: { color: colors.textMuted, fontSize: 15, marginTop: 6, marginBottom: 40 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.neon,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: { color: '#000', fontSize: 16, fontWeight: '700' },
  sentBox: { gap: 12 },
  sentTitle: { color: colors.neon, fontSize: 22, fontWeight: '800' },
  sentText: { color: colors.textMuted, fontSize: 15, lineHeight: 22 },
  link: { color: colors.neon, marginTop: 16, fontWeight: '600' },
});
