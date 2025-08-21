-- Row Level Security policies for anonymous messaging

-- Messages table: allow anonymous inserts, recipients to read/update their own,
-- and admins to read/update/delete all.

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Insert: allow both anon and authenticated users to create messages
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.messages;
CREATE POLICY "Anyone can insert messages"
ON public.messages FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Select: recipients can read their own messages
DROP POLICY IF EXISTS "Recipients can read their messages" ON public.messages;
CREATE POLICY "Recipients can read their messages"
ON public.messages FOR SELECT
TO authenticated
USING (receiver_id = auth.uid());

-- Update: recipients can update their own message flags (favorite/archive/read)
DROP POLICY IF EXISTS "Recipients can update their messages" ON public.messages;
CREATE POLICY "Recipients can update their messages"
ON public.messages FOR UPDATE
TO authenticated
USING (receiver_id = auth.uid())
WITH CHECK (receiver_id = auth.uid());

-- Admin: read all messages
DROP POLICY IF EXISTS "Admins can read all messages" ON public.messages;
CREATE POLICY "Admins can read all messages"
ON public.messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- Admin: update all messages
DROP POLICY IF EXISTS "Admins can update all messages" ON public.messages;
CREATE POLICY "Admins can update all messages"
ON public.messages FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
)
WITH CHECK (true);

-- Admin: delete any message
DROP POLICY IF EXISTS "Admins can delete all messages" ON public.messages;
CREATE POLICY "Admins can delete all messages"
ON public.messages FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- User roles table: allow users to read their own roles and admins to read all
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own roles" ON public.user_roles;
CREATE POLICY "Users can read their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can read all roles" ON public.user_roles;
CREATE POLICY "Admins can read all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);


