-- Fix 1: Restrict incident_reports to authenticated users only
DROP POLICY IF EXISTS "Anyone can view incident reports" ON public.incident_reports;

CREATE POLICY "Authenticated users can view incident reports" 
ON public.incident_reports 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Fix 2: Add DELETE policy for evidence table (user privacy rights)
CREATE POLICY "Users can delete own evidence" 
ON public.evidence 
FOR DELETE 
USING (auth.uid() = user_id);

-- Fix 3: Add storage DELETE policy for evidence files
CREATE POLICY "Users can delete own evidence files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'evidence' AND auth.uid()::text = (storage.foldername(name))[1]);