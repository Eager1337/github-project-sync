const IMAGE_TYPES = new Map([
  ['image/jpeg', ['jpg', 'jpeg']],
  ['image/png', ['png']],
  ['image/webp', ['webp']],
  ['image/gif', ['gif']],
]);

const VIDEO_TYPES = new Map([
  ['video/mp4', ['mp4']],
  ['video/webm', ['webm']],
  ['video/quicktime', ['mov']],
]);

const MAX_MEDIA_SIZE = 10 * 1024 * 1024;

export const validateMediaFile = (file: File, mediaType: 'images' | 'videos') => {
  const allowedTypes = mediaType === 'images' ? IMAGE_TYPES : VIDEO_TYPES;
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  if (file.size > MAX_MEDIA_SIZE) {
    return { valid: false, error: `File ${file.name} is too large. Max size is 10MB.` };
  }

  if (!allowedTypes.has(file.type)) {
    return { valid: false, error: `File ${file.name} is not an allowed ${mediaType === 'images' ? 'image' : 'video'} type.` };
  }

  const allowedExtensions = allowedTypes.get(file.type) || [];
  if (!allowedExtensions.includes(extension)) {
    return { valid: false, error: `File ${file.name} has an extension that does not match its media type.` };
  }

  return { valid: true, error: null };
};