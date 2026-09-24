-- Make sure the product media storage bucket exists.
--
-- Earlier migrations added storage policies for 'product-media' but never
-- created the bucket itself, so uploads fail with "Bucket not found" on any
-- environment where it was not created by hand. This is idempotent: an
-- existing bucket keeps its visibility, only its limits are normalised.
--
-- The bucket stays private; files are shared with long-lived signed URLs.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-media',
  'product-media',
  false,
  52428800, -- 50 MB (images are limited to 10 MB in the app, videos to 50 MB)
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'video/quicktime'
  ]
)
ON CONFLICT (id) DO UPDATE
SET file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;
