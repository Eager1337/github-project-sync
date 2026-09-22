import { supabase } from '@/integrations/supabase/client';

export type NotificationType = 'new_product' | 'new_drop' | 'price_change' | 'general';

interface NotifyInput {
  type: NotificationType;
  title: string;
  body?: string;
  imageUrl?: string | null;
  link?: string | null;
  productId?: string | null;
  push?: boolean;
}

/**
 * Stores a site-wide notification (shown in the bell feed) and optionally
 * sends it to every browser that opted in to push notifications.
 */
export async function broadcastNotification(input: NotifyInput) {
  const { error } = await supabase.from('notifications').insert({
    type: input.type,
    title: input.title,
    body: input.body ?? null,
    image_url: input.imageUrl ?? null,
    link: input.link ?? null,
    product_id: input.productId ?? null,
  });
  if (error) return { ok: false, error: error.message };

  if (input.push !== false) {
    const { error: pushError } = await supabase.functions.invoke('send-push', {
      body: { title: input.title, body: input.body ?? '', url: input.link ?? '/', image: input.imageUrl ?? null },
    });
    if (pushError) console.error('Push delivery failed:', pushError);
  }

  return { ok: true };
}
