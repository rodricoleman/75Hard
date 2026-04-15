import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
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
import { type, fonts } from '@/theme/tokens';

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

  const initials = (profile?.display_name || profile?.username || '?').slice(0, 1).toUpperCase();
  const usedInvites = invites.filter((i) => i.used_by).length;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(320)}>
          <Text style={styles.eyebrow}>CONFIGURAÇÕES</Text>
          <Text style={styles.h1}>AJUSTES</Text>
        </Animated.View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{profile?.display_name ?? '—'}</Text>
            <Text style={styles.profileUser}>@{profile?.username ?? '—'}</Text>
          </View>
        </View>

        <SectionLabel>CONVITES</SectionLabel>
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View>
              <Text style={styles.label}>Compartilhe com amigos</Text>
              <Text style={styles.hint}>
                {invites.length} gerado{invites.length === 1 ? '' : 's'} · {usedInvites} usado
                {usedInvites === 1 ? '' : 's'}
              </Text>
            </View>
            <Pressable style={styles.primaryBtn} onPress={onGenerateInvite}>
              <Text style={styles.primaryBtnText}>GERAR</Text>
            </Pressable>
          </View>
          {invites.length > 0 ? (
            <View style={styles.inviteList}>
              {invites.map((inv) => (
                <View key={inv.code} style={styles.inviteRow}>
                  <Text style={styles.inviteCode}>{inv.code}</Text>
                  <View
                    style={[
                      styles.statusPill,
                      inv.used_by
                        ? { backgroundColor: colors.successSoft }
                        : { backgroundColor: colors.neonSoft },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillTxt,
                        { color: inv.used_by ? colors.success : colors.neon },
                      ]}
                    >
                      {inv.used_by ? 'USADO' : 'LIVRE'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <SectionLabel>LEMBRETE DIÁRIO</SectionLabel>
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.label}>Notificação</Text>
              <Text style={styles.hint}>
                {enabled ? `Ativa às ${String(hour).padStart(2, '0')}:00` : 'Desligada'}
              </Text>
            </View>
            <Switch
              value={enabled}
              onValueChange={onToggle}
              trackColor={{ true: colors.neon, false: colors.border }}
              thumbColor={enabled ? '#000' : colors.text}
              ios_backgroundColor={colors.border}
            />
          </View>
          <View style={[styles.rowBetween, { marginTop: 18, opacity: enabled ? 1 : 0.45 }]}>
            <Text style={styles.label}>Horário</Text>
            <View style={styles.hourRow}>
              <Pressable
                onPress={() => changeHour(-1)}
                style={styles.hourBtn}
                disabled={!enabled}
              >
                <Text style={styles.hourBtnText}>−</Text>
              </Pressable>
              <Text style={styles.hour}>{String(hour).padStart(2, '0')}:00</Text>
              <Pressable
                onPress={() => changeHour(1)}
                style={styles.hourBtn}
                disabled={!enabled}
              >
                <Text style={styles.hourBtnText}>+</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <Pressable style={styles.logout} onPress={onLogout}>
          <Text style={styles.logoutText}>SAIR DA CONTA</Text>
        </Pressable>

        <Text style={styles.footer}>75HARD · versão 1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.section}>{children}</Text>
      <View style={styles.sectionLine} />
    </View>
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
  eyebrow: { ...type.eyebrow, color: colors.neon, marginBottom: 4 },
  h1: { ...type.h1, color: colors.text, fontSize: 34, marginBottom: 20 },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.neonSoft,
    borderWidth: 1,
    borderColor: colors.neon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: { color: colors.neon, fontSize: 22, fontWeight: '900' },
  profileName: { ...type.h2, color: colors.text, fontSize: 18 },
  profileUser: {
    fontFamily: fonts.mono,
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
    fontWeight: '700',
  },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    marginBottom: 10,
  },
  section: { ...type.label, color: colors.textMuted },
  sectionLine: { flex: 1, height: 1, backgroundColor: colors.border },

  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { ...type.bodyStrong, color: colors.text, fontSize: 14 },
  hint: { ...type.caption, color: colors.textMuted, marginTop: 2 },

  hourRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hourBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.surfaceHi,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hourBtnText: { color: colors.text, fontSize: 18, fontWeight: '800' },
  hour: {
    fontFamily: fonts.mono,
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    minWidth: 72,
    textAlign: 'center',
    letterSpacing: -0.5,
  },

  primaryBtn: {
    backgroundColor: colors.neon,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  primaryBtnText: {
    color: '#000',
    fontWeight: '900',
    letterSpacing: 2,
    fontSize: 11,
  },

  inviteList: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  inviteCode: {
    fontFamily: fonts.mono,
    color: colors.text,
    fontWeight: '900',
    letterSpacing: 2,
    fontSize: 15,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusPillTxt: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  logout: {
    marginTop: 28,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: {
    color: colors.danger,
    fontWeight: '900',
    letterSpacing: 2,
    fontSize: 12,
  },
  footer: {
    ...type.eyebrow,
    color: colors.textDim,
    textAlign: 'center',
    marginTop: 24,
    fontSize: 9,
  },
});
