import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SiteNotification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  image_url: string | null;
  link: string | null;
  created_at: string;
}

const READ_KEY = 'haamkay-notifications-read-at';

export function useNotifications() {
  const [items, setItems] = useState<SiteNotification[]>([]);
  const [readAt, setReadAt] = useState<string>(() => localStorage.getItem(READ_KEY) ?? '1970-01-01');

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('notifications')
      .select('id, type, title, body, image_url, link, created_at')
      .order('created_at', { ascending: false })
      .limit(30);
    if (data) setItems(data as SiteNotification[]);
  }, []);

  useEffect(() => {
    load();
    const channel = supabase
      .channel('site-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        setItems((prev) => [payload.new as SiteNotification, ...prev].slice(0, 30));
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  const markAllRead = useCallback(() => {
    const now = new Date().toISOString();
    localStorage.setItem(READ_KEY, now);
    setReadAt(now);
  }, []);

  const unreadCount = items.filter((n) => n.created_at > readAt).length;

  return { items, unreadCount, markAllRead, refresh: load };
}
