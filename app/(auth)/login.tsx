import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useAuth } from '@/store/useAuth';
import { colors } from '@/theme/colors';
import { font, spacing } from '@/theme/tokens';

export default function Login() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setLoading(true);
    const fn = mode === 'login' ? signIn : signUp;
    const { error } = await fn(email.trim(), password);
    setLoading(false);
    if (error) setError(error);
    else router.replace('/(tabs)');
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.brand}>Rotina</Text>
        <Text style={styles.tagline}>Domine sua rotina. Ganhe coin. Gaste com o que importa.</Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
          placeholder="seu@email.com"
        />
        <Input
          label="Senha"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
        />
        {error && <Text style={styles.error}>{error}</Text>}
        <Button
          label={mode === 'login' ? 'Entrar' : 'Criar conta'}
          onPress={submit}
          loading={loading}
        />
        <Button
          label={mode === 'login' ? 'Não tem conta? Criar' : 'Já tenho conta'}
          onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}
          variant="ghost"
          style={{ marginTop: spacing.sm }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.xxl, marginBottom: spacing.xxl },
  brand: { color: colors.primary, fontSize: font.size.title, fontWeight: '900', letterSpacing: -1 },
  tagline: { color: colors.textMuted, fontSize: font.size.md, marginTop: spacing.sm, lineHeight: 22 },
  form: { marginTop: spacing.lg },
  error: { color: colors.danger, fontSize: font.size.sm, marginBottom: spacing.md },
});
