-- Fix 1: Improve handle_new_user function with input validation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
BEGIN
  -- Extract and validate full_name with length limit and sanitization
  v_full_name := COALESCE(
    LEFT(TRIM(NEW.raw_user_meta_data ->> 'full_name'), 255),
    ''
  );
  
  -- Insert profile with validated name
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, v_full_name);
  
  -- Insert default settings
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Fix 2: Add UPDATE and DELETE policies for safe_locations
-- Allow users to update only their own unverified locations
CREATE POLICY "Users can update own unverified locations" 
ON public.safe_locations 
FOR UPDATE 
USING (auth.uid() = user_id AND is_verified = false)
WITH CHECK (auth.uid() = user_id AND is_verified = false);

-- Allow users to delete only their own unverified locations
CREATE POLICY "Users can delete own unverified locations" 
ON public.safe_locations 
FOR DELETE 
USING (auth.uid() = user_id AND is_verified = false);