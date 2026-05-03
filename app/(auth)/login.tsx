import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useAuth } from '@/store/useAuth';
import { colors } from '@/theme/colors';
import { font, fontFamily, radius, spacing, softShadowSm } from '@/theme/tokens';

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
    else router.replace('/');
  };

  return (
    <Screen>
      {/* Decorative blob */}
      <View style={styles.blob}>
        <View style={[styles.dot, { top: 8, left: 14, backgroundColor: colors.coin }]} />
        <View style={[styles.dot, { top: 26, left: 38, backgroundColor: colors.accent, width: 5, height: 5 }]} />
        <View style={[styles.dot, { top: 18, left: 64, backgroundColor: colors.xp, width: 4, height: 4 }]} />
        <Text style={styles.bigEmoji}>✿</Text>
      </View>

      <Text style={styles.brand}>Rotina</Text>
      <Text style={styles.tagline}>
        Domine sua rotina, ganhe coin e gaste no que te faz feliz.
      </Text>

      <View style={[styles.formCard, softShadowSm]}>
        <View style={styles.tabs}>
          <Text
            onPress={() => setMode('login')}
            style={[
              styles.tab,
              mode === 'login' && styles.tabActive,
            ]}
          >
            entrar
          </Text>
          <Text
            onPress={() => setMode('signup')}
            style={[
              styles.tab,
              mode === 'signup' && styles.tabActive,
            ]}
          >
            criar conta
          </Text>
        </View>

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
          label={mode === 'login' ? 'Entrar ♡' : 'Criar conta ✿'}
          onPress={submit}
          loading={loading}
          style={{ marginTop: spacing.sm }}
        />
      </View>

      <Text style={styles.footer}>feito com ♡ pela sua rotina</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  blob: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    alignSelf: 'flex-start',
    position: 'relative',
  },
  dot: { position: 'absolute', width: 6, height: 6, borderRadius: 3 },
  bigEmoji: { fontSize: 44, color: colors.primaryDark },
  brand: {
    color: colors.text,
    fontSize: font.size.title + 8,
    fontWeight: '700',
    fontFamily: fontFamily.display as any,
    letterSpacing: -1.2,
    marginTop: spacing.lg,
  },
  tagline: {
    color: colors.textMuted,
    fontSize: font.size.md,
    marginTop: spacing.xs + 2,
    lineHeight: 22,
    fontFamily: fontFamily.body as any,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    backgroundColor: colors.surfaceAlt,
    padding: 4,
    borderRadius: radius.pill,
  },
  tab: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 8,
    color: colors.textMuted,
    fontSize: font.size.sm,
    fontWeight: '600',
    fontFamily: fontFamily.body as any,
    borderRadius: radius.pill,
  },
  tabActive: {
    backgroundColor: colors.surface,
    color: colors.text,
    fontWeight: '700',
  },
  error: {
    color: '#A24452',
    backgroundColor: colors.dangerSoft,
    fontSize: font.size.sm,
    padding: spacing.sm + 2,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    fontFamily: fontFamily.body as any,
  },
  footer: {
    color: colors.textDim,
    fontSize: font.size.xs,
    textAlign: 'center',
    marginTop: spacing.xl,
    fontFamily: fontFamily.body as any,
  },
});
