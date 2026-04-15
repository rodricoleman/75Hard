import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { AuthField } from '@/components/AuthField';
import { useAuth } from '@/store/useAuth';
import { colors } from '@/theme/colors';

export default function SignUp() {
  const signUp = useAuth((s) => s.signUp);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    if (!email || !password || !username || !inviteCode) {
      return setError('Preencha todos os campos obrigatórios.');
    }
    if (password.length < 6) return setError('Senha precisa de 6+ caracteres.');
    if (!/^[a-z0-9_]{3,20}$/i.test(username)) {
      return setError('Username inválido. Use 3-20 letras, números ou _.');
    }
    setLoading(true);
    try {
      await signUp({
        email: email.trim(),
        password,
        inviteCode,
        username,
        displayName,
      });
    } catch (e: any) {
      setError(e?.message ?? 'Erro no cadastro.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.brand}>CRIAR CONTA</Text>
          <Text style={styles.subtitle}>Precisa de um código de convite de um amigo.</Text>

          <View style={{ marginTop: 28 }}>
            <AuthField
              label="Código de convite"
              value={inviteCode}
              onChangeText={(t) => setInviteCode(t.toUpperCase())}
              autoCapitalize="characters"
            />
            <AuthField
              label="Username (público)"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <AuthField
              label="Nome de exibição (opcional)"
              value={displayName}
              onChangeText={setDisplayName}
            />
            <AuthField
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <AuthField
              label="Senha (6+)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity style={styles.btn} onPress={onSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.btnText}>CRIAR CONTA</Text>
              )}
            </TouchableOpacity>

            <Link href="/(auth)/login" asChild>
              <TouchableOpacity style={styles.linkBtn}>
                <Text style={styles.linkText}>
                  Já tem conta? <Text style={{ color: colors.neon }}>Entrar</Text>
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 24, paddingTop: 60, maxWidth: 520, width: '100%', alignSelf: 'center' },
  brand: { color: colors.text, fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  subtitle: { color: colors.textMuted, fontSize: 15, marginTop: 8 },
  btn: {
    backgroundColor: colors.neon,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  btnText: { color: '#000', fontWeight: '900', letterSpacing: 2 },
  linkBtn: { marginTop: 24, alignItems: 'center' },
  linkText: { color: colors.textMuted, fontSize: 14 },
  errorBox: {
    backgroundColor: '#2A0F0F',
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  errorText: { color: colors.danger, fontSize: 13, lineHeight: 18 },
});
