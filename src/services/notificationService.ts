export type NotificationSupportStatus =
  | 'supported'
  | 'unsupported';

export type NotificationPermState =
  | NotificationPermission
  | 'unsupported';

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermState {
  if (!isNotificationSupported()) return 'unsupported';
  return window.Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermState> {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    const result = await window.Notification.requestPermission();
    return result;
  } catch {
    return window.Notification.permission;
  }
}

export function sendCheckInNotification(
  title: string,
  body: string
): boolean {
  if (!isNotificationSupported()) return false;
  if (window.Notification.permission !== 'granted') return false;

  try {
    new window.Notification(title, {
      body,
      icon: '/pwa-192x192.png',
      tag: 'daily-streak-reminder',
    });
    return true;
  } catch {
    return false;
  }
}

export function isPastReminderTime(reminderTime: string, now: Date = new Date()): boolean {
  const [hoursStr, minsStr] = reminderTime.split(':');
  const targetH = Number(hoursStr);
  const targetM = Number(minsStr);
  if (Number.isNaN(targetH) || Number.isNaN(targetM)) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const targetMinutes = targetH * 60 + targetM;
  return currentMinutes >= targetMinutes;
}
