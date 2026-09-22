import { supabase } from '@/integrations/supabase/client';

export const VAPID_PUBLIC_KEY =
  'BLyHFLLBl4iHS_256ez5-um0RqacgrGT0ZVUa6wVvGYE072JBDD5AXDcPVlUwlfoyZUeclShOgwoIFJamkaZ7zM';

export const pushSupported = () =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

const encodeKey = (buf: ArrayBuffer | null) =>
  buf ? btoa(String.fromCharCode(...new Uint8Array(buf))) : '';

/** Asks for permission, registers the messaging worker and stores the subscription. */
export async function enablePushNotifications(): Promise<{ ok: boolean; message: string }> {
  if (!pushSupported()) {
    return { ok: false, message: 'Your browser does not support push notifications.' };
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return { ok: false, message: 'Notifications were blocked. Enable them in your browser settings.' };
  }

  const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  await navigator.serviceWorker.ready;

  const existing = await registration.pushManager.getSubscription();
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    }));

  const json = subscription.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };

  const { error } = await supabase.from('push_subscribers').insert({
    endpoint: subscription.endpoint,
    p256dh: json.keys?.p256dh ?? encodeKey(subscription.getKey('p256dh')),
    auth: json.keys?.auth ?? encodeKey(subscription.getKey('auth')),
    user_agent: navigator.userAgent.slice(0, 300),
  });

  if (error && !error.message.toLowerCase().includes('duplicate')) {
    return { ok: false, message: 'Could not save your subscription. Please try again.' };
  }

  localStorage.setItem('haamkay-push', 'on');
  return { ok: true, message: "You're subscribed! We'll alert you about new drops and price changes." };
}

export async function disablePushNotifications() {
  localStorage.setItem('haamkay-push', 'off');
  if (!pushSupported()) return;
  const registration = await navigator.serviceWorker.getRegistration('/');
  const sub = await registration?.pushManager.getSubscription();
  await sub?.unsubscribe();
}

export const pushEnabled = () =>
  typeof window !== 'undefined' &&
  localStorage.getItem('haamkay-push') === 'on' &&
  'Notification' in window &&
  Notification.permission === 'granted';
