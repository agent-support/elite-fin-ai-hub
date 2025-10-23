-- Allow users to update their own investments (for cancellation)
CREATE POLICY "Users can update own investments"
ON public.investments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);