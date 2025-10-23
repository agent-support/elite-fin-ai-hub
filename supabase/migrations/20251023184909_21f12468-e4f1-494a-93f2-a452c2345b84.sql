-- Create investments table to track user investments
CREATE TABLE public.investments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  daily_yield NUMERIC NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- Users can view their own investments
CREATE POLICY "Users can view own investments"
ON public.investments
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own investments
CREATE POLICY "Users can create own investments"
ON public.investments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all investments
CREATE POLICY "Admins can view all investments"
ON public.investments
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update all investments
CREATE POLICY "Admins can update all investments"
ON public.investments
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_investments_updated_at
BEFORE UPDATE ON public.investments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();