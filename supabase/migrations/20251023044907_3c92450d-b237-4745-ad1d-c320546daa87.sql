-- Create function to handle new user account creation
CREATE OR REPLACE FUNCTION public.handle_new_user_account()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_accounts (user_id, balance, btc_balance, eth_balance)
  VALUES (NEW.id, 0.00, 0.00000000, 0.00000000);
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create user account on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_account();