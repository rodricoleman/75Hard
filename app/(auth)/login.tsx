import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { colors } from '@/theme/colors';

const OWNER_EMAIL = 'rodrigocoleman26@gmail.com';

export default function Login() {
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sent, setSent] = useState(false);

  async function sendCode() {
    setSending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: OWNER_EMAIL,
      options: { shouldCreateUser: true },
    });
    setSending(false);
    if (error) return Alert.alert('Erro', error.message);
    setSent(true);
  }

  useEffect(() => {
    sendCode();
  }, []);

  async function verify() {
    if (code.length < 6) return;
    setVerifying(true);
    const { error } = await supabase.auth.verifyOtp({
      email: OWNER_EMAIL,
      token: code.trim(),
      type: 'email',
    });
    setVerifying(false);
    if (error) {
      Alert.alert('Código inválido', error.message);
      setCode('');
    }
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>
        <Text style={styles.brand}>
          75<Text style={{ color: colors.neon }}>HARD</Text>
        </Text>
        <Text style={styles.subtitle}>Disciplina diária. Sem desculpa.</Text>

        <Text style={styles.hint}>
          {sending
            ? 'Enviando código…'
            : sent
            ? 'Código enviado. Verifique seu email.'
            : ''}
        </Text>

        <TextInput
          style={[styles.input, styles.code]}
          placeholder="000000"
          placeholderTextColor={colors.textDim}
          keyboardType="number-pad"
          maxLength={6}
          value={code}
          onChangeText={setCode}
          autoFocus
          editable={sent}
        />

        <TouchableOpacity
          style={[styles.button, (verifying || code.length < 6) && { opacity: 0.5 }]}
          disabled={verifying || code.length < 6}
          onPress={verify}
        >
          <Text style={styles.buttonText}>{verifying ? 'Verificando…' : 'Entrar'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={sendCode} disabled={sending}>
          <Text style={styles.link}>{sending ? '…' : 'Reenviar código'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, padding: 28, justifyContent: 'center' },
  brand: { color: colors.text, fontSize: 52, fontWeight: '900', letterSpacing: -2 },
  subtitle: { color: colors.textMuted, fontSize: 15, marginTop: 6, marginBottom: 40 },
  hint: { color: colors.textMuted, fontSize: 14, marginBottom: 16, minHeight: 20 },
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
  code: { textAlign: 'center', letterSpacing: 12, fontSize: 24, fontWeight: '700' },
  button: {
    backgroundColor: colors.neon,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: { color: '#000', fontSize: 16, fontWeight: '700' },
  link: { color: colors.neon, marginTop: 20, fontWeight: '600', textAlign: 'center' },
});
