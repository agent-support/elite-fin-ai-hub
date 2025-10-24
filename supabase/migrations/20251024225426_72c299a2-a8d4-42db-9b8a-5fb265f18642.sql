-- Update the handle_new_user_account function to include wallet_address
CREATE OR REPLACE FUNCTION public.handle_new_user_account()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_accounts (user_id, balance, btc_balance, eth_balance, wallet_address)
  VALUES (
    NEW.id, 
    0.00, 
    0.00000000, 
    0.00000000,
    NEW.raw_user_meta_data->>'wallet_address'
  );
  RETURN NEW;
END;
$$;