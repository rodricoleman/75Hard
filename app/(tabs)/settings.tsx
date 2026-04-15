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
import { colors } from '@/theme/colors';

export default function Settings() {
  const [enabled, setEnabled] = useState(false);
  const [hour, setHour] = useState(7);

  useEffect(() => {
    if (!notificationsSupported) return;
    getScheduledNotifications().then((arr) => {
      setEnabled(arr.length > 0);
      const trig = arr[0]?.trigger as any;
      if (trig?.hour != null) setHour(trig.hour);
    });
  }, []);

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

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.h1}>AJUSTES</Text>

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

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 20, paddingBottom: 40 },
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
  value: { color: colors.text, fontSize: 15, marginTop: 6 },
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
