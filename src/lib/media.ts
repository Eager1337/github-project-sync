import { supabase } from '@/integrations/supabase/client';
import { resolveMediaType } from '@/lib/fileValidation';

const BUCKET = 'product-media';
const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

/** Long-lived shareable link for a file in the product media library. */
export async function mediaUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, TEN_YEARS);
  if (error || !data) throw new Error(friendlyStorageError(error?.message, 'Could not create a link for this file'));
  return data.signedUrl;
}

/** Turns raw storage/RLS errors into something an admin can act on. */
export function friendlyStorageError(message: string | undefined, fallback = 'Upload failed'): string {
  const m = (message || '').toLowerCase();
  if (!m) return fallback;
  if (m.includes('row-level security') || m.includes('unauthorized') || m.includes('permission') || m.includes('403') || m.includes('jwt')) {
    return 'You are not signed in as an admin (or your session expired). Please sign out and sign in again.';
  }
  if (m.includes('bucket not found')) return 'The media storage bucket is missing. Please contact support.';
  if (m.includes('maximum allowed size') || m.includes('too large') || m.includes('413')) return 'This file is too large to upload.';
  if (m.includes('mime type') || m.includes('invalid_mime')) return 'This file type is not allowed.';
  if (m.includes('failed to fetch') || m.includes('network')) return 'Network error — check your connection and try again.';
  return message || fallback;
}

export type UploadedMedia = { path: string; url: string; contentType: string };

/**
 * Uploads a file to the product media library and returns its storage path and
 * a long-lived link. Throws an Error with a readable message on failure.
 *
 * @param folder storage folder, e.g. "images", "videos", "categories"
 * @param prefix optional file name prefix, e.g. "team" or "studio"
 */
export async function uploadMedia(file: File, folder: string, prefix?: string): Promise<UploadedMedia> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    throw new Error('Your admin session has expired. Please sign in again to upload files.');
  }

  const { contentType, extension } = resolveMediaType(file);
  const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '') || 'images';
  const safePrefix = prefix ? `${prefix.replace(/[^a-zA-Z0-9_-]/g, '')}-` : '';
  const random = Math.random().toString(36).slice(2, 10);
  const path = `${safeFolder}/${safePrefix}${Date.now()}-${random}.${extension}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType,
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw new Error(friendlyStorageError(error.message));

  const url = await mediaUrl(path);
  return { path, url, contentType };
}

/** Deletes a file from the product media library (errors are returned, not thrown). */
export async function removeMedia(path: string) {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  return { error: error ? friendlyStorageError(error.message, 'Could not delete file') : null };
}
