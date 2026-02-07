-- Add email column to emergency_contacts table for emergency email notifications
ALTER TABLE public.emergency_contacts
ADD COLUMN IF NOT EXISTS email TEXT;

-- Add an index on the email column for faster lookups
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_email ON public.emergency_contacts(email);