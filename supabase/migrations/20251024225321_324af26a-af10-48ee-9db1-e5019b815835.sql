-- Add wallet_address column to user_accounts table
ALTER TABLE public.user_accounts 
ADD COLUMN wallet_address TEXT;