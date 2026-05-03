import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Switch } from 'react-native';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useAuth } from '@/store/useAuth';
import { useProfile } from '@/store/useProfile';
import { requestPermissions, scheduleDailyReminder, cancelAll } from '@/lib/notifications';
import { colors } from '@/theme/colors';
import { font, fontFamily, radius, spacing } from '@/theme/tokens';

export default function Settings() {
  const { user, signOut } = useAuth();
  const profile = useProfile((s) => s.profile);
  const updateProfile = useProfile((s) => s.update);
  const [hour, setHour] = useState<string>(
    profile?.daily_reminder_hour != null ? String(profile.daily_reminder_hour) : '8',
  );
  const [name, setName] = useState(profile?.display_name ?? '');

  const enableNotifs = async () => {
    const ok = await requestPermissions();
    if (!ok) {
      Alert.alert('Permissão negada', 'Habilite nas configurações do sistema.');
      return;
    }
    const h = Math.min(23, Math.max(0, parseInt(hour, 10) || 8));
    await cancelAll();
    await scheduleDailyReminder(h, 'Hora do check-in ✿', 'Bate seus hábitos antes do dia acabar.');
    await updateProfile({ daily_reminder_hour: h });
    Alert.alert('Pronto ♡', `Lembrete diário às ${h}h.`);
  };

  return (
    <Screen>
      <Text style={styles.h1}>Ajustes ⚙</Text>

      <Card style={{ marginTop: spacing.lg }}>
        <Text style={styles.section}>♡ PERFIL</Text>
        <Input
          label="Nome"
          value={name}
          onChangeText={setName}
          placeholder="Seu nome"
        />
        <Button
          label="Salvar"
          variant="subtle"
          onPress={() => updateProfile({ display_name: name })}
        />
        <Text style={styles.email}>{user?.email}</Text>
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={styles.section}>✿ FEEDBACK</Text>
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.swTitle}>Som ao cumprir</Text>
            <Text style={styles.swDesc}>Toca um beep + haptic.</Text>
          </View>
          <Switch
            value={profile?.sound_enabled ?? true}
            onValueChange={(v) => updateProfile({ sound_enabled: v } as any)}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor={'#FFF'}
          />
        </View>
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={styles.section}>✦ NOTIFICAÇÕES</Text>
        <Input
          label="Hora do lembrete diário (0–23)"
          value={hour}
          onChangeText={setHour}
          keyboardType="number-pad"
        />
        <Button label="Ativar lembrete" onPress={enableNotifs} variant="mint" />
        <Text style={styles.hint}>
          iOS/Android recebe push local. Web só com a aba aberta.
        </Text>
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={styles.section}>⚠ CONTA</Text>
        <Button label="Sair" variant="danger" onPress={signOut} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  h1: {
    color: colors.text,
    fontSize: font.size.title,
    fontWeight: '700',
    fontFamily: fontFamily.display as any,
    letterSpacing: -1,
  },
  section: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: spacing.md,
    fontFamily: fontFamily.body as any,
  },
  email: {
    color: colors.textDim,
    fontSize: font.size.xs,
    marginTop: spacing.md,
    fontFamily: fontFamily.body as any,
  },
  hint: {
    color: colors.textDim,
    fontSize: font.size.xs,
    marginTop: spacing.sm,
    fontFamily: fontFamily.body as any,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceAlt,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  swTitle: {
    color: colors.text,
    fontSize: font.size.md,
    fontWeight: '700',
    fontFamily: fontFamily.body as any,
  },
  swDesc: {
    color: colors.textMuted,
    fontSize: font.size.xs,
    marginTop: 2,
    fontFamily: fontFamily.body as any,
  },
});
