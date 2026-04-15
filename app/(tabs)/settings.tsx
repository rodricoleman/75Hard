import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  cancelAllNotifications,
  getScheduledNotifications,
  notificationsSupported,
  requestNotificationsPermission,
  scheduleDailyReminder,
} from '@/lib/notifications';
import { createInvite, fetchMyInvites } from '@/lib/social';
import { useAuth } from '@/store/useAuth';
import { useChallenge } from '@/store/useChallenge';
import { colors } from '@/theme/colors';

type Invite = { code: string; used_by: string | null; used_at: string | null; created_at: string };

export default function Settings() {
  const userId = useAuth((s) => s.user?.id);
  const profile = useAuth((s) => s.profile);
  const signOut = useAuth((s) => s.signOut);
  const resetChallenge = useChallenge((s) => s.reset);

  const [enabled, setEnabled] = useState(false);
  const [hour, setHour] = useState(7);
  const [invites, setInvites] = useState<Invite[]>([]);

  useEffect(() => {
    if (notificationsSupported) {
      getScheduledNotifications().then((arr) => {
        setEnabled(arr.length > 0);
        const trig = arr[0]?.trigger as any;
        if (trig?.hour != null) setHour(trig.hour);
      });
    }
    if (userId) fetchMyInvites(userId).then((d) => setInvites(d as Invite[]));
  }, [userId]);

  async function onToggle(v: boolean) {
    if (!notificationsSupported) {
      return Alert.alert('Indisponível', 'Notificações só funcionam no app mobile.');
    }
    if (v) {
      const ok = await requestNotificationsPermission();
      if (!ok) return Alert.alert('Permissão negada');
      await scheduleDailyReminder(hour, 0);
      setEnabled(true);
    } else {
      await cancelAllNotifications();
      setEnabled(false);
    }
  }

  async function changeHour(delta: number) {
    const h = (hour + delta + 24) % 24;
    setHour(h);
    if (enabled) await scheduleDailyReminder(h, 0);
  }

  async function onGenerateInvite() {
    if (!userId) return;
    try {
      const code = await createInvite(userId);
      setInvites((prev) => [
        { code, used_by: null, used_at: null, created_at: new Date().toISOString() },
        ...prev,
      ]);
      Alert.alert('Convite criado', `Código: ${code}\n\nCompartilhe com o amigo.`);
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    }
  }

  async function onLogout() {
    Alert.alert('Sair', 'Deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          resetChallenge();
          await signOut();
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.h1}>AJUSTES</Text>

        <Text style={styles.section}>PERFIL</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Usuário</Text>
          <Text style={styles.value}>@{profile?.username ?? '—'}</Text>
          <Text style={[styles.label, { marginTop: 10 }]}>Nome</Text>
          <Text style={styles.value}>{profile?.display_name ?? '—'}</Text>
        </View>

        <Text style={styles.section}>CONVITES</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.primaryBtn} onPress={onGenerateInvite}>
            <Text style={styles.primaryBtnText}>GERAR CÓDIGO</Text>
          </TouchableOpacity>
          {invites.length === 0 ? (
            <Text style={[styles.label, { marginTop: 12 }]}>Nenhum convite ainda.</Text>
          ) : (
            invites.map((inv) => (
              <View key={inv.code} style={styles.inviteRow}>
                <Text style={styles.inviteCode}>{inv.code}</Text>
                <Text style={styles.inviteStatus}>
                  {inv.used_by ? 'Usado' : 'Disponível'}
                </Text>
              </View>
            ))
          )}
        </View>

        <Text style={styles.section}>LEMBRETE DIÁRIO</Text>
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Notificação</Text>
            <Switch
              value={enabled}
              onValueChange={onToggle}
              trackColor={{ true: colors.neon, false: colors.border }}
              thumbColor={colors.text}
            />
          </View>
          <View style={[styles.rowBetween, { marginTop: 14 }]}>
            <Text style={styles.label}>Horário</Text>
            <View style={styles.hourRow}>
              <TouchableOpacity onPress={() => changeHour(-1)} style={styles.hourBtn}>
                <Text style={styles.hourBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.hour}>{String(hour).padStart(2, '0')}:00</Text>
              <TouchableOpacity onPress={() => changeHour(1)} style={styles.hourBtn}>
                <Text style={styles.hourBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logout} onPress={onLogout}>
          <Text style={styles.logoutText}>SAIR</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  container: {
    padding: 20,
    paddingBottom: 40,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  h1: { color: colors.text, fontSize: 28, fontWeight: '900', marginBottom: 20 },
  section: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  value: { color: colors.text, fontSize: 15, marginTop: 4 },
  hourRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hourBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hourBtnText: { color: colors.text, fontSize: 18, fontWeight: '700' },
  hour: { color: colors.text, fontSize: 18, fontWeight: '700', minWidth: 72, textAlign: 'center' },
  primaryBtn: {
    backgroundColor: colors.neon,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#000', fontWeight: '900', letterSpacing: 2 },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 10,
  },
  inviteCode: { color: colors.text, fontWeight: '800', letterSpacing: 2, fontSize: 16 },
  inviteStatus: { color: colors.textMuted, fontSize: 12 },
  logout: {
    marginTop: 32,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: { color: colors.danger, fontWeight: '800', letterSpacing: 2 },
});
