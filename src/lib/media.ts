import { supabase } from '@/integrations/supabase/client';

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

/** Long-lived shareable link for a file in the product media library. */
export async function mediaUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from('product-media').createSignedUrl(path, TEN_YEARS);
  if (error || !data) throw new Error(error?.message || 'Could not create a link for this file');
  return data.signedUrl;
}
