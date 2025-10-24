-- Create deposit_requests table
CREATE TABLE IF NOT EXISTS public.deposit_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  crypto_type TEXT NOT NULL,
  transaction_hash TEXT NOT NULL,
  status TEXT DEFAULT 'pending'::TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deposit_requests ENABLE ROW LEVEL SECURITY;

-- Users can insert their own deposit requests
CREATE POLICY "Users can insert own deposit requests"
ON public.deposit_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own deposit requests
CREATE POLICY "Users can view own deposit requests"
ON public.deposit_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all deposit requests
CREATE POLICY "Admins can view all deposit requests"
ON public.deposit_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update all deposit requests
CREATE POLICY "Admins can update all deposit requests"
ON public.deposit_requests
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_deposit_requests_updated_at
BEFORE UPDATE ON public.deposit_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();