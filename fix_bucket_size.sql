-- Fix avatars bucket file size limit
-- Run this in your Supabase SQL editor

-- Update the existing avatars bucket to allow larger files
UPDATE storage.buckets 
SET file_size_limit = 10485760 -- 10MB in bytes
WHERE id = 'avatars';

-- Verify the bucket settings
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'avatars';

-- If the bucket doesn't exist, create it with the correct settings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  10485760, -- 10MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Check final bucket settings
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'avatars';

