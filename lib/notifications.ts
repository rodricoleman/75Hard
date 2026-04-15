import { Platform } from 'react-native';

const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

let NotificationsMod: typeof import('expo-notifications') | null = null;
if (isNative) {
  NotificationsMod = require('expo-notifications');
  NotificationsMod!.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function requestNotificationsPermission(): Promise<boolean> {
  if (!NotificationsMod) return false;
  const { status: existing } = await NotificationsMod.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await NotificationsMod.requestPermissionsAsync();
  if (Platform.OS === 'android') {
    await NotificationsMod.setNotificationChannelAsync('daily', {
      name: '75Hard — lembretes diários',
      importance: NotificationsMod.AndroidImportance.HIGH,
      lightColor: '#C6FF00',
    });
  }
  return status === 'granted';
}

export async function scheduleDailyReminder(hour: number, minute: number) {
  if (!NotificationsMod) return;
  await NotificationsMod.cancelAllScheduledNotificationsAsync();
  await NotificationsMod.scheduleNotificationAsync({
    content: {
      title: '75Hard — Bora fechar o dia',
      body: 'Marque suas tarefas e fique no streak.',
    },
    trigger: {
      type: NotificationsMod.SchedulableTriggerInputTypes.CALENDAR,
      hour,
      minute,
      repeats: true,
      channelId: 'daily',
    },
  });
}

export async function getScheduledNotifications() {
  if (!NotificationsMod) return [] as Array<{ trigger: any }>;
  return NotificationsMod.getAllScheduledNotificationsAsync();
}

export async function cancelAllNotifications() {
  if (!NotificationsMod) return;
  await NotificationsMod.cancelAllScheduledNotificationsAsync();
}

export const notificationsSupported = isNative;
