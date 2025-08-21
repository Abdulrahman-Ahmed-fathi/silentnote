-- Insert initial admin role for testing
-- Note: This will only work after a user with this email signs up
-- We'll create a function to easily assign admin role to the first user

CREATE OR REPLACE FUNCTION public.make_user_admin(user_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Find user by email in auth.users (we can reference it in functions)
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = user_email 
  LIMIT 1;
  
  IF target_user_id IS NOT NULL THEN
    -- Insert admin role if it doesn't exist
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END;
$$;

-- Create some default user roles if they don't exist
INSERT INTO public.user_roles (user_id, role)
SELECT 
  auth.users.id,
  'user'
FROM auth.users
LEFT JOIN public.user_roles ON auth.users.id = public.user_roles.user_id
WHERE public.user_roles.user_id IS NULL
ON CONFLICT DO NOTHING;