import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const res = await Notification.requestPermission();
    return res === 'granted';
  }
  if (!Device.isDevice) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// Schedule a daily local notification at the given hour (0-23). Returns the identifier.
export async function scheduleDailyReminder(
  hour: number,
  title: string,
  body: string,
): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  const id = await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: { hour, minute: 0, repeats: true },
  });
  return id;
}

export async function cancelNotification(id: string | null) {
  if (!id || Platform.OS === 'web') return;
  await Notifications.cancelScheduledNotificationAsync(id);
}

export async function cancelAll() {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

const RISK_TAG = 'streak-risk';

// Schedule a one-shot notification for tonight at `hour` warning about
// streak loss for the listed habit titles. Cancels previous risk schedules first.
export async function scheduleStreakRisk(
  habitTitles: string[],
  hour = 21,
): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  // Cancel any previous risk warnings
  const all = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    all
      .filter((n) => (n.content.data as any)?.tag === RISK_TAG)
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
  if (habitTitles.length === 0) return null;

  const now = new Date();
  const target = new Date();
  target.setHours(hour, 0, 0, 0);
  if (target.getTime() <= now.getTime()) return null; // já passou hoje

  const list = habitTitles.slice(0, 3).join(', ');
  const more = habitTitles.length > 3 ? ` (+${habitTitles.length - 3})` : '';
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '🔥 Streak em risco',
      body: `Você ainda não fez: ${list}${more}. Faltam horas pra perder.`,
      sound: true,
      data: { tag: RISK_TAG },
    },
    trigger: target,
  });
  return id;
}
