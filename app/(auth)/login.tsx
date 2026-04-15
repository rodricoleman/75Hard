import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { colors } from '@/theme/colors';

type Step = 'email' | 'code';

export default function Login() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  async function sendCode() {
    if (!email.includes('@')) return Alert.alert('Email inválido');
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: true },
    });
    setBusy(false);
    if (error) return Alert.alert('Erro', error.message);
    setStep('code');
  }

  async function verifyCode() {
    if (code.length < 6) return Alert.alert('Código incompleto');
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code.trim(),
      type: 'email',
    });
    setBusy(false);
    if (error) return Alert.alert('Código inválido', error.message);
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>
        <Text style={styles.brand}>
          75<Text style={{ color: colors.neon }}>HARD</Text>
        </Text>
        <Text style={styles.subtitle}>Disciplina diária. Sem desculpa.</Text>

        {step === 'email' ? (
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
              style={[styles.button, busy && { opacity: 0.5 }]}
              disabled={busy}
              onPress={sendCode}
            >
              <Text style={styles.buttonText}>{busy ? 'Enviando…' : 'Receber código'}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.hint}>Enviamos um código de 6 dígitos para {email}.</Text>
            <TextInput
              style={[styles.input, styles.code]}
              placeholder="000000"
              placeholderTextColor={colors.textDim}
              keyboardType="number-pad"
              maxLength={6}
              value={code}
              onChangeText={setCode}
            />
            <TouchableOpacity
              style={[styles.button, busy && { opacity: 0.5 }]}
              disabled={busy}
              onPress={verifyCode}
            >
              <Text style={styles.buttonText}>{busy ? 'Verificando…' : 'Entrar'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setStep('email');
                setCode('');
              }}
            >
              <Text style={styles.link}>Usar outro email</Text>
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
  hint: { color: colors.textMuted, fontSize: 14, marginBottom: 16 },
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
