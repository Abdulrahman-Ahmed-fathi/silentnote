-- Enhanced Anonymous Messaging System Migration
-- Run this SQL in your Supabase SQL Editor to add the new columns

-- Add sender_type column to distinguish between registered and anonymous users
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS sender_type TEXT DEFAULT 'anonymous_user' 
CHECK (sender_type IN ('registered_user', 'anonymous_user'));

-- Add sender_metadata column to store comprehensive sender information
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS sender_metadata JSONB DEFAULT NULL;

-- Create index on sender_type for efficient querying
CREATE INDEX IF NOT EXISTS idx_messages_sender_type ON public.messages(sender_type);

-- Create index on sender_metadata for efficient JSON queries
CREATE INDEX IF NOT EXISTS idx_messages_sender_metadata ON public.messages USING GIN (sender_metadata);

-- Update existing messages to have sender_type based on sender_user_id
UPDATE public.messages 
SET sender_type = CASE 
  WHEN sender_user_id IS NOT NULL THEN 'registered_user'
  ELSE 'anonymous_user'
END
WHERE sender_type IS NULL;

-- Add comment explaining the purpose of these columns
COMMENT ON COLUMN public.messages.sender_type IS 'Type of sender: registered_user or anonymous_user';
COMMENT ON COLUMN public.messages.sender_metadata IS 'Comprehensive sender metadata for admin monitoring (IP, user agent, geolocation, etc.)';

-- Verify the migration was successful
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'messages' 
AND column_name IN ('sender_type', 'sender_metadata')
ORDER BY column_name;

-- Add contact fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Optional: basic indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);