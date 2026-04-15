import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

export default function Login() {
  const signIn = useAuth((s) => s.signIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    if (!email || !password) return Alert.alert('Preencha email e senha');
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (e: any) {
      Alert.alert('Erro ao entrar', e.message);
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
          <Text style={styles.brand}>
            75<Text style={{ color: colors.neon }}>HARD</Text>
          </Text>
          <Text style={styles.subtitle}>Entre para continuar o desafio.</Text>

          <View style={{ marginTop: 32 }}>
            <AuthField
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            <AuthField
              label="Senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />

            <TouchableOpacity style={styles.btn} onPress={onSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.btnText}>ENTRAR</Text>
              )}
            </TouchableOpacity>

            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity style={styles.linkBtn}>
                <Text style={styles.linkText}>
                  Não tem conta? <Text style={{ color: colors.neon }}>Criar com convite</Text>
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
  brand: { color: colors.text, fontSize: 40, fontWeight: '900', letterSpacing: -1 },
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
});
