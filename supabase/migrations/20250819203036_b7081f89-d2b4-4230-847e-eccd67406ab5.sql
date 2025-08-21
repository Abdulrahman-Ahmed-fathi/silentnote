-- Fix foreign key constraint issue for messages table
-- The receiver_id should reference profiles.user_id, not auth.users directly

-- First, drop the existing foreign key constraint if it exists
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;

-- Add proper foreign key constraint to profiles.user_id
ALTER TABLE public.messages 
ADD CONSTRAINT messages_receiver_id_fkey 
FOREIGN KEY (receiver_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Also ensure sender_user_id has proper constraint
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_sender_user_id_fkey;
ALTER TABLE public.messages 
ADD CONSTRAINT messages_sender_user_id_fkey 
FOREIGN KEY (sender_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;