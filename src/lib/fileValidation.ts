const IMAGE_TYPES = new Map([
  ['image/jpeg', ['jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp']],
  ['image/png', ['png']],
  ['image/webp', ['webp']],
  ['image/gif', ['gif']],
]);

const VIDEO_TYPES = new Map([
  ['video/mp4', ['mp4', 'm4v']],
  ['video/webm', ['webm']],
  ['video/quicktime', ['mov', 'qt']],
]);

// Some browsers/devices report non-standard MIME aliases.
const MIME_ALIASES: Record<string, string> = {
  'image/jpg': 'image/jpeg',
  'image/pjpeg': 'image/jpeg',
  'video/x-m4v': 'video/mp4',
};

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

const extensionOf = (file: File) => {
  const parts = file.name.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
};

const typeFromExtension = (ext: string): string | null => {
  for (const [mime, exts] of [...IMAGE_TYPES, ...VIDEO_TYPES]) {
    if (exts.includes(ext)) return mime;
  }
  return null;
};

/**
 * Normalised MIME type and a safe file extension for storage.
 * Handles files with a missing/aliased MIME type (common on some phones).
 */
export const resolveMediaType = (file: File): { contentType: string; extension: string } => {
  const ext = extensionOf(file);
  const raw = (file.type || '').toLowerCase();
  const contentType = MIME_ALIASES[raw] ?? (raw || typeFromExtension(ext) || 'application/octet-stream');
  const known = IMAGE_TYPES.get(contentType) ?? VIDEO_TYPES.get(contentType);
  const extension = known ? (known.includes(ext) ? ext : known[0]) : ext.replace(/[^a-z0-9]/g, '') || 'bin';
  return { contentType, extension };
};

export const validateMediaFile = (file: File, mediaType: 'images' | 'videos') => {
  const allowedTypes = mediaType === 'images' ? IMAGE_TYPES : VIDEO_TYPES;
  const maxSize = mediaType === 'images' ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
  const { contentType } = resolveMediaType(file);
  const ext = extensionOf(file);

  if (file.size === 0) {
    return { valid: false, error: `File ${file.name} is empty.` };
  }

  if (file.size > maxSize) {
    return { valid: false, error: `File ${file.name} is too large. Max size is ${maxSize / 1024 / 1024}MB.` };
  }

  if (!allowedTypes.has(contentType)) {
    const hint = /heic|heif/.test(contentType) || /^(heic|heif)$/.test(ext)
      ? ' iPhone HEIC photos are not supported — please export as JPEG.'
      : ` Allowed: ${[...allowedTypes.values()].map((e) => e[0].toUpperCase()).join(', ')}.`;
    return { valid: false, error: `File ${file.name} is not an allowed ${mediaType === 'images' ? 'image' : 'video'} type.${hint}` };
  }

  // A missing extension is fine (we derive one from the MIME type); a
  // mismatched one is rejected to avoid disguised files.
  const allowedExtensions = allowedTypes.get(contentType) || [];
  if (ext && !allowedExtensions.includes(ext)) {
    return { valid: false, error: `File ${file.name} has an extension that does not match its media type.` };
  }

  return { valid: true, error: null };
};
